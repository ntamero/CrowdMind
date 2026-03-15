'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Share2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Sparkles,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import type { Question, QuestionCategory } from '@/types';
import { formatNumber, timeAgo, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SparklineChart from '@/components/shared/SparklineChart';
import ShareModal from '@/components/shared/ShareModal';

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------
const categoryConfig: Record<QuestionCategory, { emoji: string; gradient: string }> = {
  business:      { emoji: '💼', gradient: 'from-blue-600 to-blue-900' },
  technology:    { emoji: '🚀', gradient: 'from-violet-600 to-indigo-900' },
  design:        { emoji: '🎨', gradient: 'from-pink-600 to-rose-900' },
  lifestyle:     { emoji: '🌿', gradient: 'from-emerald-600 to-teal-900' },
  finance:       { emoji: '📈', gradient: 'from-amber-600 to-yellow-900' },
  sports:        { emoji: '⚽', gradient: 'from-green-600 to-lime-900' },
  politics:      { emoji: '🏛️', gradient: 'from-red-600 to-rose-900' },
  entertainment: { emoji: '🎬', gradient: 'from-fuchsia-600 to-purple-900' },
  education:     { emoji: '📚', gradient: 'from-cyan-600 to-sky-900' },
  health:        { emoji: '💊', gradient: 'from-teal-600 to-emerald-900' },
  other:         { emoji: '💡', gradient: 'from-slate-600 to-slate-900' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function QuestionCard({ question }: { question: Question }) {
  const [voted, setVoted] = useState<string | null>(question.userVote ?? null);
  const [localOptions, setLocalOptions] = useState(question.options);
  const [localTotal, setLocalTotal] = useState(question.totalVotes);
  const [bookmarked, setBookmarked] = useState(question.isBookmarked ?? false);
  const [showShare, setShowShare] = useState(false);

  const catCfg = categoryConfig[question.category] ?? categoryConfig.other;

  // Leading option
  const leading = [...localOptions].sort((a, b) => b.percentage - a.percentage)[0];
  const leadPct = leading?.percentage ?? 0;
  const leadColor =
    leadPct >= 50 ? 'text-emerald-400' : leadPct >= 40 ? 'text-amber-400' : 'text-red-400';
  const leadGlow =
    leadPct >= 50
      ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
      : leadPct >= 40
        ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]'
        : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]';

  const changePositive = (question.changePercent ?? 0) >= 0;

  // ---- Vote handler ----
  const handleVote = (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    const newTotal = localTotal + 1;
    setLocalTotal(newTotal);
    setLocalOptions((prev) =>
      prev.map((opt) => {
        const newVotes = opt.id === optionId ? opt.votes + 1 : opt.votes;
        return {
          ...opt,
          votes: newVotes,
          percentage: Math.round((newVotes / newTotal) * 100),
        };
      }),
    );
  };

  const showResults = !!voted;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/80 backdrop-blur-md',
          'transition-all duration-300',
          'hover:border-indigo-500/30 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]',
          'flex flex-col md:flex-row',
        )}
      >
        {/* ============================================================= */}
        {/* IMAGE SECTION (left / top on mobile)                          */}
        {/* ============================================================= */}
        <div className="relative w-full md:w-[40%] min-h-[180px] md:min-h-[260px] shrink-0 overflow-hidden">
          {/* Image or gradient placeholder */}
          {question.image ? (
            <img
              src={question.image}
              alt={question.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br',
                catCfg.gradient,
                'flex items-center justify-center',
              )}
            >
              <span className="text-5xl opacity-30 select-none">{catCfg.emoji}</span>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 hidden md:block" />

          {/* Category badge on image */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              className={cn(
                'bg-black/50 backdrop-blur-sm border-white/10 text-white text-[11px] gap-1.5 px-2.5 py-1 capitalize',
              )}
            >
              <span>{catCfg.emoji}</span>
              {question.category}
            </Badge>
          </div>

          {/* Status badges */}
          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
            {question.status === 'trending' && (
              <Badge className="bg-red-500/80 backdrop-blur-sm border-0 text-white text-[10px] gap-1 px-2 py-0.5">
                <TrendingUp size={10} /> Hot
              </Badge>
            )}
            {question.aiAnalysis && (
              <Badge className="bg-indigo-500/80 backdrop-blur-sm border-0 text-white text-[10px] gap-1 px-2 py-0.5">
                <Sparkles size={10} /> AI
              </Badge>
            )}
          </div>

          {/* Big probability overlay on image (bottom) */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className={cn('text-4xl font-black tracking-tight', leadColor, leadGlow)}>
              {leadPct}%
            </div>
            <div className="text-white/70 text-xs font-medium mt-0.5 max-w-[200px] line-clamp-1">
              {leading?.text}
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* CONTENT SECTION (right / bottom on mobile)                    */}
        {/* ============================================================= */}
        <div className="flex flex-col flex-1 p-4 md:p-5 min-w-0">
          {/* Top row: sparkline + change */}
          <div className="flex items-start justify-between gap-3 mb-3">
            {/* Title */}
            <Link
              href={`/questions/${question.id}`}
              className="no-underline text-inherit flex-1 min-w-0"
            >
              <h3 className="text-[15px] font-bold leading-snug hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2">
                {question.title}
              </h3>
            </Link>

            {/* Sparkline + change badge */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {question.trendData && question.trendData.length >= 2 && (
                <SparklineChart
                  data={question.trendData}
                  width={72}
                  height={28}
                  positive={changePositive}
                />
              )}
              {question.changePercent !== undefined && (
                <span
                  className={cn(
                    'text-[11px] font-bold px-1.5 py-0.5 rounded-md',
                    changePositive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-red-400 bg-red-500/10',
                  )}
                >
                  {changePositive ? '+' : ''}
                  {question.changePercent.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {question.description && (
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
              {question.description}
            </p>
          )}

          {/* Volume indicator */}
          {question.volume24h !== undefined && question.volume24h > 0 && (
            <div className="flex items-center gap-1.5 mb-3 text-[11px] text-muted-foreground/70">
              <Activity size={11} />
              <span>{formatNumber(question.volume24h)} vol</span>
            </div>
          )}

          {/* ---- Vote buttons / Results ---- */}
          <div className="space-y-1.5 mb-4 flex-1">
            <AnimatePresence mode="wait">
              {localOptions.map((option) => {
                const isVoted = voted === option.id;
                return (
                  <motion.button
                    key={option.id}
                    layout
                    onClick={() => handleVote(option.id)}
                    disabled={!!voted}
                    className={cn(
                      'relative w-full flex items-center justify-between rounded-xl text-left text-[13px] font-semibold transition-all overflow-hidden',
                      showResults ? 'px-3.5 py-2.5' : 'px-3.5 py-2.5',
                      !showResults && [
                        'border border-white/[0.08] bg-white/[0.03] cursor-pointer',
                        'hover:bg-white/[0.07] hover:border-white/[0.15]',
                        'hover:shadow-[0_0_15px_-3px] hover:shadow-indigo-500/20',
                        'active:scale-[0.98]',
                      ],
                      showResults && [
                        'border bg-card/60 cursor-default',
                        isVoted ? 'border-white/20' : 'border-white/[0.05] opacity-70',
                      ],
                    )}
                    style={{
                      borderColor: isVoted && showResults ? option.color + '60' : undefined,
                    }}
                  >
                    {/* Animated progress fill */}
                    {showResults && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute inset-y-0 left-0 rounded-xl"
                        style={{ background: `${option.color}18` }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-2">
                      {/* Color dot */}
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: option.color }}
                      />
                      <span className="line-clamp-1">{option.text}</span>
                      {isVoted && showResults && (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      )}
                    </span>

                    {showResults ? (
                      <span
                        className="relative z-10 font-black text-sm tabular-nums"
                        style={{ color: option.color }}
                      >
                        {option.percentage}%
                      </span>
                    ) : (
                      <span className="relative z-10 text-[11px] text-muted-foreground font-normal">
                        {formatNumber(option.votes)}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ---- Footer ---- */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold">
                <Users size={12} />
                {formatNumber(localTotal)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={12} />
                {question.totalComments}
              </span>
              <span className="text-muted-foreground/50">
                {timeAgo(question.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <DollarSign size={11} />
                Earn
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-white/[0.06]"
                onClick={() => setBookmarked(!bookmarked)}
              >
                <Bookmark
                  size={13}
                  fill={bookmarked ? '#f59e0b' : 'none'}
                  className={cn(
                    'transition-colors',
                    bookmarked ? 'text-amber-500' : 'text-muted-foreground',
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-white/[0.06]"
                onClick={() => setShowShare(true)}
              >
                <Share2 size={13} className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={question.title}
        url={`/questions/${question.id}`}
      />
    </>
  );
}
