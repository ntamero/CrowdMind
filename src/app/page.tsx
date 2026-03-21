'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Clock, Flame, ArrowRight,
  Zap, Users, BarChart3, ChevronRight,
  Globe, Activity, Eye, Vote, Plus,
  Wallet, Gift, Sparkles, MessageCircle,
  Brain, Trophy, Star, Heart, Share2,
  Camera, Hash, ArrowUp, ArrowDown, Timer, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuestionCard from '@/components/questions/QuestionCard';
import SparklineChart from '@/components/shared/SparklineChart';
import { categories } from '@/lib/mock-data';
import { cn, formatNumber } from '@/lib/utils';

type SortType = 'trending' | 'newest' | 'hot';

const howItWorks = [
  {
    icon: Plus,
    title: 'Ask Anything',
    desc: 'What should I wear? Will BTC hit 200K? Create polls & predictions on any topic.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Vote,
    title: 'Community Votes',
    desc: 'The crowd decides. Real people, real opinions. AI analyzes every vote.',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Brain,
    title: 'MIA Analyzes',
    desc: 'Our AI engine breaks down trends, sentiment & confidence for every question.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Gift,
    title: 'Earn Rewards',
    desc: 'Correct predictions earn WSR tokens. Vote, engage & climb the leaderboard.',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
  },
];

