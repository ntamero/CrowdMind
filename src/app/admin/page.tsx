'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Settings, Users, MessageSquare, BarChart3, Zap,
  TrendingUp, TrendingDown, AlertTriangle, Activity, Globe, Eye,
  Trash2, CheckCircle, Plus, Edit3, DollarSign, Wallet,
  Clock, Mail, Target, Crown, Flame, ArrowUpRight,
  ArrowDownRight, PieChart, Monitor, CreditCard, Send,
  Tag, Layers, Timer, LineChart, Search, MoreHorizontal,
  XCircle, ChevronRight, RefreshCw, Bell, Ban, ExternalLink,
} from 'lucide-react';
import { mockStats, mockQuestions, mockUsers, categories as categoryList } from '@/lib/mock-data';
import { formatNumber, timeAgo, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ── Admin Tabs ──
const adminTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'questions', label: 'Questions', icon: MessageSquare },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'visitors', label: 'Visitors', icon: Monitor },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'options', label: 'Options', icon: Target },
  { id: 'trading', label: 'Trading', icon: LineChart },
  { id: 'timers', label: 'Timers', icon: Timer },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'ads', label: 'Ads', icon: Layers },
] as const;

type AdminTab = (typeof adminTabs)[number]['id'];

// ── Mock Admin Data ──
const revenueData = {
  today: 1245.80,
  thisWeek: 8920.50,
  thisMonth: 42680.00,
  allTime: 384520.00,
  subscriptions: 28400.00,
  ads: 9800.00,
  commissions: 4480.00,
  daily: [
    { date: 'Mar 15', amount: 1245 },
    { date: 'Mar 14', amount: 1120 },
    { date: 'Mar 13', amount: 1580 },
    { date: 'Mar 12', amount: 980 },
    { date: 'Mar 11', amount: 1340 },
    { date: 'Mar 10', amount: 1890 },
    { date: 'Mar 09', amount: 1650 },
  ],
};

const visitorData = {
  today: 12450,
  thisWeek: 84200,
  thisMonth: 342800,
  uniqueToday: 8900,
  pageViews: 45600,
  bounceRate: 32.5,
  avgSession: '4m 22s',
  topPages: [
    { page: '/', views: 15200, name: 'Homepage' },
    { page: '/predictions', views: 8900, name: 'Predictions' },
    { page: '/questions', views: 6700, name: 'Questions' },
    { page: '/leaderboard', views: 4200, name: 'Leaderboard' },
    { page: '/pricing', views: 3100, name: 'Pricing' },
  ],
  countries: [
    { name: 'United States', visitors: 45200, flag: '🇺🇸' },
    { name: 'Turkey', visitors: 28400, flag: '🇹🇷' },
    { name: 'United Kingdom', visitors: 18900, flag: '🇬🇧' },
    { name: 'Germany', visitors: 15600, flag: '🇩🇪' },
    { name: 'Japan', visitors: 12300, flag: '🇯🇵' },
  ],
};

const memberEarnings = [
  { user: 'Emily Davis', earned: 4820.50, questions: 112, accuracy: 82.1, status: 'active', plan: 'Premium' },
  { user: 'Alex Chen', earned: 3420.80, questions: 89, accuracy: 78.5, status: 'active', plan: 'Pro' },
  { user: 'Sara Kim', earned: 2890.30, questions: 45, accuracy: 72.3, status: 'active', plan: 'Pro' },
  { user: 'Mike Johnson', earned: 1560.20, questions: 23, accuracy: 65.8, status: 'active', plan: 'Free' },
  { user: 'James Wilson', earned: 780.10, questions: 12, accuracy: 58.2, status: 'suspended', plan: 'Free' },
];

