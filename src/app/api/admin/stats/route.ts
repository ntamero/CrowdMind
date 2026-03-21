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

    // Build daily chart data for last 14 days
    const days14ago = new Date(todayStart); days14ago.setDate(days14ago.getDate() - 14);

    // Parallel queries
    const [
      totalUsers, totalQuestions, totalVotes, totalComments,
      usersToday, usersWeek, usersMonth,
      questionsToday, questionsWeek,
      votesToday, votesWeek,
      commentsToday,
      recentUsers, recentQuestions, totalPredictions,
      totalTokenTxs, totalXPAwarded,
      activeQuestions, expiringSoon,
      // Daily trend data
      usersLast14, questionsLast14, votesLast14, txsLast14,
      // XP/WSR aggregates
      totalXPEarned, totalXPFromVotes, totalXPFromQuestions, totalXPFromComments,
      totalWSRClaimed, totalWSRUnclaimed,
      // User level distribution
      levelDistribution,
      // Category stats
      categoryStats,
      // Transaction type breakdown
      txTypeBreakdown,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.vote.count(),
      prisma.comment.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.question.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.question.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.vote.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.vote.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.comment.count({ where: { createdAt: { gte: todayStart } } }),
      // Recent users (50)
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true, displayName: true, username: true, email: true, role: true,
          xp: true, level: true, reputation: true, badge: true, streak: true,
          totalVotes: true, totalQuestions: true, totalPredictions: true,
          predictionAccuracy: true,
          walletAddress: true, walletChain: true, walletVerified: true,
          siteWalletAddress: true,
          unclaimedWSR: true, totalClaimedWSR: true,
          emailVerified: true, createdAt: true, lastActiveAt: true,
        },
      }),
      // Recent questions (50)
      prisma.question.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { displayName: true, username: true } },
          options: { select: { id: true, label: true, voteCount: true } },
          _count: { select: { votes: true, comments: true } },
        },
      }),
      prisma.predictionParticipation.count(),
      prisma.tokenTransaction.count(),
      prisma.tokenTransaction.aggregate({ where: { type: 'earn' }, _sum: { amount: true } }),
      prisma.question.count({ where: { status: 'active' } }),
      prisma.question.count({
        where: { status: 'active', expiresAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } },
      }),
      // Daily user registrations (14 days)
      prisma.user.findMany({
        where: { createdAt: { gte: days14ago } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Daily questions (14 days)
      prisma.question.findMany({
        where: { createdAt: { gte: days14ago } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Daily votes (14 days)
      prisma.vote.findMany({
        where: { createdAt: { gte: days14ago } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Daily transactions (14 days)
      prisma.tokenTransaction.findMany({
        where: { createdAt: { gte: days14ago } },
        select: { createdAt: true, type: true, amount: true },
        orderBy: { createdAt: 'asc' },
      }),
      // XP aggregates
      prisma.user.aggregate({ _sum: { xp: true } }),
      prisma.tokenTransaction.aggregate({ where: { description: { contains: 'vote' } }, _sum: { amount: true } }),
      prisma.tokenTransaction.aggregate({ where: { description: { contains: 'question' } }, _sum: { amount: true } }),
      prisma.tokenTransaction.aggregate({ where: { description: { contains: 'comment' } }, _sum: { amount: true } }),
      // WSR aggregates
      prisma.user.aggregate({ _sum: { totalClaimedWSR: true } }),
      prisma.user.aggregate({ _sum: { unclaimedWSR: true } }),
      // Level distribution
      prisma.user.groupBy({ by: ['level'], _count: true, orderBy: { level: 'asc' } }),
      // Category question counts
      prisma.question.groupBy({ by: ['category'], _count: true, orderBy: { _count: { id: 'desc' } } }),
      // Transaction type counts
      prisma.tokenTransaction.groupBy({ by: ['type'], _count: true, _sum: { amount: true } }),
    ]);

    // Build 14-day chart data
    const chartData = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      chartData.push({
        date: label,
        users: usersLast14.filter((u: any) => u.createdAt >= d && u.createdAt < nextD).length,
        questions: questionsLast14.filter((q: any) => q.createdAt >= d && q.createdAt < nextD).length,
        votes: votesLast14.filter((v: any) => v.createdAt >= d && v.createdAt < nextD).length,
        xpEarned: txsLast14.filter((t: any) => t.createdAt >= d && t.createdAt < nextD && t.type === 'earn').reduce((s: number, t: any) => s + Number(t.amount), 0),
        claims: txsLast14.filter((t: any) => t.createdAt >= d && t.createdAt < nextD && t.type === 'claim').length,
      });
    }

    // Recent transactions (100)
    const recentTransactions = await prisma.tokenTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { displayName: true, username: true, email: true, walletAddress: true } } },
    });

    // Top earners (25)
    const topEarners = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 25,
      select: {
        id: true, displayName: true, username: true, email: true,
        xp: true, level: true, totalVotes: true, totalQuestions: true,
        predictionAccuracy: true, unclaimedWSR: true, totalClaimedWSR: true,
        walletAddress: true, badge: true, streak: true, createdAt: true,
      },
    });

    // Pool wallet
    const pool = await prisma.poolWallet.findUnique({ where: { type: 'fee_pool' } });
    const connectedWallets = await prisma.user.count({ where: { walletAddress: { not: null } } });
    const siteWallets = await prisma.user.count({ where: { siteWalletAddress: { not: null } } });
    const verifiedWallets = await prisma.user.count({ where: { walletVerified: true } });

    // Wallet users (all)
    const walletUsers = await prisma.user.findMany({
      where: { OR: [{ walletAddress: { not: null } }, { siteWalletAddress: { not: null } }] },
      select: {
        id: true, displayName: true, username: true, email: true,
        walletAddress: true, walletChain: true, walletVerified: true,
        siteWalletAddress: true,
        xp: true, unclaimedWSR: true, totalClaimedWSR: true,
        totalVotes: true, totalQuestions: true, lastActiveAt: true,
      },
      orderBy: { unclaimedWSR: 'desc' },
      take: 100,
    });

    // Pool transactions
    const poolTxs = pool ? await prisma.poolTransaction.findMany({
      where: { poolId: pool.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }) : [];

    // Active users (last 24h, 7d, 30d)
    const activeUsers24h = await prisma.user.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    const activeUsers7d = await prisma.user.count({ where: { lastActiveAt: { gte: weekStart } } });
    const activeUsers30d = await prisma.user.count({ where: { lastActiveAt: { gte: monthStart } } });

    // Users with verified email
    const verifiedEmails = await prisma.user.count({ where: { emailVerified: true } });

    return NextResponse.json({
      overview: {
        totalUsers, totalQuestions, totalVotes, totalComments,
        totalPredictions, totalTokenTxs,
        totalXPAwarded: totalXPAwarded._sum.amount || 0,
        usersToday, usersWeek, usersMonth,
        questionsToday, questionsWeek,
        votesToday, votesWeek,
        commentsToday,
        activeQuestions, expiringSoon,
        activeUsers24h, activeUsers7d, activeUsers30d,
        verifiedEmails,
        connectedWallets, siteWallets, verifiedWallets,
      },
      analytics: {
        chartData,
        xpBreakdown: {
          total: totalXPEarned._sum.xp || 0,
          fromVotes: totalXPFromVotes._sum.amount || 0,
          fromQuestions: totalXPFromQuestions._sum.amount || 0,
          fromComments: totalXPFromComments._sum.amount || 0,
        },
        wsrBreakdown: {
          totalClaimed: totalWSRClaimed._sum.totalClaimedWSR || 0,
          totalUnclaimed: totalWSRUnclaimed._sum.unclaimedWSR || 0,
        },
        levelDistribution: levelDistribution.map((l: any) => ({ level: l.level, count: l._count })),
        categoryStats: categoryStats.map((c: any) => ({ category: c.category, count: c._count })),
        txTypeBreakdown: txTypeBreakdown.map((t: any) => ({
          type: t.type, count: t._count, totalAmount: t._sum.amount || 0,
        })),
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
        siteWallets,
        verifiedWallets,
        totalUnclaimedWSR: totalWSRUnclaimed._sum.unclaimedWSR || 0,
        totalClaimedWSR: totalWSRClaimed._sum.totalClaimedWSR || 0,
      },
      walletUsers,
      poolTxs,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
