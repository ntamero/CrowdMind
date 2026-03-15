'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Crown, Zap, Building2, Sparkles, ArrowRight,
  Shield, Star, CreditCard, CheckCircle, X,
} from 'lucide-react';
import { mockPricingPlans } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [showConfirm, setShowConfirm] = useState(false);

  const yearlyDiscount = 0.2; // 20% off for yearly

  const getPrice = (plan: typeof mockPricingPlans[0]) => {
    if (plan.price === 0) return 0;
    return billingPeriod === 'yearly'
      ? +(plan.price * (1 - yearlyDiscount) * 12).toFixed(2)
      : plan.price;
  };

  const getMonthlyPrice = (plan: typeof mockPricingPlans[0]) => {
    if (plan.price === 0) return 0;
    return billingPeriod === 'yearly'
      ? +(plan.price * (1 - yearlyDiscount)).toFixed(2)
      : plan.price;
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    }
    setShowConfirm(false);
    setSelectedPlan(null);
  };

  return (
    <div className="mx-auto max-w-[1000px] py-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
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

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <div className="flex items-center gap-1 bg-card/50 border border-border/30 rounded-xl p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'px-5 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-0',
              billingPeriod === 'monthly'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'px-5 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-0 flex items-center gap-2',
              billingPeriod === 'yearly'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yearly
            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[9px] px-1.5 py-0">-20%</Badge>
          </button>
        </div>
      </motion.div>

      {/* Current Plan Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center mb-6"
      >
        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 gap-1.5 text-[12px] px-3 py-1">
          <CheckCircle size={13} /> Current plan: <span className="font-bold capitalize">{currentPlan}</span>
        </Badge>
      </motion.div>

      {/* Plans */}
      <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {mockPricingPlans.map((plan, index) => {
          const icons: Record<string, React.ReactNode> = {
            free: <Zap size={28} className="text-slate-500" />,
            pro: <Crown size={28} className="text-amber-500" />,
            enterprise: <Building2 size={28} className="text-indigo-500" />,
          };
          const isCurrentPlan = currentPlan === plan.id;
          const monthlyPrice = getMonthlyPrice(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative rounded-xl border bg-card/50 p-8 transition-all',
                plan.highlighted
                  ? 'scale-[1.03] border-2 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'border-border/30',
                isCurrentPlan && 'ring-2 ring-indigo-500/40',
              )}
            >
              {plan.badge && (
                <div
                  className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white',
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  )}
                >
                  {plan.badge}
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-indigo-600 text-white border-0 text-[10px] gap-1">
                    <CheckCircle size={10} /> Active
                  </Badge>
                </div>
              )}

              <div className="mb-6 text-center">
                <div
                  className={cn(
                    'mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl',
                    plan.highlighted ? 'bg-amber-500/10' : 'bg-card'
                  )}
                >
                  {icons[plan.id]}
                </div>
                <h3 className="mb-2 text-[22px] font-extrabold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span
                    className={cn(
                      'text-[42px] font-black',
                      plan.highlighted ? 'text-amber-400' : 'text-foreground'
                    )}
                  >
                    ${monthlyPrice}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                {billingPeriod === 'yearly' && plan.price > 0 && (
                  <div className="mt-1">
                    <span className="text-[12px] text-muted-foreground line-through mr-2">
                      ${(plan.price * 12).toFixed(2)}/yr
                    </span>
                    <span className="text-[12px] text-emerald-400 font-bold">
                      ${getPrice(plan).toFixed(2)}/yr
                    </span>
                  </div>
                )}

                {/* Reward multiplier */}
                <div className="mt-3 flex justify-center">
                  <Badge className={cn(
                    'text-[10px] border-0 gap-1',
                    plan.id === 'free' ? 'bg-slate-500/10 text-slate-400' :
                    plan.id === 'pro' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-indigo-500/10 text-indigo-400'
                  )}>
                    <Sparkles size={10} />
                    {plan.id === 'free' ? '1x' : plan.id === 'pro' ? '2x' : '3x'} Earn Rewards
                  </Badge>
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

              {isCurrentPlan ? (
                <Button
                  variant="outline"
                  className="flex h-12 w-full items-center justify-center gap-2 text-[15px] border-indigo-500/30 text-indigo-400"
                  disabled
                >
                  <CheckCircle size={18} /> Current Plan
                </Button>
              ) : plan.highlighted ? (
                <Button
                  className="flex h-12 w-full items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 text-[15px] font-semibold text-white hover:from-amber-600 hover:to-red-600 shadow-lg shadow-amber-500/20"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  <CreditCard size={18} /> Upgrade Now <ArrowRight size={18} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex h-12 w-full items-center justify-center gap-2 text-[15px]"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.price === 0 ? 'Downgrade' : 'Upgrade Now'}
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
          <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
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
          { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and crypto payments (BTC, ETH) via Base chain.' },
          { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.' },
          { q: 'How do earn rewards work?', a: 'Free users earn 1x rewards, Pro users earn 2x, and Premium users earn 3x rewards from their questions and predictions.' },
        ].map((faq) => (
          <div key={faq.q} className="mb-4 border-b border-border pb-4 last:mb-0 last:border-b-0 last:pb-0">
            <div className="mb-1.5 text-[15px] font-semibold text-foreground">{faq.q}</div>
            <div className="text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Confirmation Modal ── */}
      <AnimatePresence>
        {showConfirm && selectedPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw] bg-[#141420] border border-border/50 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Confirm Plan Change</h3>
                <button onClick={() => setShowConfirm(false)} className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center cursor-pointer border-0">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="bg-secondary/20 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Switching to</p>
                    <p className="text-xl font-black capitalize">{selectedPlan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-400">
                      ${getMonthlyPrice(mockPricingPlans.find(p => p.id === selectedPlan)!)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">per month</p>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
                {selectedPlan === 'free'
                  ? 'You will be downgraded to the Free plan. Your premium features will remain active until the end of the current billing period.'
                  : `You will be upgraded to the ${selectedPlan} plan. Your new features will be available immediately.`
                }
              </p>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 h-11 font-bold"
                  onClick={handleConfirm}
                >
                  <CheckCircle size={16} /> Confirm
                </Button>
                <Button variant="outline" className="h-11 px-6" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
