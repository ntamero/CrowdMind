import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Clear cookie by setting it expired with all possible path/domain combinations
  response.cookies.set('wisery_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
