import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard — Top Predictors & Voters',
  description: 'See who leads the Wisery community. Top predictors, most active voters, highest XP earners. Compete for the top spot and earn recognition.',
  keywords: ['leaderboard', 'top predictors', 'prediction rankings', 'community leaders', 'xp rankings'],
  alternates: { canonical: 'https://wisery.live/leaderboard' },
  openGraph: {
    title: 'Leaderboard | Wisery',
    description: 'Top predictors and voters in the Wisery community.',
    url: 'https://wisery.live/leaderboard',
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
