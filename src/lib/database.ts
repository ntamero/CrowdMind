// ============================================
// Wisery - Database Layer (Prisma + PostgreSQL)
// ============================================

import prisma from './prisma';
import { mockQuestions, mockPredictions } from '@/lib/mock-data';
import { analyzeWithAI } from '@/lib/ai-providers';
import { getOpenFangAnalysis } from '@/lib/openfang';

const OPTION_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// XP/WSR Reward constants (adjustable via admin panel later)
const XP_VOTE = 1;            // 1 XP per vote
const XP_CREATE_QUESTION = 3; // 3 XP per question created
const XP_COMMENT = 1;         // 1 XP per comment
const XP_PREDICTION = 5;      // 5 XP per prediction
const XP_PER_WSR = 250;       // 250 XP = 1 WSR token

// ─── Questions ──────────────────────────────────────

export async function getQuestions(filters: {
  category?: string | null;
  status?: string | null;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const { category, status, sort = 'trending', page = 1, limit = 10 } = filters;

  try {
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const orderBy = sort === 'newest'
      ? { createdAt: 'desc' as const }
      : { totalVotes: 'desc' as const };

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true, level: true, reputation: true, badge: true } },
          options: { orderBy: { id: 'asc' } },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions: questions.map(transformQuestion),
      total,
    };
  } catch (err) {
    console.error('getQuestions error, using mock:', err);
    let questions = [...mockQuestions];
    if (category) questions = questions.filter((q) => q.category === category);
    if (sort === 'newest') questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else questions.sort((a, b) => b.totalVotes - a.totalVotes);
    const start = (page - 1) * limit;
    return { questions: questions.slice(start, start + limit), total: questions.length };
  }
}

export async function getQuestionById(id: string) {
  try {
    const q = await prisma.question.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true, level: true, reputation: true, badge: true } },
        options: { orderBy: { id: 'asc' } },
        comments: {
          include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true, level: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!q) return null;
    return transformQuestion(q);
  } catch {
    return mockQuestions.find((q) => q.id === id) || null;
  }
}

export async function createQuestion(userId: string, body: {
  title: string;
  description?: string;
  category: string;
  options: string[];
  tags?: string[];
  visibility?: string;
  duration?: string;
}) {
  // Calculate expiry from duration
  const durationMs: Record<string, number> = {
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  const expiresAt = body.duration && durationMs[body.duration]
    ? new Date(Date.now() + durationMs[body.duration])
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // default 24h

  try {
    const question = await prisma.question.create({
      data: {
        title: body.title,
        description: body.description || '',
        category: body.category,
        tags: body.tags || [],
        visibility: body.visibility || 'public',
        expiresAt,
        userId,
        options: {
          create: body.options.map((label) => ({ label })),
        },
      },
      include: {
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true, level: true, reputation: true, badge: true } },
        options: true,
      },
    });

    // Award XP for creating a question
    await awardXP(userId, XP_CREATE_QUESTION, 'Created a question');

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: { totalQuestions: { increment: 1 } },
    });

    // Trigger AI analysis in background (don't await - fire and forget)
    triggerAIAnalysis(question.id, body.title, body.options, body.category).catch(() => {});

    return transformQuestion(question);
  } catch (err) {
    console.error('createQuestion error:', err);
    throw err;
  }
}

// ─── Votes ──────────────────────────────────────────

export async function castVote(userId: string, questionId: string, optionId: string) {
  try {
    // Check if user owns this question
    const question = await prisma.question.findUnique({ where: { id: questionId }, select: { userId: true, expiresAt: true, status: true } });
    if (!question) throw new Error('Question not found');
    if (question.userId === userId) throw new Error('You cannot vote on your own question');
    if (question.status === 'closed') throw new Error('This question is closed');
    if (question.expiresAt && question.expiresAt < new Date()) throw new Error('This question has expired');

    // Check if already voted
    const existing = await prisma.vote.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (existing) throw new Error('Already voted');

    // Create vote
    const vote = await prisma.vote.create({
      data: { userId, questionId, optionId },
    });

    // Update option vote count
    await prisma.questionOption.update({
      where: { id: optionId },
      data: { voteCount: { increment: 1 } },
    });

    // Update question total votes
    await prisma.question.update({
      where: { id: questionId },
      data: { totalVotes: { increment: 1 } },
    });

    // Award XP for voting
    await awardXP(userId, XP_VOTE, 'Voted on a question');

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: { totalVotes: { increment: 1 } },
    });

    return vote;
  } catch (err: any) {
    if (err.message === 'Already voted') throw err;
    if (err.code === 'P2002') throw new Error('Already voted');
    throw err;
  }
}

