import { NextRequest, NextResponse } from 'next/server';
import { getComments, createComment } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const questionId = new URL(request.url).searchParams.get('questionId');
    if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });
    const comments = await getComments(questionId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('[API /comments GET]', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const comment = await createComment(user.id, body.questionId, body.text);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('[API /comments POST]', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
