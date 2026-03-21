import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendDailyReport } from '@/lib/telegram';
import { analyzeWithAI } from '@/lib/ai-providers';

/**
 * GET /api/cron/daily-report
 * Generates and sends daily report to Telegram
 * Called by cron job at 08:00
 * Secured by CRON_SECRET header
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (simple auth for cron)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'wisery-cron-2026';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get today's stats
    const [todayVotes, todayQuestions, totalUsers, topQuestion] = await Promise.all([
      prisma.vote.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.question.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.user.count(),
      prisma.question.findFirst({
        where: { createdAt: { gte: yesterday } },
        orderBy: { totalVotes: 'desc' },
        select: { title: true, totalVotes: true },
      }),
    ]);

    // Generate AI insight for daily report
    let aiInsight = 'Platform activity is healthy. Community engagement continues to grow.';
    try {
      const analysis = await analyzeWithAI({
        questionTitle: `Daily platform summary: ${todayQuestions} new questions, ${todayVotes} votes`,
        options: [{ text: 'Active', votes: todayVotes, percentage: 100 }],
        totalVotes: todayVotes,
        category: 'platform',
      });
      if (analysis?.summary) aiInsight = analysis.summary;
    } catch {}

    // Send to Telegram
    const success = await sendDailyReport({
      totalVotes: todayVotes,
      newQuestions: todayQuestions,
      activeUsers: totalUsers,
      topQuestion: topQuestion?.title || 'No questions today',
      aiInsight,
    });

    return NextResponse.json({
      success,
      stats: { todayVotes, todayQuestions, totalUsers },
    });
  } catch (error) {
    console.error('[Cron daily-report] Error:', error);
    return NextResponse.json({ error: 'Report failed' }, { status: 500 });
  }
}
