'use client';

import {
  Brain, TrendingUp, Heart, Target, AlertTriangle, BarChart3,
  Sparkles, Globe, Zap, ChevronRight, ArrowUp, ArrowDown,
} from 'lucide-react';

const aiModules = [
  {
    id: 'sentiment',
    name: 'Sentiment AI',
    description: 'Analyzes emotional tone and public opinion across all votes and comments',
    icon: Heart,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #ec4899)',
    stats: { analyzed: '2.4M', accuracy: '91%', signals: '156K' },
    sample: {
      topic: 'AI-first startups',
      positive: 62,
      neutral: 24,
      negative: 14,
      trend: 'Positive sentiment increasing 3.2% week-over-week',
    },
  },
  {
    id: 'decision',
    name: 'Decision AI',
    description: 'Recommends the best option based on crowd wisdom, expert weight, and historical patterns',
    icon: Target,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    stats: { decisions: '890K', accuracy: '84%', users: '145K' },
    sample: {
      question: 'Best investment strategy 2026?',
      recommendation: 'Diversified AI + Crypto portfolio',
      confidence: 87,
      basis: 'Based on 42K votes weighted by predictor accuracy',
    },
  },
  {
    id: 'trend',
    name: 'Trend AI',
    description: 'Identifies emerging topics, viral patterns, and shifts in collective opinion',
    icon: TrendingUp,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    stats: { trends: '2.1K', predictions: '340', accuracy: '79%' },
    rising: [
      { topic: 'AI Agents', change: '+234%', direction: 'up' },
      { topic: 'Remote-first companies', change: '+89%', direction: 'up' },
      { topic: 'Web3 gaming', change: '-12%', direction: 'down' },
      { topic: 'Sustainable tech', change: '+156%', direction: 'up' },
    ],
  },
  {
    id: 'prediction',
    name: 'Prediction AI',
    description: 'Scores prediction accuracy and identifies the most reliable forecasters',
    icon: Zap,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    stats: { predictions: '8.9K', resolved: '3.2K', avgAccuracy: '71%' },
    topPredictions: [
      { topic: 'Bitcoin > $100K by Q2', probability: 68, participants: 9790 },
      { topic: 'Apple AR glasses 2026', probability: 45, participants: 9700 },
      { topic: 'AI regulation passed', probability: 52, participants: 11100 },
    ],
  },
  {
    id: 'risk',
    name: 'Risk AI',
    description: 'Evaluates risk factors for investment, business, and strategic decisions',
    icon: AlertTriangle,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    stats: { assessments: '45K', alerts: '890', accuracy: '76%' },
    riskFactors: [
      { factor: 'Market volatility', level: 'high', score: 78 },
      { factor: 'Regulatory risk', level: 'medium', score: 55 },
      { factor: 'Technology adoption', level: 'low', score: 28 },
      { factor: 'Competition intensity', level: 'high', score: 82 },
    ],
  },
];

export default function AIAnalysisPage() {
  return (
    <div style={{ maxWidth: 950, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <Brain size={32} color="white" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
          AI{' '}
          <span style={{
            background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Intelligence Engine</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 550, margin: '0 auto' }}>
          5 specialized AI modules analyze millions of votes and predictions to deliver actionable insights
        </p>
      </div>

      {/* Global stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { icon: Brain, label: 'AI Analyses', value: '4.8M', color: '#6366f1' },
          { icon: Globe, label: 'Data Points', value: '12.8M', color: '#06b6d4' },
          { icon: BarChart3, label: 'Avg Accuracy', value: '84%', color: '#10b981' },
          { icon: Sparkles, label: 'Insights/Day', value: '2.4K', color: '#f59e0b' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
              <Icon size={22} color={s.color} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* AI Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {aiModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.id} className="glass-card" style={{ padding: 28 }}>
              {/* Module Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: mod.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>{mod.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{mod.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {Object.entries(mod.stats).map(([key, val]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: mod.color }}>{val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module-specific content */}
              {mod.id === 'sentiment' && mod.sample && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: mod.color }}>
                      Live Sentiment — {mod.sample.topic}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {[
                        { label: 'Positive', value: mod.sample.positive, color: '#10b981' },
                        { label: 'Neutral', value: mod.sample.neutral, color: '#f59e0b' },
                        { label: 'Negative', value: mod.sample.negative, color: '#ef4444' },
                      ].map((s) => (
                        <div key={s.label} style={{ flex: s.value, height: 8, borderRadius: 4, background: s.color }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Positive {mod.sample.positive}%</span>
                      <span>Neutral {mod.sample.neutral}%</span>
                      <span>Negative {mod.sample.negative}%</span>
                    </div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#10b981' }}>Trend Signal</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mod.sample.trend}</div>
                  </div>
                </div>
              )}

              {mod.id === 'decision' && mod.sample && (
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Target size={16} color="#10b981" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>AI Recommendation</span>
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', marginLeft: 'auto' }}>
                      {mod.sample.confidence}% confidence
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{mod.sample.question}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{mod.sample.recommendation}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{mod.sample.basis}</div>
                </div>
              )}

              {mod.id === 'trend' && mod.rising && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {mod.rising.map((t) => (
                    <div key={t.topic} style={{
                      padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ChevronRight size={14} color={mod.color} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{t.topic}</span>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: t.direction === 'up' ? '#10b981' : '#ef4444',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {t.direction === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {t.change}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {mod.id === 'prediction' && mod.topPredictions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mod.topPredictions.map((p) => (
                    <div key={p.topic} style={{
                      padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{p.topic}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.participants.toLocaleString()} participants
                        </span>
                        <div style={{
                          width: 60, height: 8, borderRadius: 4, background: 'var(--bg-primary)', overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${p.probability}%`, height: '100%', borderRadius: 4,
                            background: p.probability > 60 ? '#10b981' : p.probability > 40 ? '#f59e0b' : '#ef4444',
                          }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: mod.color, minWidth: 36 }}>
                          {p.probability}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {mod.id === 'risk' && mod.riskFactors && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {mod.riskFactors.map((r) => (
                    <div key={r.factor} style={{
                      padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{r.factor}</div>
                        <span className="badge" style={{
                          background: r.level === 'high' ? 'rgba(239, 68, 68, 0.15)' : r.level === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: r.level === 'high' ? '#ef4444' : r.level === 'medium' ? '#f59e0b' : '#10b981',
                          fontSize: 10, marginTop: 4,
                        }}>
                          {r.level} risk
                        </span>
                      </div>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: r.score > 70 ? 'rgba(239, 68, 68, 0.1)' : r.score > 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        fontSize: 16, fontWeight: 800,
                        color: r.score > 70 ? '#ef4444' : r.score > 40 ? '#f59e0b' : '#10b981',
                      }}>
                        {r.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
