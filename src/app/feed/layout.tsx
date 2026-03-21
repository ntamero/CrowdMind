import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feed — Community Polls & Predictions',
  description: 'Browse the latest polls, predictions, and community questions on Wisery. Vote on trending topics, share your opinion, and earn XP rewards.',
  keywords: ['social feed', 'community polls', 'predictions', 'trending questions', 'vote earn crypto'],
  alternates: { canonical: 'https://wisery.live/feed' },
  openGraph: {
    title: 'Wisery Feed — Community Polls & Predictions',
    description: 'Browse polls, vote on outcomes, earn rewards. The crowd knows.',
    url: 'https://wisery.live/feed',
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
