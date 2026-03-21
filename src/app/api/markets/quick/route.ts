import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ─── Types ───
interface Bet {
  userId: string;
  side: 'up' | 'down';
  amount: number;
  entryPrice: number;   // price at the moment user placed bet
  entryTime: number;    // timestamp of bet placement
  result?: 'win' | 'lose';
  resolvePrice?: number;
  payout?: number;
}

interface QuickMarket {
  id: string;
  asset: string;
  duration: number;
  startPrice: number;
  currentPrice: number;
  startTime: number;
  endTime: number;
  status: 'active' | 'resolving' | 'resolved';
  resolveDeadline: number; // endTime + max 30s dynamic extension
  bets: Bet[];
  totalUp: number;
  totalDown: number;
  priceHistory: number[];
  houseProfit: number;
  winners: number;
  losers: number;
}

const activeMarkets = new Map<string, QuickMarket>();
const priceCache = new Map<string, { price: number; time: number }>();

const ASSETS: Record<string, { name: string; symbol: string; binanceSymbol: string }> = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', binanceSymbol: 'BTCUSDT' },
  ETH: { name: 'Ethereum', symbol: 'ETH', binanceSymbol: 'ETHUSDT' },
  SOL: { name: 'Solana', symbol: 'SOL', binanceSymbol: 'SOLUSDT' },
  POL: { name: 'Polygon', symbol: 'POL', binanceSymbol: 'POLUSDT' },
};

// ─── House advantage config ───
const HOUSE_WIN_TARGET = 0.55;  // House wants 55%+ of bets to lose
const MAX_RESOLVE_DELAY = 30000; // Max 30s extra wait for house advantage
const RESOLVE_CHECK_INTERVAL = 3000; // Check every 3s during resolving

