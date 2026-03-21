import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const verificationCode = generateVerificationCode();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: name || email.split('@')[0],
        username,
        emailVerified: false,
        verificationCode,
        verificationExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    // NO cookie — user must verify email first
    return NextResponse.json({
      email: user.email,
      requiresVerification: true,
      message: 'Verification code sent to your email.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
