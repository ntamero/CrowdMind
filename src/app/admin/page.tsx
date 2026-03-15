'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Users,
  MessageSquare,
  BarChart3,
  Zap,
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  Globe,
  Eye,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { mockStats, mockQuestions, mockUsers } from '@/lib/mock-data';
import { formatNumber, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const dashboardStats = [
    { icon: Users, label: 'Total Users', value: formatNumber(mockStats.totalUsers), change: '+12.5%', color: '#6366f1', positive: true },
    { icon: MessageSquare, label: 'Questions', value: formatNumber(mockStats.totalQuestions), change: '+8.3%', color: '#f59e0b', positive: true },
    { icon: BarChart3, label: 'Total Votes', value: formatNumber(mockStats.totalVotes), change: '+23.1%', color: '#10b981', positive: true },
    { icon: Zap, label: 'Predictions', value: formatNumber(mockStats.totalPredictions), change: '+5.7%', color: '#8b5cf6', positive: true },
    { icon: Globe, label: 'Active Now', value: formatNumber(mockStats.activeNow), change: '-2.1%', color: '#06b6d4', positive: false },
    { icon: Activity, label: 'Today', value: mockStats.questionsToday.toString(), change: '+15.4%', color: '#ef4444', positive: true },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const },
    }),
  };

  return (
    <div className="mx-auto max-w-[1100px] py-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-7 flex items-center justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2.5 text-[28px] font-extrabold text-foreground">
            <Shield size={28} className="text-primary" /> Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform analytics and management
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Settings size={18} /> Settings
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {dashboardStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-border/30 bg-card/50 p-[18px]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[10px]"
                  style={{ background: `${stat.color}18` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    stat.positive ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  <TrendingUp size={12} /> {stat.change}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Recent Questions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-xl border border-border/30 bg-card/50 p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
            <MessageSquare size={18} className="text-primary" /> Recent Questions
          </h3>
          <div className="flex flex-col gap-2.5">
            {mockQuestions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-[10px] border border-border bg-card px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {q.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {q.user.displayName} · {formatNumber(q.totalVotes)} votes · {timeAgo(q.createdAt)}
                  </div>
                </div>
                <div className="ml-2 flex gap-1.5">
                  <button className="flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-emerald-500/10 transition-colors hover:bg-emerald-500/20">
                    <CheckCircle size={14} className="text-emerald-500" />
                  </button>
                  <button className="flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-red-500/10 transition-colors hover:bg-red-500/20">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="rounded-xl border border-border/30 bg-card/50 p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
            <Users size={18} className="text-accent-foreground" /> Users
          </h3>
          <div className="flex flex-col gap-2.5">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-[10px] border border-border bg-card px-3.5 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-white">
                  {user.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{user.displayName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    @{user.username} · Rep: {formatNumber(user.reputation)}
                  </div>
                </div>
                <Badge
                  variant={user.isPremium ? 'default' : 'secondary'}
                  className={
                    user.isPremium
                      ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 text-[10px]'
                      : 'bg-slate-500/15 text-slate-500 hover:bg-slate-500/25 text-[10px]'
                  }
                >
                  {user.isPremium ? 'Premium' : 'Free'}
                </Badge>
                <button className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-border bg-secondary transition-colors hover:bg-secondary/80">
                  <Eye size={14} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Flagged Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-5 rounded-xl border border-border/30 bg-card/50 p-6"
      >
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <AlertTriangle size={18} className="text-red-500" /> Flagged Content
        </h3>
        <div className="py-10 text-center text-sm text-muted-foreground">
          <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
          <p>No flagged content. All clear!</p>
        </div>
      </motion.div>
    </div>
  );
}
