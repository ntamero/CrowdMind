import { NextRequest, NextResponse } from 'next/server';
import { castVote } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'anonymous';
    const vote = await castVote(userId, body.questionId, body.optionId);
    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to vote';
    const status = message === 'Already voted' ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
