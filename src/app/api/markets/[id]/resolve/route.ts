import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notifyPredictionResolved } from '@/lib/telegram';

// WSR reward per correct prediction
const WSR_CORRECT_PREDICTION = 100;
const WSR_POOL_SHARE = true; // Winners share the pool

/**
 * POST /api/markets/[id]/resolve
 * Resolve a prediction market — set the winning option, distribute rewards
 * Only admin or question creator can resolve
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const { winningOptionId } = await request.json();

    if (!winningOptionId) {
      return NextResponse.json({ error: 'winningOptionId required' }, { status: 400 });
    }

    // Get the question with options and votes
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        votes: { include: { user: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check permission — only creator or admin
    if (question.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only creator or admin can resolve' }, { status: 403 });
    }

    if (question.status === 'closed') {
      return NextResponse.json({ error: 'Already resolved' }, { status: 400 });
    }

    // Find winning option
    const winningOption = question.options.find(o => o.id === winningOptionId);
    if (!winningOption) {
      return NextResponse.json({ error: 'Invalid option ID' }, { status: 400 });
    }

    // Separate winners and losers
    const winners = question.votes.filter(v => v.optionId === winningOptionId);
    const losers = question.votes.filter(v => v.optionId !== winningOptionId);

    // Calculate rewards
    const totalPool = question.totalVotes * WSR_CORRECT_PREDICTION;
    const rewardPerWinner = winners.length > 0
      ? Math.floor(totalPool / winners.length)
      : 0;

    // Award winners
    for (const vote of winners) {
      // Award XP + WSR
      await prisma.user.update({
        where: { id: vote.userId },
        data: {
          xp: { increment: rewardPerWinner },
          reputation: { increment: Math.floor(rewardPerWinner / 5) },
          totalPredictions: { increment: 1 },
        },
      });

      // Log transaction
      await prisma.tokenTransaction.create({
        data: {
          userId: vote.userId,
          type: 'win',
          amount: rewardPerWinner,
          description: `Won prediction: "${question.title}" (+${rewardPerWinner} WSR)`,
        },
      });
    }

    // Update losers stats
    for (const vote of losers) {
      await prisma.user.update({
        where: { id: vote.userId },
        data: { totalPredictions: { increment: 1 } },
      });

      await prisma.tokenTransaction.create({
        data: {
          userId: vote.userId,
          type: 'stake',
          amount: -WSR_CORRECT_PREDICTION,
          description: `Lost prediction: "${question.title}"`,
        },
      });
    }

    // Update question status
    await prisma.question.update({
      where: { id },
      data: { status: 'closed' },
    });

    // Update prediction accuracy for all participants
    for (const vote of [...winners, ...losers]) {
      const userVotes = await prisma.vote.findMany({
        where: { userId: vote.userId },
        include: { question: true },
      });
      const resolvedVotes = userVotes.filter(v => v.question.status === 'closed');
      // This is simplified — in production you'd track won/lost per vote
    }

    // Notify Telegram
    notifyPredictionResolved(
      question.title,
      winningOption.label,
      winners.length,
      id,
    ).catch(() => {});

    return NextResponse.json({
      resolved: true,
      questionId: id,
      winningOption: winningOption.label,
      winners: winners.length,
      losers: losers.length,
      rewardPerWinner,
      totalPool,
    });
  } catch (error) {
    console.error('[API /markets/resolve] Error:', error);
    return NextResponse.json({ error: 'Failed to resolve market' }, { status: 500 });
  }
}
