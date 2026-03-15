import { NextRequest, NextResponse } from 'next/server';
import { getQuestionById } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await getQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json(question);
  } catch (error) {
    console.error('[API /questions/[id] GET]', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}
