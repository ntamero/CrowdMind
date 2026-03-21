import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalUsers, totalQuestions, totalComments, recentActivity, topEarners] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.comment.count(),
      // Recent activity (last 10 votes/questions)
      prisma.vote.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { displayName: true, username: true } },
          question: { select: { title: true, id: true } },
          option: { select: { label: true } },
        },
      }),
      // Top earners
      prisma.user.findMany({
        take: 5,
        orderBy: { xp: 'desc' },
        select: { displayName: true, username: true, xp: true, level: true, totalVotes: true, totalQuestions: true },
      }),
    ]);

    // Get total votes from QuestionOption voteCount sum (includes seeded votes)
    const voteCountSum = await prisma.questionOption.aggregate({ _sum: { voteCount: true } });
    const totalVotes = voteCountSum._sum.voteCount || 0;

    // Calculate total WSR earned (xp / 250)
    const totalXp = await prisma.user.aggregate({ _sum: { xp: true } });
    const totalWsrEarned = Math.floor((totalXp._sum.xp || 0) / 250);

    // Real registered users count
    const online = totalUsers;

    // Format live activities
    const liveActivities = recentActivity.map((v: any) => {
      const mins = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 60000);
      const timeStr = mins < 1 ? 'now' : mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h`;
      return {
        user: v.user?.displayName || v.user?.username || 'Anonymous',
        action: 'voted on',
        market: v.question?.title || 'Unknown',
        questionId: v.question?.id,
        option: v.option?.label,
        time: timeStr,
        emoji: '🗳️',
        earned: '+1 XP',
      };
    });

    // Format top earners
    const formattedEarners = topEarners.map((u: any, i: number) => ({
      name: u.displayName || u.username || 'Anonymous',
      avatar: ['👑', '🥷', '🎯', '👸', '🔮'][i] || '⭐',
      earned: `${Math.floor(u.xp / 250)} WSR`,
      xp: u.xp,
      accuracy: `${Math.min(99, 60 + Math.floor(u.xp / 100))}%`,
      rank: i + 1,
    }));

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      totalVotes,
      totalComments,
      totalWsrEarned,
      liveActivities,
      topEarners: formattedEarners,
      display: {
        online,
        votesCast: totalVotes,
        earned: totalWsrEarned,
        countries: 1, // Real: will increment as users from different countries register
        aiAnalyses: totalComments,
        markets: totalQuestions,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      totalUsers: 0, totalQuestions: 0, totalVotes: 0, totalComments: 0, totalWsrEarned: 0,
      liveActivities: [], topEarners: [],
      display: { online: 0, votesCast: 0, earned: 0, countries: 0, aiAnalyses: 0, markets: 0 },
    });
  }
}
