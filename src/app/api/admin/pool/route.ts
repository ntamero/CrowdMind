import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    return NextResponse.json({
      pool: {
        totalWSR: pool.totalWSR,
        totalXPFees: pool.totalXPFees,
        txCount: pool.txCount,
        updatedAt: pool.updatedAt,
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
