'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, MessageSquare, BarChart3, Zap,
  TrendingUp, AlertTriangle, Activity, Globe, Eye,
  Trash2, CheckCircle, Plus, Wallet, DollarSign,
  Clock, Target, Flame, ArrowUpRight, PieChart,
  ArrowDownRight, Send, ChevronDown, ChevronUp,
  Tag, Layers, Timer, LineChart, Search,
  RefreshCw, Ban, ExternalLink, Coins, Copy,
  ArrowRightLeft, Award, Hash, Mail, UserCheck,
  Filter, Download, MoreHorizontal, Star,
  TrendingDown, Percent, Calendar, Database,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
  CartesianGrid, Legend,
} from 'recharts';
import { categories as categoryList } from '@/lib/mock-data';
import { formatNumber, timeAgo, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const POOL_WALLET_ADDRESS = '0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119';
const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const adminTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'questions', label: 'Questions', icon: MessageSquare },
  { id: 'xp-tokens', label: 'XP & Tokens', icon: Coins },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'timers', label: 'Timers', icon: Timer },
] as const;

type AdminTab = (typeof adminTabs)[number]['id'];

interface AdminData {
  overview: {
    totalUsers: number; totalQuestions: number; totalVotes: number; totalComments: number;
    totalPredictions: number; totalTokenTxs: number; totalXPAwarded: number;
    usersToday: number; usersWeek: number; usersMonth: number;
    questionsToday: number; questionsWeek: number;
    votesToday: number; votesWeek: number;
    commentsToday: number;
    activeQuestions: number; expiringSoon: number;
    activeUsers24h: number; activeUsers7d: number; activeUsers30d: number;
    verifiedEmails: number;
    connectedWallets: number; siteWallets: number; verifiedWallets: number;
  };
  analytics: {
    chartData: { date: string; users: number; questions: number; votes: number; xpEarned: number; claims: number }[];
    xpBreakdown: { total: number; fromVotes: number; fromQuestions: number; fromComments: number };
    wsrBreakdown: { totalClaimed: number; totalUnclaimed: number };
    levelDistribution: { level: number; count: number }[];
    categoryStats: { category: string; count: number }[];
    txTypeBreakdown: { type: string; count: number; totalAmount: number }[];
  };
  recentUsers: any[];
  recentQuestions: any[];
  recentTransactions: any[];
  topEarners: any[];
  pool: { totalWSR: number; totalXPFees: number; txCount: number; updatedAt: string | null };
  walletStats: { connectedWallets: number; siteWallets: number; verifiedWallets: number; totalUnclaimedWSR: number; totalClaimedWSR: number };
  walletUsers: any[];
  poolTxs: any[];
}

