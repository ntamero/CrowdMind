import { NextResponse } from 'next/server';
import { sendWelcomeMessage, sendDailyReport } from '@/lib/telegram';

export async function GET() {
  const success = await sendWelcomeMessage();
  return NextResponse.json({ success, message: success ? 'Welcome message sent!' : 'Failed to send. Check bot token and chat ID.' });
}

export async function POST() {
  // Send a mock daily report
  const success = await sendDailyReport({
    totalVotes: 1247,
    newQuestions: 23,
    activeUsers: 342,
    topQuestion: 'Will Bitcoin hit $120K before June 2026?',
    aiInsight: 'Tech optimism at 3-month high. 78% believe AI will transform healthcare by 2027. Crypto sentiment turned bullish after BTC broke $95K.',
  });
  return NextResponse.json({ success, message: success ? 'Daily report sent!' : 'Failed to send.' });
}
