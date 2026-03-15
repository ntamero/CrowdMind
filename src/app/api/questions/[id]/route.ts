import { NextRequest, NextResponse } from 'next/server';
import { mockQuestions } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const question = mockQuestions.find((q) => q.id === id);
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  return NextResponse.json(question);
}
