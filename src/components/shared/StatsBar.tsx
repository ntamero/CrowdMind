'use client';

import { Users, BarChart3, MessageSquare, Zap, Globe, TrendingUp } from 'lucide-react';
import { mockStats } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';

const stats = [
  { icon: Users, label: 'Users', value: mockStats.totalUsers, color: 'text-indigo-400' },
  { icon: MessageSquare, label: 'Questions', value: mockStats.totalQuestions, color: 'text-amber-400' },
  { icon: BarChart3, label: 'Total Votes', value: mockStats.totalVotes, color: 'text-emerald-400' },
  { icon: Zap, label: 'Predictions', value: mockStats.totalPredictions, color: 'text-purple-400' },
  { icon: Globe, label: 'Online', value: mockStats.activeNow, color: 'text-cyan-400' },
  { icon: TrendingUp, label: 'Today', value: mockStats.questionsToday, color: 'text-red-400' },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-card/50 border border-border/30 rounded-xl p-3.5 text-center hover:border-border/60 transition-colors">
            <Icon size={16} className={`${stat.color} mx-auto mb-1.5`} />
            <div className="text-lg font-bold tracking-tight">{formatNumber(stat.value)}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
