import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earn — Vote, Predict & Earn WSR Tokens',
  description: 'Earn XP and WSR tokens by voting on polls, asking questions, making predictions, and completing daily tasks. Convert XP to WSR crypto tokens on Polygon.',
  keywords: ['earn crypto', 'vote to earn', 'earn tokens voting', 'WSR token', 'crypto rewards', 'daily tasks crypto', 'prediction rewards'],
  alternates: { canonical: 'https://wisery.live/earn' },
  openGraph: {
    title: 'Earn WSR Tokens | Wisery',
    description: 'Vote, predict, and earn real crypto rewards. 250 XP = 1 WSR token.',
    url: 'https://wisery.live/earn',
  },
};

export default function EarnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
