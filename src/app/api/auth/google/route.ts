import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wisery.live';

export async function GET() {
  const redirectUri = `${APP_URL}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
