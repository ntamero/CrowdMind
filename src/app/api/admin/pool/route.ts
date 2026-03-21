import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JsonRpcProvider, Wallet, Contract, parseUnits, formatUnits } from 'ethers';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check admin
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get or create pool wallet
    const pool = await prisma.poolWallet.upsert({
      where: { type: 'fee_pool' },
      create: { type: 'fee_pool', totalWSR: 0, totalXPFees: 0, txCount: 0 },
      update: {},
    });

    // Get recent pool transactions
    const recentTxs = await prisma.poolTransaction.findMany({
      where: { poolId: pool.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        pool: { select: { type: true } },
      },
    });

    // Get wallet stats
    const totalUsers = await prisma.user.count();
    const connectedWallets = await prisma.user.count({ where: { walletAddress: { not: null } } });
    const totalUnclaimedWSR = await prisma.user.aggregate({ _sum: { unclaimedWSR: true } });
    const totalClaimedWSR = await prisma.user.aggregate({ _sum: { totalClaimedWSR: true } });

    // Get users with wallets
    const walletUsers = await prisma.user.findMany({
      where: { walletAddress: { not: null } },
      select: {
        id: true,
        displayName: true,
        username: true,
        walletAddress: true,
        walletChain: true,
        walletVerified: true,
        xp: true,
        unclaimedWSR: true,
        totalClaimedWSR: true,
      },
      orderBy: { unclaimedWSR: 'desc' },
      take: 50,
    });

    // Get on-chain pool wallet balance
    let onChainPoolWSR = '0';
    try {
      const rpcUrl = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
      const wsrContract = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';
      const poolAddress = '0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119';
      if (wsrContract) {
        const provider = new JsonRpcProvider(rpcUrl);
        const contract = new Contract(wsrContract, ['function balanceOf(address) view returns (uint256)'], provider);
        const bal = await contract.balanceOf(poolAddress);
        onChainPoolWSR = formatUnits(bal, 18);
      }
    } catch {}

    return NextResponse.json({
      pool: {
        totalWSR: pool.totalWSR,
        totalXPFees: pool.totalXPFees,
        txCount: pool.txCount,
        updatedAt: pool.updatedAt,
        onChainWSR: onChainPoolWSR,
      },
      stats: {
        totalUsers,
        connectedWallets,
        totalUnclaimedWSR: totalUnclaimedWSR._sum.unclaimedWSR || 0,
        totalClaimedWSR: totalClaimedWSR._sum.totalClaimedWSR || 0,
      },
      walletUsers,
      recentPoolTxs: recentTxs,
    });
  } catch (error) {
    console.error('Admin pool error:', error);
    return NextResponse.json({ error: 'Failed to get pool data' }, { status: 500 });
  }
}

// POST: Admin withdraws accumulated pool WSR to their MetaMask
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true, walletAddress: true },
    });
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!user.walletAddress) {
      return NextResponse.json({ error: 'Connect your wallet first in the Wallet page' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = body.amount ? Number(body.amount) : null;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const privateKey = process.env.WSR_DISTRIBUTOR_PRIVATE_KEY;
    const wsrContract = process.env.NEXT_PUBLIC_WSR_CONTRACT;
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';

    if (!privateKey || !wsrContract) {
      return NextResponse.json({ error: 'Withdrawal service not configured' }, { status: 503 });
    }

    // Send WSR from pool/deployer wallet to admin's MetaMask
    const provider = new JsonRpcProvider(rpcUrl);
    const signer = new Wallet(privateKey, provider);
    const contract = new Contract(wsrContract, [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address) view returns (uint256)',
    ], signer);

    // Check balance
    const poolBalance = await contract.balanceOf(signer.address);
    const amountWei = parseUnits(amount.toString(), 18);

    if (poolBalance < amountWei) {
      return NextResponse.json({
        error: `Insufficient pool balance. On-chain: ${formatUnits(poolBalance, 18)} WSR`,
      }, { status: 400 });
    }

    // Execute transfer
    const tx = await contract.transfer(user.walletAddress, amountWei);
    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json({ error: 'On-chain transfer failed' }, { status: 500 });
    }

    // Update pool wallet in DB
    const pool = await prisma.poolWallet.findUnique({ where: { type: 'fee_pool' } });
    if (pool) {
      await prisma.poolWallet.update({
        where: { id: pool.id },
        data: { totalWSR: { decrement: Math.min(amount, pool.totalWSR) } },
      });
    }

    return NextResponse.json({
      success: true,
      amount,
      txHash: receipt.hash,
      to: user.walletAddress,
      explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
      message: `Withdrew ${amount} WSR to ${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-6)}`,
    });
  } catch (error: any) {
    console.error('Admin pool withdrawal error:', error);
    return NextResponse.json({ error: 'Withdrawal failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
