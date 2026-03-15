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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="glass-card"
            style={{
              padding: '18px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `${stat.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} color={stat.color} />
            </div>
            <div>
              <div
                className="stat-value"
                style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}
              >
                {formatNumber(stat.value)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
