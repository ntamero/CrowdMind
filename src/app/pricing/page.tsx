'use client';

import { motion } from 'framer-motion';
import { Check, Crown, Zap, Building2, Sparkles, ArrowRight, Shield, Star } from 'lucide-react';
import { mockPricingPlans } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1000px] py-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12 text-center"
      >
        <Badge className="mb-5 gap-1.5 border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[13px] font-semibold text-amber-400">
          <Crown size={14} /> Premium Plans
        </Badge>
        <h1 className="mb-3 text-[42px] font-black leading-tight tracking-tight text-foreground">
          Unlock{' '}
          <span className="bg-gradient-to-br from-amber-500 to-red-500 bg-clip-text text-transparent">
            Full Power
          </span>
        </h1>
        <p className="mx-auto max-w-[500px] text-[17px] text-muted-foreground">
          Get deeper AI insights, unlimited questions, and premium analytics to make better decisions.
        </p>
      </motion.div>

      {/* Plans */}
      <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {mockPricingPlans.map((plan, index) => {
          const icons: Record<string, React.ReactNode> = {
            free: <Zap size={28} className="text-slate-500" />,
            pro: <Crown size={28} className="text-amber-500" />,
            enterprise: <Building2 size={28} className="text-indigo-500" />,
          };
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-xl border bg-card/50 p-8 ${
                plan.highlighted
                  ? 'scale-[1.03] border-2 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'border-border/30'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 text-center">
                <div
                  className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    plan.highlighted ? 'bg-amber-500/10' : 'bg-card'
                  }`}
                >
                  {icons[plan.id]}
                </div>
                <h3 className="mb-2 text-[22px] font-extrabold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span
                    className={`text-[42px] font-black ${
                      plan.highlighted ? 'text-amber-400' : 'text-foreground'
                    }`}
                  >
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
              </div>

              <div className="mb-7 flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={plan.highlighted ? 'text-amber-500' : 'text-emerald-500'}
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.highlighted ? (
                <Button
                  className="flex h-12 w-full items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 text-[15px] font-semibold text-white hover:from-amber-600 hover:to-red-600"
                >
                  Upgrade Now
                  <ArrowRight size={18} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex h-12 w-full items-center justify-center gap-2 text-[15px]"
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Upgrade Now'}
                  <ArrowRight size={18} />
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 flex flex-wrap justify-center gap-8"
      >
        {[
          { icon: <Shield size={18} className="text-emerald-500" />, text: 'Secure payments' },
          { icon: <Star size={18} className="text-amber-500" />, text: '7-day free trial' },
          { icon: <Sparkles size={18} className="text-indigo-500" />, text: 'Cancel anytime' },
        ].map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            {item.icon} {item.text}
          </div>
        ))}
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto max-w-[700px] rounded-xl border border-border/30 bg-card/50 p-8"
      >
        <h3 className="mb-5 text-center text-[22px] font-bold text-foreground">
          Frequently Asked Questions
        </h3>
        {[
          { q: 'Can I cancel my subscription anytime?', a: 'Yes! You can cancel anytime. Your premium features will remain active until the end of your billing period.' },
          { q: 'Is there a free trial?', a: 'Yes, Pro plan includes a 7-day free trial. No credit card required to start.' },
          { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and crypto payments (BTC, ETH).' },
          { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.' },
        ].map((faq) => (
          <div key={faq.q} className="mb-4 border-b border-border pb-4 last:mb-0 last:border-b-0 last:pb-0">
            <div className="mb-1.5 text-[15px] font-semibold text-foreground">{faq.q}</div>
            <div className="text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
