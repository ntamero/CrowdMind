'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Hexagon, Zap, Award, Vote, MessageCircle,
  HelpCircle, Wallet, Rocket, Shield, Map, Gift,
  ChevronDown, ChevronUp, Copy, Check, ExternalLink,
  Target, Star, Flame, TrendingUp, Users, Crown,
  Lock, Globe, ArrowRight, Sparkles, Timer, Link,
  BookOpen, AlertTriangle, CircleDollarSign, Layers,
  Network, Milestone, HandCoins, Scale,
} from 'lucide-react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WSR_CONTRACT || '0x56df3739cc0510151897424CD662060066a4Ab97';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tokenDetails = [
  { label: 'Token Name', value: 'Wisery Token', icon: Coins },
  { label: 'Symbol', value: 'WSR', icon: Hexagon },
  { label: 'Network', value: 'Polygon (Amoy Testnet)', icon: Network },
  { label: 'Decimals', value: '18', icon: Layers },
  { label: 'Total Supply', value: '1,000,000,000 WSR', icon: CircleDollarSign },
];

const earningMethods = [
  {
    icon: HelpCircle,
    title: 'Ask Questions',
    desc: 'Create thoughtful questions for the community to discuss and vote on.',
    reward: '+3 XP per question',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Vote,
    title: 'Cast Votes',
    desc: 'Vote on community questions and polls to shape collective wisdom.',
    reward: '+1 XP per vote',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Leave Comments',
    desc: 'Share your insights, analysis, and perspectives on questions.',
    reward: '+1 XP per comment',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Target,
    title: 'Prediction Accuracy',
    desc: 'Earn bonus rewards when your predictions turn out to be correct.',
    reward: 'Bonus WSR rewards',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Flame,
    title: 'Daily Streaks',
    desc: 'Log in and participate every day to build streaks and earn multipliers.',
    reward: 'Up to 2x XP multiplier',
    color: 'from-red-500 to-orange-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Users,
    title: 'Refer Friends',
    desc: 'Invite others to Wisery and earn a percentage of their early rewards.',
    reward: '10% referral bonus',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-500/10',
  },
];

const useCases = [
  {
    icon: Crown,
    title: 'Premium Questions',
    desc: 'Create featured questions that get priority visibility across the platform.',
    status: 'Live',
  },
  {
    icon: Rocket,
    title: 'Boost Predictions',
    desc: 'Stake WSR to amplify your prediction positions and earn greater returns.',
    status: 'Live',
  },
  {
    icon: HandCoins,
    title: 'Tip Users',
    desc: 'Reward insightful comments and accurate predictors with WSR tips.',
    status: 'Live',
  },
  {
    icon: Scale,
    title: 'Governance Voting',
    desc: 'Use WSR to vote on platform decisions, feature proposals, and community rules.',
    status: 'Coming Soon',
  },
  {
    icon: Gift,
    title: 'Marketplace Purchases',
    desc: 'Spend WSR on exclusive items, badges, profile customizations, and more.',
    status: 'Coming Soon',
  },
  {
    icon: Lock,
    title: 'Staking Rewards',
    desc: 'Lock your WSR tokens to earn passive yields and access premium features.',
    status: 'Coming Soon',
  },
];

const walletSteps = [
  {
    step: 1,
    title: 'Install MetaMask',
    desc: 'Download MetaMask browser extension from metamask.io or the mobile app from your app store. Create a new wallet and securely save your recovery phrase.',
    icon: Wallet,
  },
  {
    step: 2,
    title: 'Add Polygon Network',
    desc: 'Open MetaMask, click the network dropdown, and select "Add Network". Search for Polygon (or Polygon Amoy Testnet for testing) and add it to your wallet.',
    icon: Globe,
  },
  {
    step: 3,
    title: 'Import WSR Token',
    desc: 'In MetaMask on the Polygon network, click "Import Tokens". Paste the WSR contract address below, and the symbol (WSR) and decimals (18) will auto-populate.',
    icon: Coins,
  },
  {
    step: 4,
    title: 'Connect to Wisery',
    desc: 'Navigate to Wisery and click "Connect Wallet" in the top navigation. Approve the connection request in MetaMask to link your wallet.',
    icon: Link,
  },
];

const tokenDistribution = [
  { label: 'Community Rewards', percentage: 30, amount: '300,000,000', color: 'bg-amber-500', desc: 'Voting, predictions, engagement rewards' },
  { label: 'Team & Development', percentage: 30, amount: '300,000,000', color: 'bg-purple-500', desc: 'Core team, advisors, development fund' },
  { label: 'Ecosystem & Partnerships', percentage: 15, amount: '150,000,000', color: 'bg-cyan-500', desc: 'Strategic partnerships, integrations' },
  { label: 'Liquidity Pool', percentage: 15, amount: '150,000,000', color: 'bg-emerald-500', desc: 'DEX liquidity (QuickSwap/Uniswap)' },
  { label: 'Reserve', percentage: 10, amount: '100,000,000', color: 'bg-orange-500', desc: 'Emergency fund, future initiatives' },
];

