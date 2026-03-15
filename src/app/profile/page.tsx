'use client';

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

export default function ProfilePage() {
  const user = mockUsers[0]; // Current user
  const userQuestions = mockQuestions.filter((q) => q.userId === user.id);

  const stats = [
    { icon: BarChart3, label: 'Total Votes', value: formatNumber(user.totalVotes), color: '#6366f1' },
    { icon: MessageSquare, label: 'Questions', value: user.totalQuestions.toString(), color: '#f59e0b' },
    { icon: Zap, label: 'Predictions', value: user.totalPredictions.toString(), color: '#10b981' },
    { icon: Target, label: 'Accuracy', value: `${user.predictionAccuracy}%`, color: '#ef4444' },
    { icon: Flame, label: 'Streak', value: `${user.streak} days`, color: '#8b5cf6' },
    { icon: Star, label: 'Reputation', value: formatNumber(user.reputation), color: '#06b6d4' },
  ];

  const achievements = mockAchievements;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0' }}>
      {/* Profile Header */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 20,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
              border: '3px solid var(--primary)',
            }}
          >
            {user.displayName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>{user.displayName}</h1>
              {user.isPremium && (
                <span
                  className="badge"
                  style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                >
                  <Crown size={12} /> Premium
                </span>
              )}
              <span
                className="badge"
                style={{
                  background: `${getBadgeColor(user.badge)}20`,
                  color: getBadgeColor(user.badge),
                }}
              >
                {user.badge}
              </span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
              @{user.username}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> Joined {new Date(user.joinedAt).toLocaleDateString()}
              <span style={{ margin: '0 8px' }}>·</span>
              Level {user.level}
            </div>

            {/* Level progress bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Level {user.level}</span>
                <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                  {user.reputation % 500}/{500} XP
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--bg-card)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${((user.reputation % 500) / 500) * 100}%`,
                    background: 'var(--gradient-primary)',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={16} /> Edit
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <Icon size={22} color={stat.color} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Achievements */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="var(--accent)" /> Achievements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {achievements.slice(0, 8).map((ach) => (
              <div
                key={ach.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-card)',
                  opacity: ach.unlocked ? 1 : 0.4,
                  border: ach.unlocked ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 22 }}>{ach.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ach.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ach.description}</div>
                </div>
                {ach.unlocked && <Star size={14} color="#f59e0b" style={{ marginLeft: 'auto' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--primary-light)" /> Recent Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {userQuestions.length > 0 ? (
              userQuestions.map((q) => (
                <a
                  key={q.id}
                  href={`/questions/${q.id}`}
                  style={{
                    display: 'block',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{q.title}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{formatNumber(q.totalVotes)} votes</span>
                    <span>{timeAgo(q.createdAt)}</span>
                  </div>
                </a>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No questions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
