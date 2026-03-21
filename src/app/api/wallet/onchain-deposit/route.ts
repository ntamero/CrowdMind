import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';

const WSR_CONTRACT = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';
const POOL_WALLET = '0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119';
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';

// ERC-20 Transfer event signature
const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Track processed tx hashes to prevent double-crediting
const processedTxHashes = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, walletAddress: true, unclaimedWSR: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.walletAddress) {
      return NextResponse.json({ error: 'Connect your wallet first' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const txHash = body.txHash as string;

    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 });
    }

    // Check if tx already processed (in-memory + DB check)
    if (processedTxHashes.has(txHash)) {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    const existingTx = await prisma.tokenTransaction.findFirst({
      where: { txHash, type: 'onchain_deposit' },
    });
    if (existingTx) {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    // Verify transaction on-chain (retry up to 5 times for slow RPC)
    const provider = new JsonRpcProvider(RPC_URL);
    let receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      // Wait and retry - Polygon Amoy can be slow
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 3000));
        receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) break;
      }
    }

    if (!receipt) {
      return NextResponse.json({ error: 'Transaction not confirmed yet. Please wait a moment and try again.' }, { status: 400 });
    }

    if (receipt.status !== 1) {
      return NextResponse.json({ error: 'Transaction failed on chain' }, { status: 400 });
    }

    // Find the ERC-20 Transfer event in the logs
    const transferLog = receipt.logs.find(log => {
      if (log.address.toLowerCase() !== WSR_CONTRACT.toLowerCase()) return false;
      if (log.topics[0] !== TRANSFER_EVENT_TOPIC) return false;
      // topics[1] = from (padded address), topics[2] = to (padded address)
      const from = '0x' + log.topics[1].slice(26).toLowerCase();
      const to = '0x' + log.topics[2].slice(26).toLowerCase();
      return from === user.walletAddress!.toLowerCase() && to === POOL_WALLET.toLowerCase();
    });

    if (!transferLog) {
      return NextResponse.json({
        error: 'No valid WSR transfer found in this transaction. Make sure you sent WSR to the platform wallet.',
      }, { status: 400 });
    }

    // Decode amount from log data (uint256)
    const amountWei = BigInt(transferLog.data);
    const amountWSR = Number(formatUnits(amountWei, 18));

    if (amountWSR <= 0) {
      return NextResponse.json({ error: 'Invalid transfer amount' }, { status: 400 });
    }

    // Mark as processed
    processedTxHashes.add(txHash);

    // Credit user's unclaimedWSR
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          unclaimedWSR: { increment: amountWSR },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          type: 'onchain_deposit',
          amount: amountWSR,
          txHash,
          description: `Deposited ${amountWSR} WSR from MetaMask (${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)})`,
          status: 'completed',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      amount: amountWSR,
      txHash,
      newUnclaimedWSR: (user.unclaimedWSR || 0) + amountWSR,
      message: `Successfully deposited ${amountWSR} WSR to your account!`,
    });
  } catch (error: any) {
    console.error('On-chain deposit error:', error);
    return NextResponse.json({ error: 'Failed to process deposit: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
