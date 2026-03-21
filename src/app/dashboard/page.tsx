'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, Wallet, TrendingUp, DollarSign,
  BarChart3, Clock, Eye, Users, MessageSquare, Star,
  Crown, Zap, Target, ArrowUpRight, ArrowDownRight,
  Copy, ExternalLink, Timer, CheckCircle, XCircle,
  Edit3, Trash2, MoreHorizontal, PieChart, Activity,
  Gift, Award, Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatNumber, cn } from '@/lib/utils';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Tabs ──
const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'questions', label: 'My Questions', icon: MessageSquare },
  { id: 'create', label: 'Create Question', icon: Plus },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
] as const;

type TabId = (typeof tabs)[number]['id'];

// Wallet and earnings data will come from dashData (API) or defaults
const getWalletData = (data: any) => ({
  address: data?.user?.walletAddress || 'Not connected',
  balance: data?.stats?.wsrTokens || 0,
  totalEarned: data?.user?.xp || 0,
  chain: 'Polygon',
  transactions: (data?.transactions || []).map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    date: new Date(t.createdAt).toLocaleDateString(),
    status: 'completed',
  })),
});

const getEarningsData = (data: any) => ({
  allTime: data?.user?.xp || 0,
  wsrTokens: data?.stats?.wsrTokens || 0,
  questionEarnings: (data?.user?.totalQuestions || 0) * 3,
  voteEarnings: (data?.user?.totalVotes || 0) * 1,
  breakdown: [
    { label: 'Questions', value: (data?.user?.totalQuestions || 0) * 3, color: '#6366f1', percent: 60 },
    { label: 'Votes', value: (data?.user?.totalVotes || 0) * 1, color: '#10b981', percent: 30 },
    { label: 'Comments', value: (data?.stats?.myComments || 0) * 1, color: '#f59e0b', percent: 10 },
  ],
});

