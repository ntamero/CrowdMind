import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WSR Token — Wisery Crypto Token on Polygon',
  description: 'WSR (Wisery) is an ERC-20 token on Polygon network. Earn WSR by voting and predicting. 1B total supply, community-driven tokenomics. Convert XP to WSR.',
  keywords: ['WSR token', 'Wisery token', 'ERC-20 token', 'Polygon token', 'crypto token', 'prediction token', 'vote to earn token'],
  alternates: { canonical: 'https://wisery.live/token' },
  openGraph: {
    title: 'WSR Token — Wisery Crypto on Polygon',
    description: 'ERC-20 token on Polygon. Earn by voting and predicting. 1B supply.',
    url: 'https://wisery.live/token',
  },
};

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