const walletEntries = [
  { user: 'Emily Davis', address: '0x7a3B...f92E', balance: 2847.50, pending: 125.30, chain: 'Base', status: 'connected' },
  { user: 'Alex Chen', address: '0x4cD2...a81B', balance: 1247.50, pending: 89.25, chain: 'Base', status: 'connected' },
  { user: 'Sara Kim', address: '0x9fE1...c34D', balance: 890.30, pending: 45.00, chain: 'Base', status: 'connected' },
  { user: 'Mike Johnson', address: '', balance: 560.20, pending: 32.10, chain: '', status: 'internal' },
  { user: 'James Wilson', address: '', balance: 180.10, pending: 0, chain: '', status: 'internal' },
];

const tradingActivity = [
  { id: 'tr1', user: 'Alex Chen', market: 'Bitcoin Above $150K', action: 'BUY YES', amount: 50, odds: 1.8, time: '2m ago', status: 'filled' },
  { id: 'tr2', user: 'Emily Davis', market: 'GPT-5 Before July', action: 'BUY YES', amount: 100, odds: 1.4, time: '5m ago', status: 'filled' },
  { id: 'tr3', user: 'Sara Kim', market: 'Apple AR Glasses', action: 'BUY NO', amount: 30, odds: 2.1, time: '8m ago', status: 'filled' },
  { id: 'tr4', user: 'Mike Johnson', market: 'Champions League', action: 'BUY YES', amount: 25, odds: 2.8, time: '12m ago', status: 'pending' },
  { id: 'tr5', user: 'James Wilson', market: 'AI Regulation', action: 'BUY NO', amount: 15, odds: 2.2, time: '15m ago', status: 'filled' },
];

const adCampaigns = [
  { id: 'ad1', name: 'Pro Plan Promotion', status: 'active', impressions: 124500, clicks: 3200, ctr: 2.57, revenue: 1280, startDate: '2026-03-01', endDate: '2026-03-31' },
  { id: 'ad2', name: 'Crypto Markets Banner', status: 'active', impressions: 89000, clicks: 2100, ctr: 2.36, revenue: 890, startDate: '2026-03-05', endDate: '2026-04-05' },
  { id: 'ad3', name: 'Prediction Challenge', status: 'paused', impressions: 56000, clicks: 1400, ctr: 2.50, revenue: 560, startDate: '2026-02-15', endDate: '2026-03-15' },
  { id: 'ad4', name: 'Referral Campaign', status: 'draft', impressions: 0, clicks: 0, ctr: 0, revenue: 0, startDate: '2026-03-20', endDate: '2026-04-20' },
];

