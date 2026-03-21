import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { distributeWSR, getRewardPoolBalance, getGasBalance } from '@/lib/token';

const CRON_SECRET = process.env.CRON_SECRET || '';
const MAX_BATCH_SIZE = 50; // Max recipients per batch tx

/**
 * POST /api/cron/distribute-rewards
 *
 * Processes pending WSR claims and distributes tokens on-chain.
 * Called by cron job (e.g., every 15 minutes) or manually by admin.
 *
 * Auth: Requires CRON_SECRET header or admin user session.
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check deployer WSR balance (acts as reward pool) and gas
    const poolBalance = await getRewardPoolBalance();
    const gasBalance = await getGasBalance();
    if (parseFloat(poolBalance) < 1) {
      return NextResponse.json({
        message: 'Deployer WSR balance too low for distribution',
        poolBalance,
        gasBalance,
      });
    }
    if (parseFloat(gasBalance) < 0.01) {
      return NextResponse.json({
        message: 'Insufficient POL for gas fees',
        poolBalance,
        gasBalance,
      });
    }

    // Find all pending claim transactions with wallet addresses
    const pendingClaims = await prisma.tokenTransaction.findMany({
      where: { type: 'claim', status: 'pending' },
      include: {
        user: {
          select: { id: true, walletAddress: true, unclaimedWSR: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_BATCH_SIZE,
    });

    if (pendingClaims.length === 0) {
      return NextResponse.json({ message: 'No pending claims to process', processed: 0 });
    }

    // Filter to claims where user has a wallet
    const validClaims = pendingClaims.filter(c => c.user.walletAddress);
    if (validClaims.length === 0) {
      return NextResponse.json({ message: 'No claims with connected wallets', processed: 0 });
    }

    // Group claims by user (a user might have multiple pending claims)
    const userClaims = new Map<string, { walletAddress: string; totalAmount: number; claimIds: string[]; userId: string }>();
    for (const claim of validClaims) {
      const existing = userClaims.get(claim.userId);
      if (existing) {
        existing.totalAmount += claim.amount;
        existing.claimIds.push(claim.id);
      } else {
        userClaims.set(claim.userId, {
          walletAddress: claim.user.walletAddress!,
          totalAmount: claim.amount,
          claimIds: [claim.id],
          userId: claim.userId,
        });
      }
    }

    const results: { userId: string; amount: number; status: string; txHash?: string; error?: string }[] = [];

    // Distribute individually (more reliable than batch for error handling)
    for (const [, data] of userClaims) {
      const result = await distributeWSR(
        data.walletAddress,
        data.totalAmount,
        `Wisery XP reward: ${data.totalAmount} WSR`
      );

      if ('txHash' in result) {
        // Success — update all claims and user balance
        await prisma.$transaction([
          prisma.tokenTransaction.updateMany({
            where: { id: { in: data.claimIds } },
            data: { status: 'completed', txHash: result.txHash },
          }),
          prisma.user.update({
            where: { id: data.userId },
            data: {
              unclaimedWSR: { decrement: data.totalAmount },
              totalClaimedWSR: { increment: data.totalAmount },
            },
          }),
        ]);

        results.push({
          userId: data.userId,
          amount: data.totalAmount,
          status: 'completed',
          txHash: result.txHash,
        });
      } else {
        // Failed — mark claims as failed
        await prisma.tokenTransaction.updateMany({
          where: { id: { in: data.claimIds } },
          data: { status: 'failed' },
        });

        results.push({
          userId: data.userId,
          amount: data.totalAmount,
          status: 'failed',
          error: result.error,
        });
      }
    }

    const completed = results.filter(r => r.status === 'completed');
    const failed = results.filter(r => r.status === 'failed');

    return NextResponse.json({
      message: `Distribution complete: ${completed.length} success, ${failed.length} failed`,
      processed: results.length,
      totalDistributed: completed.reduce((sum, r) => sum + r.amount, 0),
      results,
    });
  } catch (error) {
    console.error('Reward distribution cron error:', error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}

// GET: Check distribution status (admin view)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [pending, completed, failed, poolBalance, gasBalance] = await Promise.all([
      prisma.tokenTransaction.count({ where: { type: 'claim', status: 'pending' } }),
      prisma.tokenTransaction.count({ where: { type: 'claim', status: 'completed' } }),
      prisma.tokenTransaction.count({ where: { type: 'claim', status: 'failed' } }),
      getRewardPoolBalance(),
      getGasBalance(),
    ]);

    return NextResponse.json({
      pendingClaims: pending,
      completedClaims: completed,
      failedClaims: failed,
      wsrBalance: poolBalance,
      gasBalance,
    });
  } catch (error) {
    console.error('Distribution status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
