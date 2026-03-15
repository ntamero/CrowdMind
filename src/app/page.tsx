'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Clock, Flame, Filter, Sparkles, ArrowRight, Brain,
  Zap, Star, Gift, Users, Trophy, Crown, BarChart3,
} from 'lucide-react';
import QuestionCard from '@/components/questions/QuestionCard';
import StatsBar from '@/components/shared/StatsBar';
import { mockQuestions, mockDailyQuestions, mockPredictions, categories } from '@/lib/mock-data';

type SortType = 'trending' | 'newest' | 'hot';

export default function HomePage() {
  const [sort, setSort] = useState<SortType>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = mockQuestions
    .filter((q) => !selectedCategory || q.category === selectedCategory)
    .sort((a, b) => {
      if (sort === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.totalVotes - a.totalVotes;
    });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 30,
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.2)',
          marginBottom: 20, fontSize: 13, fontWeight: 600, color: 'var(--primary-light)',
        }}>
          <Sparkles size={14} />
          AI-Powered Collective Intelligence
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.15, marginBottom: 14, letterSpacing: -1 }}>
          Ask the World.{' '}
          <span style={{
            background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Decide Smarter.
          </span>
        </h1>
        <p style={{
          fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6,
        }}>
          Share your decisions with millions of people worldwide. Get AI-analyzed
          insights from collective intelligence.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/ask" style={{ textDecoration: 'none' }}>
            <button className="btn-glow" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', fontSize: 16 }}>
              <Brain size={20} /> Ask a Question <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/predictions" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', fontSize: 16 }}>
              <Flame size={20} /> Predictions
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Daily Questions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={20} color="#f59e0b" /> Daily Challenges
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Resets in 8h 23m</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {mockDailyQuestions.map((dq) => (
            <Link key={dq.id} href="/ask" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{
                padding: 16, cursor: 'pointer',
                border: '1px solid rgba(245, 158, 11, 0.15)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    {dq.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                    <Star size={12} /> +{dq.xpReward} XP
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{dq.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot Predictions Preview */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={20} color="#ef4444" /> Hot Predictions
          </h2>
          <Link href="/predictions" style={{ fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {mockPredictions.slice(0, 2).map((p) => (
            <Link key={p.id} href="/predictions" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: 16, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Zap size={10} /> Open
                  </span>
                  {p.prize && <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>${p.prize.toLocaleString()}</span>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{p.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Users size={12} /> {p.totalParticipants.toLocaleString()} participants
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { href: '/ai-analysis', icon: Brain, label: 'AI Analysis', color: '#6366f1' },
          { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: '#f59e0b' },
          { href: '/pricing', icon: Crown, label: 'Go Premium', color: '#ef4444' },
          { href: '/predictions', icon: BarChart3, label: 'Predict', color: '#10b981' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: 16, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: `${action.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                }}>
                  <Icon size={20} color={action.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{action.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Referral Banner */}
      <div className="glass-card" style={{
        padding: 20, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Gift size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Invite friends, earn rewards!</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Get 500 XP for each friend who joins. They get 200 XP too.
            </div>
          </div>
        </div>
        <button className="btn-glow" style={{ padding: '10px 20px', fontSize: 13, flexShrink: 0 }}>
          Invite Friends
        </button>
      </div>

      {/* Sort & Filter */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <SortBtn active={sort === 'trending'} icon={<TrendingUp size={15} />} label="Trending" onClick={() => setSort('trending')} />
          <SortBtn active={sort === 'newest'} icon={<Clock size={15} />} label="Newest" onClick={() => setSort('newest')} />
          <SortBtn active={sort === 'hot'} icon={<Flame size={15} />} label="Hot" onClick={() => setSort('hot')} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-muted)" />
          <FilterBtn label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
          {categories.slice(0, 5).map((cat) => (
            <FilterBtn
              key={cat.value}
              label={`${cat.icon} ${cat.label}`}
              active={selectedCategory === cat.value}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
              color={cat.color}
            />
          ))}
        </div>
      </div>

      {/* Questions Feed */}
      {filtered.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}

      {filtered.length === 0 && (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>No questions found in this category.</p>
        </div>
      )}
    </div>
  );
}

function SortBtn({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
      border: '1px solid var(--border)',
      background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
    }}>
      {icon} {label}
    </button>
  );
}

function FilterBtn({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)',
      background: active ? (color || 'var(--primary)') : 'transparent',
      color: active ? 'white' : 'var(--text-secondary)',
      fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );
}
