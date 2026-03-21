import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Return user with emailVerified status — frontend decides what to show
  return NextResponse.json({
    user: {
      ...user,
      emailVerified: (user as any).emailVerified || false,
    },
  });
}
