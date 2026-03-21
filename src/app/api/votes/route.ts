import { NextRequest, NextResponse } from 'next/server';
import { castVote } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Connect wallet to vote.' }, { status: 401 });
    }

    const body = await request.json();
    const vote = await castVote(user.id, body.questionId, body.optionId);
    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to vote';
    const status = message === 'Already voted' ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
