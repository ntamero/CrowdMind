'use client';

import { motion } from 'framer-motion';
import {
  User,
  Trophy,
  BarChart3,
  MessageSquare,
  Zap,
  Target,
  Flame,
  Calendar,
  Star,
  Award,
  Edit3,
  Settings,
  Crown,
  TrendingUp,
} from 'lucide-react';
import { mockUsers, mockQuestions, mockAchievements } from '@/lib/mock-data';
import { formatNumber, getBadgeColor, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function ProfilePage() {
  const user = mockUsers[0]; // Current user
  const userQuestions = mockQuestions.filter((q) => q.userId === user.id);

  const stats = [
    { icon: BarChart3, label: 'Total Votes', value: formatNumber(user.totalVotes), color: 'text-indigo-500' },
    { icon: MessageSquare, label: 'Questions', value: user.totalQuestions.toString(), color: 'text-amber-500' },
    { icon: Zap, label: 'Predictions', value: user.totalPredictions.toString(), color: 'text-emerald-500' },
    { icon: Target, label: 'Accuracy', value: `${user.predictionAccuracy}%`, color: 'text-red-500' },
    { icon: Flame, label: 'Streak', value: `${user.streak} days`, color: 'text-violet-500' },
    { icon: Star, label: 'Reputation', value: formatNumber(user.reputation), color: 'text-cyan-500' },
  ];

  const achievements = mockAchievements;
  const xpProgress = ((user.reputation % 500) / 500) * 100;

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
            {user.displayName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-[28px] font-extrabold text-foreground">{user.displayName}</h1>
              {user.isPremium && (
                <Badge variant="outline" className="bg-amber-500/15 text-amber-500 border-amber-500/30">
                  <Crown size={12} /> Premium
                </Badge>
              )}
              <Badge
                variant="outline"
                className="border-transparent"
                style={{
                  backgroundColor: `${getBadgeColor(user.badge)}20`,
                  color: getBadgeColor(user.badge),
                }}
              >
                {user.badge}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-1">
              @{user.username}
            </div>
            <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
              <Calendar size={14} /> Joined {new Date(user.joinedAt).toLocaleDateString()}
              <span className="mx-2">&middot;</span>
              Level {user.level}
            </div>

            {/* Level progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Level {user.level}</span>
                <span className="text-primary font-semibold">
                  {user.reputation % 500}/{500} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Edit3 size={16} /> Edit
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Settings size={16} />
            </Button>
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
        {stats.map((stat, i) => {
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
          </h3>
          <div className="flex flex-col gap-2.5">
            {achievements.slice(0, 8).map((ach, i) => (
              <motion.div
                key={ach.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] bg-card border transition-colors ${
                  ach.unlocked
                    ? 'opacity-100 border-indigo-500/20'
                    : 'opacity-40 border-border'
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

        {/* Recent Activity */}
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
              userQuestions.map((q, i) => (
                <motion.a
                  key={q.id}
                  href={`/questions/${q.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="block px-3.5 py-3 rounded-[10px] bg-card border border-border no-underline text-inherit transition-colors hover:border-primary/30 hover:bg-card/80"
                >
                  <div className="text-sm font-semibold mb-1 text-foreground">{q.title}</div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{formatNumber(q.totalVotes)} votes</span>
                    <span>{timeAgo(q.createdAt)}</span>
                  </div>
                </motion.a>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No questions yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
