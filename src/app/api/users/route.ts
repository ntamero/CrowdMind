import { NextResponse } from 'next/server';
import { getLeaderboard, getPlatformStats } from '@/lib/database';

export async function GET() {
  try {
    const [leaderboard, stats] = await Promise.all([
      getLeaderboard(),
      getPlatformStats(),
    ]);

    return NextResponse.json({ leaderboard, stats });
  } catch (error) {
    console.error('[API /users GET]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
