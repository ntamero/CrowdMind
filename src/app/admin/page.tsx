'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, MessageSquare, BarChart3, Zap,
  TrendingUp, AlertTriangle, Activity, Globe, Eye,
  Trash2, CheckCircle, Plus, Edit3, Wallet,
  Clock, Mail, Target, Flame, ArrowUpRight,
  ArrowDownRight, Monitor, Send,
  Tag, Layers, Timer, LineChart, Search,
  RefreshCw, Ban, ExternalLink, Coins, Copy,
  ArrowRightLeft, Award, Hash,
} from 'lucide-react';
import { categories as categoryList } from '@/lib/mock-data';
import { formatNumber, timeAgo, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Pool WSR wallet address (deployer wallet)
const POOL_WALLET_ADDRESS = '0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119';

const adminTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'questions', label: 'Questions', icon: MessageSquare },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'timers', label: 'Timers', icon: Timer },
] as const;

type AdminTab = (typeof adminTabs)[number]['id'];

interface AdminData {
  overview: {
    totalUsers: number; totalQuestions: number; totalVotes: number; totalComments: number;
    totalPredictions: number; totalTokenTxs: number; totalXPAwarded: number;
    usersToday: number; usersWeek: number; questionsToday: number; votesToday: number;
    activeQuestions: number; expiringSoon: number;
  };
  recentUsers: any[];
  recentQuestions: any[];
  recentTransactions: any[];
  topEarners: any[];
  pool: { totalWSR: number; totalXPFees: number; txCount: number; updatedAt: string | null };
  walletStats: { connectedWallets: number; totalUnclaimedWSR: number; totalClaimedWSR: number };
  walletUsers: any[];
  poolTxs: any[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Categories (local state for now)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [localCategories, setLocalCategories] = useState(categoryList.map(c => ({ ...c, questionCount: 0 })));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const d = await res.json();
        setData(d);
        // Update category counts from real questions
        if (d.recentQuestions) {
          const counts: Record<string, number> = {};
          d.recentQuestions.forEach((q: any) => { counts[q.category] = (counts[q.category] || 0) + 1; });
          setLocalCategories(prev => prev.map(c => ({ ...c, questionCount: counts[c.value] || c.questionCount })));
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const o = data?.overview;

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

  const copyPoolAddress = () => {
    navigator.clipboard.writeText(POOL_WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="max-w-full mx-auto py-4">
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={20} className="animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading admin data...</span>
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
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform management & analytics — Real-time data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
            <Activity size={11} /> Live
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { icon: Users, label: 'Total Users', value: o?.totalUsers || 0, sub: `+${o?.usersToday || 0} today`, color: '#6366f1' },
                  { icon: MessageSquare, label: 'Questions', value: o?.totalQuestions || 0, sub: `+${o?.questionsToday || 0} today`, color: '#f59e0b' },
                  { icon: BarChart3, label: 'Total Votes', value: o?.totalVotes || 0, sub: `+${o?.votesToday || 0} today`, color: '#10b981' },
                  { icon: Zap, label: 'XP Awarded', value: o?.totalXPAwarded || 0, sub: `${o?.totalTokenTxs || 0} txs`, color: '#8b5cf6' },
                  { icon: Wallet, label: 'Pool WSR', value: data?.pool.totalWSR.toFixed(2) || '0', sub: `$${((data?.pool.totalWSR || 0) * 0.001).toFixed(4)}`, color: '#ef4444' },
                  { icon: Globe, label: 'Active Q', value: o?.activeQuestions || 0, sub: `${o?.expiringSoon || 0} expiring`, color: '#06b6d4' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-card/60 border border-border/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                          <Icon size={16} style={{ color: stat.color }} />
                        </div>
                      </div>
                      <div className="text-xl font-black">{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">{stat.sub}</div>
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
                    {(data?.recentQuestions || []).slice(0, 6).map((q: any) => (
                      <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold truncate">{q.title}</p>
                          <p className="text-[10px] text-muted-foreground">{q.user?.displayName || q.user?.username} · {formatNumber(q.totalVotes)} votes · {q.category}</p>
                        </div>
                        <Badge className={cn('text-[9px] border-0 capitalize ml-2', q.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>{q.status}</Badge>
                      </div>
                    ))}
                    {(!data?.recentQuestions || data.recentQuestions.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">No questions yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Users size={15} className="text-purple-400" /> Recent Users
                  </h3>
                  <div className="space-y-2">
                    {(data?.recentUsers || []).slice(0, 6).map((user: any) => (
                      <div key={user.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {(user.displayName || user.username || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold">{user.displayName || user.username || user.email}</p>
                          <p className="text-[10px] text-muted-foreground">{user.xp} XP · Lv.{user.level} · {timeAgo(user.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={cn('text-[9px] border-0', user.role === 'admin' ? 'bg-red-500/10 text-red-400' : user.walletAddress ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>
                            {user.role === 'admin' ? 'Admin' : user.walletAddress ? 'Wallet' : 'Free'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pool Wallet Quick View */}
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
                <Flame size={20} className="text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-300">Pool Wallet</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{POOL_WALLET_ADDRESS}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-amber-400">{data?.pool.totalWSR.toFixed(4) || '0'} WSR</p>
                  <p className="text-[10px] text-muted-foreground">{data?.pool.txCount || 0} conversions</p>
                </div>
                <button onClick={copyPoolAddress} className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border-0">
                  {copied ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                </button>
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
                <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[11px]">{o?.totalUsers || 0} total</Badge>
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_60px_60px_70px_80px_60px] gap-2 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>XP / Level</span><span>Votes</span><span>Qs</span><span>WSR</span><span>Wallet</span><span>Role</span>
                </div>
                {(data?.recentUsers || [])
                  .filter((u: any) => !searchQuery || (u.displayName || u.username || u.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((user: any) => (
                    <div key={user.id} className="grid grid-cols-[1fr_80px_60px_60px_70px_80px_60px] gap-2 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
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
                      <span className="text-[12px] font-mono text-emerald-400">{(user.unclaimedWSR || 0).toFixed(1)}</span>
                      <code className="text-[9px] text-muted-foreground truncate">{user.walletAddress ? `${user.walletAddress.slice(0, 6)}...` : '—'}</code>
                      <Badge className={cn('text-[8px] border-0 w-fit', user.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400')}>{user.role}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════ QUESTIONS ═══════ */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">All Questions ({o?.totalQuestions || 0})</h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[11px]">{o?.activeQuestions || 0} active</Badge>
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                {(data?.recentQuestions || []).map((q: any) => (
                  <div key={q.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                    {q.imageUrl && <img src={q.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{q.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {q.user?.displayName || q.user?.username} · {q.category} · {formatNumber(q.totalVotes)} votes · {q.options?.length || 0} options
                      </p>
                    </div>
                    <Badge className={cn('text-[9px] border-0 capitalize', q.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>{q.status}</Badge>
                    {q.expiresAt && (
                      <span className="text-[10px] text-muted-foreground">{timeAgo(q.expiresAt)}</span>
                    )}
                  </div>
                ))}
                {(!data?.recentQuestions || data.recentQuestions.length === 0) && (
                  <p className="text-center py-8 text-muted-foreground text-sm">No questions yet</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════ CATEGORIES ═══════ */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Plus size={15} className="text-indigo-400" /> Add New Category</h3>
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
                    <span className="text-[12px] font-medium">{cat.questionCount}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[10px] text-muted-foreground">{cat.color}</span>
                    </div>
                    <button className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer border-0" onClick={() => setLocalCategories(prev => prev.filter(c => c.value !== cat.value))}>
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ EARNINGS ═══════ */}
          {activeTab === 'earnings' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total XP Awarded', value: `${formatNumber(o?.totalXPAwarded || 0)} XP`, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Pool WSR Fees', value: `${data?.pool.totalWSR.toFixed(4) || '0'} WSR`, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Total Conversions', value: data?.pool.txCount || 0, icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'XP Fees Collected', value: `${data?.pool.totalXPFees || 0} XP`, icon: Coins, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Top Earners */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold flex items-center gap-2 px-4 py-3 border-b border-border/20">
                  <Award size={15} className="text-amber-400" /> Top Earners
                </h3>
                <div className="grid grid-cols-[1fr_80px_60px_60px_80px_70px] gap-2 px-4 py-2 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>XP</span><span>Votes</span><span>Qs</span><span>WSR Earned</span><span>Streak</span>
                </div>
                {(data?.topEarners || []).map((e: any, i: number) => (
                  <div key={e.id} className="grid grid-cols-[1fr_80px_60px_60px_80px_70px] gap-2 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] font-black text-muted-foreground w-5">#{i + 1}</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(e.displayName || e.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[12px] font-semibold truncate">{e.displayName || e.username || 'Unknown'}</span>
                    </div>
                    <span className="text-[12px] font-bold text-amber-400">{e.xp.toLocaleString()}</span>
                    <span className="text-[12px]">{e.totalVotes}</span>
                    <span className="text-[12px]">{e.totalQuestions}</span>
                    <span className="text-[12px] font-mono text-emerald-400">{((e.unclaimedWSR || 0) + (e.totalClaimedWSR || 0)).toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <Flame size={11} className="text-orange-400" />
                      <span className="text-[12px]">{e.streak || 0}d</span>
                    </div>
                  </div>
                ))}
                {(!data?.topEarners || data.topEarners.length === 0) && (
                  <p className="text-center py-6 text-muted-foreground text-sm">No earners yet</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════ WALLETS ═══════ */}
          {activeTab === 'wallets' && (
            <div className="space-y-5">
              {/* Pool Wallet Card */}
              <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/20 to-red-900/10 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Flame size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-300">Pool Wallet (Fee Collection)</p>
                      <p className="text-[11px] text-muted-foreground">10 XP fee per conversion = 0.04 WSR to pool</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={fetchData}>
                    <RefreshCw size={12} /> Refresh
                  </Button>
                </div>

                {/* Pool wallet address */}
                <div className="bg-black/30 rounded-xl p-3 mb-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">WSR Wallet Address</p>
                    <p className="text-sm font-mono text-amber-300 break-all select-all">{POOL_WALLET_ADDRESS}</p>
                  </div>
                  <button onClick={copyPoolAddress} className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border-0 shrink-0">
                    {copied ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/address/${POOL_WALLET_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer no-underline shrink-0"
                  >
                    <ExternalLink size={12} /> Explorer
                  </a>
                </div>

                {/* Withdraw Pool WSR to MetaMask */}
                <div className="bg-black/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-300">Withdraw Pool WSR</p>
                    <p className="text-[10px] text-muted-foreground">Send accumulated fee WSR to your MetaMask wallet</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[11px] font-bold gap-1.5 h-9"
                    onClick={async () => {
                      const amount = prompt('Enter WSR amount to withdraw to your MetaMask:');
                      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
                      try {
                        const res = await fetch('/api/admin/pool', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: Number(amount) }),
                        });
                        const d = await res.json();
                        if (res.ok) {
                          alert(`Success! ${d.amount} WSR sent to your wallet.\nTX: ${d.txHash}`);
                          fetchData();
                        } else {
                          alert(`Error: ${d.error}`);
                        }
                      } catch (e: any) {
                        alert('Failed: ' + e.message);
                      }
                    }}
                  >
                    <ArrowUpRight size={13} /> Withdraw to MetaMask
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-400">{data?.pool.totalWSR.toFixed(4) || '0'}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">WSR in Pool (DB)</div>
                    <div className="text-[10px] text-muted-foreground/60">${((data?.pool.totalWSR || 0) * 0.001).toFixed(6)}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-orange-400">{data?.pool.totalXPFees || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">XP Fees Collected</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-red-400">{data?.pool.txCount || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Conversions</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-emerald-400">{(data?.walletStats.totalUnclaimedWSR || 0).toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total Unclaimed</div>
                  </div>
                </div>
              </div>

              {/* Wallet Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Users', value: o?.totalUsers || 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Connected Wallets', value: data?.walletStats.connectedWallets || 0, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Total Claimed WSR', value: `${(data?.walletStats.totalClaimedWSR || 0).toFixed(2)}`, icon: ArrowUpRight, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'WSR Rate', value: '$0.001', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Connected Wallets Table */}
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold flex items-center gap-2 px-4 py-3 border-b border-border/20">
                  <Wallet size={15} className="text-indigo-400" /> Connected Wallets
                </h3>
                <div className="grid grid-cols-[1fr_160px_80px_90px_80px_70px] gap-3 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Address</span><span>XP</span><span>Unclaimed WSR</span><span>Claimed WSR</span><span>Chain</span>
                </div>
                {(data?.walletUsers || []).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-sm">No wallets connected yet</div>
                )}
                {(data?.walletUsers || []).map((w: any) => (
                  <div key={w.id} className="grid grid-cols-[1fr_160px_80px_90px_80px_70px] gap-3 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(w.displayName || w.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[12px] font-semibold">{w.displayName || w.username || 'Unknown'}</span>
                    </div>
                    <code className="text-[11px] text-muted-foreground truncate">{w.walletAddress ? `${w.walletAddress.slice(0, 6)}...${w.walletAddress.slice(-4)}` : '—'}</code>
                    <span className="text-[12px] font-bold text-emerald-400">{w.xp.toLocaleString()}</span>
                    <span className="text-[12px] font-bold text-amber-400">{(w.unclaimedWSR || 0).toFixed(2)}</span>
                    <span className="text-[12px] font-bold text-purple-400">{(w.totalClaimedWSR || 0).toFixed(2)}</span>
                    <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-0 w-fit">{w.walletChain || 'Polygon'}</Badge>
                  </div>
                ))}
              </div>

              {/* Recent Pool Transactions */}
              {data?.poolTxs && data.poolTxs.length > 0 && (
                <div className="bg-card/60 border border-border/30 rounded-xl p-5">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Activity size={15} className="text-amber-400" /> Recent Fee Transactions
                  </h3>
                  <div className="space-y-1.5">
                    {data.poolTxs.map((tx: any) => (
                      <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Flame size={14} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-amber-400">+{tx.feeWSR.toFixed(4)} WSR</p>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">All Token Transactions ({o?.totalTokenTxs || 0})</h3>
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_70px_80px_1fr_80px] gap-2 px-4 py-2.5 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>User</span><span>Type</span><span>Amount</span><span>Status</span><span>Description</span><span>Date</span>
                </div>
                {(data?.recentTransactions || []).map((tx: any) => {
                  const isCredit = ['earn', 'win', 'daily_bonus', 'referral'].includes(tx.type);
                  return (
                    <div key={tx.id} className="grid grid-cols-[1fr_80px_70px_80px_1fr_80px] gap-2 px-4 py-3 border-b border-border/10 items-center hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(tx.user?.displayName || tx.user?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold truncate">{tx.user?.displayName || tx.user?.username || 'System'}</span>
                      </div>
                      <Badge className={cn('text-[8px] border-0 w-fit capitalize',
                        tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.type === 'claim' ? 'bg-blue-500/10 text-blue-400' :
                        tx.type === 'transfer' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-500/10 text-slate-400'
                      )}>{tx.type}</Badge>
                      <span className={cn('text-[12px] font-bold font-mono', isCredit ? 'text-emerald-400' : 'text-blue-400')}>
                        {isCredit ? '+' : ''}{tx.amount} {tx.type === 'claim' || tx.type === 'transfer' ? 'WSR' : 'XP'}
                      </span>
                      <Badge className={cn('text-[8px] border-0 w-fit',
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      )}>{tx.status}</Badge>
                      <span className="text-[10px] text-muted-foreground truncate">{tx.description || '—'}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  );
                })}
                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                  <p className="text-center py-8 text-muted-foreground text-sm">No transactions yet</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════ TIMERS ═══════ */}
          {activeTab === 'timers' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Timer size={18} className="text-amber-400" /> Question Expiry Tracking</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Questions', value: o?.activeQuestions || 0, icon: Flame, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Expiring in 3 Days', value: o?.expiringSoon || 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Total Questions', value: o?.totalQuestions || 0, icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', s.bg)}><s.icon size={18} className={s.color} /></div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
                {(data?.recentQuestions || []).filter((q: any) => q.expiresAt).map((q: any) => {
                  const expires = new Date(q.expiresAt);
                  const now = new Date();
                  const daysLeft = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                  const expired = expires < now;
                  return (
                    <div key={q.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/10 hover:bg-secondary/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">{q.title}</p>
                        <p className="text-[10px] text-muted-foreground">{q.category} · {formatNumber(q.totalVotes)} votes</p>
                      </div>
                      <Badge className={cn('text-[10px] border-0 gap-1',
                        expired ? 'bg-red-500/10 text-red-400' :
                        daysLeft <= 3 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      )}>
                        <Timer size={10} /> {expired ? 'Expired' : `${daysLeft}d left`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
