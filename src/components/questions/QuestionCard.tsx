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
  Timer,
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
// Time remaining helper
// ---------------------------------------------------------------------------
function getTimeRemaining(targetDate?: string): string | null {
  if (!targetDate) return null;
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 30) return `${Math.floor(days / 30)}mo ${days % 30}d`;
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

// ---------------------------------------------------------------------------
// Component — Compact Vertical Card (3-column friendly)
// ---------------------------------------------------------------------------
export default function QuestionCard({ question }: { question: Question }) {
  const [voted, setVoted] = useState<string | null>(question.userVote ?? null);
  const [localOptions, setLocalOptions] = useState(question.options);
  const [localTotal, setLocalTotal] = useState(question.totalVotes);
  const [bookmarked, setBookmarked] = useState(question.isBookmarked ?? false);
  const [showShare, setShowShare] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const catCfg = categoryConfig[question.category] ?? categoryConfig.other;

  // Leading option
  const leading = [...localOptions].sort((a, b) => b.percentage - a.percentage)[0];
  const leadPct = leading?.percentage ?? 0;
  const leadColor =
    leadPct >= 50 ? 'text-emerald-400' : leadPct >= 40 ? 'text-amber-400' : 'text-red-400';

  const changePositive = (question.changePercent ?? 0) >= 0;
  const timeLeft = getTimeRemaining(question.expiresAt);

  // ---- Vote handler (real API) ----
  const handleVote = async (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    const newTotal = localTotal + 1;
    setLocalTotal(newTotal);
    setLocalOptions((prev) =>
      prev.map((opt) => {
        const newVotes = opt.id === optionId ? opt.votes + 1 : opt.votes;
        return { ...opt, votes: newVotes, percentage: Math.round((newVotes / newTotal) * 100) };
      }),
    );
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, optionId }),
      });
      if (!res.ok) {
        // Revert on failure
        setVoted(null);
        setLocalTotal(localTotal);
        setLocalOptions(question.options);
      }
    } catch {
      setVoted(null);
      setLocalTotal(localTotal);
      setLocalOptions(question.options);
    }
  };

  const showResults = !!voted;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/80 backdrop-blur-md',
          'transition-all duration-300 flex flex-col',
          'hover:border-indigo-500/30 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]',
        )}
      >
        {/* ── Image Section (top) ── */}
        <div className="relative h-[130px] overflow-hidden shrink-0">
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

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Category badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge
              className="bg-black/50 backdrop-blur-sm border-white/10 text-white text-[9px] gap-1 px-2 py-0.5 capitalize font-bold uppercase tracking-wider"
            >
              <span>{catCfg.emoji}</span>
              {question.category}
            </Badge>
          </div>

          {/* Status + Timer badges — top-right */}
          <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5">
            {timeLeft && (
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                <Timer size={10} className="text-amber-400" />
                <span className="text-[10px] font-bold">{timeLeft}</span>
              </div>
            )}
            {question.status === 'trending' && (
              <Badge className="bg-red-500/80 backdrop-blur-sm border-0 text-white text-[9px] gap-1 px-1.5 py-0.5">
                <TrendingUp size={9} /> Hot
              </Badge>
            )}
          </div>

          {/* AI badge */}
          {question.aiAnalysis && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <Badge className="bg-indigo-500/80 backdrop-blur-sm border-0 text-white text-[9px] gap-1 px-1.5 py-0.5">
                <Sparkles size={9} /> AI
              </Badge>
            </div>
          )}

          {/* Leading probability — bottom-left on image */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <div className={cn(
              'text-2xl font-black',
              leadColor,
              leadPct >= 50
                ? 'drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                : leadPct >= 40
                  ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                  : 'drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
            )}>
              {leadPct}%
            </div>
          </div>
        </div>

        {/* ── Content Section ── */}
        <div className="flex flex-col flex-1 p-4 min-w-0">
          {/* Title + Sparkline */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link
              href={`/questions/${question.id}`}
              className="no-underline text-inherit flex-1 min-w-0"
            >
              <h3 className="text-[14px] font-bold leading-snug hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2">
                {question.title}
              </h3>
            </Link>
          </div>

          {/* Description */}
          {question.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5 line-clamp-1">
              {question.description}
            </p>
          )}

          {/* Sparkline + Change */}
          {question.trendData && question.trendData.length >= 2 && (
            <div className="flex items-center gap-2 mb-3">
              <SparklineChart
                data={question.trendData}
                width={80}
                height={24}
                positive={changePositive}
              />
              {question.changePercent !== undefined && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] font-bold border-0 gap-0.5 px-1.5 py-0',
                    changePositive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  )}
                >
                  {changePositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {changePositive ? '+' : ''}{question.changePercent.toFixed(1)}%
                </Badge>
              )}
            </div>
          )}

          {/* ── Vote buttons / Results (compact) ── */}
          <div className="space-y-1.5 mb-3 flex-1">
            <AnimatePresence mode="wait">
              {(expanded ? localOptions : localOptions.slice(0, 3)).map((option) => {
                const isVoted = voted === option.id;
                const isLeading = option.id === leading?.id;
                return (
                  <motion.button
                    key={option.id}
                    layout
                    onClick={() => handleVote(option.id)}
                    disabled={!!voted}
                    className={cn(
                      'relative w-full rounded-lg text-left text-[12px] font-medium transition-all overflow-hidden',
                      showResults ? 'px-2.5 py-1.5' : 'px-2.5 py-1.5',
                      !showResults && [
                        'border border-white/[0.08] bg-white/[0.03] cursor-pointer',
                        'hover:bg-white/[0.07] hover:border-white/[0.15]',
                        'active:scale-[0.98]',
                      ],
                      showResults && [
                        'border bg-card/60 cursor-default',
                        isVoted
                          ? 'border-white/20'
                          : isLeading
                            ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20 border-transparent'
                            : 'border-white/[0.05] opacity-70',
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
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ background: `${option.color}18` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: option.color }}
                        />
                        <span className="truncate">{option.text}</span>
                        {isVoted && showResults && (
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        )}
                      </span>

                      {showResults ? (
                        <span
                          className="font-bold text-[11px] tabular-nums shrink-0 ml-2"
                          style={{ color: option.color }}
                        >
                          {option.percentage}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-normal shrink-0 ml-2">
                          {formatNumber(option.votes)}
                        </span>
                      )}
                    </div>

                    {/* Mini progress bar under option */}
                    {showResults && (
                      <div className="mt-1 h-[3px] bg-secondary/60 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${option.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          className={cn(
                            'h-full rounded-full',
                            isLeading
                              ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                              : 'bg-muted-foreground/25'
                          )}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {localOptions.length > 3 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-[11px] text-amber-400 font-semibold text-center py-1 cursor-pointer hover:text-amber-300 transition-colors"
              >
                +{localOptions.length - 3} more options
              </button>
            )}
            {expanded && localOptions.length > 3 && voted && (
              <button
                onClick={() => setExpanded(false)}
                className="w-full text-[10px] text-muted-foreground text-center py-1 cursor-pointer hover:text-foreground transition-colors"
              >
                Show less
              </button>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold">
                <Users size={10} />
                {formatNumber(localTotal)} votes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={10} />
                {question.totalComments}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/[0.06]"
                onClick={() => setBookmarked(!bookmarked)}
              >
                <Bookmark
                  size={11}
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
                className="h-6 w-6 hover:bg-white/[0.06]"
                onClick={() => setShowShare(true)}
              >
                <Share2 size={11} className="text-muted-foreground" />
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
