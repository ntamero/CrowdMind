import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vote = {
    id: 'v' + Date.now(),
    questionId: body.questionId,
    userId: body.userId || 'u1',
    optionId: body.optionId,
    createdAt: new Date().toISOString(),
  };
  return NextResponse.json(vote, { status: 201 });
}
