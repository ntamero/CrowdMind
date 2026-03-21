import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      // Already verified — just log them in
      const token = generateToken(user.id);
      await setAuthCookie(token);
      return NextResponse.json({ verified: true, message: 'Already verified' });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return NextResponse.json({ error: 'Code expired. Please login again to get a new code.' }, { status: 400 });
    }

    // Verify email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    // Now set auth cookie — user is verified
    const token = generateToken(user.id);
    await setAuthCookie(token);

    // Send welcome email
    sendWelcomeEmail(user.email, user.displayName || 'User').catch(() => {});

    return NextResponse.json({ verified: true, message: 'Email verified! Welcome to Wisery.' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
