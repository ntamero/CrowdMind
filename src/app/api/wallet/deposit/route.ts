import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

const XP_PER_WSR = 250;
const DEPOSIT_FEE_XP = 10; // 10 XP fee (deducted from credited XP)

// WSR → XP: Convert unclaimed WSR back to XP
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, xp: true, unclaimedWSR: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedWSR = body.amount ? Math.floor(body.amount) : null;

    if (!requestedWSR || requestedWSR < 1) {
      return NextResponse.json({ error: 'Minimum 1 WSR to convert' }, { status: 400 });
    }

    if (user.unclaimedWSR < requestedWSR) {
      return NextResponse.json({
        error: `Insufficient WSR. You have ${user.unclaimedWSR} unclaimed WSR.`,
        available: user.unclaimedWSR,
      }, { status: 400 });
    }

    const xpToCredit = (requestedWSR * XP_PER_WSR) - DEPOSIT_FEE_XP;
    const feeWSR = DEPOSIT_FEE_XP / XP_PER_WSR; // 0.04 WSR fee equivalent

    // Get pool wallet
    const pool = await prisma.poolWallet.upsert({
      where: { type: 'fee_pool' },
      create: { type: 'fee_pool', totalWSR: 0, totalXPFees: 0, txCount: 0 },
      update: {},
    });

    // Atomically: decrement WSR, increment XP, log fee to pool
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          unclaimedWSR: { decrement: requestedWSR },
          xp: { increment: xpToCredit },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          type: 'transfer',
          amount: requestedWSR,
          description: `Converted ${requestedWSR} WSR → ${xpToCredit} XP (fee: ${DEPOSIT_FEE_XP} XP → ${feeWSR} WSR to pool)`,
          status: 'completed',
        },
      }),
      prisma.poolWallet.update({
        where: { id: pool.id },
        data: {
          totalWSR: { increment: feeWSR },
          totalXPFees: { increment: DEPOSIT_FEE_XP },
          txCount: { increment: 1 },
        },
      }),
      prisma.poolTransaction.create({
        data: {
          poolId: pool.id,
          userId: user.id,
          feeXP: DEPOSIT_FEE_XP,
          feeWSR,
          description: `Fee from ${requestedWSR} WSR → XP deposit`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      wsrSpent: requestedWSR,
      xpCredited: xpToCredit,
      fee: DEPOSIT_FEE_XP,
      remainingWSR: user.unclaimedWSR - requestedWSR,
      newXP: user.xp + xpToCredit,
      message: `Converted ${requestedWSR} WSR → ${xpToCredit} XP (${DEPOSIT_FEE_XP} XP fee deducted)`,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ error: 'Failed to process deposit' }, { status: 500 });
  }
}
