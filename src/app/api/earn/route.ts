import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ dailyTasks: [], streak: 0, achievements: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wisery-secret-2026') as any;
    const userId = decoded.userId;

    // Get today's start (UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, streak: true, reputation: true, totalVotes: true, totalQuestions: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ dailyTasks: [], streak: 0, achievements: [] });
    }

    // Count today's activities
    const [todayVotes, todayQuestions, todayComments] = await Promise.all([
      prisma.vote.count({
        where: { userId, createdAt: { gte: todayStart } },
      }),
      prisma.question.count({
        where: { userId, createdAt: { gte: todayStart } },
      }),
      prisma.comment.count({
        where: { userId, createdAt: { gte: todayStart } },
      }),
    ]);

    // Daily tasks with real progress
    const dailyTasks = [
      { id: '1', title: 'Cast 3 Votes', desc: 'Vote on any 3 questions', reward: '+3 XP', progress: Math.min(todayVotes, 3), total: 3 },
      { id: '2', title: 'Create a Poll', desc: 'Ask the community something', reward: '+3 XP', progress: Math.min(todayQuestions, 1), total: 1 },
      { id: '3', title: 'Leave 2 Comments', desc: 'Share your thoughts on questions', reward: '+2 XP', progress: Math.min(todayComments, 2), total: 2 },
    ];

    const completedCount = dailyTasks.filter(t => t.progress >= t.total).length;

    // Hours until reset (midnight UTC)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    midnight.setUTCHours(0, 0, 0, 0);
    const hoursLeft = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));

    // Achievements based on real data
    const achievements = [
      { title: 'First Vote', desc: 'Cast your first vote', icon: '🗳️', unlocked: user.totalVotes >= 1, rarity: 'common' },
      { title: 'Poll Creator', desc: 'Create your first question', icon: '📝', unlocked: user.totalQuestions >= 1, rarity: 'common' },
      { title: 'Active Voter', desc: 'Cast 10 votes', icon: '🎯', unlocked: user.totalVotes >= 10, rarity: 'rare' },
      { title: 'Prolific', desc: 'Create 5 questions', icon: '✨', unlocked: user.totalQuestions >= 5, rarity: 'rare' },
      { title: 'Dedicated', desc: 'Earn 100 XP', icon: '🏅', unlocked: user.xp >= 100, rarity: 'epic' },
      { title: 'Whale', desc: 'Earn 1,000+ XP', icon: '🐋', unlocked: user.xp >= 1000, rarity: 'legendary' },
    ];

    return NextResponse.json({
      dailyTasks,
      completedCount,
      totalTasks: dailyTasks.length,
      hoursLeft,
      streak: user.streak,
      achievements,
    });
  } catch (error) {
    console.error('Earn API error:', error);
    return NextResponse.json({ dailyTasks: [], streak: 0, achievements: [], completedCount: 0, totalTasks: 0, hoursLeft: 24 });
  }
}
