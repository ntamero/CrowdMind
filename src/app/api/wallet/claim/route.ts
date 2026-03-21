import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

const XP_PER_WSR = 250;
const CONVERSION_FEE_XP = 10; // 10 XP fee per conversion
const MIN_CLAIM_WSR = 1; // Minimum 1 WSR per claim (= 250 XP)

// Rate limiting for claims
const claimCooldowns = new Map<string, number>();
const CLAIM_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between claims

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Cooldown check
    const lastClaim = claimCooldowns.get(currentUser.id);
    if (lastClaim && Date.now() - lastClaim < CLAIM_COOLDOWN_MS) {
      const minutesLeft = Math.ceil((CLAIM_COOLDOWN_MS - (Date.now() - lastClaim)) / 60000);
      return NextResponse.json({
        error: `Please wait ${minutesLeft} minutes before claiming again`,
      }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        xp: true,
        walletAddress: true,
        walletVerified: true,
        unclaimedWSR: true,
        totalClaimedWSR: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.walletAddress) {
      return NextResponse.json({ error: 'Connect your wallet first' }, { status: 400 });
    }

    // Check if user wants to convert a specific amount or max
    const body = await req.json().catch(() => ({}));
    const requestedWSR = body.amount ? Math.floor(body.amount) : null;

    // Calculate claimable WSR from current XP (after fee)
    const availableXp = user.xp - CONVERSION_FEE_XP; // Reserve fee
    if (availableXp < XP_PER_WSR) {
      return NextResponse.json({
        error: `Need at least ${XP_PER_WSR + CONVERSION_FEE_XP} XP to convert (${XP_PER_WSR} XP per WSR + ${CONVERSION_FEE_XP} XP fee). You have ${user.xp} XP.`,
        currentXP: user.xp,
        needed: XP_PER_WSR + CONVERSION_FEE_XP,
        fee: CONVERSION_FEE_XP,
      }, { status: 400 });
    }

    const maxClaimable = Math.floor(availableXp / XP_PER_WSR);
    const claimableWSR = requestedWSR ? Math.min(requestedWSR, maxClaimable) : maxClaimable;

    if (claimableWSR < MIN_CLAIM_WSR) {
      return NextResponse.json({
        error: `Need at least ${MIN_CLAIM_WSR * XP_PER_WSR + CONVERSION_FEE_XP} XP to claim.`,
        currentXP: user.xp,
        needed: MIN_CLAIM_WSR * XP_PER_WSR + CONVERSION_FEE_XP,
      }, { status: 400 });
    }

    const xpToConvert = claimableWSR * XP_PER_WSR;
    const totalXpDeducted = xpToConvert + CONVERSION_FEE_XP;

    // Convert XP to unclaimed WSR (atomically) — deduct XP + fee
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { decrement: totalXpDeducted },
          unclaimedWSR: { increment: claimableWSR },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          type: 'claim',
          amount: claimableWSR,
          description: `Converted ${xpToConvert} XP → ${claimableWSR} WSR (fee: ${CONVERSION_FEE_XP} XP)`,
          status: 'pending',
        },
      }),
    ]);

    // Set cooldown
    claimCooldowns.set(currentUser.id, Date.now());

    return NextResponse.json({
      success: true,
      claimed: claimableWSR,
      xpSpent: xpToConvert,
      fee: CONVERSION_FEE_XP,
      totalDeducted: totalXpDeducted,
      remainingXP: user.xp - totalXpDeducted,
      totalUnclaimed: (user.unclaimedWSR || 0) + claimableWSR,
      message: `Converted ${xpToConvert} XP → ${claimableWSR} WSR (${CONVERSION_FEE_XP} XP fee). Tokens will be distributed to your wallet.`,
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 });
  }
}

// GET: Check claim status and eligibility
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        xp: true,
        walletAddress: true,
        unclaimedWSR: true,
        totalClaimedWSR: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const availableXp = Math.max(0, user.xp - CONVERSION_FEE_XP);
    const claimableWSR = Math.floor(availableXp / XP_PER_WSR);
    const lastClaim = claimCooldowns.get(currentUser.id);
    const cooldownRemaining = lastClaim
      ? Math.max(0, CLAIM_COOLDOWN_MS - (Date.now() - lastClaim))
      : 0;

    // Get recent transactions (all types)
    const recentTxs = await prisma.tokenTransaction.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        txHash: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      currentXP: user.xp,
      xpPerWSR: XP_PER_WSR,
      conversionFee: CONVERSION_FEE_XP,
      claimableWSR,
      unclaimedWSR: user.unclaimedWSR || 0,
      totalClaimedWSR: user.totalClaimedWSR || 0,
      walletConnected: !!user.walletAddress,
      walletAddress: user.walletAddress,
      cooldownRemaining: Math.ceil(cooldownRemaining / 60000),
      recentTxs,
    });
  } catch (error) {
    console.error('Claim status error:', error);
    return NextResponse.json({ error: 'Failed to get claim status' }, { status: 500 });
  }
}
