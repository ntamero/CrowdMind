import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, generateToken, setAuthCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ethers } from 'ethers';

// Rate limiting: track connection attempts per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max attempts
const RATE_WINDOW = 60 * 1000; // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const { address, chain, signature, message } = await req.json();
    if (!address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Verify signature if provided (SIWE)
    if (signature && message) {
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const currentUser = await getCurrentUser();

    if (currentUser) {
      // User is logged in — check email verified
      const fullUser = await prisma.user.findUnique({ where: { id: currentUser.id } });
      if (!fullUser?.emailVerified) {
        return NextResponse.json({ error: 'Please verify your email before connecting wallet' }, { status: 403 });
      }

      // Require signature for linking wallet to account
      if (!signature || !message) {
        return NextResponse.json({ error: 'Wallet signature required for verification' }, { status: 400 });
      }

      const existing = await prisma.user.findFirst({
        where: { walletAddress: address.toLowerCase(), id: { not: currentUser.id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Wallet already linked to another account' }, { status: 409 });
      }

      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          walletAddress: address.toLowerCase(),
          walletChain: chain || 'polygon',
        },
      });

      return NextResponse.json({ success: true, address: address.toLowerCase(), userId: currentUser.id });
    }

    // User NOT logged in — check if wallet already registered
    const existingUser = await prisma.user.findFirst({
      where: { walletAddress: address.toLowerCase() },
    });

    if (existingUser) {
      // Require signature for wallet-based login
      if (!signature || !message) {
        return NextResponse.json({
          error: 'Wallet signature required for login',
          requiresSignature: true,
        }, { status: 401 });
      }

      // Auto-login existing wallet user (signature already verified above)
      const token = generateToken(existingUser.id);
      await setAuthCookie(token);
      return NextResponse.json({
        success: true,
        address: address.toLowerCase(),
        userId: existingUser.id,
        displayName: existingUser.displayName,
      });
    }

    // New wallet — require email registration first
    return NextResponse.json({
      error: 'Please register with email first, verify your email, then connect wallet',
      requiresRegistration: true,
    }, { status: 403 });
  } catch (error) {
    console.error('Wallet connect error:', error);
    return NextResponse.json({ error: 'Failed to connect wallet' }, { status: 500 });
  }
}