const categories = [
  'business', 'technology', 'design', 'lifestyle', 'finance',
  'sports', 'politics', 'entertainment', 'education', 'health',
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { profile } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDashData(data); })
      .finally(() => setLoading(false));
  }, []);

  // Use real data from API
  const user = dashData?.user || profile || { displayName: 'User', username: 'user', xp: 0, level: 1, reputation: 0, badge: 'newcomer', totalVotes: 0, totalQuestions: 0, streak: 0, walletAddress: null };
  const userQuestions = dashData?.myQuestions || [];

  // Derive wallet and earnings from real data
  const walletData = getWalletData(dashData);
  const _earn = getEarningsData(dashData);
  const earningsData = {
    today: dashData?.stats?.myVotes || 0,
    thisWeek: dashData?.user?.xp || 0,
    thisMonth: dashData?.user?.xp || 0,
    allTime: dashData?.user?.xp || 0,
    questionEarnings: _earn.questionEarnings,
    voteEarnings: _earn.voteEarnings,
    wsrTokens: _earn.wsrTokens,
    breakdown: _earn.breakdown,
    history: (dashData?.transactions || []).slice(0, 7).map((t: any) => ({
      date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: t.amount,
    })),
  };
  // Ensure history has at least some entries for chart
  if (earningsData.history.length === 0) {
    earningsData.history = [{ date: 'Today', amount: 0 }];
  }

  // Create question form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('technology');
  const [formOptions, setFormOptions] = useState(['', '']);
  const [formDuration, setFormDuration] = useState('7');

  const addOption = () => setFormOptions([...formOptions, '']);
  const removeOption = (i: number) => setFormOptions(formOptions.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => {
    const copy = [...formOptions];
    copy[i] = val;
    setFormOptions(copy);
  };

  return (
    <div className="max-w-full mx-auto py-4">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1">
            <Crown size={12} /> {user.isPremium ? 'Pro' : 'Free'}
          </Badge>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 gap-1">
            <Star size={12} /> Level {user.level}
          </Badge>
        </div>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 bg-card/50 border border-border/30 rounded-xl p-1 mb-6 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap border-0',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ═══════ OVERVIEW ═══════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Zap, label: 'Total XP', value: `${(user.xp || 0).toLocaleString()} XP`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: Wallet, label: 'WSR Tokens', value: `${walletData.balance} WSR`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { icon: MessageSquare, label: 'My Questions', value: userQuestions.length.toString(), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { icon: Star, label: 'Level', value: `Lv.${user.level || 1}`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', s.bg)}>
                      <s.icon size={16} className={s.color} />
                    </div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Activity + Earnings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Questions */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <MessageSquare size={15} className="text-indigo-400" /> My Recent Questions
                  </h3>
                  <div className="space-y-2">
                    {userQuestions.slice(0, 4).map((q: any) => (
                      <Link key={q.id} href={`/questions/${q.id}`} className="no-underline text-inherit">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                          {q.image && (
                            <img src={q.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold truncate">{q.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-0.5"><Users size={9} /> {formatNumber(q.totalVotes)}</span>
                              <span className="flex items-center gap-0.5"><MessageSquare size={9} /> {q.totalComments}</span>
                            </div>
                          </div>
                          <Badge className={cn(
                            'text-[9px] border-0 capitalize',
                            q.status === 'trending' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                          )}>
                            {q.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-3 text-[12px] text-muted-foreground" onClick={() => setActiveTab('questions')}>
                    View all questions
                  </Button>
                </div>

                {/* Earnings Summary */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <DollarSign size={15} className="text-emerald-400" /> Earnings Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: 'Today', value: `${earningsData.today} XP` },
                      { label: 'This Week', value: `${earningsData.thisWeek} XP` },
                      { label: 'This Month', value: `${earningsData.thisMonth} XP` },
                      { label: 'All Time', value: `${earningsData.allTime.toLocaleString()} XP` },
                    ].map((e) => (
                      <div key={e.label} className="bg-secondary/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-black text-emerald-400">{e.value}</div>
                        <div className="text-[10px] text-muted-foreground">{e.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Breakdown */}
                  <div className="space-y-2">
                    {earningsData.breakdown.map((b: any) => (
                      <div key={b.label} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
                        <span className="text-[12px] flex-1">{b.label}</span>
                        <span className="text-[12px] font-bold">{b.value.toLocaleString()} XP</span>
                        <div className="w-20 h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${b.percent}%`, background: b.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Activity size={15} className="text-purple-400" /> Recent Transactions
                </h3>
                <div className="space-y-1.5">
                  {walletData.transactions.slice(0, 4).map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/20 transition-colors">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        tx.type === 'earning' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      )}>
                        {tx.type === 'earning' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-[13px] font-bold', tx.amount > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} XP
                        </p>
                        <Badge className={cn('text-[8px] border-0', tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ MY QUESTIONS ═══════ */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">My Questions ({userQuestions.length})</h3>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-[13px]" onClick={() => setActiveTab('create')}>
                  <Plus size={14} /> New Question
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userQuestions.map((q: any) => (
                  <div key={q.id} className="bg-card/60 border border-border/30 rounded-xl overflow-hidden group">
                    {q.image && (
                      <div className="relative h-[100px] overflow-hidden">
                        <img src={q.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <Badge className="absolute top-2 left-2 bg-black/50 text-white border-0 text-[9px] capitalize">{q.category}</Badge>
                        <Badge className={cn(
                          'absolute top-2 right-2 border-0 text-[9px]',
                          q.status === 'trending' ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'
                        )}>
                          {q.status}
                        </Badge>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="text-[13px] font-bold line-clamp-2 mb-2">{q.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                        <span className="flex items-center gap-0.5"><Users size={9} /> {formatNumber(q.totalVotes)}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare size={9} /> {q.totalComments}</span>
                        <span className="flex items-center gap-0.5"><Zap size={9} className="text-amber-400" /> +3 XP</span>
                      </div>
                      {/* Options preview */}
                      <div className="space-y-1 mb-3">
                        {q.options.slice(0, 2).map((opt: any) => (
                          <div key={opt.id} className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: opt.color }} />
                              {opt.text}
                            </span>
                            <span className="font-bold ml-2">{opt.percentage}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <Link href={`/questions/${q.id}`} className="flex-1 no-underline">
                          <Button variant="outline" size="sm" className="w-full text-[11px] h-7 gap-1">
                            <Eye size={11} /> View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1 px-2">
                          <Edit3 size={11} />
                        </Button>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1 px-2 text-red-400 hover:text-red-300">
                          <Trash2 size={11} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ CREATE QUESTION ═══════ */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-card/60 border border-border/30 rounded-xl p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-5">
                  <Plus size={18} className="text-indigo-400" /> Create New Question
                </h3>

                {/* Title */}
                <div className="mb-4">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Question Title *</label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Will Bitcoin reach $200K by end of 2026?"
                    className="h-11 bg-secondary/30 border-border/40"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Add more context to your question..."
                    className="w-full h-24 rounded-lg bg-secondary/30 border border-border/40 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Category + Duration */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-11 rounded-lg bg-secondary/30 border border-border/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 capitalize cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      <Timer size={11} className="inline mr-1" />Duration *
                    </label>
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full h-11 rounded-lg bg-secondary/30 border border-border/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                    >
                      <option value="1">1 Day</option>
                      <option value="3">3 Days</option>
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                </div>

                {/* Options */}
                <div className="mb-5">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Answer Options *</label>
                  <div className="space-y-2">
                    {formOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="h-9 bg-secondary/30 border-border/40 text-sm"
                        />
                        {formOptions.length > 2 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 shrink-0" onClick={() => removeOption(i)}>
                            <XCircle size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formOptions.length < 6 && (
                    <Button variant="ghost" className="mt-2 text-[12px] text-indigo-400 gap-1" onClick={addOption}>
                      <Plus size={13} /> Add Option
                    </Button>
                  )}
                </div>

                {/* Pricing info */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <Gift size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold mb-1">Earn from your questions!</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        You earn rewards when people vote on your questions. More votes = more earnings.
                        Pro users earn 2x rewards. Premium users earn 3x rewards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 h-11 text-[14px] font-bold shadow-lg shadow-indigo-500/20">
                    <Zap size={16} /> Publish Question
                  </Button>
                  <Button variant="outline" className="h-11 px-6 text-[14px]">
                    Save Draft
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ EARNINGS ═══════ */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Earnings Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Today', value: `${earningsData.today} XP`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'This Week', value: `${earningsData.thisWeek} XP`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'This Month', value: `${earningsData.thisMonth} XP`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'All Time', value: `${earningsData.allTime.toLocaleString()} XP`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}>
                      <s.icon size={18} className={s.color} />
                    </div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Earnings Breakdown */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <PieChart size={15} className="text-indigo-400" /> Earnings Breakdown
                  </h3>
                  <div className="space-y-4">
                    {earningsData.breakdown.map((b: any) => (
                      <div key={b.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                            {b.label}
                          </span>
                          <span className="text-[13px] font-bold">{b.value.toLocaleString()} XP</span>
                        </div>
                        <div className="h-2 bg-secondary/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${b.percent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: b.color }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{b.percent}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Earnings */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <BarChart3 size={15} className="text-emerald-400" /> Daily Earnings (Last 7 Days)
                  </h3>
                  <div className="space-y-2">
                    {earningsData.history.map((day: any) => {
                      const maxAmount = Math.max(...earningsData.history.map((d: any) => d.amount));
                      const pct = (day.amount / maxAmount) * 100;
                      return (
                        <div key={day.date} className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground w-12 shrink-0">{day.date}</span>
                          <div className="flex-1 h-5 bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            />
                          </div>
                          <span className="text-[12px] font-bold text-emerald-400 w-14 text-right">{day.amount} XP</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Earning Questions */}
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Award size={15} className="text-amber-400" /> Top Earning Questions
                </h3>
                <div className="space-y-2">
                  {userQuestions.map((q: any, i: number) => (
                    <div key={q.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                      <span className="text-[14px] font-black text-muted-foreground w-6 text-center">#{i + 1}</span>
                      {q.image && <img src={q.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">{q.title}</p>
                        <p className="text-[10px] text-muted-foreground">{formatNumber(q.totalVotes)} votes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-emerald-400">{q.totalVotes} XP</p>
                        <p className="text-[9px] text-muted-foreground">earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ WALLET ═══════ */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-pink-900/20 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <Wallet size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">CrowdMind Wallet</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[13px] text-foreground font-mono">{walletData.address}</code>
                        <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 gap-1 text-[11px]">
                    {walletData.chain} Chain
                  </Badge>
                </div>

                <div className="mb-5">
                  <p className="text-[11px] text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-4xl font-black text-white">{walletData.balance.toLocaleString()} XP</p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    1 WSR = $0.001
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11 font-bold shadow-lg shadow-emerald-500/20">
                    <ArrowUpRight size={16} /> Withdraw
                  </Button>
                  <Button variant="outline" className="h-11 gap-2 font-bold border-white/10 hover:bg-white/5">
                    <ExternalLink size={16} /> Connect Web3
                  </Button>
                </div>
              </div>

              {/* Wallet Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Earned', value: `${walletData.totalEarned.toLocaleString()} XP`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Withdrawn WSR', value: `0 WSR`, icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Pending', value: `0 XP`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}>
                      <s.icon size={16} className={s.color} />
                    </div>
                    <div className="text-lg font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Transaction History */}
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Activity size={15} className="text-purple-400" /> Transaction History
                </h3>
                <div className="space-y-1.5">
                  {walletData.transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors border border-transparent hover:border-border/20">
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                        tx.type === 'earning' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      )}>
                        {tx.type === 'earning'
                          ? <ArrowUpRight size={16} className="text-emerald-400" />
                          : <ArrowDownRight size={16} className="text-red-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{tx.description}</p>
                        <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-[14px] font-bold', tx.amount > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}{Math.abs(tx.amount).toFixed(0)} XP
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {tx.status === 'completed'
                            ? <CheckCircle size={10} className="text-emerald-400" />
                            : <Clock size={10} className="text-amber-400" />
                          }
                          <span className={cn('text-[9px] capitalize', tx.status === 'completed' ? 'text-emerald-400' : 'text-amber-400')}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
