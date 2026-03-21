import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const [myQuestions, myVotes, myComments, transactions, totalUsers, totalQuestions, totalVotes] = await Promise.all([
      prisma.question.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { options: true },
      }),
      prisma.vote.count({ where: { userId: user.id } }),
      prisma.comment.count({ where: { userId: user.id } }),
      prisma.tokenTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.user.count(),
      prisma.question.count(),
      prisma.vote.count(),
    ]);

    // Get full user with latest data
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });

    return NextResponse.json({
      user: {
        id: fullUser?.id,
        email: fullUser?.email,
        displayName: fullUser?.displayName,
        username: fullUser?.username,
        avatarUrl: fullUser?.avatarUrl,
        xp: fullUser?.xp || 0,
        level: fullUser?.level || 1,
        reputation: fullUser?.reputation || 0,
        badge: fullUser?.badge || 'newcomer',
        streak: fullUser?.streak || 0,
        totalVotes: fullUser?.totalVotes || 0,
        totalQuestions: fullUser?.totalQuestions || 0,
        walletAddress: fullUser?.walletAddress,
        createdAt: fullUser?.createdAt,
      },
      myQuestions: myQuestions.map(q => ({
        id: q.id,
        title: q.title,
        category: q.category,
        totalVotes: q.totalVotes,
        totalComments: q.totalComments,
        status: q.status,
        expiresAt: q.expiresAt,
        createdAt: q.createdAt,
        options: q.options.map(o => ({ id: o.id, label: o.label, voteCount: o.voteCount })),
      })),
      stats: {
        myVotes,
        myComments,
        myQuestions: myQuestions.length,
        xpToNextLevel: ((fullUser?.level || 1) * 1000) - (fullUser?.xp || 0),
        wsrTokens: Math.floor((fullUser?.xp || 0) / 250),
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
      })),
      platformStats: {
        totalUsers,
        totalQuestions,
        totalVotes,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
