'use client';

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

export default function AdminPage() {
  const dashboardStats = [
    { icon: Users, label: 'Total Users', value: formatNumber(mockStats.totalUsers), change: '+12.5%', color: '#6366f1', positive: true },
    { icon: MessageSquare, label: 'Questions', value: formatNumber(mockStats.totalQuestions), change: '+8.3%', color: '#f59e0b', positive: true },
    { icon: BarChart3, label: 'Total Votes', value: formatNumber(mockStats.totalVotes), change: '+23.1%', color: '#10b981', positive: true },
    { icon: Zap, label: 'Predictions', value: formatNumber(mockStats.totalPredictions), change: '+5.7%', color: '#8b5cf6', positive: true },
    { icon: Globe, label: 'Active Now', value: formatNumber(mockStats.activeNow), change: '-2.1%', color: '#06b6d4', positive: false },
    { icon: Activity, label: 'Today', value: mockStats.questionsToday.toString(), change: '+15.4%', color: '#ef4444', positive: true },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={28} color="var(--primary)" /> Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Platform analytics and management
          </p>
        </div>
        <button className="btn-glow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${stat.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={stat.color} />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: stat.positive ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <TrendingUp size={12} /> {stat.change}
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Questions */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} color="var(--primary-light)" /> Recent Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mockQuestions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {q.user.displayName} · {formatNumber(q.totalVotes)} votes · {timeAgo(q.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                  <button
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle size={14} color="#10b981" />
                  </button>
                  <button
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Management */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="var(--accent)" /> Users
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mockUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {user.displayName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user.displayName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    @{user.username} · Rep: {formatNumber(user.reputation)}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: user.isPremium ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                    color: user.isPremium ? '#f59e0b' : '#64748b',
                    fontSize: 10,
                  }}
                >
                  {user.isPremium ? 'Premium' : 'Free'}
                </span>
                <button
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Eye size={14} color="var(--text-muted)" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="#ef4444" /> Flagged Content
        </h3>
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          <CheckCircle size={32} color="#10b981" style={{ marginBottom: 8 }} />
          <p>No flagged content. All clear!</p>
        </div>
      </div>
    </div>
  );
}
