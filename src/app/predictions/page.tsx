'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Trophy, Users, Clock, TrendingUp, TrendingDown,
  DollarSign, Target, Flame, Share2, BarChart3, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PredictionsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === 'all'
      ? mockPredictions
      : mockPredictions.filter((p) => p.category === filter);

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      {/* ───── Header ───── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/25">
          <BarChart3 size={30} className="text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">
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
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {[
          { icon: Zap, label: 'Active Markets', value: '48', color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
          { icon: DollarSign, label: 'Total Volume', value: '$2.4M', color: 'text-indigo-400', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/20' },
          { icon: Trophy, label: 'Prize Pool', value: '$18K', color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
          { icon: Target, label: 'Top Accuracy', value: '82.1%', color: 'text-pink-400', bg: 'bg-pink-500/10', ring: 'ring-pink-500/20' },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              'bg-card/60 backdrop-blur border border-border/30 rounded-xl p-4 flex items-center gap-3 ring-1',
              s.ring
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black leading-none mb-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ───── Category Filters ───── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-1"
      >
        {categories.map((cat) => {
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'relative px-5 py-2 rounded-full text-xs font-semibold capitalize transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border border-border/40'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-indigo-600 -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              {cat}
            </button>
          );
        })}
      </motion.div>

      {/* ───── Market Cards Grid ───── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {filtered.map((prediction) => {
            const isExpanded = expandedId === prediction.id;
            const hasPrize = !!prediction.prize;
            const isPositive = (prediction.changePercent ?? 0) >= 0;
            const leadingOption = [...prediction.options].sort(
              (a, b) => b.participants - a.participants
            )[0];

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
                <div className="relative h-[160px] overflow-hidden">
                  {prediction.image ? (
                    <img
                      src={prediction.image}
                      alt={prediction.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
                  )}
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                  {/* Category badge — top-left */}
                  <Badge
                    className={cn(
                      'absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider border-0 shadow-md',
                      categoryColors[prediction.category] ?? 'bg-indigo-500/80 text-white'
                    )}
                  >
                    {prediction.category}
                  </Badge>

                  {/* Status badge — top-right */}
                  <Badge
                    className={cn(
                      'absolute top-3 right-3 text-[10px] font-bold capitalize border-0 gap-1 shadow-md',
                      prediction.status === 'open'
                        ? 'bg-emerald-500/90 text-white'
                        : prediction.status === 'closed'
                        ? 'bg-red-500/90 text-white'
                        : 'bg-blue-500/90 text-white'
                    )}
                  >
                    {prediction.status === 'open' ? <Flame size={10} /> : <Clock size={10} />}
                    {prediction.status}
                  </Badge>

                  {/* Prize badge — bottom-right on image */}
                  {hasPrize && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/30">
                      <Crown size={12} />
                      <span className="text-xs font-black">${prediction.prize!.toLocaleString()} PRIZE</span>
                    </div>
                  )}
                </div>

                {/* ── Card Content ── */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-[17px] font-bold leading-snug mb-1.5">{prediction.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                    {prediction.description}
                  </p>

                  {/* Sparkline + Change */}
                  {prediction.trendData && prediction.trendData.length >= 2 && (
                    <div className="flex items-center gap-3 mb-4">
                      <SparklineChart
                        data={prediction.trendData}
                        width={100}
                        height={32}
                        positive={isPositive}
                      />
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[11px] font-bold border-0 gap-1 px-2 py-0.5',
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {isPositive ? '+' : ''}
                        {prediction.changePercent}%
                      </Badge>
                    </div>
                  )}

                  {/* ── Options (betting rows) ── */}
                  <div className="space-y-2.5 mb-4">
                    {prediction.options.map((option) => {
                      const totalP = prediction.totalParticipants || 1;
                      const pct = Math.round((option.participants / totalP) * 100);
                      const isLeading = option.id === leadingOption.id;

                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            'relative rounded-lg p-2.5 transition-colors duration-200',
                            isLeading
                              ? 'bg-indigo-500/8 ring-1 ring-indigo-500/20'
                              : 'bg-secondary/30 hover:bg-secondary/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {isLeading && (
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 shadow-sm shadow-indigo-400/50" />
                              )}
                              <span className="text-[13px] font-medium truncate">{option.text}</span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0 ml-2">
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Users size={10} />
                                {formatNumber(option.participants)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-amber-500/10 text-amber-400 border-0 px-1.5 py-0 font-bold"
                              >
                                {option.odds}x
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                className={cn(
                                  'h-full rounded-full',
                                  isLeading
                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                    : 'bg-muted-foreground/30'
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                'text-[12px] font-bold w-9 text-right',
                                isLeading ? 'text-indigo-400' : 'text-muted-foreground'
                              )}
                            >
                              {pct}%
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* ── Meta Footer ── */}
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-3 border-t border-border/30">
                    <span className="flex items-center gap-1.5">
                      <Users size={12} /> {formatNumber(prediction.totalParticipants)} participants
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> {new Date(prediction.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {prediction.currentValue && (
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <TrendingUp size={12} /> ${prediction.currentValue.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* ── Expanded Action Row ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2.5 mt-4 pt-4 border-t border-border/30">
                          <Button
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 shadow-lg shadow-indigo-500/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Target size={16} /> Make Prediction
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-border/50 hover:bg-secondary/60"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 size={14} /> Share
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
