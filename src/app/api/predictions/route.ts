import { NextRequest, NextResponse } from 'next/server';
import { mockPredictions } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({ predictions: mockPredictions });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prediction = {
    id: 'p' + Date.now(),
    ...body,
    totalParticipants: 0,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  return NextResponse.json(prediction, { status: 201 });
}
