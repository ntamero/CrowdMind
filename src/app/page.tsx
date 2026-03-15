'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Flame, Sparkles, ArrowRight, Brain,
  Zap, Star, Users, Trophy, Crown, BarChart3, ChevronRight,
  Globe, Gift, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QuestionCard from '@/components/questions/QuestionCard';
import StatsBar from '@/components/shared/StatsBar';
import { mockQuestions, mockDailyQuestions, mockPredictions, categories } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type SortType = 'trending' | 'newest' | 'hot';

export default function HomePage() {
  const [sort, setSort] = useState<SortType>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = mockQuestions
    .filter((q) => !selectedCategory || q.category === selectedCategory)
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.totalVotes - a.totalVotes;
    });

  return (
    <div className="max-w-[900px] mx-auto">
      {/* ─── Hero ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10 relative"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/8 border border-indigo-500/15 mb-5 text-[12px] font-semibold text-indigo-400">
          <Sparkles size={13} />
          AI-Powered Collective Intelligence
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">
          Ask the World.{' '}
          <span className="gradient-text">Decide Smarter.</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-lg mx-auto mb-7 leading-relaxed">
          Share your decisions with millions worldwide. Get AI-analyzed insights from collective intelligence.
        </p>

        <div className="flex justify-center gap-3 mb-5">
          <Link href="/ask">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-11 px-6 text-[14px] font-semibold">
              <Brain size={18} /> Ask a Question <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/predictions">
            <Button variant="outline" className="gap-2 h-11 px-5 text-[14px] border-border/50">
              <Flame size={18} /> Predictions
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          <Users size={13} /> 2,847 deciding now
          <span className="mx-1">·</span>
          <Globe size={13} /> 142 countries
        </div>
      </motion.div>

      {/* ─── Stats ────────────────────────────────── */}
      <StatsBar />

      {/* ─── Daily Challenges ─────────────────────── */}
      <Section icon={<Zap size={16} className="text-amber-400" />} title="Daily Challenges" trailing={
        <span className="text-[11px] text-muted-foreground bg-amber-500/8 border border-amber-500/15 px-2.5 py-1 rounded-full">
          <Clock size={10} className="inline mr-1 align-[-1px]" /> Resets in 8h 23m
        </span>
      }>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {mockDailyQuestions.map((dq, i) => (
            <motion.div
              key={dq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/ask" className="no-underline text-inherit">
                <div className="bg-card/50 border border-amber-500/10 rounded-xl p-4 hover:border-amber-500/25 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-2.5">
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/8 text-amber-400 border-0 capitalize">
                      {dq.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                      <Star size={11} /> +{dq.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold leading-snug">{dq.title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── Hot Predictions ──────────────────────── */}
      <Section icon={<Flame size={16} className="text-red-400" />} title="Hot Predictions" trailing={
        <Link href="/predictions" className="text-[12px] text-indigo-400 no-underline font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View all <ChevronRight size={14} />
        </Link>
      }>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {mockPredictions.slice(0, 2).map((p) => (
            <Link key={p.id} href="/predictions" className="no-underline text-inherit">
              <div className="bg-card/50 border border-border/40 rounded-xl p-4 hover:border-border transition-colors cursor-pointer">
                <div className="flex justify-between mb-2.5">
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-0 gap-1">
                    <Zap size={9} /> Open
                  </Badge>
                  {p.prize && <span className="text-[15px] font-black text-emerald-400">${p.prize.toLocaleString()}</span>}
                </div>
                <p className="text-[14px] font-semibold leading-snug mb-2.5">{p.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users size={12} /> {p.totalParticipants.toLocaleString()} participants
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ─── Quick Actions ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[
          { href: '/ai-analysis', icon: Brain, label: 'AI Engine', color: 'text-indigo-400', bg: 'bg-indigo-500/8' },
          { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: 'text-amber-400', bg: 'bg-amber-500/8' },
          { href: '/pricing', icon: Crown, label: 'Premium', color: 'text-red-400', bg: 'bg-red-500/8' },
          { href: '/predictions', icon: BarChart3, label: 'Predict', color: 'text-emerald-400', bg: 'bg-emerald-500/8' },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="no-underline text-inherit">
            <div className="bg-card/50 border border-border/30 rounded-xl p-4 text-center hover:border-border/60 transition-colors cursor-pointer">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', a.bg)}>
                <a.icon size={20} className={a.color} />
              </div>
              <span className="text-[12px] font-semibold">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Referral ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-indigo-500/10 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-bold">Invite friends, earn rewards!</p>
            <p className="text-[12px] text-muted-foreground">Get 500 XP per friend. They get 200 XP too.</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] h-9 px-4 shrink-0">
          Invite
        </Button>
      </div>

      <Separator className="mb-5 bg-border/30" />

      {/* ─── Sort & Filter ────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1">
          {[
            { key: 'trending' as const, icon: TrendingUp, label: 'Trending' },
            { key: 'newest' as const, icon: Clock, label: 'Newest' },
            { key: 'hot' as const, icon: Flame, label: 'Hot' },
          ].map((s) => (
            <Button
              key={s.key}
              variant={sort === s.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSort(s.key)}
              className={cn(
                'gap-1.5 text-[12px] h-8',
                sort === s.key ? 'bg-indigo-500/10 text-indigo-400' : 'text-muted-foreground'
              )}
            >
              <s.icon size={13} /> {s.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={13} className="text-muted-foreground" />
          <FilterPill active={!selectedCategory} onClick={() => setSelectedCategory(null)} label="All" />
          {categories.slice(0, 5).map((cat) => (
            <FilterPill
              key={cat.value}
              active={selectedCategory === cat.value}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
              label={`${cat.icon} ${cat.label}`}
            />
          ))}
        </div>
      </div>

      {/* ─── Feed ─────────────────────────────────── */}
      {filtered.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}

      {filtered.length === 0 && (
        <div className="bg-card border border-border/30 rounded-xl p-12 text-center">
          <p className="text-base font-semibold mb-1">No questions found</p>
          <p className="text-sm text-muted-foreground">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, trailing, children }: {
  icon: React.ReactNode;
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold flex items-center gap-2">
          {icon} {title}
        </h2>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-[11px] font-medium transition-all border cursor-pointer',
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-transparent text-muted-foreground border-border/50 hover:border-border'
      )}
    >
      {label}
    </button>
  );
}