// ─── Predictions ────────────────────────────────────

export async function getPredictions() {
  try {
    const predictions = await prisma.prediction.findMany({
      orderBy: { createdAt: 'desc' },
      include: { options: true },
    });
    return predictions.map(transformPrediction);
  } catch {
    return mockPredictions;
  }
}

// ─── Users / Leaderboard ────────────────────────────

export async function getLeaderboard(limit = 20) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { reputation: 'desc' },
      take: limit,
      select: {
        id: true, displayName: true, username: true, avatarUrl: true,
        reputation: true, level: true, badge: true, xp: true,
        totalVotes: true, totalQuestions: true, totalPredictions: true,
        predictionAccuracy: true, streak: true, createdAt: true,
      },
    });

    return users.map((u, i) => ({
      rank: i + 1,
      user: {
        id: u.id,
        username: u.username || 'user',
        displayName: u.displayName || 'User',
        avatar: u.avatarUrl || '',
        reputation: u.reputation,
        level: u.level,
        badge: u.badge,
        totalVotes: u.totalVotes,
        totalQuestions: u.totalQuestions,
        totalPredictions: u.totalPredictions,
        predictionAccuracy: u.predictionAccuracy,
        streak: u.streak,
        joinedAt: u.createdAt.toISOString(),
      },
      score: u.reputation,
      accuracy: u.predictionAccuracy,
      streak: u.streak,
      change: 0,
    }));
  } catch {
    const { mockLeaderboard } = await import('@/lib/mock-data');
    return mockLeaderboard;
  }
}

// ─── Comments ───────────────────────────────────────

export async function getComments(questionId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { questionId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true, level: true } },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      user: c.user ? {
        id: c.user.id,
        username: c.user.username || 'user',
        displayName: c.user.displayName || 'User',
        avatar: c.user.avatarUrl || '',
        level: c.user.level,
      } : undefined,
      questionId: c.questionId,
      text: c.text,
      likes: c.likesCount,
      createdAt: c.createdAt.toISOString(),
    }));
  } catch {
    const { mockComments } = await import('@/lib/mock-data');
    return mockComments.filter((c) => c.questionId === questionId);
  }
}

export async function createComment(userId: string, questionId: string, text: string) {
  try {
    const comment = await prisma.comment.create({
      data: { userId, questionId, text },
      include: {
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true, level: true } },
      },
    });

    // Update question comment count
    await prisma.question.update({
      where: { id: questionId },
      data: { totalComments: { increment: 1 } },
    });

    // Award XP
    await awardXP(userId, XP_COMMENT, 'Left a comment');

    return {
      id: comment.id,
      userId: comment.userId,
      user: comment.user,
      questionId: comment.questionId,
      text: comment.text,
      likes: 0,
      createdAt: comment.createdAt.toISOString(),
    };
  } catch (err) {
    console.error('createComment error:', err);
    throw err;
  }
}

// ─── Platform Stats ─────────────────────────────────

export async function getPlatformStats() {
  try {
    const [totalUsers, totalQuestions, totalVotes, totalPredictions] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.vote.count(),
      prisma.prediction.count(),
    ]);

    return {
      totalUsers,
      totalQuestions,
      totalVotes,
      totalPredictions,
      activeNow: Math.floor(Math.random() * 500) + 100,
      questionsToday: Math.floor(Math.random() * 50) + 10,
    };
  } catch {
    const { mockStats } = await import('@/lib/mock-data');
    return mockStats;
  }
}

// ─── XP & Reward System ─────────────────────────────

export async function awardXP(userId: string, amount: number, reason: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: amount },
        reputation: { increment: Math.floor(amount / 5) },
      },
    });

    // Level up check: every 1000 XP = 1 level
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    // Log transaction
    await prisma.tokenTransaction.create({
      data: {
        userId,
        type: 'earn',
        amount,
        description: `${reason} (+${amount} XP)`,
      },
    });

    return { xp: user.xp, level: newLevel };
  } catch (err) {
    console.error('awardXP error:', err);
  }
}

