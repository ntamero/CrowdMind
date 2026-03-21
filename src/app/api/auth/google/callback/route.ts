import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, setAuthCookie, hashPassword } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wisery.live';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/auth?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${APP_URL}/auth?error=google_token_failed`);
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${APP_URL}/auth?error=google_no_email`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      // Create new user from Google
      const username = googleUser.email.split('@')[0] + Math.floor(Math.random() * 100);
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          passwordHash: await hashPassword(`google_${googleUser.id}_${Date.now()}`),
          displayName: googleUser.name || googleUser.email.split('@')[0],
          username,
          avatarUrl: googleUser.picture || null,
          emailVerified: true, // Google emails are already verified
        },
      });
    } else if (!user.emailVerified) {
      // If user exists but not verified, verify now (Google verified)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          avatarUrl: user.avatarUrl || googleUser.picture || null,
        },
      });
    }

    // Generate JWT
    const token = generateToken(user.id);
    await setAuthCookie(token);

    // Redirect to home
    return NextResponse.redirect(`${APP_URL}/`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`${APP_URL}/auth?error=google_failed`);
  }
}
