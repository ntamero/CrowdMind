'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User, Trophy, BarChart3, MessageSquare, Zap, Target,
  Flame, Calendar, Star, Award, Edit3, Settings, Crown,
  TrendingUp, Coins, Wallet, RefreshCw,
} from 'lucide-react';
import { formatNumber, getBadgeColor, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/supabase/auth-context';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

// Static achievements definitions
const achievementDefs = [
  { id: 'first_vote', icon: '🗳️', title: 'First Vote', description: 'Cast your first vote', check: (u: any) => (u.totalVotes || 0) >= 1 },
  { id: 'first_question', icon: '❓', title: 'Question Asker', description: 'Create your first question', check: (u: any) => (u.totalQuestions || 0) >= 1 },
  { id: '10_votes', icon: '🔥', title: 'Active Voter', description: 'Cast 10 votes', check: (u: any) => (u.totalVotes || 0) >= 10 },
  { id: '5_questions', icon: '💡', title: 'Curious Mind', description: 'Create 5 questions', check: (u: any) => (u.totalQuestions || 0) >= 5 },
  { id: '100_xp', icon: '⚡', title: 'XP Hunter', description: 'Earn 100 XP', check: (u: any) => (u.xp || 0) >= 100 },
  { id: '1000_xp', icon: '🏆', title: 'XP Master', description: 'Earn 1,000 XP', check: (u: any) => (u.xp || 0) >= 1000 },
  { id: 'first_wsr', icon: '🪙', title: 'Token Holder', description: 'Own your first WSR token', check: (u: any) => (u.unclaimedWSR || 0) + (u.totalClaimedWSR || 0) > 0 },
  { id: 'streak_3', icon: '🔥', title: 'On Fire', description: '3 day streak', check: (u: any) => (u.streak || 0) >= 3 },
  { id: 'level_5', icon: '⭐', title: 'Rising Star', description: 'Reach level 5', check: (u: any) => (u.level || 1) >= 5 },
  { id: 'wallet', icon: '💎', title: 'Web3 Native', description: 'Connect a wallet', check: (u: any) => !!u.walletAddress },
];

export default function ProfilePage() {
  const { profile } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDashData(data); })
      .finally(() => setLoading(false));
  }, []);

  const user = dashData?.user || profile || {
    displayName: 'User', username: 'user', xp: 0, level: 1,
    reputation: 0, badge: 'newcomer', totalVotes: 0, totalQuestions: 0,
    totalPredictions: 0, predictionAccuracy: 0, streak: 0, walletAddress: null,
    unclaimedWSR: 0, totalClaimedWSR: 0, createdAt: new Date().toISOString(),
  };

  const userQuestions = dashData?.myQuestions || [];
  const stats = dashData?.stats || { myVotes: 0, myComments: 0, myQuestions: 0 };

  // Achievements based on real user data
  const achievements = achievementDefs.map(a => ({
    ...a,
    unlocked: a.check(user),
  }));

  const xpForLevel = (user.level || 1) * 1000;
  const xpProgress = Math.min(100, ((user.xp || 0) / xpForLevel) * 100);

  const statItems = [
    { icon: BarChart3, label: 'Total Votes', value: formatNumber(user.totalVotes || 0), color: 'text-indigo-500' },
    { icon: MessageSquare, label: 'Questions', value: (user.totalQuestions || 0).toString(), color: 'text-amber-500' },
    { icon: Zap, label: 'XP', value: formatNumber(user.xp || 0), color: 'text-emerald-500' },
    { icon: Coins, label: 'WSR Balance', value: `${(user.unclaimedWSR || 0).toLocaleString()}`, color: 'text-orange-500' },
    { icon: Flame, label: 'Streak', value: `${user.streak || 0} days`, color: 'text-violet-500' },
    { icon: Star, label: 'Level', value: `Lv.${user.level || 1}`, color: 'text-cyan-500' },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] py-20 text-center">
        <RefreshCw size={24} className="animate-spin mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] py-5">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card/50 border border-border/30 rounded-xl p-8 mb-6"
      >
        <div className="flex items-start gap-6">
          <div className="w-[90px] h-[90px] rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-extrabold text-white shrink-0 border-[3px] border-primary">
            {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-[28px] font-extrabold text-foreground">{user.displayName || user.username || 'User'}</h1>
              <Badge
                variant="outline"
                className="border-transparent"
                style={{
                  backgroundColor: `${getBadgeColor(user.badge || 'newcomer')}20`,
                  color: getBadgeColor(user.badge || 'newcomer'),
                }}
              >
                {user.badge || 'newcomer'}
              </Badge>
            </div>
            {user.username && (
              <div className="text-sm text-muted-foreground mb-1">@{user.username}</div>
            )}
            {user.email && !user.username && (
              <div className="text-sm text-muted-foreground mb-1">{user.email}</div>
            )}
            <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
              <Calendar size={14} /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              <span className="mx-2">&middot;</span>
              Level {user.level || 1}
              <span className="mx-2">&middot;</span>
              {user.xp || 0} XP
            </div>

            {/* Level progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Level {user.level || 1}</span>
                <span className="text-primary font-semibold">
                  {user.xp || 0} / {xpForLevel} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Edit3 size={16} /> Edit
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-6"
      >
        {statItems.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              custom={i}
              className="bg-card/50 border border-border/30 rounded-xl p-4 text-center"
            >
              <Icon size={22} className={`${stat.color} mx-auto mb-2`} />
              <div className="text-[22px] font-extrabold text-foreground mb-0.5">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card/50 border border-border/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <Award size={20} className="text-amber-500" /> Achievements
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2.5">
            {achievements.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] bg-card border transition-colors ${
                  ach.unlocked ? 'opacity-100 border-indigo-500/20' : 'opacity-40 border-border'
                }`}
              >
                <span className="text-[22px]">{ach.icon}</span>
                <div>
                  <div className="text-[13px] font-semibold text-foreground">{ach.title}</div>
                  <div className="text-[11px] text-muted-foreground">{ach.description}</div>
                </div>
                {ach.unlocked && <Star size={14} className="text-amber-500 ml-auto" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Questions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card/50 border border-border/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <TrendingUp size={20} className="text-primary" /> Recent Questions
          </h3>
          <div className="flex flex-col gap-2.5">
            {userQuestions.length > 0 ? (
              userQuestions.slice(0, 8).map((q: any, i: number) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <Link
                    href={`/questions/${q.id}`}
                    className="block px-3.5 py-3 rounded-[10px] bg-card border border-border no-underline text-inherit transition-colors hover:border-primary/30 hover:bg-card/80"
                  >
                    <div className="text-sm font-semibold mb-1 text-foreground">{q.title}</div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{formatNumber(q.totalVotes)} votes</span>
                      <span>{q.totalComments} comments</span>
                      <span>{timeAgo(q.createdAt)}</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare size={28} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No questions yet</p>
                <Link href="/ask">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs">
                    <MessageSquare size={12} /> Ask Your First Question
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
