'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Timer, Zap, ArrowUp, ArrowDown,
  RefreshCw, Activity, Circle, ChevronRight, X,
  DollarSign, Target, Award, BarChart3,
} from 'lucide-react';

interface QuickMarket {
  id: string;
  asset: string;
  name: string;
  symbol: string;
  duration: number;
  startPrice: number;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  remaining: number;
  remainingFormatted: string;
  progress: number;
  status: string;
  result?: string;
  totalUp: number;
  totalDown: number;
  totalBets: number;
  upPercent: number;
  downPercent: number;
  upCents: number;
  downCents: number;
  priceHistory: number[];
  upReturn: string;
  downReturn: string;
}

const ASSET_ICONS: Record<string, string> = { BTC: '₿', ETH: 'Ξ', SOL: '◎', POL: '⬡' };

const ASSET_COLORS: Record<string, { border: string; bg: string }> = {
  BTC: { border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  ETH: { border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  SOL: { border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
  POL: { border: 'border-violet-500/30', bg: 'bg-violet-500/5' },
};

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

// Mini Sparkline SVG
function MiniSparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Countdown with red transition
function CountdownTimer({ remaining }: { remaining: number }) {
  const [time, setTime] = useState(remaining);

  useEffect(() => {
    setTime(remaining);
    const interval = setInterval(() => setTime(t => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const mins = Math.floor(time / 60000);
  const secs = Math.floor((time % 60000) / 1000);
  const isUrgent = time < 60000;
  const isCritical = time < 30000;

  return (
    <span className={`font-mono text-sm font-bold transition-colors ${
      isCritical ? 'text-red-500 animate-pulse' : isUrgent ? 'text-orange-400' : 'text-foreground'
    }`}>
      {mins}:{String(secs).padStart(2, '0')}
    </span>
  );
}

// Market Card with all improvements
function MarketCard({ market, onBet, activeBets, onOpenSlip }: {
  market: QuickMarket;
  onBet: (asset: string, duration: number, side: 'up' | 'down') => void;
  activeBets: Set<string>;
  onOpenSlip: (market: QuickMarket, side: 'up' | 'down') => void;
}) {
  const colors = ASSET_COLORS[market.asset] || ASSET_COLORS.BTC;
  const isUp = market.priceChange >= 0;
  const hasBet = activeBets.has(market.id);
  const isActive = market.status === 'active' && market.remaining > 30000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 hover:border-opacity-60 transition-all`}
    >
      {/* Header — clickable to open detail page */}
      <Link href={`/markets/${market.id}`} className="flex items-center justify-between mb-2 cursor-pointer no-underline text-foreground">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{ASSET_ICONS[market.asset]}</span>
          <div>
            <div className="font-bold text-sm">{market.symbol}/USD</div>
            <div className="text-[10px] text-muted-foreground">{market.duration}min</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight size={13} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
          <div className="flex items-center gap-1.5">
            <Timer size={12} className="text-muted-foreground" />
            <CountdownTimer remaining={market.remaining} />
          </div>
        </div>
      </Link>

      {/* Price + Sparkline */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-lg font-bold font-mono">{'$'}{formatPrice(market.currentPrice)}</div>
          <div className={`flex items-center gap-1 text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isUp ? '+' : ''}{market.priceChangePercent.toFixed(3)}%</span>
          </div>
        </div>
        <MiniSparkline data={market.priceHistory} isUp={isUp} />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary/50 rounded-full mb-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${market.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Live betting stats */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Up</span>
          {market.totalBets > 0 ? (
            <span className="text-xs font-bold text-emerald-400">{market.upCents}¢</span>
          ) : (
            <span className="text-xs text-muted-foreground/50">-</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {market.totalBets > 0 ? (
            <>
              <span>{market.totalBets} bets</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-bold text-amber-400">{(market as any).totalVolume || (market.totalUp + market.totalDown)} XP</span>
            </>
          ) : (
            <span className="text-muted-foreground/50">No bets yet</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {market.totalBets > 0 ? (
            <span className="text-xs font-bold text-red-400">{market.downCents}¢</span>
          ) : (
            <span className="text-xs text-muted-foreground/50">-</span>
          )}
          <span className="text-xs text-muted-foreground">Down</span>
          <div className="w-2 h-2 rounded-full bg-red-500" />
        </div>
      </div>

      {/* Bet distribution bar — only show when bets exist */}
      {market.totalBets > 0 ? (
        <div className="flex gap-0.5 mb-3">
          <div className="h-1.5 rounded-l-full bg-emerald-500 transition-all" style={{ width: `${market.upPercent}%` }} />
          <div className="h-1.5 rounded-r-full bg-red-500 transition-all" style={{ width: `${market.downPercent}%` }} />
        </div>
      ) : (
        <div className="h-1.5 rounded-full bg-secondary/30 mb-3" />
      )}

      {/* Bet buttons */}
      {market.status === 'active' ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => isActive && !hasBet ? onOpenSlip(market, 'up') : null}
            disabled={hasBet || !isActive}
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <div className="flex items-center gap-1">
              <ArrowUp size={14} />
              UP {market.upCents}¢
            </div>
            <span className="text-[9px] font-normal text-emerald-400/60">{market.upReturn}x return</span>
          </button>
          <button
            onClick={() => isActive && !hasBet ? onOpenSlip(market, 'down') : null}
            disabled={hasBet || !isActive}
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <div className="flex items-center gap-1">
              <ArrowDown size={14} />
              DOWN {market.downCents}¢
            </div>
            <span className="text-[9px] font-normal text-red-400/60">{market.downReturn}x return</span>
          </button>
        </div>
      ) : (
        <div className={`text-center py-2 rounded-lg text-xs font-bold ${
          market.result === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          Resolved: {market.result?.toUpperCase()} {isUp ? '📈' : '📉'}
        </div>
      )}

      {hasBet && (
        <div className="text-center text-[10px] text-amber-400 mt-2 font-medium">
          Bet placed +1 XP
        </div>
      )}
    </motion.div>
  );
}

// Order Slip Panel (right side)
function OrderSlip({ market, side, onClose, onConfirm }: {
  market: QuickMarket;
  side: 'up' | 'down';
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [betAmount, setBetAmount] = useState(1);
  const isUp = side === 'up';
  const cents = isUp ? market.upCents : market.downCents;
  const potentialReturn = betAmount * parseFloat(isUp ? market.upReturn : market.downReturn);
  const profit = potentialReturn - betAmount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl border border-border/40 bg-[#0e0e1a] p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ASSET_ICONS[market.asset]}</span>
          <div>
            <div className="text-sm font-bold">{market.symbol} {market.duration}min</div>
            <div className="text-[10px] text-muted-foreground">Place your prediction</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary/50">
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Side selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={`py-2 rounded-lg text-center text-sm font-bold border ${
          isUp ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-secondary/20 border-border/30 text-muted-foreground'
        }`}>
          UP {market.upCents}¢
        </div>
        <div className={`py-2 rounded-lg text-center text-sm font-bold border ${
          !isUp ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-secondary/20 border-border/30 text-muted-foreground'
        }`}>
          DOWN {market.downCents}¢
        </div>
      </div>

      {/* Amount */}
      <div className="mb-3">
        <label className="text-[11px] text-muted-foreground mb-1 block">Bet Amount (XP)</label>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 border border-border/30">
          <DollarSign size={14} className="text-muted-foreground" />
          <input
            type="number"
            value={betAmount}
            onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={10}
            className="flex-1 bg-transparent text-sm font-bold outline-none"
          />
          <span className="text-[10px] text-muted-foreground">XP</span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[1, 2, 5, 10].map(amt => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`flex-1 py-1 rounded text-[11px] font-medium border transition-all ${
                betAmount === amt
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-secondary/20 border-border/30 text-muted-foreground hover:bg-secondary/40'
              }`}
            >
              {amt} XP
            </button>
          ))}
        </div>
      </div>

      {/* Order details */}
      <div className="space-y-2 mb-4 p-3 rounded-lg bg-secondary/10 border border-border/20">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Price</span>
          <span className="font-medium">{cents}¢</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Potential Return</span>
          <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {potentialReturn.toFixed(1)} XP ({isUp ? market.upReturn : market.downReturn}x)
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Profit if correct</span>
          <span className="font-bold text-amber-400">+{profit.toFixed(1)} XP</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Time remaining</span>
          <CountdownTimer remaining={market.remaining} />
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
          isUp
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isUp ? '📈' : '📉'} Bet {betAmount} XP on {side.toUpperCase()}
      </button>

      <p className="text-[9px] text-muted-foreground text-center mt-2">
        Market resolves automatically when timer ends
      </p>
    </motion.div>
  );
}

export default function QuickMarketsPage() {
  const [markets, setMarkets] = useState<QuickMarket[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeBets, setActiveBets] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | '5' | '15'>('all');
  const [error, setError] = useState('');
  const [orderSlip, setOrderSlip] = useState<{ market: QuickMarket; side: 'up' | 'down' } | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch('/api/markets/quick?asset=BTC&duration=5');
      const data = await res.json();
      if (data.allMarkets) setMarkets(data.allMarkets);
      if (data.prices) setPrices(data.prices);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 5000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  const handleBet = async (asset: string, duration: number, side: 'up' | 'down') => {
    setError('');
    try {
      const res = await fetch('/api/markets/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, duration, side }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place bet');
        return;
      }
      setActiveBets(prev => new Set([...prev, data.market]));
      setOrderSlip(null);
      fetchMarkets();
    } catch {
      setError('Failed to place bet');
    }
  };

  const filteredMarkets = filter === 'all'
    ? markets
    : markets.filter(m => m.duration === parseInt(filter));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-amber-400" />
            <h1 className="text-xl font-bold">Quick Markets</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Predict price movement. Earn XP for correct predictions.
          </p>
        </div>
        <button
          onClick={fetchMarkets}
          className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Live prices ticker */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {Object.entries(prices).map(([asset, price]) => (
          <div key={asset} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 border border-border/20 min-w-fit">
            <span className="text-lg">{ASSET_ICONS[asset]}</span>
            <div>
              <div className="text-[10px] text-muted-foreground">{asset}/USD</div>
              <div className="text-sm font-bold font-mono">{'$'}{formatPrice(price)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', '5', '15'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
            }`}
          >
            {f === 'all' ? 'All Markets' : `${f} min`}
          </button>
        ))}
        <div className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
          <Activity size={10} />
          Prices via Binance · Updated every 5s
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content: Markets grid + Order slip */}
      <div className="flex gap-4">
        {/* Markets grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 rounded-xl bg-secondary/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map(market => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onBet={handleBet}
                  activeBets={activeBets}
                  onOpenSlip={(m, s) => setOrderSlip({ market: m, side: s })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order Slip (right panel) */}
        <AnimatePresence>
          {orderSlip && (
            <div className="hidden md:block w-[300px] flex-shrink-0 sticky top-20">
              <OrderSlip
                market={orderSlip.market}
                side={orderSlip.side}
                onClose={() => setOrderSlip(null)}
                onConfirm={() => handleBet(orderSlip.market.asset, orderSlip.market.duration, orderSlip.side)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* How it works */}
      <div className="mt-8 p-4 rounded-xl bg-secondary/10 border border-border/20">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Activity size={14} className="text-amber-400" />
          How Quick Markets Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <Target size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-foreground font-medium block">Pick a side</span>
              Will the price go UP or DOWN when the timer ends?
            </div>
          </div>
          <div className="flex gap-2">
            <DollarSign size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-foreground font-medium block">Cent pricing</span>
              50¢ = 50% chance. Lower price = higher potential return.
            </div>
          </div>
          <div className="flex gap-2">
            <Timer size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-foreground font-medium block">Auto-resolve</span>
              Markets resolve when countdown hits zero. No manual action needed.
            </div>
          </div>
          <div className="flex gap-2">
            <Award size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-foreground font-medium block">Earn rewards</span>
              +1 XP per bet. Correct predictions earn bonus XP and WSR.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