// ─── Price fetching ───
async function fetchAllPrices(): Promise<Record<string, number>> {
  const symbols = Object.values(ASSETS).map(a => a.binanceSymbol);
  const now = Date.now();

  const allCached = symbols.every(s => {
    const cached = priceCache.get(s);
    return cached && now - cached.time < 3000; // 3s cache for faster updates
  });
  if (allCached) {
    const result: Record<string, number> = {};
    for (const [asset, config] of Object.entries(ASSETS)) {
      result[asset] = priceCache.get(config.binanceSymbol)?.price || 0;
    }
    return result;
  }

  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(symbols));
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`, {
      cache: 'no-store',
    });
    const data = await res.json();

    const result: Record<string, number> = {};
    for (const item of data) {
      priceCache.set(item.symbol, { price: parseFloat(item.price), time: now });
    }
    for (const [asset, config] of Object.entries(ASSETS)) {
      result[asset] = priceCache.get(config.binanceSymbol)?.price || 0;
    }
    return result;
  } catch {
    const result: Record<string, number> = {};
    for (const [asset, config] of Object.entries(ASSETS)) {
      result[asset] = priceCache.get(config.binanceSymbol)?.price || 0;
    }
    return result;
  }
}

async function fetchPrice(asset: string): Promise<number> {
  const prices = await fetchAllPrices();
  return prices[asset] || 0;
}

// ─── Resolution logic ───
// Each bet is resolved individually based on entryPrice vs current price
function calculateResults(market: QuickMarket, resolvePrice: number): { winners: number; losers: number; houseWinRate: number } {
  let winners = 0;
  let losers = 0;

  for (const bet of market.bets) {
    const isUp = resolvePrice > bet.entryPrice;
    const isDown = resolvePrice < bet.entryPrice;
    const isFlat = resolvePrice === bet.entryPrice;

    // Flat = house wins (no movement = lose)
    if (isFlat) {
      losers++;
    } else if ((bet.side === 'up' && isUp) || (bet.side === 'down' && isDown)) {
      winners++;
    } else {
      losers++;
    }
  }

  const total = winners + losers;
  const houseWinRate = total > 0 ? losers / total : 1;
  return { winners, losers, houseWinRate };
}

async function resolveMarket(market: QuickMarket, resolvePrice: number) {
  market.status = 'resolved';
  market.currentPrice = resolvePrice;
  let totalWinners = 0;
  let totalLosers = 0;

  const winnerUserIds: string[] = [];

  for (const bet of market.bets) {
    bet.resolvePrice = resolvePrice;
    const isUp = resolvePrice > bet.entryPrice;
    const isDown = resolvePrice < bet.entryPrice;
    const isFlat = resolvePrice === bet.entryPrice;

    if (isFlat) {
      bet.result = 'lose';
      totalLosers++;
    } else if ((bet.side === 'up' && isUp) || (bet.side === 'down' && isDown)) {
      bet.result = 'win';
      totalWinners++;
      winnerUserIds.push(bet.userId);
    } else {
      bet.result = 'lose';
      totalLosers++;
    }
  }

  market.winners = totalWinners;
  market.losers = totalLosers;

  // ─── Payout: winners share 80% of losers' pool, house keeps 20% ───
  // No XP ever leaves the house. Losers' stakes are already deducted.
  // Winners get: their own stake back + proportional share of 80% of loser pool
  const loserPool = market.bets
    .filter(b => b.result === 'lose')
    .reduce((sum, b) => sum + b.amount, 0);
  const winnerPool = loserPool * 0.8; // 80% goes to winners, 20% house cut
  const houseCut = loserPool * 0.2;
  market.houseProfit = houseCut;

  // Total winning bet amounts (for proportional distribution)
  const totalWinningAmount = market.bets
    .filter(b => b.result === 'win')
    .reduce((sum, b) => sum + b.amount, 0);

  const winnerPayouts = new Map<string, number>();
  for (const bet of market.bets) {
    if (bet.result === 'win') {
      // Stake back + proportional share of winner pool
      const share = totalWinningAmount > 0 ? bet.amount / totalWinningAmount : 0;
      const profit = winnerPool * share;
      const payout = bet.amount + profit; // stake + profit
      bet.payout = payout;
      winnerPayouts.set(bet.userId, (winnerPayouts.get(bet.userId) || 0) + payout);
    }
  }
  if (winnerPayouts.size > 0) {
    try {
      for (const [userId, payout] of winnerPayouts) {
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: Math.floor(payout) } },
        });
      }
    } catch (e) {
      console.error('Failed to award winner XP:', e);
    }
  }
}

// Try to resolve: if house is losing, delay up to MAX_RESOLVE_DELAY
async function tryResolve(market: QuickMarket): Promise<boolean> {
  const now = Date.now();

  if (market.bets.length === 0) {
    market.status = 'resolved';
    market.winners = 0;
    market.losers = 0;
    market.houseProfit = 0;
    return true;
  }

  const { houseWinRate } = calculateResults(market, market.currentPrice);

  // If house is winning enough OR we've hit the max delay, resolve now
  if (houseWinRate >= HOUSE_WIN_TARGET || now >= market.resolveDeadline) {
    resolveMarket(market, market.currentPrice);
    return true;
  }

  // House is losing — enter resolving state, wait for better price
  if (market.status === 'active') {
    market.status = 'resolving';
  }
  return false;
}

// ─── Market management ───
function generateMarketId(asset: string, duration: number): string {
  const roundTo = duration * 60 * 1000;
  const roundedTime = Math.floor(Date.now() / roundTo) * roundTo;
  return `${asset}-${duration}m-${roundedTime}`;
}

async function getOrCreateMarket(asset: string, duration: number): Promise<QuickMarket> {
  const id = generateMarketId(asset, duration);
  let market = activeMarkets.get(id);

  if (market) {
    const newPrice = await fetchPrice(asset);
    if (newPrice > 0) {
      market.currentPrice = newPrice;
      market.priceHistory.push(newPrice);
      if (market.priceHistory.length > 60) market.priceHistory.shift();
    }

    const now = Date.now();
    // Check resolution
    if (now >= market.endTime && market.status !== 'resolved') {
      await tryResolve(market);
    }
    return market;
  }

  const price = await fetchPrice(asset);
  const roundTo = duration * 60 * 1000;
  const startTime = Math.floor(Date.now() / roundTo) * roundTo;

  market = {
    id,
    asset,
    duration,
    startPrice: price,
    currentPrice: price,
    startTime,
    endTime: startTime + roundTo,
    resolveDeadline: startTime + roundTo + MAX_RESOLVE_DELAY,
    status: 'active',
    bets: [],
    totalUp: 0,
    totalDown: 0,
    priceHistory: [price],
    houseProfit: 0,
    winners: 0,
    losers: 0,
  };

  activeMarkets.set(id, market);

  // Cleanup old markets (> 30 min past endTime)
  for (const [key, m] of activeMarkets) {
    if (Date.now() - m.endTime > 30 * 60 * 1000) activeMarkets.delete(key);
  }

  return market;
}

// ─── GET: Get active quick markets ───
export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    await fetchAllPrices();

    const allMarkets = [];
    for (const [asset, config] of Object.entries(ASSETS)) {
      for (const dur of [5, 15]) {
        const m = await getOrCreateMarket(asset, dur);

        // For display: remaining time accounts for resolving state
        let displayRemaining: number;
        if (m.status === 'resolved') {
          displayRemaining = 0;
        } else if (m.status === 'resolving') {
          // Show "resolving" countdown (time until force-resolve)
          displayRemaining = Math.max(0, m.resolveDeadline - now);
        } else {
          displayRemaining = Math.max(0, m.endTime - now);
        }

        const pChange = m.currentPrice - m.startPrice;
        const pChangePercent = m.startPrice > 0 ? (pChange / m.startPrice) * 100 : 0;
        const total = m.totalUp + m.totalDown;
        const upPct = total > 0 ? Math.round((m.totalUp / total) * 100) : 50;

        const betCount = m.bets.length;
        const upBetCount = m.bets.filter(b => b.side === 'up').length;
        const downBetCount = m.bets.filter(b => b.side === 'down').length;

        allMarkets.push({
          id: m.id,
          asset,
          name: config.name,
          symbol: config.symbol,
          duration: dur,
          startPrice: m.startPrice,
          currentPrice: m.currentPrice,
          priceChange: pChange,
          priceChangePercent: pChangePercent,
          remaining: displayRemaining,
          remainingFormatted: `${Math.floor(displayRemaining / 60000)}:${String(Math.floor((displayRemaining % 60000) / 1000)).padStart(2, '0')}`,
          progress: Math.min(100, ((now - m.startTime) / (dur * 60 * 1000)) * 100),
          status: m.status,
          totalUp: m.totalUp,
          totalDown: m.totalDown,
          totalBets: betCount,
          totalVolume: total,
          upPercent: upPct,
          downPercent: 100 - upPct,
          upCents: upPct,
          downCents: 100 - upPct,
          upBetCount,
          downBetCount,
          priceHistory: m.priceHistory,
          upReturn: upPct > 0 ? (100 / upPct).toFixed(1) : '2.0',
          downReturn: (100 - upPct) > 0 ? (100 / (100 - upPct)).toFixed(1) : '2.0',
          // Resolution info
          winners: m.winners,
          losers: m.losers,
          houseProfit: m.houseProfit,
          isResolving: m.status === 'resolving',
        });
      }
    }

    return NextResponse.json({ allMarkets });
  } catch (error) {
    console.error('Quick market error:', error);
    return NextResponse.json({ error: 'Failed to load markets' }, { status: 500 });
  }
}

// ─── POST: Place a bet ───
// Each bet records the CURRENT price as entryPrice
// Result will be determined by comparing entryPrice vs resolvePrice
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Sign in to place bets' }, { status: 401 });
    }

    const { asset, duration, side, amount } = await req.json();
    if (!asset || !duration || !['up', 'down'].includes(side)) {
      return NextResponse.json({ error: 'Invalid bet parameters' }, { status: 400 });
    }

    const betAmount = Math.max(1, Math.min(10000, parseInt(amount) || 1));

    const market = await getOrCreateMarket(asset, duration);

    if (market.status !== 'active') {
      return NextResponse.json({ error: 'Market has ended' }, { status: 400 });
    }

    if (market.endTime - Date.now() < 2000) {
      return NextResponse.json({ error: 'Too late — market closing' }, { status: 400 });
    }

    const userBets = market.bets.filter(b => b.userId === currentUser.id);
    if (userBets.length >= 20) {
      return NextResponse.json({ error: 'Max 20 bets per market' }, { status: 400 });
    }

    // CHECK XP FIRST before adding bet
    const user = await prisma.user.findUnique({ where: { id: currentUser.id }, select: { xp: true } });
    if (!user || user.xp < betAmount) {
      return NextResponse.json({
        error: `Not enough XP (need ${betAmount}, have ${user?.xp || 0}). Earn or buy WSR tokens.`,
      }, { status: 400 });
    }

    const entryPrice = market.currentPrice;

    const bet: Bet = {
      userId: currentUser.id,
      side,
      amount: betAmount,
      entryPrice,
      entryTime: Date.now(),
    };

    market.bets.push(bet);
    if (side === 'up') market.totalUp += betAmount;
    else market.totalDown += betAmount;

    // Deduct XP (stake)
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { xp: { decrement: betAmount } },
    });

    const total = market.totalUp + market.totalDown;
    const upPct = Math.round((market.totalUp / total) * 100);

    return NextResponse.json({
      success: true,
      side,
      amount: betAmount,
      market: market.id,
      entryPrice,
      upPercent: upPct,
      downPercent: 100 - upPct,
      xpRemaining: user.xp - betAmount,
      message: `Bet placed: ${betAmount} XP on ${asset} ${side.toUpperCase()} @ $${entryPrice.toLocaleString()}`,
      betCount: userBets.length + 1,
    });
  } catch (error) {
    console.error('Quick market bet error:', error);
    return NextResponse.json({ error: 'Failed to place bet' }, { status: 500 });
  }
}
