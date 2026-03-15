import { NextRequest, NextResponse } from 'next/server';
import type { AIAnalysis } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { questionTitle, options, totalVotes } = body;

  // Simulated AI analysis — in production this would call OpenAI / LLM
  const analysis: AIAnalysis = {
    summary: `Based on ${totalVotes.toLocaleString()} votes for "${questionTitle}", the collective intelligence shows a clear trend. The leading option reflects broader market sentiment and aligns with current global trends.`,
    sentiment: totalVotes > 10000 ? 'positive' : 'neutral',
    confidence: Math.min(95, 50 + Math.floor(totalVotes / 500)),
    insights: [
      `${options[0]?.text || 'Leading option'} leads with strong support across demographics`,
      'Voting patterns suggest high conviction among participants',
      'Similar questions globally show consistent results',
      'Engagement rate is above platform average',
    ],
    recommendation:
      'The crowd wisdom strongly favors the leading option. Consider this alongside your own research and context.',
    demographics: [
      { label: '18-24', value: 35 },
      { label: '25-34', value: 40 },
      { label: '35-44', value: 15 },
      { label: '45+', value: 10 },
    ],
    trendDirection: 'up',
  };

  return NextResponse.json(analysis);
}
