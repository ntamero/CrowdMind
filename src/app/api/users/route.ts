import { NextResponse } from 'next/server';
import { mockUsers, mockLeaderboard, mockStats } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    users: mockUsers,
    leaderboard: mockLeaderboard,
    stats: mockStats,
  });
}
