'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Vote, Coins, Wallet, ShieldCheck,
  MessageSquare, Trophy, Users, Clock, Target,
} from 'lucide-react';

const ruleSections = [
  {
    title: '1. Voting Rules',
    icon: Vote,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    description: 'Voting is the core mechanic of Wisery. These rules ensure fair and meaningful participation.',
    rules: [
      {
        rule: 'One Vote Per Question',
        detail: 'Each user is permitted exactly one (1) vote per question. Votes are final and cannot be changed, retracted, or reassigned once submitted.',
      },
      {
        rule: 'No Self-Voting',
        detail: 'You cannot vote on questions that you have created. This prevents creators from biasing the results of their own questions.',
      },
      {
        rule: 'Vote Expiry',
        detail: 'Questions have a defined voting window set by the creator (default: 7 days, maximum: 30 days). Once the voting window closes, no further votes may be cast. Votes submitted before the deadline are counted in the final tally.',
      },
      {
        rule: 'Vote Authenticity',
        detail: 'All votes must represent your genuine opinion or best assessment. Voting with the intent to manipulate outcomes, earn XP fraudulently, or game the system is prohibited.',
      },
      {
        rule: 'Anonymous Voting',
        detail: 'Individual votes are anonymous to other users. Only aggregated results are displayed publicly. Your voting history is visible only to you in your profile.',
      },
      {
        rule: 'Minimum Account Age',
        detail: 'New accounts must be at least 24 hours old before they can cast votes. This helps prevent spam and manipulation through freshly created accounts.',
      },
    ],
  },
  {
    title: '2. Earning System',
    icon: Coins,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    description: 'Wisery rewards active participation through an XP (Experience Points) and WSR token system.',
    rules: [
      {
        rule: 'Question Creation: 3 XP',
        detail: 'You earn 3 XP for each question you create that passes quality review. Questions flagged as low-quality, spam, or duplicate do not earn XP.',
      },
      {
        rule: 'Voting: 1 XP',
        detail: 'You earn 1 XP for each vote you cast. XP is awarded immediately upon vote submission. You must vote within the question\'s active voting window.',
      },
      {
        rule: 'Commenting: 1 XP',
        detail: 'You earn 1 XP for each comment you leave on a question. Only the first 5 comments per question earn XP. Comments must be substantive (minimum 10 characters).',
      },
      {
        rule: 'WSR Token Conversion: 250 XP = 1 WSR',
        detail: 'When you accumulate 250 XP, you may convert them to 1 WSR token. Conversion is one-way: WSR tokens cannot be converted back to XP. Conversion rates are subject to change with advance notice.',
      },
      {
        rule: 'Daily XP Cap',
        detail: 'There is a daily cap of 100 XP per user to prevent gaming and ensure fair distribution. Daily tasks and achievements may award bonus XP that does not count toward this cap.',
      },
      {
        rule: 'Streak Bonuses',
        detail: 'Consecutive daily logins earn streak bonuses: 3-day streak = +5 XP, 7-day streak = +15 XP, 30-day streak = +50 XP. Streaks reset if you miss a day.',
      },
      {
        rule: 'No XP for Removed Content',
        detail: 'If your question or comment is removed by moderators for violating Community Guidelines, any XP earned from that content will be deducted from your balance.',
      },
    ],
  },
  {
    title: '3. Wallet Requirements',
    icon: Wallet,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    description: 'WSR token transactions require a connected blockchain wallet.',
    rules: [
      {
        rule: 'Wallet Connection',
        detail: 'You must connect a compatible Web3 wallet (such as MetaMask, WalletConnect, or Coinbase Wallet) to receive, hold, and transfer WSR tokens. XP accumulation does not require a wallet.',
      },
      {
        rule: 'Polygon Network',
        detail: 'WSR tokens operate on the Polygon network (currently testnet). You must configure your wallet for the correct Polygon network to interact with WSR tokens.',
      },
      {
        rule: 'One Wallet Per Account',
        detail: 'Each Wisery account may be linked to one (1) wallet address at a time. You may change your linked wallet, but there is a 7-day cooldown period between wallet changes.',
      },
      {
        rule: 'Gas Fees',
        detail: 'Blockchain transactions may require gas fees paid in MATIC (Polygon\'s native token). Wisery does not cover gas fees. On testnet, test MATIC is available through public faucets.',
      },
      {
        rule: 'Wallet Security',
        detail: 'You are solely responsible for the security of your wallet, including seed phrases and private keys. Wisery will never ask for your private keys or seed phrase. Lost wallets cannot be recovered by Wisery.',
      },
    ],
  },
  {
    title: '4. Security Requirements',
    icon: ShieldCheck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    description: 'Security is mandatory on Wisery to protect users and maintain platform integrity.',
    rules: [
      {
        rule: 'Two-Factor Authentication (2FA) Mandatory',
        detail: 'All users must enable two-factor authentication within 48 hours of account creation. Accounts without 2FA will have restricted access: no WSR transactions, no prediction market participation, and reduced daily XP cap.',
      },
      {
        rule: 'Supported 2FA Methods',
        detail: 'We support authenticator apps (Google Authenticator, Authy, etc.) and email-based verification codes. SMS-based 2FA is not offered due to SIM-swap vulnerabilities.',
      },
      {
        rule: 'Session Management',
        detail: 'Active sessions expire after 24 hours of inactivity. You may have up to 3 concurrent sessions across different devices. You can view and terminate active sessions from your security settings.',
      },
      {
        rule: 'Suspicious Activity',
        detail: 'Accounts exhibiting suspicious activity (rapid login attempts, unusual location changes, abnormal voting patterns) may be temporarily locked for investigation. You will be notified via email if your account is locked.',
      },
    ],
  },
  {
    title: '5. Question Creation Rules',
    icon: MessageSquare,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    description: 'Creating high-quality questions is essential to the Wisery ecosystem.',
    rules: [
      {
        rule: 'Daily Question Limit',
        detail: 'Standard users may create up to 5 questions per day. Premium users may create up to 15 questions per day. This limit resets at midnight UTC.',
      },
      {
        rule: 'Question Formatting',
        detail: 'Questions must include: a clear title (10-200 characters), a description providing context (optional but recommended, up to 2000 characters), at least 2 and up to 8 answer options, appropriate category tags, and a voting deadline.',
      },
      {
        rule: 'Prediction Market Questions',
        detail: 'Prediction market questions require: a clearly defined resolution criteria, a resolution date, an initial WSR stake (minimum 10 WSR), and binary (Yes/No) or multiple-choice outcomes that are objectively verifiable.',
      },
      {
        rule: 'Content Review',
        detail: 'All questions are subject to automated and manual review. Questions that violate Community Guidelines, are duplicates, or are deemed low-quality may be removed. You will be notified with a reason if your question is removed.',
      },
      {
        rule: 'Edit Window',
        detail: 'Questions may be edited within 15 minutes of creation, provided no votes have been cast. After votes are cast or the edit window closes, questions cannot be modified.',
      },
    ],
  },
  {
    title: '6. Prediction Market Resolution',
    icon: Target,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    description: 'Prediction markets follow strict resolution rules to ensure fairness.',
    rules: [
      {
        rule: 'Resolution Process',
        detail: 'Prediction markets are resolved based on the outcome criteria defined at creation. Resolution occurs within 48 hours of the resolution date. Markets may be resolved early if the outcome becomes definitively known.',
      },
      {
        rule: 'Resolution Sources',
        detail: 'Outcomes are verified using reputable, publicly accessible sources. The specific sources used for resolution are documented and disclosed when the market is resolved.',
      },
      {
        rule: 'Disputed Resolutions',
        detail: 'Users may dispute a market resolution within 72 hours by submitting evidence to disputes@wisery.live. Disputed markets are reviewed by a resolution committee. If the dispute is upheld, the market is re-resolved or voided.',
      },
      {
        rule: 'Voided Markets',
        detail: 'Markets may be voided if: resolution criteria are ambiguous, the outcome cannot be verified, evidence of manipulation is found, or force majeure events prevent fair resolution. In voided markets, all staked WSR tokens are returned to participants.',
      },
      {
        rule: 'Payout Distribution',
        detail: 'Winners receive their share of the prize pool proportional to their stake and the odds at the time of their prediction. A 2% platform fee is deducted from winnings. Payouts are processed within 24 hours of resolution.',
      },
    ],
  },
  {
    title: '7. Leaderboard and Ranking',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    description: 'The leaderboard recognizes top contributors to the Wisery community.',
    rules: [
      {
        rule: 'Ranking Criteria',
        detail: 'Leaderboard rankings are based on a composite score that includes: total XP earned, prediction accuracy rate, question quality score (based on engagement), community reputation, and WSR tokens earned through predictions.',
      },
      {
        rule: 'Leaderboard Periods',
        detail: 'Leaderboards are maintained for three time periods: Weekly (resets every Monday at 00:00 UTC), Monthly (resets on the 1st of each month at 00:00 UTC), and All-Time (cumulative from account creation).',
      },
      {
        rule: 'Leaderboard Rewards',
        detail: 'Top 10 weekly performers receive bonus WSR tokens. Top 3 monthly performers receive special badges and additional WSR rewards. All-time leaders receive exclusive platform perks.',
      },
      {
        rule: 'Fair Play',
        detail: 'Accounts found to be gaming the leaderboard through manipulation, multi-accounting, or other fraudulent means will be removed from the leaderboard and may face account suspension.',
      },
    ],
  },
  {
    title: '8. Referral Program',
    icon: Users,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    description: 'Grow the Wisery community and earn rewards through referrals.',
    rules: [
      {
        rule: 'Referral Link',
        detail: 'Each user receives a unique referral link accessible from their profile. Share this link to invite new users to the Platform.',
      },
      {
        rule: 'Referral Rewards',
        detail: 'You earn 10% of your referral\'s XP earnings for their first 30 days on the Platform (up to a maximum of 500 bonus XP per referral). The referred user receives a 50 XP welcome bonus.',
      },
      {
        rule: 'Referral Limits',
        detail: 'There is no limit to the number of users you can refer. However, referral rewards are capped at 5,000 bonus XP per month to prevent abuse.',
      },
      {
        rule: 'Qualifying Referrals',
        detail: 'A referral is considered valid when the referred user: creates an account using your referral link, verifies their email address, enables 2FA, and casts at least 3 votes within their first 7 days.',
      },
      {
        rule: 'Prohibited Referral Practices',
        detail: 'Self-referrals (referring your own alternate accounts), spam distribution of referral links, paid referral schemes, and misleading referral marketing are prohibited and will result in forfeiture of all referral rewards and possible account suspension.',
      },
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-amber-400"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
            <BookOpen className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Platform Rules</h1>
            <p className="text-sm text-zinc-400">Last updated: March 19, 2026</p>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          These rules govern how Wisery works. They define the mechanics of voting, earning,
          predictions, and community participation. Understanding these rules will help you make the
          most of your Wisery experience.
        </p>
      </motion.div>

      {/* Quick Reference Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6"
      >
        <h2 className="mb-4 text-lg font-semibold text-amber-400">Quick Reference</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Create Question', value: '+3 XP', icon: MessageSquare },
            { label: 'Cast Vote', value: '+1 XP', icon: Vote },
            { label: 'Leave Comment', value: '+1 XP', icon: Clock },
            { label: 'WSR Conversion', value: '250 XP', icon: Coins },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
                <Icon size={18} className="mx-auto mb-1.5 text-amber-400" />
                <p className="text-xs text-zinc-400">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Rule Sections */}
      <div className="space-y-8">
        {ruleSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${section.bg}`}>
                  <Icon className={section.color} size={18} />
                </div>
                <h2 className="text-xl font-semibold text-amber-400">{section.title}</h2>
              </div>
              <p className="mb-5 text-sm text-zinc-400">{section.description}</p>

              <div className="space-y-3">
                {section.rules.map((item, rIndex) => (
                  <div
                    key={rIndex}
                    className="rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-4"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-medium text-amber-400">
                        {rIndex + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-200">{item.rule}</h3>
                    </div>
                    <p className="ml-7 text-sm leading-relaxed text-zinc-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
      >
        <p className="text-sm text-zinc-400">
          These rules are subject to change as the Platform evolves. Major rule changes will be
          announced in advance through Platform notifications and email.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link href="/terms" className="text-amber-400 hover:text-amber-300 transition-colors">
            Terms of Service
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/guidelines" className="text-amber-400 hover:text-amber-300 transition-colors">
            Community Guidelines
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/disclaimer" className="text-amber-400 hover:text-amber-300 transition-colors">
            Token Disclaimer
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
