import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithAI } from '@/lib/ai-providers';
import { getOpenFangAnalysis } from '@/lib/openfang';

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

    // Run MIA (Groq) and OpenFang analysis in parallel
    const [miaAnalysis, openfangComment] = await Promise.all([
      analyzeWithAI({ questionTitle, options, totalVotes, category, tags }),
      getOpenFangAnalysis(
        questionTitle,
        options.map((o: any) => o.text || o),
        category || 'general',
        totalVotes,
      ).catch(() => null),
    ]);

    return NextResponse.json({
      ...miaAnalysis,
      openfangInsight: openfangComment || undefined,
    });
  } catch (error) {
    console.error('[API /ai] Error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed' },
      { status: 500 },
    );
  }
}
