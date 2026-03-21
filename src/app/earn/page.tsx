'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Gift, Trophy, Flame, Star, Zap, Target,
  CheckCircle2, Lock, Clock, TrendingUp,
  Coins, Award, Crown, Sparkles, ArrowRight,
  Vote, MessageCircle, Share2, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const earningMethods = [
  {
    icon: Vote,
    title: 'Vote to Earn',
    desc: 'Cast votes on questions and polls. Each vote earns you XP and helps build your reputation.',
    reward: '1 XP per vote',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Predict to Earn',
    desc: 'Make correct predictions on prediction markets. Higher accuracy = more rewards.',
    reward: 'Bonus XP for accuracy',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Target,
    title: 'Create to Earn',
    desc: 'Create polls and questions. Earn XP based on community engagement.',
    reward: '3 XP per question',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Users,
    title: 'Refer to Earn',
    desc: 'Invite friends to Wisery. Earn 10% of their XP for 30 days.',
    reward: '10% referral bonus',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10',
  },
];

const taskIcons: Record<string, any> = {
  '1': Vote,
  '2': Target,
  '3': MessageCircle,
};
const taskColors: Record<string, string> = {
  '1': 'text-amber-400',
  '2': 'text-orange-400',
  '3': 'text-cyan-400',
};

const rarityColors: Record<string, string> = {
  common: 'border-gray-500/30 bg-gray-500/5',
  rare: 'border-blue-500/30 bg-blue-500/5',
  epic: 'border-purple-500/30 bg-purple-500/5',
  legendary: 'border-amber-500/30 bg-amber-500/5',
};

const rarityLabels: Record<string, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

export default function EarnPage() {
  const { profile } = useAuth();
  const [earnData, setEarnData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/earn').then(r => r.json()).then(setEarnData).catch(() => {});
  }, []);

  const userXp = profile?.xp || 0;
  const userLevel = profile?.level || 1;
  const userStreak = earnData?.streak ?? profile?.streak ?? 0;
  const userReputation = profile?.reputation || 0;

  const dailyTasks = earnData?.dailyTasks || [];
  const completedCount = earnData?.completedCount || 0;
  const totalTasks = earnData?.totalTasks || 0;
  const hoursLeft = earnData?.hoursLeft || 24;
  const achievements = earnData?.achievements || [];

  return (
    <div className="max-w-full mx-auto">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: Sparkles, label: 'Total XP', value: userXp.toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Coins, label: 'Reputation', value: userReputation.toLocaleString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Flame, label: 'Day Streak', value: String(userStreak), color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Trophy, label: 'Level', value: String(userLevel), color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-5 text-center"
          >
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2', stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-[12px] text-muted-foreground font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Left Column */}
        <div>
          {/* Daily Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Daily Tasks
              </h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[11px] font-bold">
                  {completedCount}/{totalTasks} Complete
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock size={12} />
                  Resets in {hoursLeft}h
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {dailyTasks.length === 0 && (
                <p className="text-center text-muted-foreground text-[13px] py-6">Sign in to track your daily tasks</p>
              )}
              {dailyTasks.map((task: any) => {
                const IconComp = taskIcons[task.id] || Target;
                const color = taskColors[task.id] || 'text-amber-400';
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl border transition-all',
                      task.progress >= task.total
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-border/20 hover:border-border/40'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      task.progress >= task.total ? 'bg-emerald-500/10' : 'bg-secondary/30'
                    )}>
                      {task.progress >= task.total ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : (
                        <IconComp size={20} className={color} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-[14px] font-semibold', task.progress >= task.total && 'line-through text-muted-foreground')}>
                          {task.title}
                        </p>
                        <Badge variant="secondary" className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border-0">
                          {task.reward}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{task.desc}</p>
                      {task.progress < task.total && (
                        <div className="mt-1.5 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                            style={{ width: `${(task.progress / task.total) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {task.progress}/{task.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* How to Earn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Gift size={18} className="text-emerald-400" />
              Ways to Earn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earningMethods.map((method, i) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-5 hover:border-border/40 transition-all group cursor-pointer"
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', method.bg)}>
                    <method.icon size={22} className="text-foreground" />
                  </div>
                  <h3 className="text-[15px] font-bold mb-1">{method.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{method.desc}</p>
                  <Badge className={cn('text-[11px] border-0 font-bold bg-emerald-500/10 text-emerald-400')}>
                    {method.reward}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame size={24} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black">{userStreak} {userStreak === 1 ? 'Day' : 'Days'}</p>
                <p className="text-[12px] text-muted-foreground">Current Streak</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold',
                    i < Math.min(userStreak, 7)
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-secondary/20 text-muted-foreground'
                  )}
                >
                  {i < Math.min(userStreak, 7) ? <Flame size={12} /> : '·'}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {userStreak > 0
                ? <>Keep your streak alive! Log in tomorrow for a <span className="text-orange-400 font-bold">bonus</span></>
                : 'Start your streak by being active today!'
              }
            </p>
          </div>

          {/* Achievements */}
          <div className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-5">
            <h3 className="text-[15px] font-bold flex items-center gap-2 mb-4">
              <Award size={16} className="text-amber-400" />
              Achievements
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {achievements.length === 0 && (
                <p className="col-span-3 text-center text-muted-foreground text-[12px] py-4">Sign in to see achievements</p>
              )}
              {achievements.map((ach: any) => (
                <div
                  key={ach.title}
                  className={cn(
                    'rounded-xl p-3 text-center border transition-all',
                    ach.unlocked
                      ? rarityColors[ach.rarity]
                      : 'border-border/20 bg-secondary/10 opacity-50'
                  )}
                >
                  <span className="text-2xl block mb-1">
                    {ach.unlocked ? ach.icon : '🔒'}
                  </span>
                  <p className="text-[10px] font-bold truncate">{ach.title}</p>
                  <p className={cn('text-[8px] font-semibold uppercase mt-0.5', ach.unlocked ? rarityLabels[ach.rarity] : 'text-muted-foreground')}>
                    {ach.rarity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <span className="text-[14px] font-bold">Level {userLevel}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">{userXp.toLocaleString()} / {((userLevel) * 1000).toLocaleString()} XP</span>
            </div>
            <div className="h-3 bg-secondary/30 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                style={{ width: `${Math.min((userXp % 1000) / 10, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {(userLevel * 1000) - userXp > 0 ? (userLevel * 1000) - userXp : 0} XP to <span className="text-amber-400 font-bold">Level {userLevel + 1}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
