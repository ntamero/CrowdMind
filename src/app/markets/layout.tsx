import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Markets — Live Crypto Price Predictions',
  description: 'Predict Bitcoin, Ethereum, Solana price movements in real-time. Place bets with XP, win up to 2x returns. Live prices from Binance, 5-minute and 15-minute markets.',
  keywords: ['crypto prediction', 'bitcoin price prediction', 'live trading', 'price prediction market', 'polymarket alternative', 'crypto betting', 'binary options crypto'],
  alternates: { canonical: 'https://wisery.live/markets' },
  openGraph: {
    title: 'Quick Markets — Live Crypto Predictions | Wisery',
    description: 'Predict BTC, ETH, SOL price movements. Win up to 2x returns. Updated every 5 seconds.',
    url: 'https://wisery.live/markets',
  },
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
