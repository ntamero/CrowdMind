import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithAI } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionTitle, options, totalVotes, category, tags } = body;

    if (!questionTitle || !options || totalVotes === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: questionTitle, options, totalVotes' },
        { status: 400 },
      );
    }

    const analysis = await analyzeWithAI({
      questionTitle,
      options,
      totalVotes,
      category,
      tags,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('[API /ai] Error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed' },
      { status: 500 },
    );
  }
}
