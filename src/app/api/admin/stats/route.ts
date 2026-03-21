import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({ where: { id: currentUser.id }, select: { role: true } });
    if (me?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries
    const [
      totalUsers, totalQuestions, totalVotes, totalComments,
      usersToday, usersWeek, questionsToday, votesToday,
      recentUsers, recentQuestions, totalPredictions,
      totalTokenTxs, totalXPAwarded,
      activeQuestions, expiringSoon,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.vote.count(),
      prisma.comment.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.question.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.vote.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, displayName: true, username: true, email: true, role: true,
          xp: true, level: true, reputation: true, badge: true, streak: true,
          totalVotes: true, totalQuestions: true, totalPredictions: true,
          walletAddress: true, unclaimedWSR: true, totalClaimedWSR: true,
          emailVerified: true, createdAt: true, lastActiveAt: true,
        },
      }),
      prisma.question.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { displayName: true, username: true } },
          options: { select: { id: true, label: true, voteCount: true } },
          _count: { select: { votes: true, comments: true } },
        },
      }),
      prisma.predictionParticipation.count(),
      prisma.tokenTransaction.count(),
      prisma.tokenTransaction.aggregate({
        where: { type: 'earn' },
        _sum: { amount: true },
      }),
      prisma.question.count({ where: { status: 'active' } }),
      prisma.question.count({
        where: {
          status: 'active',
          expiresAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Recent transactions (all users)
    const recentTransactions = await prisma.tokenTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { user: { select: { displayName: true, username: true } } },
    });

    // Top earners
    const topEarners = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 15,
      select: {
        id: true, displayName: true, username: true, xp: true, level: true,
        totalVotes: true, totalQuestions: true, predictionAccuracy: true,
        unclaimedWSR: true, totalClaimedWSR: true, walletAddress: true,
        badge: true, streak: true,
      },
    });

    // Pool wallet
    const pool = await prisma.poolWallet.findUnique({ where: { type: 'fee_pool' } });
    const connectedWallets = await prisma.user.count({ where: { walletAddress: { not: null } } });
    const totalUnclaimedWSR = await prisma.user.aggregate({ _sum: { unclaimedWSR: true } });
    const totalClaimedWSR = await prisma.user.aggregate({ _sum: { totalClaimedWSR: true } });

    // Wallet users
    const walletUsers = await prisma.user.findMany({
      where: { walletAddress: { not: null } },
      select: {
        id: true, displayName: true, username: true, walletAddress: true,
        walletChain: true, xp: true, unclaimedWSR: true, totalClaimedWSR: true,
      },
      orderBy: { unclaimedWSR: 'desc' },
      take: 50,
    });

    // Pool transactions
    const poolTxs = pool ? await prisma.poolTransaction.findMany({
      where: { poolId: pool.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }) : [];

    return NextResponse.json({
      overview: {
        totalUsers, totalQuestions, totalVotes, totalComments,
        totalPredictions, totalTokenTxs,
        totalXPAwarded: totalXPAwarded._sum.amount || 0,
        usersToday, usersWeek, questionsToday, votesToday,
        activeQuestions, expiringSoon,
      },
      recentUsers,
      recentQuestions: recentQuestions.map(q => ({
        ...q,
        voteCount: q._count.votes,
        commentCount: q._count.comments,
      })),
      recentTransactions,
      topEarners,
      pool: pool ? {
        totalWSR: pool.totalWSR,
        totalXPFees: pool.totalXPFees,
        txCount: pool.txCount,
        updatedAt: pool.updatedAt,
      } : { totalWSR: 0, totalXPFees: 0, txCount: 0, updatedAt: null },
      walletStats: {
        connectedWallets,
        totalUnclaimedWSR: totalUnclaimedWSR._sum.unclaimedWSR || 0,
        totalClaimedWSR: totalClaimedWSR._sum.totalClaimedWSR || 0,
      },
      walletUsers,
      poolTxs,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
