'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Trophy, Users, Clock, TrendingUp, TrendingDown,
  DollarSign, Target, Flame, Share2, BarChart3, Crown,
  Timer, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockPredictions } from '@/lib/mock-data';
import SparklineChart from '@/components/shared/SparklineChart';
import { formatNumber, cn } from '@/lib/utils';

const categories = ['all', 'crypto', 'tech', 'sports', 'politics'] as const;

const categoryColors: Record<string, string> = {
  crypto: 'bg-amber-500/80 text-white',
  tech: 'bg-cyan-500/80 text-white',
  sports: 'bg-red-500/80 text-white',
  politics: 'bg-slate-500/80 text-white',
};

const categoryEmoji: Record<string, string> = {
  crypto: '₿',
  tech: '🚀',
  sports: '⚽',
  politics: '🏛️',
};

function getTimeRemaining(targetDate: string): string {
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

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PredictionsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === 'all'
      ? mockPredictions
      : mockPredictions.filter((p) => p.category === filter);

  return (
    <div className="max-w-full mx-auto py-4">
      {/* ───── Header ───── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <BarChart3 size={26} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Prediction{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Markets
          </span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Forecast the future. Compete with the crowd. Win real prizes.
        </p>
      </motion.div>

      {/* ───── Key Stats ───── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6"
      >
        {[
          { icon: Zap, label: 'Active Markets', value: '48', color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
          { icon: DollarSign, label: 'Total Volume', value: '$2.4M', color: 'text-indigo-400', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/20' },
          { icon: Trophy, label: 'Prize Pool', value: '$18K', color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
          { icon: Wallet, label: 'Earnings', value: '$4.2K', color: 'text-pink-400', bg: 'bg-pink-500/10', ring: 'ring-pink-500/20' },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              'bg-card/60 backdrop-blur border border-border/30 rounded-xl p-3 flex items-center gap-3 ring-1',
              s.ring
            )}
          >
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black leading-none mb-0.5">{s.value}</div>
              <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ───── Category Filters ───── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {categories.map((cat) => {
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'relative px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border border-border/40'
              )}
            >
              {cat !== 'all' && <span className="mr-1">{categoryEmoji[cat]}</span>}
              {cat}
            </button>
          );
        })}
      </motion.div>

      {/* ───── Market Cards Grid — 3 columns ───── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((prediction) => {
            const isExpanded = expandedId === prediction.id;
            const hasPrize = !!prediction.prize;
            const isPositive = (prediction.changePercent ?? 0) >= 0;
            const leadingOption = [...prediction.options].sort(
              (a, b) => b.participants - a.participants
            )[0];
            const leadPct = Math.round((leadingOption.participants / (prediction.totalParticipants || 1)) * 100);
            const timeLeft = getTimeRemaining(prediction.targetDate);

            return (
              <motion.div
                key={prediction.id}
                variants={cardVariant}
                layout
                className={cn(
                  'group bg-card border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
                  hasPrize
                    ? 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
                    : 'border-border/40 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
                )}
                onClick={() => setExpandedId(isExpanded ? null : prediction.id)}
              >
                {/* ── Event Image ── */}
                <div className="relative h-[130px] overflow-hidden">
                  {prediction.image ? (
                    <img
                      src={prediction.image}
                      alt={prediction.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  {/* Category badge */}
                  <Badge
                    className={cn(
                      'absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider border-0 shadow-md px-2 py-0.5',
                      categoryColors[prediction.category] ?? 'bg-indigo-500/80 text-white'
                    )}
                  >
                    {categoryEmoji[prediction.category]} {prediction.category}
                  </Badge>

                  {/* Time remaining badge — top-right */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                    <Timer size={10} className="text-amber-400" />
                    <span className="text-[10px] font-bold">{timeLeft}</span>
                  </div>

                  {/* Prize badge — bottom-right */}
                  {hasPrize && (
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-2.5 py-1 rounded-lg shadow-lg shadow-amber-500/30">
                      <Crown size={10} />
                      <span className="text-[10px] font-black">${prediction.prize!.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Leading probability — bottom-left on image */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <div className={cn(
                      'text-2xl font-black',
                      leadPct >= 50 ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                    )}>
                      {leadPct}%
                    </div>
                  </div>
                </div>

                {/* ── Card Content ── */}
                <div className="p-4">
                  <h3 className="text-[14px] font-bold leading-snug mb-1 line-clamp-2">{prediction.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-1">
                    {prediction.description}
                  </p>

                  {/* Sparkline + Change */}
                  {prediction.trendData && prediction.trendData.length >= 2 && (
                    <div className="flex items-center gap-2 mb-3">
                      <SparklineChart
                        data={prediction.trendData}
                        width={80}
                        height={24}
                        positive={isPositive}
                      />
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] font-bold border-0 gap-0.5 px-1.5 py-0',
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {isPositive ? '+' : ''}{prediction.changePercent}%
                      </Badge>
                    </div>
                  )}

                  {/* ── Options (compact) ── */}
                  <div className="space-y-1.5 mb-3">
                    {prediction.options.slice(0, 3).map((option) => {
                      const totalP = prediction.totalParticipants || 1;
                      const pct = Math.round((option.participants / totalP) * 100);
                      const isLeading = option.id === leadingOption.id;

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            'relative rounded-lg px-2.5 py-1.5 transition-colors duration-200',
                            isLeading
                              ? 'bg-indigo-500/8 ring-1 ring-indigo-500/20'
                              : 'bg-secondary/30'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isLeading && (
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                              )}
                              <span className="text-[12px] font-medium truncate">{option.text}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <Badge
                                variant="secondary"
                                className="text-[9px] bg-amber-500/10 text-amber-400 border-0 px-1 py-0 font-bold"
                              >
                                {option.odds}x
                              </Badge>
                              <span className={cn(
                                'text-[11px] font-bold',
                                isLeading ? 'text-indigo-400' : 'text-muted-foreground'
                              )}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-1 h-1 bg-secondary/60 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                              className={cn(
                                'h-full rounded-full',
                                isLeading
                                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                  : 'bg-muted-foreground/25'
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {prediction.options.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{prediction.options.length - 3} more options
                      </p>
                    )}
                  </div>

                  {/* ── Meta Footer ── */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2.5 border-t border-border/30">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {formatNumber(prediction.totalParticipants)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={10} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Earn</span>
                    </span>
                    {prediction.currentValue && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        ${prediction.currentValue.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* ── Expanded ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                          <Button
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-1.5 text-[12px] h-9 shadow-lg shadow-indigo-500/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Target size={14} /> Predict
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-1.5 text-[12px] h-9 border-border/50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 size={12} /> Share
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted-foreground"
        >
          <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold mb-1">No markets found</p>
          <p className="text-sm">Try selecting a different category.</p>
        </motion.div>
      )}
    </div>
  );
}
