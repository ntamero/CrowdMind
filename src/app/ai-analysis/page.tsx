'use client';

import {
  Brain, TrendingUp, Heart, Target, AlertTriangle, BarChart3,
  Sparkles, Globe, Zap, ChevronRight, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const aiModules = [
  {
    id: 'sentiment',
    name: 'Sentiment AI',
    description: 'Analyzes emotional tone and public opinion across all votes and comments',
    icon: Heart,
    colorClass: 'text-red-500',
    gradientClass: 'bg-gradient-to-br from-red-500 to-pink-500',
    stats: { analyzed: '2.4M', accuracy: '91%', signals: '156K' },
    sample: {
      topic: 'AI-first startups',
      positive: 62,
      neutral: 24,
      negative: 14,
      trend: 'Positive sentiment increasing 3.2% week-over-week',
    },
  },
  {
    id: 'decision',
    name: 'Decision AI',
    description: 'Recommends the best option based on crowd wisdom, expert weight, and historical patterns',
    icon: Target,
    colorClass: 'text-emerald-500',
    gradientClass: 'bg-gradient-to-br from-emerald-500 to-cyan-500',
    stats: { decisions: '890K', accuracy: '84%', users: '145K' },
    sample: {
      question: 'Best investment strategy 2026?',
      recommendation: 'Diversified AI + Crypto portfolio',
      confidence: 87,
      basis: 'Based on 42K votes weighted by predictor accuracy',
    },
  },
  {
    id: 'trend',
    name: 'Trend AI',
    description: 'Identifies emerging topics, viral patterns, and shifts in collective opinion',
    icon: TrendingUp,
    colorClass: 'text-indigo-500',
    gradientClass: 'bg-gradient-to-br from-indigo-500 to-violet-500',
    stats: { trends: '2.1K', predictions: '340', accuracy: '79%' },
    rising: [
      { topic: 'AI Agents', change: '+234%', direction: 'up' },
      { topic: 'Remote-first companies', change: '+89%', direction: 'up' },
      { topic: 'Web3 gaming', change: '-12%', direction: 'down' },
      { topic: 'Sustainable tech', change: '+156%', direction: 'up' },
    ],
  },
  {
    id: 'prediction',
    name: 'Prediction AI',
    description: 'Scores prediction accuracy and identifies the most reliable forecasters',
    icon: Zap,
    colorClass: 'text-amber-500',
    gradientClass: 'bg-gradient-to-br from-amber-500 to-red-500',
    stats: { predictions: '8.9K', resolved: '3.2K', avgAccuracy: '71%' },
    topPredictions: [
      { topic: 'Bitcoin > $100K by Q2', probability: 68, participants: 9790 },
      { topic: 'Apple AR glasses 2026', probability: 45, participants: 9700 },
      { topic: 'AI regulation passed', probability: 52, participants: 11100 },
    ],
  },
  {
    id: 'risk',
    name: 'Risk AI',
    description: 'Evaluates risk factors for investment, business, and strategic decisions',
    icon: AlertTriangle,
    colorClass: 'text-violet-500',
    gradientClass: 'bg-gradient-to-br from-violet-500 to-purple-500',
    stats: { assessments: '45K', alerts: '890', accuracy: '76%' },
    riskFactors: [
      { factor: 'Market volatility', level: 'high', score: 78 },
      { factor: 'Regulatory risk', level: 'medium', score: 55 },
      { factor: 'Technology adoption', level: 'low', score: 28 },
      { factor: 'Competition intensity', level: 'high', score: 82 },
    ],
  },
];

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

const globalStats = [
  { icon: Brain, label: 'AI Analyses', value: '4.8M', colorClass: 'text-indigo-500' },
  { icon: Globe, label: 'Data Points', value: '12.8M', colorClass: 'text-cyan-500' },
  { icon: BarChart3, label: 'Avg Accuracy', value: '84%', colorClass: 'text-emerald-500' },
  { icon: Sparkles, label: 'Insights/Day', value: '2.4K', colorClass: 'text-amber-500' },
];

export default function AIAnalysisPage() {
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
          5 specialized AI modules analyze millions of votes and predictions to deliver actionable insights
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

      {/* AI Modules */}
      <motion.div
        className="flex flex-col gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {aiModules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              variants={itemVariants}
              className="bg-card/50 border border-border/30 rounded-xl p-7"
            >
              {/* Module Header */}
              <div className="mb-5 flex items-center gap-3.5">
                <div className={`flex h-[50px] w-[50px] items-center justify-center rounded-[14px] ${mod.gradientClass}`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{mod.name}</h3>
                  <p className="text-[13px] text-muted-foreground">{mod.description}</p>
                </div>
                <div className="flex gap-4">
                  {Object.entries(mod.stats).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className={`text-lg font-extrabold ${mod.colorClass}`}>{val}</div>
                      <div className="text-[11px] capitalize text-muted-foreground">{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              {mod.id === 'sentiment' && mod.sample && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <div className="mb-3 text-[13px] font-semibold text-red-500">
                      Live Sentiment — {mod.sample.topic}
                    </div>
                    <div className="mb-2 flex gap-2">
                      <div className="h-2 rounded bg-emerald-500" style={{ flex: mod.sample.positive }} />
                      <div className="h-2 rounded bg-amber-500" style={{ flex: mod.sample.neutral }} />
                      <div className="h-2 rounded bg-red-500" style={{ flex: mod.sample.negative }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Positive {mod.sample.positive}%</span>
                      <span>Neutral {mod.sample.neutral}%</span>
                      <span>Negative {mod.sample.negative}%</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] p-4">
                    <div className="mb-1.5 text-[13px] font-semibold text-emerald-500">Trend Signal</div>
                    <div className="text-sm leading-relaxed text-muted-foreground">{mod.sample.trend}</div>
                  </div>
                </div>
              )}

              {/* Decision */}
              {mod.id === 'decision' && mod.sample && (
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Target size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-500">AI Recommendation</span>
                    <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
                      {mod.sample.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="mb-1.5 text-[13px] text-muted-foreground">{mod.sample.question}</div>
                  <div className="text-lg font-bold">{mod.sample.recommendation}</div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{mod.sample.basis}</div>
                </div>
              )}

              {/* Trend */}
              {mod.id === 'trend' && mod.rising && (
                <div className="grid grid-cols-2 gap-2.5">
                  {mod.rising.map((t) => (
                    <div
                      key={t.topic}
                      className="flex items-center justify-between rounded-[10px] bg-muted/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-indigo-500" />
                        <span className="text-sm font-medium">{t.topic}</span>
                      </div>
                      <span className={`flex items-center gap-1 text-[13px] font-bold ${t.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.direction === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {t.change}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Prediction */}
              {mod.id === 'prediction' && mod.topPredictions && (
                <div className="flex flex-col gap-2.5">
                  {mod.topPredictions.map((p) => (
                    <div
                      key={p.topic}
                      className="flex items-center justify-between rounded-[10px] bg-muted/50 px-4 py-3"
                    >
                      <span className="text-sm font-medium">{p.topic}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {p.participants.toLocaleString()} participants
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
              )}

              {/* Risk */}
              {mod.id === 'risk' && mod.riskFactors && (
                <div className="grid grid-cols-2 gap-2.5">
                  {mod.riskFactors.map((r) => (
                    <div
                      key={r.factor}
                      className="flex items-center justify-between rounded-[10px] bg-muted/50 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{r.factor}</div>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-[10px] ${
                            r.level === 'high'
                              ? 'border-red-500/30 bg-red-500/15 text-red-500'
                              : r.level === 'medium'
                              ? 'border-amber-500/30 bg-amber-500/15 text-amber-500'
                              : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
                          }`}
                        >
                          {r.level} risk
                        </Badge>
                      </div>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-extrabold ${
                          r.score > 70
                            ? 'bg-red-500/10 text-red-500'
                            : r.score > 40
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {r.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
