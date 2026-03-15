import { NextRequest, NextResponse } from 'next/server';
import { mockQuestions } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') || 'trending';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  let questions = [...mockQuestions];

  if (category) {
    questions = questions.filter((q) => q.category === category);
  }
  if (status) {
    questions = questions.filter((q) => q.status === status);
  }

  if (sort === 'trending') {
    questions.sort((a, b) => b.totalVotes - a.totalVotes);
  } else if (sort === 'newest') {
    questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const start = (page - 1) * limit;
  const paginated = questions.slice(start, start + limit);

  return NextResponse.json({
    questions: paginated,
    total: questions.length,
    page,
    totalPages: Math.ceil(questions.length / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newQuestion = {
    id: 'q' + Date.now(),
    userId: 'u1',
    user: mockQuestions[0].user,
    title: body.title,
    description: body.description,
    category: body.category,
    options: body.options.map((text: string, i: number) => ({
      id: 'o' + (i + 1),
      text,
      votes: 0,
      percentage: 0,
      color: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'][i],
    })),
    totalVotes: 0,
    totalComments: 0,
    tags: body.tags || [],
    status: 'active' as const,
    visibility: body.visibility || 'public',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(newQuestion, { status: 201 });
}
