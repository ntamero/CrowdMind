'use client';

import { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, Heart, Target, AlertTriangle, BarChart3,
  Sparkles, Globe, Zap, ChevronRight, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function AIAnalysisPage() {
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/questions').then(r => r.json()).then(d => setQuestions(d.questions || [])).catch(() => {});
  }, []);

  const d = stats?.display || { aiAnalyses: 0, votesCast: 0, markets: 0, online: 0 };
  const totalUsers = stats?.totalUsers || 0;

  const globalStats = [
    { icon: Brain, label: 'Questions Analyzed', value: String(d.markets), colorClass: 'text-indigo-500' },
    { icon: Globe, label: 'Total Votes', value: String(d.votesCast), colorClass: 'text-cyan-500' },
    { icon: BarChart3, label: 'Comments', value: String(d.aiAnalyses), colorClass: 'text-emerald-500' },
    { icon: Sparkles, label: 'Users', value: String(totalUsers), colorClass: 'text-amber-500' },
  ];

  // Calculate real category distribution from questions
  const categoryCounts: Record<string, number> = {};
  questions.forEach((q: any) => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, count]) => ({
      topic: cat.charAt(0).toUpperCase() + cat.slice(1),
      count,
      percentage: questions.length > 0 ? Math.round((count / questions.length) * 100) : 0,
    }));

  // Get top voted questions as "predictions"
  const topQuestions = [...questions]
    .sort((a: any, b: any) => (b.totalVotes || 0) - (a.totalVotes || 0))
    .slice(0, 3)
    .map((q: any) => {
      const leading = q.options?.sort((a: any, b: any) => b.percentage - a.percentage)?.[0];
      return {
        topic: q.title,
        probability: leading?.percentage || 0,
        participants: q.totalVotes || 0,
      };
    });

  // Calculate sentiment from vote distribution
  const totalVotesAll = questions.reduce((sum: number, q: any) => sum + (q.totalVotes || 0), 0);
  const avgOptions = questions.length > 0
    ? Math.round(questions.reduce((sum: number, q: any) => sum + (q.options?.length || 0), 0) / questions.length)
    : 0;

  return (
    <div className="mx-auto max-w-[950px] py-5">
      {/* Header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <Brain size={32} className="text-white" />
        </div>
        <h1 className="mb-2 text-4xl font-black">
          AI{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Intelligence Engine
          </span>
        </h1>
        <p className="mx-auto max-w-[550px] text-base text-muted-foreground">
          MIA analyzes all votes and predictions across {d.markets} questions to deliver actionable insights
        </p>
      </motion.div>

      {/* Global stats */}
      <motion.div
        className="mb-8 grid grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {globalStats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="bg-card/50 border border-border/30 rounded-xl p-4 text-center"
            >
              <Icon size={22} className={`mx-auto mb-2 ${s.colorClass}`} />
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI Modules with Real Data */}
      <motion.div
        className="flex flex-col gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sentiment Module */}
        <motion.div variants={itemVariants} className="bg-card/50 border border-border/30 rounded-xl p-7">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-gradient-to-br from-red-500 to-pink-500">
              <Heart size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Sentiment AI</h3>
              <p className="text-[13px] text-muted-foreground">Analyzes emotional tone and public opinion across all votes and comments</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-extrabold text-red-500">{d.votesCast}</div>
                <div className="text-[11px] text-muted-foreground">Votes Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-red-500">{d.markets}</div>
                <div className="text-[11px] text-muted-foreground">Questions</div>
              </div>
            </div>
          </div>
          {questions.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="mb-3 text-[13px] font-semibold text-red-500">
                  Platform Overview
                </div>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Questions</span><span className="font-bold">{questions.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Votes</span><span className="font-bold">{totalVotesAll}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Avg Options/Question</span><span className="font-bold">{avgOptions}</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] p-4">
                <div className="mb-1.5 text-[13px] font-semibold text-emerald-500">Engagement Signal</div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {totalVotesAll > 0
                    ? `${totalVotesAll} votes cast across ${questions.length} questions. Average ${questions.length > 0 ? Math.round(totalVotesAll / questions.length) : 0} votes per question.`
                    : 'Voting data will appear here as users participate.'
                  }
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Category Distribution Module */}
        <motion.div variants={itemVariants} className="bg-card/50 border border-border/30 rounded-xl p-7">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Category AI</h3>
              <p className="text-[13px] text-muted-foreground">Identifies trending categories and topic distribution across the platform</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-extrabold text-indigo-500">{Object.keys(categoryCounts).length}</div>
                <div className="text-[11px] text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-indigo-500">{questions.length}</div>
                <div className="text-[11px] text-muted-foreground">Questions</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {topCategories.length === 0 && (
              <p className="col-span-2 text-center text-muted-foreground text-[13px] py-4">Category data will appear as questions are created</p>
            )}
            {topCategories.map((t) => (
              <div
                key={t.topic}
                className="flex items-center justify-between rounded-[10px] bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-indigo-500" />
                  <span className="text-sm font-medium">{t.topic}</span>
                </div>
                <span className="flex items-center gap-1 text-[13px] font-bold text-indigo-400">
                  {t.count} ({t.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Predictions Module */}
        <motion.div variants={itemVariants} className="bg-card/50 border border-border/30 rounded-xl p-7">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-gradient-to-br from-amber-500 to-red-500">
              <Zap size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Prediction AI</h3>
              <p className="text-[13px] text-muted-foreground">Tracks the most active predictions and identifies leading outcomes</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-extrabold text-amber-500">{questions.length}</div>
                <div className="text-[11px] text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-amber-500">{totalVotesAll}</div>
                <div className="text-[11px] text-muted-foreground">Votes</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {topQuestions.length === 0 && (
              <p className="text-center text-muted-foreground text-[13px] py-4">Predictions will appear here as users vote</p>
            )}
            {topQuestions.map((p) => (
              <div
                key={p.topic}
                className="flex items-center justify-between rounded-[10px] bg-muted/50 px-4 py-3"
              >
                <span className="text-sm font-medium flex-1 min-w-0 truncate mr-4">{p.topic}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {p.participants} votes
                  </span>
                  <div className="w-[60px]">
                    <Progress
                      value={p.probability}
                      className="h-2 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:rounded [&_[data-slot=progress-indicator]]:rounded"
                    />
                  </div>
                  <span className="min-w-[36px] text-sm font-bold text-amber-500">
                    {p.probability}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Decision AI Module */}
        <motion.div variants={itemVariants} className="bg-card/50 border border-border/30 rounded-xl p-7">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Target size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Decision AI</h3>
              <p className="text-[13px] text-muted-foreground">Recommends the best option based on crowd wisdom and vote patterns</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-extrabold text-emerald-500">{totalUsers}</div>
                <div className="text-[11px] text-muted-foreground">Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-emerald-500">{d.votesCast}</div>
                <div className="text-[11px] text-muted-foreground">Decisions</div>
              </div>
            </div>
          </div>
          {topQuestions.length > 0 && (
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target size={16} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-500">Most Voted Question</span>
                <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
                  {topQuestions[0].participants} votes
                </Badge>
              </div>
              <div className="text-lg font-bold truncate">{topQuestions[0].topic}</div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                Leading option at {topQuestions[0].probability}% — based on {topQuestions[0].participants} community votes
              </div>
            </div>
          )}
          {topQuestions.length === 0 && (
            <p className="text-center text-muted-foreground text-[13px] py-4">Decision insights will appear as voting data grows</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
