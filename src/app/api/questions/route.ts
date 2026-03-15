import { NextRequest, NextResponse } from 'next/server';
import { getQuestions, createQuestion } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { questions, total } = await getQuestions({
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      sort: searchParams.get('sort') || 'trending',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    });

    return NextResponse.json({
      questions,
      total,
      page: parseInt(searchParams.get('page') || '1'),
      totalPages: Math.ceil(total / parseInt(searchParams.get('limit') || '10')),
    });
  } catch (error) {
    console.error('[API /questions GET]', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // In production, get userId from auth session
    const userId = body.userId || 'anonymous';
    const question = await createQuestion(userId, body);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('[API /questions POST]', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