// ─── AI Analysis (Background) ────────────────────────

async function triggerAIAnalysis(questionId: string, title: string, options: string[], category: string) {
  try {
    // Run MIA and OpenFang in parallel
    const [miaResult, openfangResult] = await Promise.all([
      analyzeWithAI({
        questionTitle: title,
        options: options.map((text, i) => ({ text, votes: 0, percentage: 0 })),
        totalVotes: 0,
        category,
      }).catch(() => null),
      getOpenFangAnalysis(title, options, category).catch(() => null),
    ]);

    // Build AI comment text
    const parts: string[] = [];
    if (miaResult?.summary) parts.push(`MIA: ${miaResult.summary}`);
    if (openfangResult) parts.push(`OpenFang: ${openfangResult}`);

    if (parts.length === 0) return;

    // Save as AI comment on the question (using a system user or first comment)
    // For now, store as a notification or system comment
    const aiCommentText = parts.join('\n\n');

    // Create AI system comment
    await prisma.comment.create({
      data: {
        questionId,
        userId: 'system', // Will need a system user, fallback handled below
        text: `🤖 AI Analysis:\n${aiCommentText}`,
      },
    }).catch(async () => {
      // If system user doesn't exist, try to create one
      let systemUser = await prisma.user.findFirst({ where: { email: 'mia@wisery.live' } });
      if (!systemUser) {
        const { hashPassword } = await import('@/lib/auth');
        systemUser = await prisma.user.create({
          data: {
            email: 'mia@wisery.live',
            passwordHash: await hashPassword('mia-system-2026'),
            displayName: 'MIA',
            username: 'mia',
            avatarUrl: '',
            role: 'system',
            badge: 'ai',
          },
        });
      }
      await prisma.comment.create({
        data: {
          questionId,
          userId: systemUser.id,
          text: `🤖 AI Analysis:\n${aiCommentText}`,
        },
      });
      await prisma.question.update({
        where: { id: questionId },
        data: { totalComments: { increment: 1 } },
      });
    });

    console.log(`AI analysis completed for question: ${questionId}`);
  } catch (err) {
    console.error('triggerAIAnalysis error:', err);
  }
}

// ─── Transformers ───────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function transformQuestion(q: any) {
  const totalVotes = q.totalVotes || 0;
  const options = (q.options || []).map((o: any, i: number) => ({
    id: o.id,
    text: o.label,
    votes: o.voteCount || 0,
    percentage: totalVotes > 0 ? Math.round(((o.voteCount || 0) / totalVotes) * 100) : 0,
    color: OPTION_COLORS[i % OPTION_COLORS.length],
  }));

  // Generate trend data from option vote distribution
  const trendData = totalVotes > 0
    ? options.map((o: any) => o.votes).filter((v: number) => v > 0)
    : undefined;

  return {
    id: q.id,
    userId: q.userId,
    user: q.user ? {
      id: q.user.id,
      username: q.user.username || 'user',
      displayName: q.user.displayName || 'User',
      avatar: q.user.avatarUrl || '',
      reputation: q.user.reputation || 0,
      level: q.user.level || 1,
      badge: q.user.badge || 'newcomer',
    } : undefined,
    title: q.title,
    description: q.description || '',
    category: q.category,
    image: q.imageUrl || null,
    options,
    totalVotes,
    totalComments: q.totalComments || 0,
    tags: q.tags || [],
    status: q.status || 'active',
    visibility: q.visibility || 'public',
    createdAt: q.createdAt?.toISOString?.() || q.createdAt,
    expiresAt: q.expiresAt?.toISOString?.() || q.expiresAt,
    trendData: trendData && trendData.length >= 2 ? trendData : undefined,
  };
}

function transformPrediction(p: any) {
  return {
    id: p.id,
    title: p.title,
    description: p.description || '',
    category: p.category,
    targetDate: p.targetDate?.toISOString?.() || p.targetDate,
    options: (p.options || []).map((o: any) => ({
      id: o.id,
      text: o.label,
      odds: o.odds || 50,
      participants: 0,
    })),
    totalParticipants: 0,
    status: p.status || 'open',
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
