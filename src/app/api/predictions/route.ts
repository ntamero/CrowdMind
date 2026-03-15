import { NextRequest, NextResponse } from 'next/server';
import { getPredictions } from '@/lib/database';

export async function GET() {
  try {
    const predictions = await getPredictions();
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('[API /predictions GET]', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prediction = {
      id: 'p' + Date.now(),
      ...body,
      totalParticipants: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('[API /predictions POST]', error);
    return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 });
  }
}
