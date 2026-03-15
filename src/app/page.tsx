'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Clock, Flame, ArrowRight,
  Zap, Users, BarChart3, ChevronRight,
  Globe, Activity, Eye, Vote, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuestionCard from '@/components/questions/QuestionCard';
import SparklineChart from '@/components/shared/SparklineChart';
import { mockQuestions, featuredMarkets, categories } from '@/lib/mock-data';
import { cn, formatNumber } from '@/lib/utils';

type SortType = 'trending' | 'newest' | 'hot';

const liveActivities = [
  { user: 'Alex', action: 'voted YES on', market: 'GPT-5 Launch Before July', time: '2m ago', emoji: '🗳️' },
  { user: 'Sara', action: 'created market', market: 'Will Spotify hit 1B users?', time: '5m ago', emoji: '🚀' },
  { user: 'Mike', action: 'voted NO on', market: 'Bitcoin Above $150K', time: '8m ago', emoji: '🗳️' },
  { user: 'Emily', action: 'voted YES on', market: 'Apple AR Glasses in 2026', time: '12m ago', emoji: '📊' },
];

export default function HomePage() {
  const [sort, setSort] = useState<SortType>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = mockQuestions
    .filter((q) => !selectedCategory || q.category === selectedCategory)
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'hot') return (b.changePercent ?? 0) - (a.changePercent ?? 0);
      return b.totalVotes - a.totalVotes;
    });

  return (
    <div className="w-full">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mb-10">
        {/* Animated gradient mesh background */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99,102,241,0.15) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 60% at 80% 20%, rgba(168,85,247,0.12) 0%, transparent 55%)',
              'radial-gradient(ellipse 70% 50% at 50% 80%, rgba(6,182,212,0.10) 0%, transparent 50%)',
              'radial-gradient(ellipse 40% 40% at 70% 60%, rgba(236,72,153,0.08) 0%, transparent 50%)',
            ].join(', '),
            animation: 'heroMeshMove 12s ease-in-out infinite alternate',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <style>{`
          @keyframes heroMeshMove {
            0% { filter: hue-rotate(0deg); transform: scale(1); }
            50% { filter: hue-rotate(15deg); transform: scale(1.05); }
            100% { filter: hue-rotate(-10deg); transform: scale(1); }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.5); }
          }
          @keyframes tickerScroll {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          .featured-scroll::-webkit-scrollbar { display: none; }
          .featured-scroll { scrollbar-width: none; }
        `}</style>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 text-[12px] font-semibold text-indigo-400 backdrop-blur-sm">
              <Activity size={13} />
              Collective Intelligence Platform
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
              />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
              Predict. Vote.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Shape the Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Join millions making predictions on world events, technology, finance, and more.
              Harness the wisdom of the crowd with AI-powered insights.
            </p>

            <div className="flex justify-center gap-3 mb-8">
              <Link href="/predictions">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-12 px-7 text-[15px] font-bold shadow-lg shadow-indigo-600/20 transition-all hover:shadow-xl hover:shadow-indigo-600/30">
                  <Eye size={18} /> Explore Markets <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/ask">
                <Button variant="outline" className="gap-2 h-12 px-6 text-[15px] font-bold border-border/50 backdrop-blur-sm hover:bg-white/5">
                  <Plus size={18} /> Create Market
                </Button>
              </Link>
            </div>

            {/* Live stats ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center justify-center gap-4 sm:gap-6 text-[13px] text-muted-foreground flex-wrap"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
                />
                <span className="font-bold text-foreground">3,420</span> online
              </span>
              <span className="w-px h-3.5 bg-border/50" />
              <span className="flex items-center gap-1.5">
                <Vote size={13} className="text-indigo-400" />
                <span className="font-bold text-foreground">12.8M</span> votes cast
              </span>
              <span className="w-px h-3.5 bg-border/50" />
              <span className="flex items-center gap-1.5">
                <Globe size={13} className="text-cyan-400" />
                <span className="font-bold text-foreground">142</span> countries
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-full mx-auto">
        {/* ═══════════ FEATURED MARKETS ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              Featured Markets
            </h2>
            <Link href="/predictions" className="text-[13px] text-indigo-400 no-underline font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div
            ref={scrollRef}
            className="featured-scroll flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory"
          >
            {featuredMarkets.map((market, i) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="snap-start shrink-0"
                style={{ width: 320 }}
              >
                <Link href="/predictions" className="no-underline text-inherit block">
                  <div className="relative rounded-2xl overflow-hidden bg-card border border-border/30 hover:border-border/60 transition-all group cursor-pointer h-full">
                    {/* Image with gradient overlay */}
                    <div className="relative h-[140px] overflow-hidden">
                      <img
                        src={market.image}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />

                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-[10px] bg-black/50 text-white border-0 backdrop-blur-md capitalize">
                          {categories.find(c => c.value === market.category)?.icon}{' '}
                          {market.category}
                        </Badge>
                      </div>

                      {/* HOT badge */}
                      {market.hot && (
                        <div className="absolute top-3 right-3">
                          <Badge className="text-[10px] bg-orange-500/90 text-white border-0 gap-1 font-bold">
                            <Flame size={10} /> HOT
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 pt-0 -mt-4 relative">
                      <h3 className="text-[14px] font-bold leading-snug mb-3 line-clamp-2">
                        {market.title}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        {/* YES percentage */}
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-2xl font-black',
                            market.yesPercent >= 50 ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {market.yesPercent}%
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">Yes</span>
                        </div>

                        {/* Sparkline + Change badge */}
                        <div className="flex items-center gap-2">
                          <SparklineChart
                            data={market.trendData}
                            width={64}
                            height={28}
                            positive={market.changePercent >= 0}
                          />
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[10px] border-0 font-bold tabular-nums',
                              market.changePercent >= 0
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            )}
                          >
                            {market.changePercent >= 0 ? '+' : ''}{market.changePercent}%
                          </Badge>
                        </div>
                      </div>

                      {/* Footer stats */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/20 pt-2.5">
                        <span className="flex items-center gap-1">
                          <BarChart3 size={11} />
                          Vol: {formatNumber(market.volume24h)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {formatNumber(market.totalVotes)} votes
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════ CATEGORY NAVIGATION ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-1 featured-scroll">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all border cursor-pointer whitespace-nowrap',
                !selectedCategory
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:bg-white/5'
              )}
            >
              All Markets
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all border cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                  selectedCategory === cat.value
                    ? 'text-white border-transparent shadow-lg'
                    : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:bg-white/5'
                )}
                style={selectedCategory === cat.value ? {
                  backgroundColor: cat.color,
                  borderColor: cat.color,
                  boxShadow: `0 4px 15px ${cat.color}33`,
                } : undefined}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ═══════════ TRENDING MARKETS GRID ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              Markets
            </h2>
            <div className="flex gap-1 bg-card/50 border border-border/30 rounded-xl p-1">
              {[
                { key: 'trending' as const, icon: TrendingUp, label: 'Trending' },
                { key: 'newest' as const, icon: Clock, label: 'Newest' },
                { key: 'hot' as const, icon: Flame, label: 'Hot' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border-0',
                    sort === s.key
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <s.icon size={13} /> {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  layout
                >
                  <QuestionCard question={q} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="bg-card border border-border/30 rounded-xl p-12 text-center">
              <p className="text-base font-semibold mb-1">No markets found</p>
              <p className="text-sm text-muted-foreground">Try selecting a different category</p>
            </div>
          )}
        </motion.div>

        {/* ═══════════ LIVE ACTIVITY FEED ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-[15px] font-bold flex items-center gap-2 mb-3">
            <Zap size={16} className="text-amber-400" />
            Live Activity
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 ml-1"
              style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
            />
          </h2>

          <div className="bg-card/30 border border-border/20 rounded-xl overflow-hidden divide-y divide-border/10">
            {liveActivities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                className="flex items-center gap-3 px-4 py-3 text-[13px] hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-base">{act.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="font-semibold text-foreground">{act.user}</span>{' '}
                  <span className="text-muted-foreground">{act.action}</span>{' '}
                  <span className="font-medium text-foreground">&apos;{act.market}&apos;</span>
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">{act.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════ QUICK STATS BAR ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mb-10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { icon: Users, label: 'Total Users', value: '284.5K', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { icon: BarChart3, label: 'Markets', value: '45.2K', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { icon: Vote, label: 'Votes Cast', value: '12.8M', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: TrendingUp, label: 'Predictions', value: '8,900', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Globe, label: 'Countries', value: '142', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Zap, label: 'Today', value: '127', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card/30 backdrop-blur-md border border-border/20 rounded-xl p-4 text-center hover:border-border/40 transition-colors"
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2', stat.bg)}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <p className="text-lg font-black text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
