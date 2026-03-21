import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ALWAYS send 2FA code — every login requires verification
    const code = generateVerificationCode();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    sendVerificationEmail(email, code).catch(() => {});

    // NO cookie set — must verify code first
    return NextResponse.json({
      requiresVerification: true,
      email: user.email,
      message: 'Verification code sent to your email.',
    }, { status: 403 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