// Stat card component
function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-border/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-0.5 text-[10px] font-bold', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
            {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          </div>
        )}
      </div>
      <div className="text-xl font-black">{typeof value === 'number' ? formatNumber(value) : value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {sub && <div className="text-[9px] text-emerald-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// Mini chart tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/40 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-[10px]" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [txFilter, setTxFilter] = useState<string>('all');
  const [userSort, setUserSort] = useState<string>('recent');
  const [questionFilter, setQuestionFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const o = data?.overview;
  const a = data?.analytics;

  const copyPoolAddress = () => {
    navigator.clipboard.writeText(POOL_WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    if (!data?.recentTransactions) return [];
    if (txFilter === 'all') return data.recentTransactions;
    return data.recentTransactions.filter((tx: any) => tx.type === txFilter);
  }, [data?.recentTransactions, txFilter]);

  // Sorted users
  const sortedUsers = useMemo(() => {
    if (!data?.recentUsers) return [];
    const users = [...data.recentUsers];
    if (userSort === 'xp') users.sort((a: any, b: any) => b.xp - a.xp);
    else if (userSort === 'votes') users.sort((a: any, b: any) => b.totalVotes - a.totalVotes);
    else if (userSort === 'wsr') users.sort((a: any, b: any) => (b.unclaimedWSR + b.totalClaimedWSR) - (a.unclaimedWSR + a.totalClaimedWSR));
    return users;
  }, [data?.recentUsers, userSort]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (!data?.recentQuestions) return [];
    if (questionFilter === 'all') return data.recentQuestions;
    if (questionFilter === 'active') return data.recentQuestions.filter((q: any) => q.status === 'active');
    if (questionFilter === 'expired') return data.recentQuestions.filter((q: any) => q.expiresAt && new Date(q.expiresAt) < new Date());
    return data.recentQuestions.filter((q: any) => q.category === questionFilter);
  }, [data?.recentQuestions, questionFilter]);

  if (loading && !data) {
    return (
      <div className="max-w-full mx-auto py-4">
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={20} className="animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto py-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-black">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform management & real-time analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
            <Activity size={11} /> Live
          </Badge>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
            {o?.activeUsers24h || 0} active now
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={fetchData}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 overflow-x-auto">
        <div className="flex gap-1 bg-card/50 border border-border/30 rounded-xl p-1 min-w-max">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border-0',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

          {/* ═══════ OVERVIEW ═══════ */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={Users} label="Total Users" value={o?.totalUsers || 0} sub={`+${o?.usersToday || 0} today · +${o?.usersWeek || 0} week`} color="#6366f1" trend="up" />
                <StatCard icon={MessageSquare} label="Questions" value={o?.totalQuestions || 0} sub={`+${o?.questionsToday || 0} today · ${o?.activeQuestions || 0} active`} color="#f59e0b" trend="up" />
                <StatCard icon={BarChart3} label="Total Votes" value={o?.totalVotes || 0} sub={`+${o?.votesToday || 0} today · +${o?.votesWeek || 0} week`} color="#10b981" trend="up" />
                <StatCard icon={Zap} label="XP in System" value={a?.xpBreakdown.total || 0} sub={`${o?.totalTokenTxs || 0} transactions`} color="#8b5cf6" />
                <StatCard icon={Coins} label="WSR Economy" value={`${((a?.wsrBreakdown.totalClaimed || 0) + (a?.wsrBreakdown.totalUnclaimed || 0)).toFixed(2)}`} sub={`${(a?.wsrBreakdown.totalClaimed || 0).toFixed(2)} claimed`} color="#ef4444" />
                <StatCard icon={Globe} label="Active Users" value={o?.activeUsers24h || 0} sub={`7d: ${o?.activeUsers7d || 0} · 30d: ${o?.activeUsers30d || 0}`} color="#06b6d4" />
              </div>

              {/* Activity Chart + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <TrendingUp size={15} className="text-indigo-400" /> 14-Day Activity
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={a?.chartData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="votes" name="Votes" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                        <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1" fill="#6366f120" strokeWidth={2} />
                        <Area type="monotone" dataKey="questions" name="Questions" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Platform Health */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Database size={15} className="text-purple-400" /> Platform Health
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Verified Emails', value: o?.verifiedEmails || 0, total: o?.totalUsers || 1, icon: Mail, color: '#10b981' },
                      { label: 'Connected Wallets', value: o?.connectedWallets || 0, total: o?.totalUsers || 1, icon: Wallet, color: '#6366f1' },
                      { label: 'Active (7d)', value: o?.activeUsers7d || 0, total: o?.totalUsers || 1, icon: UserCheck, color: '#f59e0b' },
                      { label: 'Questions Expiring', value: o?.expiringSoon || 0, total: o?.activeQuestions || 1, icon: AlertTriangle, color: '#ef4444' },
                    ].map((item) => {
                      const pct = Math.min(100, Math.round((item.value / item.total) * 100));
                      return (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <item.icon size={12} style={{ color: item.color }} />
                              <span className="text-[11px] text-muted-foreground">{item.label}</span>
                            </div>
                            <span className="text-[11px] font-bold">{item.value} <span className="text-muted-foreground font-normal">/ {item.total}</span></span>
                          </div>
                          <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: item.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pool Quick View */}
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Flame size={11} className="text-amber-400" /> Pool WSR</span>
                      <span className="text-sm font-black text-amber-400">{data?.pool.totalWSR.toFixed(4) || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><ArrowRightLeft size={11} className="text-blue-400" /> Conversions</span>
                      <span className="text-sm font-bold">{data?.pool.txCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity: Users + Questions + Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Users */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Users size={14} className="text-indigo-400" /> New Users
                  </h3>
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                    {(data?.recentUsers || []).slice(0, 8).map((user: any) => (
                      <div key={user.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(user.displayName || user.username || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate">{user.displayName || user.username || user.email}</p>
                          <p className="text-[9px] text-muted-foreground">{user.xp} XP · Lv.{user.level} · {timeAgo(user.createdAt)}</p>
                        </div>
                        <Badge className={cn('text-[8px] border-0', user.walletAddress ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>
                          {user.walletAddress ? 'Wallet' : 'Free'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Questions */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-amber-400" /> Recent Questions
                  </h3>
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                    {(data?.recentQuestions || []).slice(0, 8).map((q: any) => (
                      <div key={q.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold truncate">{q.title}</p>
                          <p className="text-[9px] text-muted-foreground">{q.user?.displayName || q.user?.username} · {formatNumber(q.totalVotes)} votes · {q.category}</p>
                        </div>
                        <Badge className={cn('text-[8px] border-0 capitalize ml-2', q.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>{q.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Activity size={14} className="text-emerald-400" /> Recent Transactions
                  </h3>
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                    {(data?.recentTransactions || []).slice(0, 8).map((tx: any) => {
                      const isCredit = ['earn', 'win', 'daily_bonus', 'referral'].includes(tx.type);
                      return (
                        <div key={tx.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 transition-colors">
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            isCredit ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                          )}>
                            {isCredit ? <ArrowUpRight size={12} className="text-emerald-400" /> : <ArrowDownRight size={12} className="text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate">{tx.user?.displayName || tx.user?.username || 'System'}</p>
                            <p className="text-[9px] text-muted-foreground">{tx.type} · {tx.description?.slice(0, 30) || '—'}</p>
                          </div>
                          <span className={cn('text-[11px] font-bold font-mono', isCredit ? 'text-emerald-400' : 'text-blue-400')}>
                            {isCredit ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ ANALYTICS ═══════ */}
          {activeTab === 'analytics' && a && (
            <div className="space-y-5">
              {/* XP & WSR Economy */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <StatCard icon={Zap} label="Total XP" value={a.xpBreakdown.total} color="#8b5cf6" />
                <StatCard icon={BarChart3} label="XP from Votes" value={a.xpBreakdown.fromVotes} color="#10b981" />
                <StatCard icon={MessageSquare} label="XP from Questions" value={a.xpBreakdown.fromQuestions} color="#f59e0b" />
                <StatCard icon={Target} label="XP from Comments" value={a.xpBreakdown.fromComments} color="#06b6d4" />
                <StatCard icon={Coins} label="WSR Claimed" value={a.wsrBreakdown.totalClaimed.toFixed(2)} color="#ef4444" />
                <StatCard icon={Wallet} label="WSR Unclaimed" value={a.wsrBreakdown.totalUnclaimed.toFixed(2)} color="#f59e0b" />
                <StatCard icon={Flame} label="Pool WSR" value={data?.pool.totalWSR.toFixed(4) || '0'} color="#f97316" />
                <StatCard icon={ArrowRightLeft} label="Conversions" value={data?.pool.txCount || 0} color="#6366f1" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Daily Activity Chart */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <TrendingUp size={15} className="text-indigo-400" /> Daily Votes & Users (14 days)
                  </h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={a.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="votes" name="Votes" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="users" name="New Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="questions" name="Questions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* XP Earned Over Time */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Zap size={15} className="text-purple-400" /> Daily XP Earned & Claims
                  </h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={a.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Area type="monotone" dataKey="xpEarned" name="XP Earned" stroke="#8b5cf6" fill="#8b5cf620" strokeWidth={2} />
                        <Area type="monotone" dataKey="claims" name="WSR Claims" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Category Distribution */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <PieChart size={15} className="text-amber-400" /> Questions by Category
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={a.categoryStats.slice(0, 8)}
                          dataKey="count"
                          nameKey="category"
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={3}
                        >
                          {a.categoryStats.slice(0, 8).map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {a.categoryStats.slice(0, 8).map((c: any, i: number) => (
                      <div key={c.category} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[9px] text-muted-foreground capitalize">{c.category} ({c.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Distribution */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Star size={15} className="text-emerald-400" /> User Level Distribution
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={a.levelDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="level" tick={{ fontSize: 10, fill: '#6b7094' }} label={{ value: 'Level', position: 'bottom', fontSize: 10, fill: '#6b7094' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6b7094' }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="count" name="Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Transaction Type Breakdown */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Activity size={15} className="text-red-400" /> Transaction Types
                  </h3>
                  <div className="space-y-2">
                    {a.txTypeBreakdown.map((t: any) => {
                      const maxCount = Math.max(...a.txTypeBreakdown.map((x: any) => x.count), 1);
                      const pct = Math.round((t.count / maxCount) * 100);
                      const colorMap: Record<string, string> = {
                        earn: '#10b981', claim: '#6366f1', stake: '#f59e0b', win: '#ef4444',
                        transfer: '#8b5cf6', daily_bonus: '#06b6d4', referral: '#f97316',
                      };
                      return (
                        <div key={t.type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold capitalize">{t.type.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{t.count} txs</span>
                              <span className="text-[10px] font-mono font-bold" style={{ color: colorMap[t.type] || '#6b7094' }}>
                                {Number(t.totalAmount).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colorMap[t.type] || '#6b7094' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Earners */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold flex items-center gap-2 px-4 py-3 border-b border-border/20">
                  <Award size={15} className="text-amber-400" /> Top 25 Earners
                </h3>
                <div className="grid grid-cols-[30px_1fr_70px_60px_60px_80px_60px_70px] gap-2 px-4 py-2 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>#</span><span>User</span><span>XP</span><span>Votes</span><span>Qs</span><span>WSR Total</span><span>Streak</span><span>Joined</span>
                </div>
                {(data?.topEarners || []).map((e: any, i: number) => (
                  <div key={e.id} className="grid grid-cols-[30px_1fr_70px_60px_60px_80px_60px_70px] gap-2 px-4 py-2.5 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <span className={cn('text-[12px] font-black', i < 3 ? 'text-amber-400' : 'text-muted-foreground')}>#{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {(e.displayName || e.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold truncate block">{e.displayName || e.username || 'Unknown'}</span>
                        <span className="text-[9px] text-muted-foreground">Lv.{e.level} · {e.badge}</span>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-amber-400">{e.xp.toLocaleString()}</span>
                    <span className="text-[11px]">{e.totalVotes}</span>
                    <span className="text-[11px]">{e.totalQuestions}</span>
                    <span className="text-[11px] font-mono text-emerald-400">{((e.unclaimedWSR || 0) + (e.totalClaimedWSR || 0)).toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <Flame size={10} className="text-orange-400" />
                      <span className="text-[11px]">{e.streak || 0}d</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(e.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ USERS ═══════ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* User Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard icon={Users} label="Total Users" value={o?.totalUsers || 0} color="#6366f1" sub={`+${o?.usersToday || 0} today`} />
                <StatCard icon={UserCheck} label="Active (24h)" value={o?.activeUsers24h || 0} color="#10b981" />
                <StatCard icon={Mail} label="Verified Email" value={o?.verifiedEmails || 0} color="#f59e0b" />
                <StatCard icon={Wallet} label="Wallets Connected" value={o?.connectedWallets || 0} color="#8b5cf6" />
                <StatCard icon={Globe} label="Active (7d)" value={o?.activeUsers7d || 0} color="#06b6d4" />
                <StatCard icon={Calendar} label="This Month" value={o?.usersMonth || 0} color="#ef4444" />
              </div>

              {/* Search & Sort */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search users by name, email..." className="pl-9 h-9 bg-secondary/30 border-border/40 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-1">
                  {[
                    { value: 'recent', label: 'Recent' },
                    { value: 'xp', label: 'Top XP' },
                    { value: 'votes', label: 'Top Votes' },
                    { value: 'wsr', label: 'Top WSR' },
                  ].map((s) => (
                    <button key={s.value} onClick={() => setUserSort(s.value)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border-0 cursor-pointer transition-all',
                        userSort === s.value ? 'bg-indigo-600 text-white' : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
                      )}>{s.label}</button>
                  ))}
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[11px]">{o?.totalUsers || 0} total</Badge>
              </div>

              {/* Users Table */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_60px_60px_80px_80px_100px_60px] gap-2 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>XP / Level</span><span>Votes</span><span>Qs</span><span>WSR</span><span>Wallet</span><span>Last Active</span><span>Role</span>
                </div>
                {sortedUsers
                  .filter((u: any) => !searchQuery || [u.displayName, u.username, u.email].some(v => (v || '').toLowerCase().includes(searchQuery.toLowerCase())))
                  .map((user: any) => (
                    <div key={user.id} className="grid grid-cols-[1fr_80px_60px_60px_80px_80px_100px_60px] gap-2 px-4 py-2.5 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold truncate">{user.displayName || user.username || 'Unknown'}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[12px] font-bold text-amber-400">{user.xp}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">Lv.{user.level}</span>
                      </div>
                      <span className="text-[12px]">{user.totalVotes}</span>
                      <span className="text-[12px]">{user.totalQuestions}</span>
                      <div>
                        <span className="text-[12px] font-mono text-emerald-400">{(user.unclaimedWSR || 0).toFixed(1)}</span>
                        {user.totalClaimedWSR > 0 && <span className="text-[9px] text-muted-foreground ml-0.5">+{user.totalClaimedWSR.toFixed(1)}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {user.walletAddress ? (
                          <code className="text-[9px] text-emerald-400 truncate">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</code>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                        {user.walletVerified && <CheckCircle size={10} className="text-emerald-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{user.lastActiveAt ? timeAgo(user.lastActiveAt) : 'Never'}</span>
                      <Badge className={cn('text-[8px] border-0 w-fit',
                        user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                        user.role === 'moderator' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-500/10 text-slate-400'
                      )}>{user.role}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════ QUESTIONS ═══════ */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold">All Questions ({o?.totalQuestions || 0})</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[11px]">{o?.activeQuestions || 0} active</Badge>
                  <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[11px]">{o?.expiringSoon || 0} expiring</Badge>
                </div>
                <div className="flex gap-1">
                  {['all', 'active', 'expired', ...(a?.categoryStats.slice(0, 5).map((c: any) => c.category) || [])].map((f) => (
                    <button key={f} onClick={() => setQuestionFilter(f)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border-0 cursor-pointer capitalize transition-all',
                        questionFilter === f ? 'bg-indigo-600 text-white' : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
                      )}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_100px_60px_60px_80px_80px] gap-2 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Img</span><span>Question</span><span>Author</span><span>Votes</span><span>Opts</span><span>Category</span><span>Status / Timer</span>
                </div>
                {filteredQuestions.map((q: any) => {
                  const expired = q.expiresAt && new Date(q.expiresAt) < new Date();
                  const daysLeft = q.expiresAt ? Math.max(0, Math.floor((new Date(q.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
                  return (
                    <div key={q.id} className="grid grid-cols-[40px_1fr_100px_60px_60px_80px_80px] gap-2 px-4 py-2.5 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                      {q.imageUrl ? (
                        <img src={q.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <MessageSquare size={12} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold truncate">{q.title}</p>
                        <p className="text-[9px] text-muted-foreground">{timeAgo(q.createdAt)}</p>
                      </div>
                      <span className="text-[11px] truncate">{q.user?.displayName || q.user?.username}</span>
                      <span className="text-[12px] font-bold">{formatNumber(q.totalVotes)}</span>
                      <span className="text-[11px]">{q.options?.length || 0}</span>
                      <Badge className="text-[8px] bg-secondary/20 text-muted-foreground border-0 capitalize w-fit">{q.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Badge className={cn('text-[8px] border-0 gap-0.5',
                          expired ? 'bg-red-500/10 text-red-400' :
                          daysLeft !== null && daysLeft <= 3 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        )}>
                          {expired ? 'Expired' : daysLeft !== null ? <><Timer size={8} /> {daysLeft}d</> : q.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground text-sm">No questions match filter</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════ XP & TOKENS ═══════ */}
          {activeTab === 'xp-tokens' && (
            <div className="space-y-5">
              {/* XP Economy Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard icon={Zap} label="Total XP in System" value={a?.xpBreakdown.total || 0} color="#8b5cf6" />
                <StatCard icon={BarChart3} label="XP Awarded (Txs)" value={o?.totalXPAwarded || 0} color="#10b981" sub={`${o?.totalTokenTxs || 0} transactions`} />
                <StatCard icon={Coins} label="Total WSR Supply" value={`${((a?.wsrBreakdown.totalClaimed || 0) + (a?.wsrBreakdown.totalUnclaimed || 0)).toFixed(2)}`} color="#ef4444" />
                <StatCard icon={ArrowUpRight} label="WSR Claimed" value={(a?.wsrBreakdown.totalClaimed || 0).toFixed(2)} color="#6366f1" />
                <StatCard icon={Wallet} label="WSR Unclaimed" value={(a?.wsrBreakdown.totalUnclaimed || 0).toFixed(2)} color="#f59e0b" />
                <StatCard icon={Flame} label="Pool Fees" value={`${data?.pool.totalWSR.toFixed(4) || '0'} WSR`} color="#f97316" sub={`${data?.pool.totalXPFees || 0} XP fees`} />
              </div>

              {/* XP Flow Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Zap size={15} className="text-purple-400" /> XP Sources
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Voting (1 XP each)', value: a?.xpBreakdown.fromVotes || 0, color: '#10b981', icon: BarChart3 },
                      { label: 'Creating Questions (3 XP each)', value: a?.xpBreakdown.fromQuestions || 0, color: '#f59e0b', icon: MessageSquare },
                      { label: 'Comments (1 XP each)', value: a?.xpBreakdown.fromComments || 0, color: '#06b6d4', icon: Target },
                    ].map((item) => {
                      const total = (a?.xpBreakdown.fromVotes || 0) + (a?.xpBreakdown.fromQuestions || 0) + (a?.xpBreakdown.fromComments || 0) || 1;
                      const pct = Math.round((item.value / total) * 100);
                      return (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <item.icon size={13} style={{ color: item.color }} />
                              <span className="text-[11px]">{item.label}</span>
                            </div>
                            <span className="text-[12px] font-bold" style={{ color: item.color }}>{item.value} XP ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: item.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Coins size={15} className="text-amber-400" /> WSR Token Flow
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-900/5 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                          <p className="text-lg font-black text-emerald-400">250 XP = 1 WSR</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fee per Convert</p>
                          <p className="text-lg font-black text-amber-400">10 XP</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-secondary/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-blue-400">{(a?.wsrBreakdown.totalUnclaimed || 0).toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground">Platform WSR</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-emerald-400">{(a?.wsrBreakdown.totalClaimed || 0).toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground">On-Chain WSR</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-amber-400">{data?.pool.totalWSR.toFixed(4) || '0'}</p>
                        <p className="text-[9px] text-muted-foreground">Pool Fees</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Wallet Management */}
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Flame size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-300">Fee Pool Wallet</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{POOL_WALLET_ADDRESS}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyPoolAddress} className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border-0">
                      {copied ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                    <a href={`https://amoy.polygonscan.com/address/${POOL_WALLET_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer no-underline">
                      <ExternalLink size={11} /> Explorer
                    </a>
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[11px] font-bold gap-1.5 h-8"
                      onClick={async () => {
                        const amount = prompt('Enter WSR amount to withdraw:');
                        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
                        try {
                          const res = await fetch('/api/admin/pool', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount) }) });
                          const d = await res.json();
                          if (res.ok) { alert(`${d.amount} WSR sent!\nTX: ${d.txHash}`); fetchData(); }
                          else alert(`Error: ${d.error}`);
                        } catch (e: any) { alert('Failed: ' + e.message); }
                      }}>
                      <ArrowUpRight size={12} /> Withdraw
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-400">{data?.pool.totalWSR.toFixed(4) || '0'}</div>
                    <div className="text-[10px] text-muted-foreground">WSR in Pool</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-orange-400">{data?.pool.totalXPFees || 0}</div>
                    <div className="text-[10px] text-muted-foreground">XP Fees</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-red-400">{data?.pool.txCount || 0}</div>
                    <div className="text-[10px] text-muted-foreground">Conversions</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-emerald-400">${((data?.pool.totalWSR || 0) * 0.001).toFixed(6)}</div>
                    <div className="text-[10px] text-muted-foreground">Pool Value (USD)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ WALLETS ═══════ */}
          {activeTab === 'wallets' && (
            <div className="space-y-5">
              {/* Wallet Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={Wallet} label="MetaMask Wallets" value={data?.walletStats.connectedWallets || 0} color="#6366f1" />
                <StatCard icon={Database} label="Site Wallets" value={data?.walletStats.siteWallets || 0} color="#10b981" />
                <StatCard icon={CheckCircle} label="Verified" value={data?.walletStats.verifiedWallets || 0} color="#f59e0b" />
                <StatCard icon={Coins} label="Total Unclaimed" value={`${(data?.walletStats.totalUnclaimedWSR || 0).toFixed(2)} WSR`} color="#ef4444" />
                <StatCard icon={ArrowUpRight} label="Total Claimed" value={`${(data?.walletStats.totalClaimedWSR || 0).toFixed(2)} WSR`} color="#8b5cf6" />
                <StatCard icon={DollarSign} label="WSR Rate" value="$0.001" color="#06b6d4" />
              </div>

              {/* Wallet Users Table */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold flex items-center gap-2 px-4 py-3 border-b border-border/20">
                  <Wallet size={15} className="text-indigo-400" /> All Wallet Users ({data?.walletUsers?.length || 0})
                </h3>
                <div className="grid grid-cols-[1fr_160px_70px_80px_80px_60px_80px] gap-2 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Wallet Address</span><span>XP</span><span>Unclaimed</span><span>Claimed</span><span>Chain</span><span>Activity</span>
                </div>
                {(data?.walletUsers || []).map((w: any) => (
                  <div key={w.id} className="grid grid-cols-[1fr_160px_70px_80px_80px_60px_80px] gap-2 px-4 py-2.5 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(w.displayName || w.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold block truncate">{w.displayName || w.username || 'Unknown'}</span>
                        <span className="text-[9px] text-muted-foreground">{w.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-[10px] text-muted-foreground truncate">{w.walletAddress ? `${w.walletAddress.slice(0, 6)}...${w.walletAddress.slice(-4)}` : w.siteWalletAddress ? `Site: ${w.siteWalletAddress.slice(0, 6)}...` : '—'}</code>
                      {w.walletAddress && (
                        <a href={`https://amoy.polygonscan.com/address/${w.walletAddress}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={10} className="text-muted-foreground hover:text-indigo-400" />
                        </a>
                      )}
                    </div>
                    <span className="text-[12px] font-bold text-emerald-400">{w.xp.toLocaleString()}</span>
                    <span className="text-[12px] font-bold text-amber-400">{(w.unclaimedWSR || 0).toFixed(2)}</span>
                    <span className="text-[12px] font-bold text-purple-400">{(w.totalClaimedWSR || 0).toFixed(2)}</span>
                    <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-0 w-fit">{w.walletChain || 'Polygon'}</Badge>
                    <span className="text-[10px] text-muted-foreground">{w.lastActiveAt ? timeAgo(w.lastActiveAt) : '—'}</span>
                  </div>
                ))}
                {(!data?.walletUsers || data.walletUsers.length === 0) && (
                  <p className="text-center py-8 text-muted-foreground text-sm">No wallets connected</p>
                )}
              </div>

              {/* Pool Fee Transactions */}
              {data?.poolTxs && data.poolTxs.length > 0 && (
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Flame size={15} className="text-amber-400" /> Pool Fee Transactions ({data.poolTxs.length})
                  </h3>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {data.poolTxs.map((tx: any) => (
                      <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Flame size={14} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium">{tx.description}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-bold text-amber-400">+{Number(tx.feeWSR).toFixed(4)} WSR</p>
                          <p className="text-[9px] text-muted-foreground">{tx.feeXP} XP fee</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ TRANSACTIONS ═══════ */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-bold">All Token Transactions ({o?.totalTokenTxs || 0})</h3>
                <div className="flex gap-1">
                  {['all', 'earn', 'claim', 'stake', 'win', 'transfer', 'daily_bonus'].map((f) => (
                    <button key={f} onClick={() => setTxFilter(f)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border-0 cursor-pointer capitalize transition-all',
                        txFilter === f ? 'bg-indigo-600 text-white' : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
                      )}>{f === 'all' ? 'All' : f.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>

              {/* Transaction Stats */}
              {a?.txTypeBreakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {a.txTypeBreakdown.map((t: any) => {
                    const colorMap: Record<string, string> = {
                      earn: '#10b981', claim: '#6366f1', stake: '#f59e0b', win: '#ef4444',
                      transfer: '#8b5cf6', daily_bonus: '#06b6d4', referral: '#f97316',
                    };
                    return (
                      <div key={t.type} className="bg-card/60 border border-border/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-black" style={{ color: colorMap[t.type] || '#6b7094' }}>{t.count}</div>
                        <div className="text-[9px] text-muted-foreground capitalize">{t.type.replace('_', ' ')}</div>
                        <div className="text-[10px] font-mono mt-0.5" style={{ color: colorMap[t.type] || '#6b7094' }}>{Number(t.totalAmount).toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Transaction Table */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_80px_70px_1fr_100px] gap-2 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Type</span><span>Amount</span><span>Status</span><span>Description</span><span>Date</span>
                </div>
                {filteredTxs.map((tx: any) => {
                  const isCredit = ['earn', 'win', 'daily_bonus', 'referral'].includes(tx.type);
                  return (
                    <div key={tx.id} className="grid grid-cols-[1fr_80px_80px_70px_1fr_100px] gap-2 px-4 py-2.5 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(tx.user?.displayName || tx.user?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold truncate block">{tx.user?.displayName || tx.user?.username || 'System'}</span>
                          <span className="text-[9px] text-muted-foreground truncate block">{tx.user?.email || ''}</span>
                        </div>
                      </div>
                      <Badge className={cn('text-[8px] border-0 w-fit capitalize',
                        tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.type === 'claim' ? 'bg-blue-500/10 text-blue-400' :
                        tx.type === 'win' ? 'bg-red-500/10 text-red-400' :
                        tx.type === 'daily_bonus' ? 'bg-cyan-500/10 text-cyan-400' :
                        tx.type === 'transfer' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-500/10 text-slate-400'
                      )}>{tx.type.replace('_', ' ')}</Badge>
                      <span className={cn('text-[12px] font-bold font-mono', isCredit ? 'text-emerald-400' : 'text-blue-400')}>
                        {isCredit ? '+' : ''}{tx.amount} {['claim', 'transfer', 'withdraw'].includes(tx.type) ? 'WSR' : 'XP'}
                      </span>
                      <Badge className={cn('text-[8px] border-0 w-fit',
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      )}>{tx.status}</Badge>
                      <span className="text-[10px] text-muted-foreground truncate">{tx.description || '—'}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  );
                })}
                {filteredTxs.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground text-sm">No transactions found</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════ TIMERS ═══════ */}
          {activeTab === 'timers' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Flame} label="Active Questions" value={o?.activeQuestions || 0} color="#10b981" />
                <StatCard icon={AlertTriangle} label="Expiring (3 days)" value={o?.expiringSoon || 0} color="#ef4444" />
                <StatCard icon={CheckCircle} label="Total Questions" value={o?.totalQuestions || 0} color="#6366f1" />
                <StatCard icon={Clock} label="Avg Days Left" value={(() => {
                  const qs = (data?.recentQuestions || []).filter((q: any) => q.expiresAt && new Date(q.expiresAt) > new Date());
                  if (qs.length === 0) return '0';
                  const avg = qs.reduce((s: number, q: any) => s + Math.max(0, (new Date(q.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0) / qs.length;
                  return avg.toFixed(1);
                })()} color="#f59e0b" />
              </div>

              {/* Expired Questions */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold flex items-center gap-2 px-4 py-3 border-b border-border/20">
                  <AlertTriangle size={15} className="text-red-400" /> Expired & Expiring Soon
                </h3>
                {(data?.recentQuestions || [])
                  .filter((q: any) => q.expiresAt)
                  .sort((a: any, b: any) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
                  .map((q: any) => {
                    const expires = new Date(q.expiresAt);
                    const now = new Date();
                    const daysLeft = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const hoursLeft = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60));
                    const expired = expires < now;
                    return (
                      <div key={q.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          expired ? 'bg-red-500/10' : daysLeft <= 1 ? 'bg-amber-500/10' : daysLeft <= 3 ? 'bg-yellow-500/10' : 'bg-emerald-500/10'
                        )}>
                          <Timer size={16} className={expired ? 'text-red-400' : daysLeft <= 1 ? 'text-amber-400' : daysLeft <= 3 ? 'text-yellow-400' : 'text-emerald-400'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate">{q.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {q.user?.displayName || q.user?.username} · {q.category} · {formatNumber(q.totalVotes)} votes · {q.options?.length || 0} options
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge className={cn('text-[10px] border-0 gap-1',
                            expired ? 'bg-red-500/10 text-red-400' :
                            daysLeft <= 1 ? 'bg-amber-500/10 text-amber-400' :
                            daysLeft <= 3 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          )}>
                            <Timer size={10} />
                            {expired ? 'EXPIRED' : daysLeft <= 0 ? `${hoursLeft}h left` : `${daysLeft}d left`}
                          </Badge>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{expires.toLocaleDateString()} {expires.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  })}
                {(data?.recentQuestions || []).filter((q: any) => q.expiresAt).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground text-sm">No timed questions</p>
                )}
              </div>

              {/* Active Questions without expiry */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold flex items-center gap-2 px-4 py-3 border-b border-border/20">
                  <Globe size={15} className="text-emerald-400" /> No Expiry (Permanent)
                </h3>
                {(data?.recentQuestions || [])
                  .filter((q: any) => !q.expiresAt && q.status === 'active')
                  .map((q: any) => (
                    <div key={q.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">{q.title}</p>
                        <p className="text-[10px] text-muted-foreground">{q.category} · {formatNumber(q.totalVotes)} votes</p>
                      </div>
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-0">Permanent</Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
