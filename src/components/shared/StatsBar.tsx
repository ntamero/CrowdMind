'use client';

import { Users, BarChart3, MessageSquare, Zap, Globe, TrendingUp } from 'lucide-react';
import { mockStats } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';

const stats = [
  { icon: Users, label: 'Users', value: mockStats.totalUsers, color: '#6366f1' },
  { icon: MessageSquare, label: 'Questions', value: mockStats.totalQuestions, color: '#f59e0b' },
  { icon: BarChart3, label: 'Total Votes', value: mockStats.totalVotes, color: '#10b981' },
  { icon: Zap, label: 'Predictions', value: mockStats.totalPredictions, color: '#8b5cf6' },
  { icon: Globe, label: 'Online Now', value: mockStats.activeNow, color: '#06b6d4' },
  { icon: TrendingUp, label: 'Today', value: mockStats.questionsToday, color: '#ef4444' },
];

export default function StatsBar() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      marginBottom: 32,
    }}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="glass-card stat-card"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Subtle glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 60, height: 60, borderRadius: '50%',
              background: `radial-gradient(circle, ${stat.color}15, transparent)`,
              pointerEvents: 'none',
            }} />
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${stat.color}10`,
              border: `1px solid ${stat.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={18} color={stat.color} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2, letterSpacing: -0.5 }}>
                {formatNumber(stat.value)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.3 }}>
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
