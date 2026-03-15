'use client';

import { Check, Crown, Zap, Building2, Sparkles, ArrowRight, Shield, Star } from 'lucide-react';
import { mockPricingPlans } from '@/lib/mock-data';

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 30,
          background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.2)',
          marginBottom: 20, fontSize: 13, fontWeight: 600, color: '#fbbf24',
        }}>
          <Crown size={14} /> Premium Plans
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12, letterSpacing: -1 }}>
          Unlock{' '}
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Full Power
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
          Get deeper AI insights, unlimited questions, and premium analytics to make better decisions.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
        {mockPricingPlans.map((plan) => {
          const icons: Record<string, React.ReactNode> = {
            free: <Zap size={28} color="#64748b" />,
            pro: <Crown size={28} color="#f59e0b" />,
            enterprise: <Building2 size={28} color="#6366f1" />,
          };
          return (
            <div
              key={plan.id}
              className="glass-card"
              style={{
                padding: 32,
                position: 'relative',
                border: plan.highlighted ? '2px solid rgba(245, 158, 11, 0.4)' : undefined,
                transform: plan.highlighted ? 'scale(1.03)' : undefined,
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  padding: '6px 16px', borderRadius: 20,
                  background: plan.id === 'pro' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'var(--gradient-primary)',
                  fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                  background: plan.highlighted ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icons[plan.id]}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: plan.highlighted ? '#fbbf24' : 'var(--text-primary)' }}>
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mo</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <Check size={16} color={plan.highlighted ? '#f59e0b' : '#10b981'} />
                    <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={plan.highlighted ? 'btn-glow' : 'btn-secondary'}
                style={{
                  width: '100%', padding: '14px', fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: plan.highlighted ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : undefined,
                }}
              >
                {plan.price === 0 ? 'Get Started Free' : 'Upgrade Now'}
                <ArrowRight size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32,
        flexWrap: 'wrap',
      }}>
        {[
          { icon: <Shield size={18} color="#10b981" />, text: 'Secure payments' },
          { icon: <Star size={18} color="#f59e0b" />, text: '7-day free trial' },
          { icon: <Sparkles size={18} color="#6366f1" />, text: 'Cancel anytime' },
        ].map((item) => (
          <div key={item.text} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
            color: 'var(--text-secondary)',
          }}>
            {item.icon} {item.text}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="glass-card" style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
          Frequently Asked Questions
        </h3>
        {[
          { q: 'Can I cancel my subscription anytime?', a: 'Yes! You can cancel anytime. Your premium features will remain active until the end of your billing period.' },
          { q: 'Is there a free trial?', a: 'Yes, Pro plan includes a 7-day free trial. No credit card required to start.' },
          { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and crypto payments (BTC, ETH).' },
          { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.' },
        ].map((faq) => (
          <div key={faq.q} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{faq.q}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