const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    status: 'current' as const,
    period: 'Q1 2026',
    items: [
      'WSR token deployed on Polygon Amoy Testnet',
      'XP-based earning system live',
      'Vote, comment, and question rewards',
      'Basic wallet integration with MetaMask',
      'Prediction markets with WSR staking',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Growth',
    status: 'upcoming' as const,
    period: 'Q2 2026',
    items: [
      'Migration to Polygon Mainnet',
      'DEX listing on QuickSwap / Uniswap',
      'Liquidity pool creation and LP rewards',
      'Expanded earning mechanisms',
      'Mobile wallet support',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Expansion',
    status: 'upcoming' as const,
    period: 'Q3 2026',
    items: [
      'WSR staking with tiered APY',
      'Full governance DAO launch',
      'Premium feature marketplace',
      'Creator monetization tools',
      'Partnership integrations',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Scale',
    status: 'upcoming' as const,
    period: 'Q4 2026',
    items: [
      'Cross-chain bridge (Ethereum, Base, Arbitrum)',
      'CEX listing applications',
      'Strategic partnerships and grants',
      'Advanced DeFi features',
      'Global community expansion',
    ],
  },
];

const faqs = [
  {
    q: 'What is WSR token?',
    a: 'WSR is the native utility token of the Wisery platform, built on the Polygon blockchain. It powers the prediction market economy, rewards community participation, and enables governance voting.',
  },
  {
    q: 'How do I earn WSR tokens?',
    a: 'You earn XP by asking questions (+3 XP), voting (+1 XP), and commenting (+1 XP). When you accumulate 250 XP, it automatically converts to 1 WSR token. Daily streaks and prediction accuracy provide bonus rewards.',
  },
  {
    q: 'Is WSR available on mainnet?',
    a: 'WSR is currently deployed on the Polygon Amoy Testnet. Mainnet migration is planned for Phase 2 of the roadmap. Testnet tokens will be migrated to mainnet at a 1:1 ratio.',
  },
  {
    q: 'Do I need cryptocurrency to use Wisery?',
    a: 'No! You can start earning WSR for free by participating in the community. You only need a wallet (like MetaMask) to claim and manage your earned tokens.',
  },
  {
    q: 'Can I buy WSR tokens?',
    a: 'Currently, WSR can only be earned through platform participation. After mainnet launch and DEX listing in Phase 2, WSR will be available for trading on decentralized exchanges.',
  },
  {
    q: 'What happens to my XP and WSR if I lose access to my wallet?',
    a: 'Your XP is tied to your Wisery account and is always safe. Unclaimed WSR remains in your Wisery account until you transfer it to a wallet. Always back up your wallet recovery phrase.',
  },
  {
    q: 'Is there a minimum amount to withdraw WSR?',
    a: 'Yes, the minimum withdrawal is 10 WSR. This ensures gas fees do not consume a disproportionate amount of your tokens. Gas fees on Polygon are typically under $0.01.',
  },
  {
    q: 'How does the 250 XP to 1 WSR conversion work?',
    a: 'XP accumulates from your activities. Once you reach 250 XP, the system automatically converts it to 1 WSR and credits your in-platform balance. You can then transfer WSR to your connected wallet at any time.',
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1.5 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className="border border-zinc-800 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <span className="font-medium text-zinc-100 pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-zinc-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TokenPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-8 shadow-lg shadow-amber-500/20"
          >
            <Coins className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              WSR Token
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8"
          >
            The utility token powering the Wisery prediction and
            collective intelligence platform on Polygon.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
              <Hexagon className="w-4 h-4" /> Polygon Network
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <Shield className="w-4 h-4" /> Verified Contract
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
              <Zap className="w-4 h-4" /> Low Gas Fees
            </span>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-24">

        {/* What is WSR Token */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" /> Overview
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              What is WSR Token?
            </h2>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-10"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-zinc-300 leading-relaxed text-lg">
                  WSR is the native utility token of the Wisery platform &mdash; a
                  collective intelligence ecosystem where communities predict outcomes,
                  share insights, and earn rewards for accurate forecasting.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  Built on the Polygon blockchain for fast, low-cost transactions,
                  WSR powers the entire Wisery economy. Earn tokens through
                  participation, stake them on predictions, tip insightful contributors,
                  and vote on governance proposals that shape the platform.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  The XP-to-WSR conversion system ensures fair distribution: every question
                  asked, vote cast, and comment made earns experience points that convert
                  into real tokens at a rate of 250 XP = 1 WSR.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Earn', icon: Award, desc: 'Participate and earn XP that converts to WSR', color: 'text-amber-400' },
                  { label: 'Predict', icon: Target, desc: 'Stake WSR on outcomes for multiplied returns', color: 'text-purple-400' },
                  { label: 'Govern', icon: Scale, desc: 'Vote on platform decisions with your tokens', color: 'text-cyan-400' },
                  { label: 'Grow', icon: TrendingUp, desc: 'Stake tokens for passive yield and benefits', color: 'text-emerald-400' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-center"
                  >
                    <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                    <h4 className="font-semibold text-zinc-100 mb-1">{item.label}</h4>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Token Details */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <Hexagon className="w-4 h-4" /> Specifications
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Token Details
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokenDetails.map((detail) => (
              <motion.div
                key={detail.label}
                variants={fadeUp}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <detail.icon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">{detail.label}</p>
                  <p className="text-zinc-100 font-semibold truncate">{detail.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Contract Address */}
          <motion.div
            variants={fadeUp}
            className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
          >
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Contract Address</p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-amber-400 font-mono text-sm break-all">{CONTRACT_ADDRESS}</code>
              <CopyButton text={CONTRACT_ADDRESS} />
              <a
                href={`https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 transition-colors"
                title="View on PolygonScan"
              >
                <ExternalLink className="w-4 h-4 text-zinc-400" />
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* Token Distribution */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              Token Distribution
            </h2>
          </motion.div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            {/* Visual bar */}
            <div className="flex h-4 rounded-full overflow-hidden mb-6">
              {tokenDistribution.map((d) => (
                <div
                  key={d.label}
                  className={`${d.color} transition-all`}
                  style={{ width: `${d.percentage}%` }}
                  title={`${d.label}: ${d.percentage}%`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tokenDistribution.map((d) => (
                <motion.div
                  key={d.label}
                  variants={fadeUp}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50"
                >
                  <div className={`w-3 h-3 rounded-full ${d.color} mt-1 shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-100">{d.label}</p>
                      <span className="text-xs font-bold text-amber-400">{d.percentage}%</span>
                    </div>
                    <p className="text-xs text-zinc-400">{d.amount} WSR</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How to Earn WSR */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Award className="w-4 h-4" /> Earn
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              How to Earn WSR
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Every interaction on Wisery earns you XP. Accumulate 250 XP to receive 1 WSR token automatically.
            </p>
          </motion.div>

          {/* XP Conversion Banner */}
          <motion.div
            variants={fadeUp}
            className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">250 XP</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Experience Points</p>
              </div>
              <ArrowRight className="w-6 h-6 text-zinc-600" />
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">1 WSR</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Token</p>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earningMethods.map((method) => (
              <motion.div
                key={method.title}
                variants={fadeUp}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/80 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center mb-4`}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{method.title}</h3>
                <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{method.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> {method.reward}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How to Use WSR */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /> Utility
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              How to Use WSR
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              WSR unlocks premium features and powers the Wisery ecosystem.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/80 transition-colors relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      item.status === 'Live'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Wallet Setup */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
              <Wallet className="w-4 h-4" /> Setup
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Wallet Setup Guide
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Get set up in minutes to start earning and managing your WSR tokens.
            </p>
          </motion.div>
          <div className="space-y-4">
            {walletSteps.map((step) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex gap-5 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg shadow-amber-500/10">
                  {step.step}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <step.icon className="w-4 h-4 text-amber-400" />
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                  {step.step === 3 && (
                    <div className="mt-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Contract Address to Import</p>
                      <div className="flex items-center gap-2">
                        <code className="text-amber-400 font-mono text-xs break-all">{CONTRACT_ADDRESS}</code>
                        <CopyButton text={CONTRACT_ADDRESS} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Token Roadmap */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
              <Map className="w-4 h-4" /> Roadmap
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Token Roadmap
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Our phased approach to building the WSR ecosystem from testnet to global scale.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {roadmapPhases.map((phase) => (
              <motion.div
                key={phase.phase}
                variants={fadeUp}
                className={`bg-zinc-900/50 border rounded-xl p-6 ${
                  phase.status === 'current'
                    ? 'border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{phase.phase}</span>
                    <h3 className="text-xl font-bold text-zinc-100">{phase.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500">{phase.period}</span>
                    <div className="mt-1">
                      {phase.status === 'current' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <Flame className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                          <Timer className="w-3 h-3" /> Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        phase.status === 'current' ? 'bg-amber-400' : 'bg-zinc-600'
                      }`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" /> FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.section>

        {/* Disclaimer */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-3">Disclaimer</h3>
                <div className="space-y-2 text-sm text-zinc-400 leading-relaxed">
                  <p>
                    This page is for informational purposes only and does not constitute financial,
                    investment, legal, or tax advice. WSR tokens are currently deployed on the Polygon
                    Amoy Testnet and have no monetary value.
                  </p>
                  <p>
                    Testnet tokens are intended for platform testing and community participation.
                    There is no guarantee that testnet tokens will retain value upon mainnet migration.
                    Cryptocurrency and blockchain technologies involve significant risks.
                  </p>
                  <p>
                    Always do your own research (DYOR) before interacting with any blockchain
                    tokens or smart contracts. Never invest more than you can afford to lose.
                    Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}