const mailTemplates = [
  { id: 'm1', name: 'Welcome Email', type: 'onboarding', lastSent: '2026-03-15', recipients: 1240, openRate: 68.5, status: 'active' },
  { id: 'm2', name: 'Weekly Digest', type: 'newsletter', lastSent: '2026-03-14', recipients: 45200, openRate: 42.3, status: 'active' },
  { id: 'm3', name: 'Prediction Results', type: 'notification', lastSent: '2026-03-13', recipients: 8900, openRate: 78.2, status: 'active' },
  { id: 'm4', name: 'Earnings Report', type: 'report', lastSent: '2026-03-10', recipients: 12400, openRate: 55.8, status: 'active' },
  { id: 'm5', name: 'Premium Upgrade', type: 'marketing', lastSent: '2026-03-08', recipients: 32000, openRate: 35.1, status: 'paused' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [localCategories, setLocalCategories] = useState(categoryList.map(c => ({ ...c, questionCount: Math.floor(Math.random() * 5000) + 500 })));

  const dashboardStats = [
    { icon: Users, label: 'Total Users', value: formatNumber(mockStats.totalUsers), change: '+12.5%', color: '#6366f1', positive: true },
    { icon: MessageSquare, label: 'Questions', value: formatNumber(mockStats.totalQuestions), change: '+8.3%', color: '#f59e0b', positive: true },
    { icon: BarChart3, label: 'Total Votes', value: formatNumber(mockStats.totalVotes), change: '+23.1%', color: '#10b981', positive: true },
    { icon: Zap, label: 'Predictions', value: formatNumber(mockStats.totalPredictions), change: '+5.7%', color: '#8b5cf6', positive: true },
    { icon: DollarSign, label: 'Revenue', value: `$${formatNumber(revenueData.thisMonth)}`, change: '+18.2%', color: '#ef4444', positive: true },
    { icon: Globe, label: 'Active Now', value: formatNumber(mockStats.activeNow), change: '+3.1%', color: '#06b6d4', positive: true },
  ];

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    setLocalCategories([...localCategories, {
      value: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      label: newCategoryName,
      icon: newCategoryEmoji || '📌',
      color: '#6366f1',
      questionCount: 0,
    }]);
    setNewCategoryName('');
    setNewCategoryEmoji('');
  };

  const removeCategory = (value: string) => {
    setLocalCategories(localCategories.filter(c => c.value !== value));
  };

  return (
    <div className="max-w-full mx-auto py-4">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-black">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform management & analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
            <Activity size={11} /> System Online
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* ── Tab Navigation (scrollable) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 overflow-x-auto"
      >
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
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {dashboardStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-card/60 border border-border/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                          <Icon size={16} style={{ color: stat.color }} />
                        </div>
                        <span className={cn('text-[10px] font-bold flex items-center gap-0.5', stat.positive ? 'text-emerald-400' : 'text-red-400')}>
                          {stat.positive ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-xl font-black">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Questions */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <MessageSquare size={15} className="text-indigo-400" /> Recent Questions
                  </h3>
                  <div className="space-y-2">
                    {mockQuestions.slice(0, 5).map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold truncate">{q.title}</p>
                          <p className="text-[10px] text-muted-foreground">{q.user.displayName} · {formatNumber(q.totalVotes)} votes · {timeAgo(q.createdAt)}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-colors cursor-pointer border-0">
                            <CheckCircle size={12} className="text-emerald-500" />
                          </button>
                          <button className="w-7 h-7 rounded-md bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer border-0">
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Users size={15} className="text-purple-400" /> Recent Users
                  </h3>
                  <div className="space-y-2">
                    {mockUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {user.displayName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold">{user.displayName}</p>
                          <p className="text-[10px] text-muted-foreground">@{user.username} · Rep: {formatNumber(user.reputation)}</p>
                        </div>
                        <Badge className={cn('text-[9px] border-0', user.isPremium ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400')}>
                          {user.isPremium ? 'Premium' : 'Free'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flagged */}
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-red-400" /> Flagged Content
                </h3>
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500" />
                  <p>No flagged content. All clear!</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ USERS ═══════ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-9 h-9 bg-secondary/30 border-border/40 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-[12px] h-9">
                  <Plus size={13} /> Add User
                </Button>
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_100px_100px_80px_60px] gap-3 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Plan</span><span>Questions</span><span>Reputation</span><span>Status</span><span></span>
                </div>
                {mockUsers.filter(u => !searchQuery || u.displayName.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <div key={user.id} className="grid grid-cols-[1fr_120px_100px_100px_80px_60px] gap-3 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{user.displayName.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold truncate">{user.displayName}</p>
                        <p className="text-[10px] text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <Badge className={cn('text-[9px] border-0 w-fit', user.isPremium ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400')}>
                      <Crown size={9} className="mr-0.5" /> {user.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                    <span className="text-[12px]">{user.totalQuestions}</span>
                    <span className="text-[12px] font-semibold">{formatNumber(user.reputation)}</span>
                    <Badge className="text-[9px] bg-emerald-500/10 text-emerald-400 border-0 w-fit">Active</Badge>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer border-0"><Eye size={11} className="text-muted-foreground" /></button>
                      <button className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer border-0"><Ban size={11} className="text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ QUESTIONS ═══════ */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">All Questions ({mockQuestions.length})</h3>
                <div className="relative max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search questions..." className="pl-9 h-9 bg-secondary/30 border-border/40 text-sm" />
                </div>
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                {mockQuestions.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                    {q.image && <img src={q.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{q.title}</p>
                      <p className="text-[10px] text-muted-foreground">{q.user.displayName} · {q.category} · {formatNumber(q.totalVotes)} votes</p>
                    </div>
                    <Badge className={cn('text-[9px] border-0 capitalize', q.status === 'trending' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400')}>{q.status}</Badge>
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded-md bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer border-0"><Eye size={12} className="text-muted-foreground" /></button>
                      <button className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-colors cursor-pointer border-0"><CheckCircle size={12} className="text-emerald-500" /></button>
                      <button className="w-7 h-7 rounded-md bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer border-0"><Trash2 size={12} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ CATEGORIES ═══════ */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Plus size={15} className="text-indigo-400" /> Add New Category
                </h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category Name</label>
                    <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Crypto" className="h-10 bg-secondary/30 border-border/40" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Emoji</label>
                    <Input value={newCategoryEmoji} onChange={(e) => setNewCategoryEmoji(e.target.value)} placeholder="📌" className="h-10 bg-secondary/30 border-border/40 text-center" />
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-10" onClick={addCategory}>
                    <Plus size={14} /> Add
                  </Button>
                </div>
              </div>

              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_80px_80px_60px] gap-3 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Icon</span><span>Name</span><span>Questions</span><span>Color</span><span></span>
                </div>
                {localCategories.map((cat) => (
                  <div key={cat.value} className="grid grid-cols-[40px_1fr_80px_80px_60px] gap-3 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold capitalize">{cat.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cat.value}</p>
                    </div>
                    <span className="text-[12px] font-medium">{formatNumber(cat.questionCount)}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[10px] text-muted-foreground">{cat.color}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer border-0"><Edit3 size={11} className="text-muted-foreground" /></button>
                      <button className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer border-0" onClick={() => removeCategory(cat.value)}><Trash2 size={11} className="text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ REVENUE ═══════ */}
          {activeTab === 'revenue' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Today', value: `$${revenueData.today.toLocaleString()}`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'This Week', value: `$${revenueData.thisWeek.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'This Month', value: `$${formatNumber(revenueData.thisMonth)}`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'All Time', value: `$${formatNumber(revenueData.allTime)}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><PieChart size={15} className="text-indigo-400" /> Revenue Sources</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Subscriptions', value: revenueData.subscriptions, color: '#6366f1', pct: 67 },
                      { label: 'Advertisements', value: revenueData.ads, color: '#f59e0b', pct: 23 },
                      { label: 'Commissions', value: revenueData.commissions, color: '#10b981', pct: 10 },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}</span>
                          <span className="font-bold">${s.value.toLocaleString()} ({s.pct}%)</span>
                        </div>
                        <div className="h-2 bg-secondary/40 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><BarChart3 size={15} className="text-emerald-400" /> Daily Revenue</h3>
                  <div className="space-y-2">
                    {revenueData.daily.map((d) => {
                      const max = Math.max(...revenueData.daily.map(x => x.amount));
                      return (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground w-12 shrink-0">{d.date}</span>
                          <div className="flex-1 h-5 bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.amount / max) * 100}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                          </div>
                          <span className="text-[12px] font-bold w-14 text-right">${d.amount}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ VISITORS ═══════ */}
          {activeTab === 'visitors' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Today', value: formatNumber(visitorData.today), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Unique Today', value: formatNumber(visitorData.uniqueToday), icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Page Views', value: formatNumber(visitorData.pageViews), icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Bounce Rate', value: `${visitorData.bounceRate}%`, icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Monitor size={15} className="text-indigo-400" /> Top Pages</h3>
                  <div className="space-y-2">
                    {visitorData.topPages.map((p, i) => (
                      <div key={p.page} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20">
                        <span className="text-[13px] font-black text-muted-foreground w-5 text-center">#{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.page}</p>
                        </div>
                        <span className="text-[12px] font-bold">{formatNumber(p.views)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Globe size={15} className="text-cyan-400" /> Top Countries</h3>
                  <div className="space-y-2">
                    {visitorData.countries.map((c) => {
                      const max = visitorData.countries[0].visitors;
                      return (
                        <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20">
                          <span className="text-xl">{c.flag}</span>
                          <div className="flex-1">
                            <p className="text-[12px] font-semibold">{c.name}</p>
                            <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden mt-1">
                              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(c.visitors / max) * 100}%` }} />
                            </div>
                          </div>
                          <span className="text-[12px] font-bold">{formatNumber(c.visitors)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ EARNINGS (Member) ═══════ */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Member Earnings Tracking</h3>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_100px_80px_80px_80px_60px] gap-3 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Plan</span><span>Earned</span><span>Questions</span><span>Accuracy</span><span>Status</span>
                </div>
                {memberEarnings.map((m) => (
                  <div key={m.user} className="grid grid-cols-[1fr_100px_80px_80px_80px_60px] gap-3 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{m.user.charAt(0)}</div>
                      <span className="text-[12px] font-semibold">{m.user}</span>
                    </div>
                    <Badge className={cn('text-[9px] border-0 w-fit', m.plan === 'Premium' ? 'bg-amber-500/10 text-amber-400' : m.plan === 'Pro' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-400')}>{m.plan}</Badge>
                    <span className="text-[12px] font-bold text-emerald-400">${m.earned.toLocaleString()}</span>
                    <span className="text-[12px]">{m.questions}</span>
                    <span className="text-[12px] font-semibold">{m.accuracy}%</span>
                    <Badge className={cn('text-[9px] border-0', m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ WALLETS ═══════ */}
          {activeTab === 'wallets' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Wallets', value: '5', icon: Wallet, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Connected (Web3)', value: '3', icon: ExternalLink, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Total Balance', value: '$5,725.60', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_140px_100px_80px_80px_80px] gap-3 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Address</span><span>Balance</span><span>Pending</span><span>Chain</span><span>Status</span>
                </div>
                {walletEntries.map((w) => (
                  <div key={w.user} className="grid grid-cols-[1fr_140px_100px_80px_80px_80px] gap-3 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{w.user.charAt(0)}</div>
                      <span className="text-[12px] font-semibold">{w.user}</span>
                    </div>
                    <code className="text-[11px] text-muted-foreground">{w.address || '—'}</code>
                    <span className="text-[12px] font-bold">${w.balance.toLocaleString()}</span>
                    <span className="text-[12px] text-amber-400">${w.pending}</span>
                    <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-0 w-fit">{w.chain || 'Internal'}</Badge>
                    <Badge className={cn('text-[9px] border-0 w-fit', w.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>{w.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ OPTIONS ═══════ */}
          {activeTab === 'options' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Active Markets', value: '48', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Total Options', value: '186', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Total Volume', value: '$2.4M', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Resolved', value: '124', icon: CheckCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Target size={15} className="text-indigo-400" /> Active Option Markets</h3>
                <div className="space-y-2">
                  {mockQuestions.slice(0, 5).map((q) => (
                    <div key={q.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                      {q.image && <img src={q.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">{q.title}</p>
                        <p className="text-[10px] text-muted-foreground">{q.options.length} options · {formatNumber(q.totalVotes)} votes</p>
                      </div>
                      <div className="flex gap-2">
                        {q.options.slice(0, 2).map((opt) => (
                          <Badge key={opt.id} className="text-[9px] border-0 bg-secondary/50">{opt.text}: {opt.percentage}%</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TRADING ═══════ */}
          {activeTab === 'trading' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Trades Today', value: '1,240', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Volume Today', value: '$45.2K', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Active Traders', value: '892', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Avg Trade', value: '$36.50', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><LineChart size={15} className="text-indigo-400" /> Live Trading Activity</h3>
                <div className="space-y-1.5">
                  {tradingActivity.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/20 transition-colors">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', t.action.includes('YES') ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                        {t.action.includes('YES') ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium"><span className="font-bold">{t.user}</span> · {t.market}</p>
                        <p className="text-[10px] text-muted-foreground">{t.time}</p>
                      </div>
                      <Badge className={cn('text-[9px] border-0', t.action.includes('YES') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{t.action}</Badge>
                      <span className="text-[12px] font-bold">${t.amount}</span>
                      <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-0">{t.odds}x</Badge>
                      <Badge className={cn('text-[9px] border-0', t.status === 'filled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{t.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TIMERS ═══════ */}
          {activeTab === 'timers' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Timer size={18} className="text-amber-400" /> Question Duration Tracking</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Active Questions', value: '48', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Ending Today', value: '5', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Ended This Week', value: '23', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                {mockQuestions.map((q) => {
                  const expires = q.expiresAt ? new Date(q.expiresAt) : null;
                  const now = new Date();
                  const daysLeft = expires ? Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;
                  return (
                    <div key={q.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">{q.title}</p>
                        <p className="text-[10px] text-muted-foreground">{q.category} · {formatNumber(q.totalVotes)} votes</p>
                      </div>
                      <div className="text-right">
                        {daysLeft !== null ? (
                          <Badge className={cn('text-[10px] border-0 gap-1', daysLeft <= 3 ? 'bg-red-500/10 text-red-400' : daysLeft <= 7 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')}>
                            <Timer size={10} /> {daysLeft}d left
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-0">No expiry</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1 px-2"><Edit3 size={11} /> Edit</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════ MAIL ═══════ */}
          {activeTab === 'mail' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2"><Mail size={18} className="text-indigo-400" /> Email System</h3>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-[12px]"><Plus size={13} /> New Template</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Sent', value: '124.5K', icon: Send, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Avg Open Rate', value: '55.8%', icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Templates', value: '5', icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Subscribers', value: '45.2K', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_80px_80px_80px_60px] gap-3 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Template</span><span>Type</span><span>Recipients</span><span>Open Rate</span><span>Last Sent</span><span></span>
                </div>
                {mailTemplates.map((m) => (
                  <div key={m.id} className="grid grid-cols-[1fr_80px_80px_80px_80px_60px] gap-3 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div>
                      <p className="text-[12px] font-semibold">{m.name}</p>
                    </div>
                    <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-0 w-fit capitalize">{m.type}</Badge>
                    <span className="text-[12px]">{formatNumber(m.recipients)}</span>
                    <span className="text-[12px] font-bold text-emerald-400">{m.openRate}%</span>
                    <span className="text-[10px] text-muted-foreground">{m.lastSent}</span>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center hover:bg-indigo-500/20 transition-colors cursor-pointer border-0"><Send size={10} className="text-indigo-400" /></button>
                      <button className="w-6 h-6 rounded bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer border-0"><Edit3 size={10} className="text-muted-foreground" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ ADS ═══════ */}
          {activeTab === 'ads' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2"><Layers size={18} className="text-amber-400" /> Ad Management</h3>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-[12px]"><Plus size={13} /> New Campaign</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Revenue', value: '$2,730', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Impressions', value: '269.5K', icon: Eye, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Clicks', value: '6,700', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Avg CTR', value: '2.49%', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                {adCampaigns.map((ad) => (
                  <div key={ad.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold">{ad.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ad.startDate} → {ad.endDate}</p>
                    </div>
                    <Badge className={cn('text-[9px] border-0 capitalize', ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : ad.status === 'paused' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400')}>{ad.status}</Badge>
                    <div className="text-right">
                      <p className="text-[11px]"><span className="text-muted-foreground">Imp:</span> <span className="font-bold">{formatNumber(ad.impressions)}</span></p>
                      <p className="text-[11px]"><span className="text-muted-foreground">CTR:</span> <span className="font-bold text-indigo-400">{ad.ctr}%</span></p>
                    </div>
                    <span className="text-[13px] font-bold text-emerald-400">${ad.revenue}</span>
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded-md bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer border-0"><Edit3 size={12} className="text-muted-foreground" /></button>
                      <button className="w-7 h-7 rounded-md bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer border-0"><Trash2 size={12} className="text-red-400" /></button>
                    </div>
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
