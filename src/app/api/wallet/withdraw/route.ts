import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JsonRpcProvider, Wallet, Contract, parseUnits } from 'ethers';

const WSR_CONTRACT = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
const DEPLOYER_PRIVATE_KEY = process.env.WSR_DISTRIBUTOR_PRIVATE_KEY || '';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
];

// Rate limit: 1 withdrawal per hour per user
const withdrawCooldowns = new Map<string, number>();
const WITHDRAW_COOLDOWN_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Cooldown check
    const lastWithdraw = withdrawCooldowns.get(currentUser.id);
    if (lastWithdraw && Date.now() - lastWithdraw < WITHDRAW_COOLDOWN_MS) {
      const minutesLeft = Math.ceil((WITHDRAW_COOLDOWN_MS - (Date.now() - lastWithdraw)) / 60000);
      return NextResponse.json({ error: `Please wait ${minutesLeft} minutes before withdrawing again` }, { status: 429 });
    }

    if (!DEPLOYER_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Withdrawal service temporarily unavailable' }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, walletAddress: true, walletVerified: true, unclaimedWSR: true, totalClaimedWSR: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.walletAddress) {
      return NextResponse.json({ error: 'Connect your MetaMask wallet first' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedWSR = body.amount ? Math.floor(body.amount) : null;

    if (!requestedWSR || requestedWSR < 1) {
      return NextResponse.json({ error: 'Minimum withdrawal: 1 WSR' }, { status: 400 });
    }

    if ((user.unclaimedWSR || 0) < requestedWSR) {
      return NextResponse.json({
        error: `Insufficient WSR. You have ${user.unclaimedWSR || 0} unclaimed WSR.`,
        available: user.unclaimedWSR || 0,
      }, { status: 400 });
    }

    // Send WSR on-chain from deployer wallet to user's wallet
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(DEPLOYER_PRIVATE_KEY, provider);
    const wsrContract = new Contract(WSR_CONTRACT, ERC20_ABI, signer);

    // Check deployer has enough WSR
    const deployerBalance = await wsrContract.balanceOf(signer.address);
    const amountWei = parseUnits(requestedWSR.toString(), 18);

    if (deployerBalance < amountWei) {
      return NextResponse.json({ error: 'Insufficient platform WSR balance. Please contact admin.' }, { status: 503 });
    }

    // Execute on-chain transfer
    const tx = await wsrContract.transfer(user.walletAddress, amountWei);
    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json({ error: 'On-chain transfer failed. Please try again.' }, { status: 500 });
    }

    const txHash = receipt.hash;

    // Update DB: decrement unclaimedWSR, increment totalClaimedWSR
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          unclaimedWSR: { decrement: requestedWSR },
          totalClaimedWSR: { increment: requestedWSR },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          type: 'withdraw',
          amount: requestedWSR,
          txHash,
          description: `Withdrew ${requestedWSR} WSR to MetaMask (${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)})`,
          status: 'completed',
        },
      }),
    ]);

    // Set cooldown
    withdrawCooldowns.set(currentUser.id, Date.now());

    return NextResponse.json({
      success: true,
      amount: requestedWSR,
      txHash,
      explorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
      remainingWSR: (user.unclaimedWSR || 0) - requestedWSR,
      message: `Successfully withdrew ${requestedWSR} WSR to your wallet!`,
    });
  } catch (error: any) {
    console.error('Withdraw error:', error);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return NextResponse.json({ error: 'Insufficient gas (POL) in platform wallet. Contact admin.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Withdrawal failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
