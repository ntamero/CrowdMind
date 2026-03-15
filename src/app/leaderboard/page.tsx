'use client';

import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Flame,
  Crown,
  Star,
  Award,
} from 'lucide-react';
import { mockLeaderboard } from '@/lib/mock-data';
import { formatNumber, getBadgeColor } from '@/lib/utils';

export default function LeaderboardPage() {
  const top3 = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Trophy size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
          Global{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Leaderboard
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Top predictors and decision-makers worldwide
        </p>
      </div>

      {/* Top 3 Podium */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
          marginBottom: 32,
          alignItems: 'end',
        }}
      >
        {/* 2nd place */}
        {top3[1] && (
          <PodiumCard entry={top3[1]} height={200} medal="silver" icon={<Medal size={24} color="#94a3b8" />} />
        )}
        {/* 1st place */}
        {top3[0] && (
          <PodiumCard entry={top3[0]} height={240} medal="gold" icon={<Crown size={28} color="#f59e0b" />} />
        )}
        {/* 3rd place */}
        {top3[2] && (
          <PodiumCard entry={top3[2]} height={170} medal="bronze" icon={<Award size={22} color="#cd7f32" />} />
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px 100px 80px 60px',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          <span>Rank</span>
          <span>User</span>
          <span style={{ textAlign: 'center' }}>Score</span>
          <span style={{ textAlign: 'center' }}>Accuracy</span>
          <span style={{ textAlign: 'center' }}>Streak</span>
          <span style={{ textAlign: 'center' }}>+/-</span>
        </div>

        {mockLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '60px 1fr 100px 100px 80px 60px',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Rank */}
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color:
                  entry.rank === 1
                    ? '#f59e0b'
                    : entry.rank === 2
                    ? '#94a3b8'
                    : entry.rank === 3
                    ? '#cd7f32'
                    : 'var(--text-secondary)',
              }}
            >
              #{entry.rank}
            </span>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {entry.user.displayName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.user.displayName}</div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: getBadgeColor(entry.user.badge),
                    textTransform: 'uppercase',
                  }}
                >
                  {entry.user.badge}
                </div>
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700 }}>
              {formatNumber(entry.score)}
            </div>

            {/* Accuracy */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  background:
                    entry.accuracy >= 75
                      ? 'rgba(16, 185, 129, 0.15)'
                      : entry.accuracy >= 60
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  color:
                    entry.accuracy >= 75
                      ? '#10b981'
                      : entry.accuracy >= 60
                      ? '#f59e0b'
                      : '#ef4444',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {entry.accuracy}%
              </span>
            </div>

            {/* Streak */}
            <div
              style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              <Flame size={14} /> {entry.streak}
            </div>

            {/* Change */}
            <div style={{ textAlign: 'center' }}>
              {entry.change > 0 ? (
                <TrendingUp size={16} color="#10b981" />
              ) : entry.change < 0 ? (
                <TrendingDown size={16} color="#ef4444" />
              ) : (
                <Minus size={16} color="var(--text-muted)" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  height,
  medal,
  icon,
}: {
  entry: (typeof mockLeaderboard)[0];
  height: number;
  medal: string;
  icon: React.ReactNode;
}) {
  const medalColors: Record<string, string> = {
    gold: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    silver: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
    bronze: 'linear-gradient(135deg, #cd7f32, #daa520)',
  };

  return (
    <div
      className="glass-card"
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        textAlign: 'center',
        border: medal === 'gold' ? '1px solid rgba(245, 158, 11, 0.3)' : undefined,
      }}
    >
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: medalColors[medal],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 800,
          color: 'white',
          marginBottom: 10,
        }}
      >
        {entry.user.displayName.charAt(0)}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
        {entry.user.displayName}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-light)', marginBottom: 4 }}>
        {formatNumber(entry.score)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981' }}>
        <Target size={12} /> {entry.accuracy}%
      </div>
    </div>
  );
}
