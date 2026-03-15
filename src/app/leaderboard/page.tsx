'use client';

import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Flame,
  Crown,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockLeaderboard } from '@/lib/mock-data';
import { formatNumber, getBadgeColor, cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const podiumVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 18 },
  }),
};

export default function LeaderboardPage() {
  const top3 = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500">
          <Trophy size={28} className="text-white" />
        </div>
        <h1 className="mb-2 text-4xl font-extrabold text-foreground">
          Global{' '}
          <span className="bg-gradient-to-br from-amber-500 to-red-500 bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Top predictors and decision-makers worldwide
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="mb-8 grid grid-cols-3 items-end gap-3 sm:gap-4">
        {/* 2nd place */}
        {top3[1] && (
          <motion.div custom={1} variants={podiumVariants} initial="hidden" animate="visible">
            <PodiumCard entry={top3[1]} height="h-[200px]" medal="silver" icon={<Medal size={24} className="text-slate-400" />} />
          </motion.div>
        )}
        {/* 1st place */}
        {top3[0] && (
          <motion.div custom={0} variants={podiumVariants} initial="hidden" animate="visible">
            <PodiumCard entry={top3[0]} height="h-[240px]" medal="gold" icon={<Crown size={28} className="text-amber-500" />} />
          </motion.div>
        )}
        {/* 3rd place */}
        {top3[2] && (
          <motion.div custom={2} variants={podiumVariants} initial="hidden" animate="visible">
            <PodiumCard entry={top3[2]} height="h-[170px]" medal="bronze" icon={<Award size={22} className="text-amber-700" />} />
          </motion.div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="overflow-hidden bg-card/50 border border-border/30 rounded-xl">
        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_80px_80px_70px_50px] sm:grid-cols-[60px_1fr_100px_100px_80px_60px] items-center border-b border-border px-4 sm:px-6 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <span>Rank</span>
          <span>User</span>
          <span className="text-center">Score</span>
          <span className="text-center">Accuracy</span>
          <span className="text-center">Streak</span>
          <span className="text-center">+/-</span>
        </div>

        {/* Table Rows */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {mockLeaderboard.map((entry) => (
            <motion.div
              key={entry.rank}
              variants={rowVariants}
              className="grid grid-cols-[60px_1fr_80px_80px_70px_50px] sm:grid-cols-[60px_1fr_100px_100px_80px_60px] items-center border-b border-border/50 px-4 sm:px-6 py-3.5 transition-colors hover:bg-secondary/50"
            >
              {/* Rank */}
              <span
                className={cn(
                  'text-lg font-extrabold',
                  entry.rank === 1 && 'text-amber-500',
                  entry.rank === 2 && 'text-slate-400',
                  entry.rank === 3 && 'text-amber-700',
                  entry.rank > 3 && 'text-muted-foreground'
                )}
              >
                #{entry.rank}
              </span>

              {/* User */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                  {entry.user.displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {entry.user.displayName}
                  </div>
                  <Badge
                    variant="secondary"
                    className="mt-0.5 text-[10px] uppercase"
                    style={{ color: getBadgeColor(entry.user.badge) }}
                  >
                    {entry.user.badge}
                  </Badge>
                </div>
              </div>

              {/* Score */}
              <div className="text-center text-[15px] font-bold text-foreground">
                {formatNumber(entry.score)}
              </div>

              {/* Accuracy */}
              <div className="flex justify-center">
                <span
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[13px] font-bold',
                    entry.accuracy >= 75 && 'bg-emerald-500/15 text-emerald-500',
                    entry.accuracy >= 60 && entry.accuracy < 75 && 'bg-amber-500/15 text-amber-500',
                    entry.accuracy < 60 && 'bg-red-500/15 text-red-500'
                  )}
                >
                  {entry.accuracy}%
                </span>
              </div>

              {/* Streak */}
              <div className="flex items-center justify-center gap-1 text-sm font-semibold text-amber-500">
                <Flame size={14} /> {entry.streak}
              </div>

              {/* Change */}
              <div className="flex justify-center">
                {entry.change > 0 ? (
                  <TrendingUp size={16} className="text-emerald-500" />
                ) : entry.change < 0 ? (
                  <TrendingDown size={16} className="text-red-500" />
                ) : (
                  <Minus size={16} className="text-muted-foreground" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  height,
  medal,
  icon,
}: {
  entry: (typeof mockLeaderboard)[0];
  height: string;
  medal: string;
  icon: React.ReactNode;
}) {
  const medalGradients: Record<string, string> = {
    gold: 'bg-gradient-to-br from-amber-500 to-amber-300',
    silver: 'bg-gradient-to-br from-slate-400 to-slate-300',
    bronze: 'bg-gradient-to-br from-amber-700 to-yellow-600',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border/30 bg-card/50 p-5 text-center backdrop-blur-sm',
        height,
        medal === 'gold' && 'border-amber-500/30'
      )}
    >
      <div className="mb-2">{icon}</div>
      <div
        className={cn(
          'mb-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-[14px] text-lg font-extrabold text-white',
          medalGradients[medal]
        )}
      >
        {entry.user.displayName.charAt(0)}
      </div>
      <div className="mb-0.5 text-[15px] font-bold text-foreground">
        {entry.user.displayName}
      </div>
      <div className="mb-1 text-xl font-extrabold text-primary">
        {formatNumber(entry.score)}
      </div>
      <div className="flex items-center gap-1 text-xs text-emerald-500">
        <Target size={12} /> {entry.accuracy}%
      </div>
    </div>
  );
}