export default function HomePage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen" />}>
      <HomePageInner />
    </Suspense>
  );
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const [sort, setSort] = useState<SortType>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync URL category param
  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  // Fetch real stats
  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // Fetch real questions from DB
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const params = new URLSearchParams({ sort, limit: '20' });
        if (selectedCategory) params.set('category', selectedCategory);
        const res = await fetch(`/api/questions?${params}`);
        if (res.ok) {
          const data = await res.json();
          setDbQuestions(data.questions || []);
        }
      } catch {}
      setLoadingDb(false);
    }
    fetchQuestions();
  }, [sort, selectedCategory]);

  const liveActivities = stats?.liveActivities || [];
  const topEarners = stats?.topEarners || [];
  const d = stats?.display || { online: 0, votesCast: 0, earned: 0, countries: 0, aiAnalyses: 0, markets: 0 };

  const allQuestions = dbQuestions;
  const filtered = allQuestions
    .filter((q: any) => !selectedCategory || q.category === selectedCategory)
    .sort((a: any, b: any) => {
      // Default: newest first (tarih sırasına göre)
      if (sort === 'trending') return (b.totalVotes || 0) - (a.totalVotes || 0);
      if (sort === 'hot') return ((b.changePercent ?? 0) - (a.changePercent ?? 0));
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
    });

  return (
    <div className="w-full">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mb-10">
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(245,158,11,0.12) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 60% at 80% 20%, rgba(249,115,22,0.10) 0%, transparent 55%)',
              'radial-gradient(ellipse 70% 50% at 50% 80%, rgba(168,85,247,0.08) 0%, transparent 50%)',
              'radial-gradient(ellipse 40% 40% at 70% 60%, rgba(6,182,212,0.06) 0%, transparent 50%)',
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
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .featured-scroll::-webkit-scrollbar { display: none; }
          .featured-scroll { scrollbar-width: none; }
        `}</style>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 text-[12px] font-semibold text-amber-400 backdrop-blur-sm">
              <Sparkles size={13} />
              The Wisdom of the Crowd
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
              />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-5">
              Ask. Vote.{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Earn.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              From &ldquo;What should I wear today?&rdquo; to &ldquo;Will Bitcoin hit $200K?&rdquo; —
              ask anything, let the crowd decide, earn rewards for correct predictions.
              <span className="text-amber-400 font-semibold"> Powered by AI.</span>
            </p>

            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-2 h-12 px-7 text-[15px] font-bold shadow-lg shadow-amber-600/20 transition-all hover:shadow-xl hover:shadow-amber-600/30">
                <Wallet size={18} /> Connect Wallet <ArrowRight size={16} />
              </Button>
              <Link href="/ask">
                <Button variant="outline" className="gap-2 h-12 px-6 text-[15px] font-bold border-border/50 backdrop-blur-sm hover:bg-white/5">
                  <Plus size={18} /> Ask a Question
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
                <span className="font-bold text-foreground">{formatNumber(d.online)}</span> users
              </span>
              <span className="w-px h-3.5 bg-border/50" />
              <span className="flex items-center gap-1.5">
                <Vote size={13} className="text-amber-400" />
                <span className="font-bold text-foreground">{formatNumber(d.votesCast)}</span> votes cast
              </span>
              <span className="w-px h-3.5 bg-border/50" />
              <span className="flex items-center gap-1.5">
                <Gift size={13} className="text-emerald-400" />
                <span className="font-bold text-foreground">{formatNumber(d.earned)} WSR</span> earned
              </span>
              <span className="w-px h-3.5 bg-border/50" />
              <span className="flex items-center gap-1.5">
                <MessageCircle size={13} className="text-cyan-400" />
                <span className="font-bold text-foreground">{formatNumber(d.aiAnalyses)}</span> comments
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════ QUICK MARKETS LIVE ═══════════ */}
      <QuickMarketsPreview />

      <div className="max-w-full mx-auto">

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="relative bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-5 text-center hover:border-border/40 transition-all group"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3', step.bg)}>
                  <step.icon size={22} className="text-foreground" />
                </div>
                <h3 className="text-[14px] font-bold mb-1.5">{step.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <ChevronRight size={16} className="text-border" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════ FEATURED MARKETS ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              Hot Markets
            </h2>
            <Link href="/predictions" className="text-[13px] text-amber-400 no-underline font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div
            ref={scrollRef}
            className="featured-scroll flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory"
          >
            {allQuestions.slice(0, 4).map((q: any, i: number) => {
              const topOpt = q.options?.sort((a: any, b: any) => b.percentage - a.percentage)[0];
              const topPct = topOpt?.percentage ?? 0;
              const catIcon = categories.find(c => c.value === q.category)?.icon || '💡';
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="snap-start shrink-0"
                  style={{ width: 320 }}
                >
                  <Link href={`/questions/${q.id}`} className="no-underline text-inherit block">
                    <div className="relative rounded-2xl overflow-hidden bg-card border border-border/30 hover:border-amber-500/30 transition-all group cursor-pointer h-full">
                      <div className="relative h-[140px] overflow-hidden">
                        {q.image ? (
                          <img src={q.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-900 flex items-center justify-center">
                            <span className="text-5xl opacity-30">{catIcon}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-[10px] bg-black/50 text-white border-0 backdrop-blur-md capitalize">
                            {catIcon} {q.category}
                          </Badge>
                        </div>
                        {q.totalVotes > 5 && (
                          <div className="absolute top-3 right-3">
                            <Badge className="text-[10px] bg-orange-500/90 text-white border-0 gap-1 font-bold">
                              <Flame size={10} /> HOT
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4 pt-0 -mt-4 relative">
                        <h3 className="text-[14px] font-bold leading-snug mb-3 line-clamp-2">{q.title}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-2xl font-black', topPct >= 50 ? 'text-emerald-400' : 'text-red-400')}>
                              {topPct}%
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">{topOpt?.text || 'Leading'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/20 pt-2.5">
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {formatNumber(q.totalVotes)} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={11} />
                            {q.totalComments || 0} comments
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
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
                  ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:bg-white/5'
              )}
            >
              All
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

        {/* ═══════════ MAIN CONTENT: MARKETS + SIDEBAR ═══════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 mb-10">
          {/* Left: Markets Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" />
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
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                        : 'bg-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <s.icon size={13} /> {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Top Earners */}
            <div className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-4">
              <h3 className="text-[14px] font-bold flex items-center gap-2 mb-3">
                <Trophy size={15} className="text-amber-400" />
                Top Earners
              </h3>
              <div className="space-y-2">
                {topEarners.map((earner: any) => (
                  <div key={earner.rank} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <span className={cn(
                      'text-[12px] font-black w-5 text-center',
                      earner.rank === 1 ? 'text-amber-400' : earner.rank === 2 ? 'text-gray-400' : earner.rank === 3 ? 'text-orange-600' : 'text-muted-foreground'
                    )}>
                      {earner.rank}
                    </span>
                    <span className="text-lg">{earner.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{earner.name}</p>
                      <p className="text-[10px] text-muted-foreground">{earner.accuracy} accuracy</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400">{earner.earned}</span>
                  </div>
                ))}
              </div>
              <Link href="/leaderboard" className="text-[12px] text-amber-400 font-semibold flex items-center gap-1 mt-3 no-underline hover:gap-2 transition-all">
                View Leaderboard <ChevronRight size={12} />
              </Link>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-4">
              <h3 className="text-[14px] font-bold flex items-center gap-2 mb-3">
                <Zap size={15} className="text-amber-400" />
                Live Activity
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
                />
              </h3>
              <div className="space-y-1">
                {liveActivities.map((act: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                    className="flex items-start gap-2 py-2 text-[12px] border-b border-border/10 last:border-0"
                  >
                    <span className="text-sm mt-0.5">{act.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground">{act.user}</span>{' '}
                      <span className="text-muted-foreground">{act.action}</span>{' '}
                      <span className="font-medium text-foreground">&ldquo;{act.market}&rdquo;</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{act.time} ago</span>
                        <span className="text-[10px] font-bold text-emerald-400">{act.earned}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* MIA AI Insight Card */}
            <div className="bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/10 rounded-2xl p-4">
              <h3 className="text-[14px] font-bold flex items-center gap-2 mb-2">
                <Brain size={15} className="text-purple-400" />
                MIA Daily Insight
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
                {d.votesCast > 0
                  ? `Based on ${formatNumber(d.votesCast)} total votes across ${formatNumber(d.markets)} questions. ${formatNumber(stats?.totalUsers || 0)} users are shaping collective wisdom. Explore AI-powered analysis of crowd predictions.`
                  : 'MIA analyzes every vote and prediction to deliver actionable insights. Start voting to see AI-powered analysis of crowd wisdom.'
                }
              </p>
              <Link href="/ai-analysis" className="text-[12px] text-purple-400 font-semibold flex items-center gap-1 no-underline hover:gap-2 transition-all">
                Full Analysis <ChevronRight size={12} />
              </Link>
            </div>

            {/* CTA: Connect Wallet */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
                <Wallet size={22} className="text-white" />
              </div>
              <h3 className="text-[15px] font-bold mb-1">Start Earning</h3>
              <p className="text-[12px] text-muted-foreground mb-3">
                Connect your wallet to vote, predict & earn WSR tokens
              </p>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-[13px] h-10">
                <Wallet size={15} className="mr-2" /> Connect Wallet
              </Button>
            </div>
          </div>
        </div>

        {/* ═══════════ QUICK STATS BAR ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mb-10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { icon: Users, label: 'Total Users', value: formatNumber(d.online), color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: BarChart3, label: 'Markets', value: formatNumber(d.markets), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { icon: Vote, label: 'Votes Cast', value: formatNumber(d.votesCast), color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: Gift, label: 'WSR Earned', value: formatNumber(d.earned), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Globe, label: 'Comments', value: formatNumber(d.aiAnalyses), color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { icon: Brain, label: 'AI Analyses', value: formatNumber(d.aiAnalyses), color: 'text-pink-400', bg: 'bg-pink-500/10' },
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

// ═══════════ QUICK MARKETS LIVE PREVIEW ═══════════

const ASSET_ICONS: Record<string, string> = { BTC: '₿', ETH: 'Ξ', SOL: '◎', POL: '⬡' };

function QuickMarketsPreview() {
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarkets = () => {
      fetch('/api/markets/quick?asset=BTC&duration=5')
        .then(r => r.json())
        .then(d => { if (d.allMarkets) setMarkets(d.allMarkets.filter((m: any) => m.duration === 5)); })
        .catch(() => {});
    };
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 8000);
    return () => clearInterval(interval);
  }, []);

  if (markets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          <h2 className="text-sm font-bold">Quick Markets</h2>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <Link href="/markets" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 no-underline">
          All Markets <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {markets.map(m => {
          const isUp = m.priceChange >= 0;
          const mins = Math.floor(m.remaining / 60000);
          const secs = Math.floor((m.remaining % 60000) / 1000);
          return (
            <Link
              key={m.id}
              href="/markets"
              className="no-underline rounded-xl border border-border/30 bg-secondary/10 hover:bg-secondary/20 p-3 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{ASSET_ICONS[m.asset]}</span>
                  <span className="text-xs font-bold text-foreground">{m.symbol}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <Timer size={10} />
                  {mins}:{String(secs).padStart(2, '0')}
                </span>
              </div>
              <div className="text-sm font-bold font-mono text-foreground">
                ${m.currentPrice >= 1000
                  ? m.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : m.currentPrice.toFixed(4)}
              </div>
              <div className={`flex items-center gap-1 text-[11px] mt-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {isUp ? '+' : ''}{m.priceChangePercent.toFixed(3)}%
              </div>
              <div className="flex gap-0.5 mt-2">
                <div className="flex-1 h-1 rounded-l-full bg-emerald-500/40" style={{ width: `${m.upPercent}%` }} />
                <div className="flex-1 h-1 rounded-r-full bg-red-500/40" style={{ width: `${m.downPercent}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
