'use client';

import { useState } from 'react';
import {
  Zap,
  Trophy,
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  Target,
  Flame,
  Share2,
} from 'lucide-react';
import { mockPredictions } from '@/lib/mock-data';
import { formatNumber, timeAgo } from '@/lib/utils';

export default function PredictionsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const categories = ['all', 'crypto', 'tech', 'sports', 'politics'];

  const filtered =
    filter === 'all'
      ? mockPredictions
      : mockPredictions.filter((p) => p.category === filter);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
          <Zap size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
          Prediction{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Markets
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Forecast the future. Compete with the crowd. Win prizes.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {[
          { icon: Zap, label: 'Active Markets', value: '48', color: '#f59e0b' },
          { icon: Users, label: 'Participants', value: '48.2K', color: '#6366f1' },
          { icon: DollarSign, label: 'Prize Pool', value: '$18K', color: '#10b981' },
          { icon: Trophy, label: 'Top Accuracy', value: '82.1%', color: '#ef4444' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card" style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
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
                <div style={{ fontSize: 22, fontWeight: 800 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: filter === cat ? 'var(--primary)' : 'transparent',
              color: filter === cat ? 'white' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prediction Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((prediction) => {
          const isExpanded = selectedPrediction === prediction.id;
          return (
            <div
              key={prediction.id}
              className="glass-card"
              style={{
                padding: 24,
                cursor: 'pointer',
                border: isExpanded ? '1px solid rgba(245, 158, 11, 0.3)' : undefined,
              }}
              onClick={() =>
                setSelectedPrediction(isExpanded ? null : prediction.id)
              }
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      className="badge"
                      style={{
                        background: prediction.status === 'open' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: prediction.status === 'open' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {prediction.status === 'open' ? <Flame size={12} /> : <Clock size={12} />}
                      {prediction.status}
                    </span>
                    <span className="tag">{prediction.category}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {prediction.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {prediction.description}
                  </p>
                </div>
                {prediction.prize && (
                  <div
                    style={{
                      padding: '10px 16px',
                      borderRadius: 12,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 2 }}>PRIZE</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>
                      ${prediction.prize.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <Users size={14} /> {formatNumber(prediction.totalParticipants)} participants
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <Clock size={14} /> Ends {new Date(prediction.targetDate).toLocaleDateString()}
                </div>
                {prediction.currentValue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)' }}>
                    <TrendingUp size={14} /> ${prediction.currentValue.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prediction.options.map((option) => {
                  const totalP = prediction.totalParticipants || 1;
                  const pct = Math.round((option.participants / totalP) * 100);
                  return (
                    <div
                      key={option.id}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${pct}%`,
                          background: 'rgba(99, 102, 241, 0.08)',
                          borderRadius: 10,
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 1, fontSize: 14, fontWeight: 500 }}>
                        {option.text}
                      </span>
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {formatNumber(option.participants)}
                        </span>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: 'var(--accent)',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {option.odds}x
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-light)' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded: predict button */}
              {isExpanded && (
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button
                    className="btn-glow"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Target size={18} /> Make Prediction
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
