'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Clock, Flame, Filter, Sparkles, ArrowRight, Brain,
  Zap, Star, Gift, Users, Trophy, Crown, BarChart3, Globe, ChevronRight,
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
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* ─── Hero Section ─────────────────────────── */}
      <div style={{
        textAlign: 'center', padding: '48px 0 40px',
        position: 'relative',
      }}>
        {/* Ambient glow behind hero */}
        <div style={{
          position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 300,
          background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15), transparent 70%)',
          pointerEvents: 'none', zIndex: -1,
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 20px', borderRadius: 30,
          background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)',
          marginBottom: 24, fontSize: 13, fontWeight: 700, color: 'var(--primary-light)',
          letterSpacing: 0.3,
        }}>
          <Sparkles size={14} />
          AI-Powered Collective Intelligence
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#10b981',
            display: 'inline-block',
          }} className="pulse-dot" />
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 900, lineHeight: 1.1,
          marginBottom: 18, letterSpacing: -2,
        }}>
          Ask the World.{' '}
          <span className="gradient-text-animated" style={{ fontSize: 52 }}>
            Decide Smarter.
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520,
          margin: '0 auto 32px', lineHeight: 1.7, fontWeight: 400,
        }}>
          Share your decisions with millions worldwide. Get AI-analyzed
          insights from collective intelligence.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/ask" style={{ textDecoration: 'none' }}>
            <button className="btn-glow" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '16px 36px', fontSize: 16,
            }}>
              <Brain size={20} /> Ask a Question <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/predictions" style={{ textDecoration: 'none' }}>
            <button className="btn-outline" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '16px 30px', fontSize: 16,
            }}>
              <Flame size={20} /> Predictions
            </button>
          </Link>
        </div>

        {/* Live indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 24, fontSize: 13, color: 'var(--text-muted)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#10b981', display: 'inline-block',
          }} className="pulse-dot" />
          <Users size={14} /> 2,847 people deciding right now
          <span style={{ margin: '0 4px' }}>·</span>
          <Globe size={14} /> 142 countries
        </div>
      </div>

      {/* ─── Stats ────────────────────────────────── */}
      <StatsBar />

      {/* ─── Daily Challenges ─────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header">
          <h2 className="section-title">
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#f59e0b" />
            </div>
            Daily Challenges
          </h2>
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            background: 'rgba(245, 158, 11, 0.08)',
            padding: '4px 12px', borderRadius: 20,
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}>
            <Clock size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
            Resets in 8h 23m
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {mockDailyQuestions.map((dq) => (
            <Link key={dq.id} href="/ask" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{
                padding: 18, cursor: 'pointer',
                border: '1px solid rgba(245, 158, 11, 0.12)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tag" style={{
                    background: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24',
                    borderColor: 'rgba(245, 158, 11, 0.2)', fontSize: 11,
                  }}>
                    {dq.category}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 800, color: '#f59e0b',
                  }}>
                    <Star size={12} /> +{dq.xpReward} XP
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}>{dq.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Hot Predictions ──────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header">
          <h2 className="section-title">
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Flame size={18} color="#ef4444" />
            </div>
            Hot Predictions
          </h2>
          <Link href="/predictions" style={{
            fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {mockPredictions.slice(0, 2).map((p) => (
            <Link key={p.id} href="/predictions" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="badge" style={{
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}>
                    <Zap size={10} /> Open
                  </span>
                  {p.prize && (
                    <span style={{
                      fontSize: 16, fontWeight: 900, color: '#10b981',
                      textShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                    }}>
                      ${p.prize.toLocaleString()}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>{p.title}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, color: 'var(--text-muted)',
                }}>
                  <Users size={13} /> {p.totalParticipants.toLocaleString()} participants
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Quick Actions ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { href: '/ai-analysis', icon: Brain, label: 'AI Engine', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.15)' },
          { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' },
          { href: '/pricing', icon: Crown, label: 'Go Premium', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.15)' },
          { href: '/predictions', icon: BarChart3, label: 'Predict', color: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${action.color}12`,
                  border: `1px solid ${action.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                  boxShadow: `0 0 30px ${action.glow}`,
                }}>
                  <Icon size={22} color={action.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{action.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Referral Banner ──────────────────────── */}
      <div className="glass-card" style={{
        padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(168, 85, 247, 0.06), rgba(236, 72, 153, 0.04))',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
          }}>
            <Gift size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>Invite friends, earn rewards!</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Get 500 XP for each friend who joins. They get 200 XP too.
            </div>
          </div>
        </div>
        <button className="btn-glow" style={{ padding: '12px 24px', fontSize: 13, flexShrink: 0 }}>
          Invite Friends
        </button>
      </div>

      {/* ─── Sort & Filter ────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 22, flexWrap: 'wrap', gap: 12,
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

      {/* ─── Questions Feed ───────────────────────── */}
      {filtered.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}

      {filtered.length === 0 && (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>No questions found</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}

function SortBtn({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12,
      border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border)',
      background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
      color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
      fontSize: 13, fontWeight: 700, cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {icon} {label}
    </button>
  );
}

function FilterBtn({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20,
      border: active ? '1px solid transparent' : '1px solid var(--border)',
      background: active ? (color || 'var(--primary)') : 'transparent',
      color: active ? 'white' : 'var(--text-secondary)',
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {label}
    </button>
  );
}
