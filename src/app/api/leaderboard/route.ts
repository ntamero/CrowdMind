import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 50,
      select: {
        id: true,
        displayName: true,
        username: true,
        xp: true,
        level: true,
        reputation: true,
        totalVotes: true,
        totalQuestions: true,
        streak: true,
        badge: true,
      },
    });

    const leaderboard = users.map((u: any, i: number) => ({
      rank: i + 1,
      user: {
        id: u.id,
        displayName: u.displayName || u.username || 'Anonymous',
        username: u.username || 'user',
        badge: u.badge || 'newcomer',
      },
      score: u.xp,
      accuracy: u.totalVotes > 0 ? Math.min(99, 50 + Math.floor((u.xp / Math.max(1, u.totalVotes)) * 5)) : 0,
      streak: u.streak,
      change: 0,
      wsrEarned: Math.floor(u.xp / 250),
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ leaderboard: [] });
  }
}
