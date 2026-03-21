'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp, ArrowDown, TrendingUp, TrendingDown, Timer, Zap,
  MessageCircle, Send, ChevronLeft, Users, Activity, Clock,
  Target, Award, BarChart3, X, Flame, CandlestickChart, LineChart, AreaChart,
} from 'lucide-react';

// ─── Types ───
interface MarketData {
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
  totalUp: number;
  totalDown: number;
  totalBets: number;
  totalVolume: number;
  upPercent: number;
  downPercent: number;
  upCents: number;
  downCents: number;
  upBetCount: number;
  downBetCount: number;
  priceHistory: number[];
  upReturn: string;
  downReturn: string;
  winners: number;
  losers: number;
  houseProfit: number;
  isResolving: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

const ASSET_ICONS: Record<string, string> = { BTC: '₿', ETH: 'Ξ', SOL: '◎', POL: '⬡' };

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

// ─── Live Chart with blinking cursor ───
type ChartType = 'original' | 'line' | 'candlestick';

function LiveChart({ market, priceHistory, chartType = 'original' }: { market: MarketData; priceHistory: number[]; chartType?: ChartType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const cursorPhase = useRef(0);
  const marketRef = useRef(market);
  const priceRef = useRef(priceHistory);
  const chartTypeRef = useRef(chartType);
  marketRef.current = market;
  priceRef.current = priceHistory;
  chartTypeRef.current = chartType;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const PAD = { top: 30, right: 70, bottom: 35, left: 15 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const data = priceRef.current;
      const market = marketRef.current;
      const chartType = chartTypeRef.current;
      if (data.length < 2) {
        ctx.fillStyle = '#666';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Collecting price data...', W / 2, H / 2);
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const now = Date.now();
      const timeLeft = market.remaining;
      const totalMs = market.duration * 60 * 1000;
      const elapsed = totalMs - timeLeft;

      const realPrice = data[data.length - 1];
      const priceRange = Math.max(...data) - Math.min(...data) || realPrice * 0.0005;

      // Subtle tip oscillation
      const tipNoise = (
        Math.sin(now * 0.002) * 0.3 +
        Math.sin(now * 0.005) * 0.15
      ) * priceRange * 0.015;
      let extra = 0;
      if (timeLeft < 30000 && timeLeft > 0) {
        const intensity = 1 - (timeLeft / 30000);
        extra = Math.sin(now * 0.004) * priceRange * 0.02 * intensity;
      }
      const tipPrice = realPrice + tipNoise + extra;
      const displayData = [...data, tipPrice];

      const min = Math.min(...displayData);
      const max = Math.max(...displayData);
      const range = max - min || max * 0.0005 || 1;
      const padY = range * 0.15;
      const yMin = min - padY;
      const yMax = max + padY;
      const yRange = yMax - yMin;

      // ── POLYMARKET-STYLE: data fills full width, x-axis shows clock times ──
      const toY = (v: number) => PAD.top + chartH - ((v - yMin) / yRange) * chartH;

      // Data points fill the entire chart width (auto-scale like Polymarket)
      const pointXs: number[] = [];
      for (let i = 0; i < displayData.length; i++) {
        pointXs.push(PAD.left + (i / (displayData.length - 1)) * chartW);
      }

      const isUp = market.currentPrice >= market.startPrice;
      const mainColor = isUp ? '#34d399' : '#f87171';

      // ── Grid lines ──
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = PAD.top + (chartH * i) / 4;
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(W - PAD.right, y);
        ctx.stroke();
        const val = yMax - (yRange * i) / 4;
        ctx.fillStyle = '#666';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(formatPrice(val), W - PAD.right + 6, y + 4);
      }

      // ── Time labels (absolute clock times like Polymarket) ──
      ctx.fillStyle = '#555';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      // Calculate the actual time range the data covers
      const dataStartTime = now - elapsed; // approximate start time
      const labelCount = 6;
      for (let i = 0; i < labelCount; i++) {
        const x = PAD.left + (chartW * i) / (labelCount - 1);
        const t = new Date(dataStartTime + (elapsed * i) / (labelCount - 1));
        const h = t.getHours();
        const m = t.getMinutes();
        const s = t.getSeconds();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        ctx.fillText(`${h12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`, x, H - 8);
      }

      // ── Target price dashed line (Polymarket style) ──
      const startY = toY(market.startPrice);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD.left, startY);
      ctx.lineTo(W - PAD.right, startY);
      ctx.stroke();
      ctx.setLineDash([]);
      // "Target" badge on the right
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
      const tBadgeW = 56;
      ctx.beginPath();
      ctx.roundRect(W - PAD.right - tBadgeW - 4, startY - 10, tBadgeW, 20, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Target ⇅', W - PAD.right - tBadgeW / 2 - 4, startY + 4);
      // Price label on y-axis
      ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPrice(market.startPrice), W - PAD.right + 6, startY + 4);

      // ── Chart type drawing ──
      if (chartType === 'candlestick') {
        const candleCount = Math.min(20, displayData.length);
        const candleSize = Math.max(1, Math.floor(displayData.length / candleCount));
        const candles: { o: number; h: number; l: number; c: number; xPos: number }[] = [];
        for (let i = 0; i < displayData.length; i += candleSize) {
          const slice = displayData.slice(i, i + candleSize);
          const midIdx = i + Math.floor(candleSize / 2);
          candles.push({
            o: slice[0], h: Math.max(...slice), l: Math.min(...slice), c: slice[slice.length - 1],
            xPos: midIdx < pointXs.length ? pointXs[midIdx] : pointXs[pointXs.length - 1],
          });
        }
        const candleW = Math.max(4, (chartW / candles.length) * 0.6);

        for (const c of candles) {
          const bullish = c.c >= c.o;
          const color = bullish ? '#34d399' : '#f87171';
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(c.xPos, toY(c.h));
          ctx.lineTo(c.xPos, toY(c.l));
          ctx.stroke();
          const bodyTop = toY(Math.max(c.o, c.c));
          const bodyBot = toY(Math.min(c.o, c.c));
          ctx.fillStyle = color;
          ctx.fillRect(c.xPos - candleW / 2, bodyTop, candleW, Math.max(1, bodyBot - bodyTop));
        }
      } else if (chartType === 'line') {
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pointXs[0], toY(displayData[0]));
        for (let i = 1; i < displayData.length; i++) {
          ctx.lineTo(pointXs[i], toY(displayData[i]));
        }
        ctx.stroke();
      } else {
        // Original: area fill + smooth bezier
        const gradient = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
        gradient.addColorStop(0, isUp ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)');
        gradient.addColorStop(1, isUp ? 'rgba(52, 211, 153, 0.01)' : 'rgba(248, 113, 113, 0.01)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(pointXs[0], toY(displayData[0]));
        for (let i = 1; i < displayData.length; i++) {
          const xc = (pointXs[i - 1] + pointXs[i]) / 2;
          const yc = (toY(displayData[i - 1]) + toY(displayData[i])) / 2;
          ctx.quadraticCurveTo(pointXs[i - 1], toY(displayData[i - 1]), xc, yc);
        }
        ctx.lineTo(pointXs[displayData.length - 1], toY(displayData[displayData.length - 1]));
        ctx.lineTo(pointXs[displayData.length - 1], PAD.top + chartH);
        ctx.lineTo(pointXs[0], PAD.top + chartH);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pointXs[0], toY(displayData[0]));
        for (let i = 1; i < displayData.length; i++) {
          const xc = (pointXs[i - 1] + pointXs[i]) / 2;
          const yc = (toY(displayData[i - 1]) + toY(displayData[i])) / 2;
          ctx.quadraticCurveTo(pointXs[i - 1], toY(displayData[i - 1]), xc, yc);
        }
        ctx.lineTo(pointXs[displayData.length - 1], toY(displayData[displayData.length - 1]));
        ctx.stroke();
      }

      // ── Blinking cursor at current position ──
      cursorPhase.current += 0.06;
      const pulse = (Math.sin(cursorPhase.current) + 1) / 2;
      const lastX = pointXs[pointXs.length - 1];
      const lastY = toY(displayData[displayData.length - 1]);

      const glowRadius = 12 + pulse * 8;
      const glow = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, glowRadius);
      glow.addColorStop(0, isUp ? `rgba(52, 211, 153, ${0.4 * pulse})` : `rgba(248, 113, 113, ${0.4 * pulse})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lastX, lastY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal scan line to price axis
      ctx.strokeStyle = `rgba(${isUp ? '52,211,153' : '248,113,113'}, ${0.15 + pulse * 0.15})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(W - PAD.right, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current price box
      const priceText = `$${formatPrice(market.currentPrice)}`;
      ctx.font = 'bold 11px monospace';
      const tw = ctx.measureText(priceText).width + 10;
      const boxX = W - PAD.right + 2;
      const boxY = lastY - 9;
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, tw, 18, 3);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(priceText, boxX + 5, lastY + 4);

      // No vertical time marker needed — line always ends at right edge

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: '380px' }}
    />
  );
}

// ─── Movement Arrows ───
function MovementArrows({ priceHistory }: { priceHistory: number[] }) {
  if (priceHistory.length < 2) return null;
  const current = priceHistory[priceHistory.length - 1];
  const prev = priceHistory[priceHistory.length - 2];
  const diff = current - prev;
  const pct = prev > 0 ? ((diff / prev) * 100) : 0;
  const threshold = 0.001; // 0.001% = stable

  const isUp = pct > threshold;
  const isDown = pct < -threshold;

  return (
    <div className="flex items-center justify-center gap-3 py-1.5 px-2">
      <div className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
        isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-muted-foreground'
      }`}>
        {isUp ? (
          <>
            <ArrowUp size={14} className="animate-bounce" />
            <span>UP</span>
            <span className="font-mono text-[10px] opacity-70">+{pct.toFixed(4)}%</span>
          </>
        ) : isDown ? (
          <>
            <ArrowDown size={14} className="animate-bounce" />
            <span>DOWN</span>
            <span className="font-mono text-[10px] opacity-70">{pct.toFixed(4)}%</span>
          </>
        ) : (
          <>
            <Activity size={14} />
            <span>STABLE</span>
            <span className="font-mono text-[10px] opacity-70">{pct.toFixed(4)}%</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Countdown Timer with milliseconds ───
function CountdownTimer({ remaining, large }: { remaining: number; large?: boolean }) {
  const [time, setTime] = useState(remaining);
  const startRef = useRef(Date.now());
  const baseRef = useRef(remaining);

  useEffect(() => {
    startRef.current = Date.now();
    baseRef.current = remaining;
    setTime(remaining);
  }, [remaining]);

  useEffect(() => {
    let raf: number;
    function tick() {
      const elapsed = Date.now() - startRef.current;
      const t = Math.max(0, baseRef.current - elapsed);
      setTime(t);
      if (t > 0) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [remaining]);

  const mins = Math.floor(time / 60000);
  const secs = Math.floor((time % 60000) / 1000);
  const ms = Math.floor((time % 1000) / 10);
  const isFinal10 = time < 10000;
  const isFinal30 = time < 30000;

  // Blink effect: slow at 30s, fast at 10s
  const blinkClass = isFinal10
    ? 'animate-[pulse_0.3s_ease-in-out_infinite]' // fast blink
    : isFinal30
      ? 'animate-[pulse_1.5s_ease-in-out_infinite]' // slow blink
      : '';

  return (
    <span className={`font-mono font-bold transition-colors ${
      large ? (isFinal10 ? 'text-4xl' : isFinal30 ? 'text-3xl' : 'text-2xl') : 'text-lg'
    } ${
      isFinal10 ? `text-red-500 ${blinkClass}` : isFinal30 ? `text-orange-400 ${blinkClass}` : 'text-foreground'
    }`}>
      {mins}:{String(secs).padStart(2, '0')}
      <span className={`${large ? (isFinal10 ? 'text-2xl' : 'text-base') : 'text-xs'} opacity-60`}>
        .{String(ms).padStart(2, '0')}
      </span>
    </span>
  );
}

// ─── Chat Panel ───
function ChatPanel({ marketId }: { marketId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef(0);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?marketId=${marketId}&after=${lastTimestamp.current}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => {
          const existing = new Set(prev.map(m => m.id));
          const newMsgs = data.messages.filter((m: ChatMessage) => !existing.has(m.id));
          if (newMsgs.length === 0) return prev;
          const all = [...prev, ...newMsgs].slice(-100);
          lastTimestamp.current = Math.max(...all.map((m: ChatMessage) => m.timestamp));
          return all;
        });
      }
    } catch {}
  }, [marketId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId, message: input.trim() }),
      });
      if (res.ok) {
        setInput('');
        fetchMessages();
      }
    } catch {}
    setSending(false);
  };

  const colors = ['text-amber-400', 'text-blue-400', 'text-emerald-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400'];
  const getColor = (userId: string) => colors[userId.charCodeAt(0) % colors.length];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-amber-400" />
            <span className="text-sm font-bold">Live Chat</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Users size={10} />
            <span>{messages.length > 0 ? Math.max(1, new Set(messages.slice(-20).map(m => m.userId)).size) : 0}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-8">
            <MessageCircle size={20} className="mx-auto mb-2 opacity-30" />
            Be the first to chat!
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="group">
            <div className="flex items-start gap-1.5">
              <span className={`text-[11px] font-bold shrink-0 ${getColor(msg.userId)}`}>
                {msg.username}
              </span>
              <span className="text-[11px] text-foreground/80 break-all leading-tight">
                {msg.message}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            maxLength={200}
            className="flex-1 bg-secondary/30 border border-border/20 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-30 transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;

  const [market, setMarket] = useState<MarketData | null>(null);
  const [allMarkets, setAllMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [betSide, setBetSide] = useState<'up' | 'down' | null>(null);
  const [betAmount, setBetAmount] = useState(1);
  const [myBets, setMyBets] = useState<{ side: 'up' | 'down'; entryPrice: number; amount: number }[]>([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('original');
  const [userXp, setUserXp] = useState<number>(0);
  const priceHistoryRef = useRef<number[]>([]);

  // Parse asset/duration from market ID (e.g. "BTC-5m-1774020600000")
  const idParts = marketId.split('-');
  const idAsset = idParts[0] || 'BTC';
  const idDuration = parseInt(idParts[1]?.replace('m', '') || '5');

  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch('/api/markets/quick?asset=BTC&duration=5');
      const data = await res.json();
      if (data.allMarkets) {
        setAllMarkets(data.allMarkets);
        const found = data.allMarkets.find((m: MarketData) => m.id === marketId);
        if (found) {
          setMarket(found);
          // Accumulate price history across fetches
          if (found.priceHistory && found.priceHistory.length > 0) {
            const last = priceHistoryRef.current;
            const newPrice = found.priceHistory[found.priceHistory.length - 1];
            if (last.length === 0 || last[last.length - 1] !== newPrice) {
              priceHistoryRef.current = [...last, newPrice].slice(-120);
            }
          }

          // Auto-redirect when market resolves: find the new active market for same asset/duration
          if (found.status === 'resolved' && found.remaining === 0) {
            const nextMarket = data.allMarkets.find(
              (m: MarketData) => m.asset === idAsset && m.duration === idDuration && m.id !== marketId && m.status !== 'resolved'
            );
            if (nextMarket) {
              // Short delay to show result, then redirect
              setTimeout(() => {
                priceHistoryRef.current = [];
                setMyBets([]);
                router.replace(`/markets/${nextMarket.id}`);
              }, 3000);
            }
          }
        } else {
          // Market ID not found at all — find the active one for same asset/duration
          const nextMarket = data.allMarkets.find(
            (m: MarketData) => m.asset === idAsset && m.duration === idDuration && m.status !== 'resolved'
          );
          if (nextMarket) {
            priceHistoryRef.current = [];
            setMyBets([]);
            router.replace(`/markets/${nextMarket.id}`);
          }
        }
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [marketId, idAsset, idDuration, router]);

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 2000);
    return () => clearInterval(interval);
  }, [fetchMarket]);

  // Fetch user XP for MAX button
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.xp != null) setUserXp(d.user.xp);
    }).catch(() => {});
  }, []);

  const handleBet = async (side: 'up' | 'down') => {
    if (!market) return;
    setError('');
    try {
      const res = await fetch('/api/markets/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset: market.asset, duration: market.duration, side, amount: betAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place bet');
        return;
      }
      setMyBets(prev => [...prev, { side, entryPrice: data.entryPrice || market.currentPrice, amount: betAmount }]);
      if (data.xpRemaining != null) setUserXp(data.xpRemaining);
      setBetSide(null);
      fetchMarket();
    } catch {
      setError('Failed to place bet');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary/30 rounded w-48" />
          <div className="h-[400px] bg-secondary/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-xl font-bold mb-2">Market Not Found</h1>
        <p className="text-muted-foreground text-sm mb-4">This market may have expired or been resolved.</p>
        <Link href="/markets" className="text-amber-400 hover:text-amber-300 text-sm">
          Back to Markets
        </Link>
      </div>
    );
  }

  const isUp = market.currentPrice >= market.startPrice;
  const displayHistory = priceHistoryRef.current.length > 1 ? priceHistoryRef.current : market.priceHistory;

  // Parse asset/duration from other markets for sidebar navigation
  const relatedMarkets = allMarkets.filter(m => m.id !== market.id).slice(0, 6);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <Link href="/markets" className="p-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{ASSET_ICONS[market.asset]}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{market.asset}/USD</h1>
              <span className="text-xs bg-secondary/40 px-2 py-0.5 rounded text-muted-foreground">{market.duration}min</span>
              {market.status === 'resolving' ? (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[9px] font-bold border border-orange-500/30 flex items-center gap-1 animate-pulse">
                  <Activity size={10} />
                  RESOLVING
                </span>
              ) : market.status === 'resolved' ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold border border-blue-500/30">
                  SETTLED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: Chart + Chat sidebar */}
      <div className="flex gap-4">
        {/* Left: Chart + Controls */}
        <div className="flex-1 min-w-0">
          {/* Price + Countdown header (Polymarket style) */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-end gap-4">
              <div>
                <span className="text-[10px] text-muted-foreground block">Price to beat</span>
                <span className="text-xl font-bold font-mono text-foreground/70">${formatPrice(market.startPrice)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Current price{' '}
                  <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? '▲' : '▼'} ${Math.abs(market.priceChange).toFixed(2)}
                  </span>
                </span>
                <span className={`text-xl font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${formatPrice(market.currentPrice)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Activity size={10} />
                Binance · Live
              </span>
            </div>
            {/* Big countdown */}
            <div className="text-right">
              <CountdownTimer remaining={market.remaining} large />
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#0a0a14]/80 rounded-xl border border-border/20 p-2 mb-4">
            {/* Chart type selector */}
            <div className="flex items-center justify-end gap-1 mb-1 px-1">
              {([
                { type: 'original' as ChartType, icon: AreaChart, label: 'Area' },
                { type: 'line' as ChartType, icon: LineChart, label: 'Line' },
                { type: 'candlestick' as ChartType, icon: CandlestickChart, label: 'Candle' },
              ]).map(opt => (
                <button
                  key={opt.type}
                  onClick={() => setChartType(opt.type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    chartType === opt.type
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30 border border-transparent'
                  }`}
                >
                  <opt.icon size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
            <LiveChart market={market} priceHistory={displayHistory} chartType={chartType} />
            {/* Movement arrows */}
            <MovementArrows priceHistory={displayHistory} />
          </div>

          {/* UP/DOWN Single Bar */}
          <div className="mb-4">
            <div className="flex rounded-xl overflow-hidden border border-border/20 h-14">
              {/* UP side */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={market.status !== 'active'}
                onClick={() => market.status === 'active' && setBetSide(betSide === 'up' ? null : 'up')}
                className={`flex-1 flex items-center justify-between px-4 transition-all relative ${
                  betSide === 'up'
                    ? 'bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/40'
                    : 'bg-emerald-500/5 hover:bg-emerald-500/10'
                } ${market.status !== 'active' ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUp size={18} className="text-emerald-400" />
                  <span className="font-bold text-emerald-400 text-sm">UP</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">{market.upReturn}x</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{market.upCents}¢</span>
                  <span className="text-[10px] text-emerald-400/60">{market.upPercent}%</span>
                </div>
              </motion.button>

              {/* Divider */}
              <div className="w-px bg-border/40 relative z-10" />

              {/* DOWN side */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={market.status !== 'active'}
                onClick={() => market.status === 'active' && setBetSide(betSide === 'down' ? null : 'down')}
                className={`flex-1 flex items-center justify-between px-4 transition-all relative ${
                  betSide === 'down'
                    ? 'bg-red-500/20 ring-1 ring-inset ring-red-500/40'
                    : 'bg-red-500/5 hover:bg-red-500/10'
                } ${market.status !== 'active' ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-red-400/60">{market.downPercent}%</span>
                  <span className="text-lg font-bold text-red-400 font-mono">{market.downCents}¢</span>
                  <span className="text-[10px] text-muted-foreground">{market.downReturn}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-400 text-sm">DOWN</span>
                  <ArrowDown size={18} className="text-red-400" />
                </div>
              </motion.button>
            </div>

            {/* Sentiment bar underneath */}
            <div className="flex h-1.5 rounded-full overflow-hidden mt-1.5">
              <motion.div
                className="bg-emerald-500 rounded-l-full"
                initial={{ width: 0 }}
                animate={{ width: `${market.upPercent}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="bg-red-500 rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${market.downPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground px-1">
              <span>{market.upBetCount || 0} bets · {market.totalUp} XP</span>
              <span>{market.totalBets} trades</span>
              <span>{market.totalDown} XP · {market.downBetCount || 0} bets</span>
            </div>
          </div>

          {/* Bet Confirmation */}
          <AnimatePresence>
            {betSide && market.status === 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`rounded-xl border p-4 mb-4 ${
                  betSide === 'up' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target size={14} className={betSide === 'up' ? 'text-emerald-400' : 'text-red-400'} />
                    <span className="text-sm font-bold">
                      Confirm: {market.asset} {betSide.toUpperCase()} in {market.duration}min
                    </span>
                  </div>
                  <button onClick={() => setBetSide(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-1">Amount:</span>
                  {[1, 5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        betAmount === amt
                          ? betSide === 'up'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                  <button
                    onClick={() => setBetAmount(Math.max(1, userXp))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      ![1, 5, 10, 20, 50, 100].includes(betAmount)
                        ? betSide === 'up'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
                    }`}
                  >
                    MAX{userXp > 0 ? ` (${userXp})` : ''}
                  </button>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-xs mb-3 px-1">
                  <div>
                    <span className="text-muted-foreground">Stake: </span>
                    <span className="font-bold">{betAmount} XP</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pool: </span>
                    <span className="font-bold text-amber-400">{market.totalUp + market.totalDown} XP</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Win: </span>
                    <span className="font-bold text-emerald-400">
                      stake + share of 80% loser pool
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBet(betSide)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                    betSide === 'up'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {betSide === 'up' ? '📈' : '📉'} Place {betAmount} XP on {betSide.toUpperCase()}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* WIN Notification */}
          {market.status === 'resolved' && myBets.length > 0 && (() => {
            const wins = myBets.filter(b =>
              b.side === 'up' ? market.currentPrice > b.entryPrice : market.currentPrice < b.entryPrice
            );
            if (wins.length === 0) return null;
            const totalWon = wins.reduce((s, b) => s + b.amount, 0);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 rounded-xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-amber-500/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <div className="text-sm font-bold text-emerald-400">YOU WON!</div>
                      <div className="text-xs text-muted-foreground">
                        {wins.length} winning bet{wins.length > 1 ? 's' : ''} — XP credited to your wallet
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400 font-mono">+{totalWon} XP</div>
                    <div className="text-[10px] text-muted-foreground">+ pool share</div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Active bets — show each with entry price and live P&L */}
          {myBets.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Award size={14} className="text-amber-400" />
                  Your Bets ({myBets.length})
                </div>
                {market.status === 'resolving' && (
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                    <Activity size={10} />
                    RESOLVING...
                  </span>
                )}
              </div>
              {myBets.map((bet, idx) => {
                const isWin = bet.side === 'up' ? market.currentPrice > bet.entryPrice : market.currentPrice < bet.entryPrice;
                const isFlat = market.currentPrice === bet.entryPrice;
                return (
                  <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    market.status === 'resolved'
                      ? isWin ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                      : 'bg-secondary/10 border-border/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${bet.side === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {bet.side === 'up' ? '↑' : '↓'} {bet.side.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground">@</span>
                      <span className="font-mono font-bold">${formatPrice(bet.entryPrice)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold ${
                        isFlat ? 'text-muted-foreground' : isWin ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isFlat ? '0' : isWin ? `+${bet.amount}` : `-${bet.amount}`} XP
                      </span>
                      {market.status === 'resolved' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isWin ? 'WON' : 'LOST'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tabs: Activity / Positions / Order Book / Rules / MIA */}
          <TabSection market={market} myBets={myBets} />
        </div>

        {/* Right Sidebar: Chat (top) + Related Markets (bottom) */}
        <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0 sticky top-16 h-[calc(100vh-80px)] gap-3">
          {/* Chat — takes upper portion */}
          <div className="flex-1 min-h-0 bg-card/50 border border-border/20 rounded-xl overflow-hidden flex flex-col">
            <ChatPanel marketId={marketId} />
          </div>

          {/* Related Markets below chat — tabbed by duration */}
          <SidebarMarkets markets={relatedMarkets} currentId={market.id} />
        </div>
      </div>
    </div>
  );
}

// ─── Tab Section (Activity, Positions, Order Book, Rules, MIA) ───
function TabSection({ market, myBets }: { market: MarketData; myBets: { side: 'up' | 'down'; entryPrice: number; amount: number }[] }) {
  const [tab, setTab] = useState<'activity' | 'positions' | 'orderbook' | 'rules' | 'mia'>('activity');
  const [miaAnalysis, setMiaAnalysis] = useState<string | null>(null);
  const [miaLoading, setMiaLoading] = useState(false);
  const miaTriggered = useRef(false);

  // Auto-trigger MIA analysis when tab is selected
  useEffect(() => {
    if (tab === 'mia' && !miaAnalysis && !miaLoading && !miaTriggered.current) {
      miaTriggered.current = true;
      setMiaLoading(true);
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionTitle: `Quick technical analysis for ${market.asset}/USD. Current price: $${market.currentPrice.toLocaleString()}. Recent change: ${market.priceChangePercent.toFixed(3)}%. Give a brief 2-3 sentence analysis with a directional bias.`,
          options: [{ text: 'Up (Bullish)' }, { text: 'Down (Bearish)' }],
          totalVotes: market.totalBets || 0,
          category: 'finance',
        }),
      })
        .then(r => r.json())
        .then(d => setMiaAnalysis(d.analysis || d.recommendation || d.summary || 'Analysis unavailable.'))
        .catch(() => setMiaAnalysis('Failed to generate analysis.'))
        .finally(() => setMiaLoading(false));
    }
  }, [tab, miaAnalysis, miaLoading, market.asset, market.currentPrice, market.priceChangePercent]);

  const tabs_list = [
    { id: 'activity' as const, label: 'Activity' },
    { id: 'positions' as const, label: 'Positions' },
    { id: 'orderbook' as const, label: 'Order Book' },
    { id: 'rules' as const, label: 'Rules' },
    { id: 'mia' as const, label: 'MIA Analysis' },
  ];

  return (
    <div className="mb-4">
      {/* Tab headers */}
      <div className="flex items-center border-b border-border/20 mb-3">
        <div className="flex overflow-x-auto flex-1">
          {tabs_list.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                tab === t.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Volume indicator */}
        <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] shrink-0 border-b-2 border-transparent">
          <BarChart3 size={10} className="text-amber-400" />
          <span className="text-muted-foreground">Vol:</span>
          <span className="font-bold text-foreground font-mono">{market.totalVolume || (market.totalUp + market.totalDown)} XP</span>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'activity' && (
        <div className="space-y-2">
          {market.totalBets === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-6">No activity yet</div>
          ) : (
            <>
              <div className="grid grid-cols-4 text-[10px] text-muted-foreground uppercase tracking-wider px-3 pb-1">
                <span>Side</span><span>Amount</span><span>Price</span><span className="text-right">Time</span>
              </div>
              {/* Show market-level stats as simulated activity */}
              {market.totalUp > 0 && (
                <div className="grid grid-cols-4 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/5">
                  <span className="text-emerald-400 font-bold">UP</span>
                  <span>{market.totalUp} XP</span>
                  <span className="font-mono">${formatPrice(market.startPrice)}</span>
                  <span className="text-right text-muted-foreground">Recent</span>
                </div>
              )}
              {market.totalDown > 0 && (
                <div className="grid grid-cols-4 text-xs px-3 py-1.5 rounded-lg bg-red-500/5">
                  <span className="text-red-400 font-bold">DOWN</span>
                  <span>{market.totalDown} XP</span>
                  <span className="font-mono">${formatPrice(market.startPrice)}</span>
                  <span className="text-right text-muted-foreground">Recent</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'positions' && (
        <div className="space-y-2">
          {myBets.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-6">No positions — place a bet to start</div>
          ) : (
            <>
              <div className="grid grid-cols-5 text-[10px] text-muted-foreground uppercase tracking-wider px-3 pb-1">
                <span>Side</span><span>Amount</span><span>Entry</span><span>Current</span><span className="text-right">P&L</span>
              </div>
              {myBets.map((bet, idx) => {
                const isWin = bet.side === 'up' ? market.currentPrice > bet.entryPrice : market.currentPrice < bet.entryPrice;
                return (
                  <div key={idx} className="grid grid-cols-5 text-xs px-3 py-1.5 rounded-lg bg-secondary/5 items-center">
                    <span className={`font-bold ${bet.side === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {bet.side === 'up' ? '↑ UP' : '↓ DN'}
                    </span>
                    <span>{bet.amount} XP</span>
                    <span className="font-mono">${formatPrice(bet.entryPrice)}</span>
                    <span className={`font-mono ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${formatPrice(market.currentPrice)}
                    </span>
                    <span className={`text-right font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isWin ? `+${bet.amount}` : `-${bet.amount}`}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab === 'orderbook' && (
        <div className="space-y-3">
          {/* UP / DOWN depth bars */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">UP</span>
                <span className="text-[10px] text-muted-foreground">{market.upBetCount || 0} bets</span>
              </div>
              <div className="h-7 rounded bg-emerald-500/10 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/25 rounded transition-all duration-500"
                  style={{ width: `${market.totalUp > 0 ? Math.max(5, market.upPercent) : 0}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-emerald-400 font-mono">
                  {market.totalUp} XP
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">DOWN</span>
                <span className="text-[10px] text-muted-foreground">{market.downBetCount || 0} bets</span>
              </div>
              <div className="h-7 rounded bg-red-500/10 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 bg-red-500/25 rounded transition-all duration-500"
                  style={{ width: `${market.totalDown > 0 ? Math.max(5, market.downPercent) : 0}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-red-400 font-mono">
                  {market.totalDown} XP
                </span>
              </div>
            </div>
          </div>

          {/* Market stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-secondary/10">
              <div className="text-[9px] text-muted-foreground">Open Price</div>
              <div className="text-xs font-mono font-bold">${formatPrice(market.startPrice)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/10">
              <div className="text-[9px] text-muted-foreground">Current</div>
              <div className={`text-xs font-mono font-bold ${market.currentPrice >= market.startPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                ${formatPrice(market.currentPrice)}
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/10">
              <div className="text-[9px] text-muted-foreground">Total Bets</div>
              <div className="text-xs font-bold">{market.totalBets}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/10">
              <div className="text-[9px] text-muted-foreground">Total Volume</div>
              <div className="text-xs font-bold font-mono">{market.totalUp + market.totalDown} XP</div>
            </div>
          </div>

          {/* Ratio bar */}
          {(market.totalUp + market.totalDown) > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>UP {market.upPercent}%</span>
                <span>{market.downPercent}% DOWN</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${market.upPercent}%` }} />
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${market.downPercent}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'rules' && (
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p>- Price is based on {market.asset}/USD from Binance</p>
          <p>- Each bet uses your current XP as stake</p>
          <p>- Result based on YOUR entry price vs resolve price</p>
          <p>- If price is flat at resolve = house wins</p>
          <p>- Winners share 80% of losers pool proportionally</p>
          <p>- House keeps 20% of loser pool</p>
          <p>- Market may extend up to 30s for settlement</p>
          <p>- Max 20 bets per market per user</p>
        </div>
      )}

      {tab === 'mia' && (
        <div>
          {miaLoading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 py-4">
              <Zap size={14} className="animate-pulse" />
              Analyzing {market.asset}/USD...
            </div>
          )}
          {miaAnalysis && (
            <div>
              <p className="text-xs text-foreground/80 leading-relaxed">{miaAnalysis}</p>
              <button
                onClick={() => { miaTriggered.current = false; setMiaAnalysis(null); }}
                className="mt-2 px-3 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Markets with Duration Tabs ───
function SidebarMarkets({ markets, currentId }: { markets: MarketData[]; currentId: string }) {
  const durations = [...new Set(markets.map(m => m.duration))].sort((a, b) => a - b);
  const durKey = durations.join(',');
  const [activeDur, setActiveDur] = useState<number>(durations[0] || 5);

  useEffect(() => {
    if (durations.length > 0 && !durations.includes(activeDur)) {
      setActiveDur(durations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durKey]);

  const filtered = markets.filter(m => m.duration === activeDur);

  const durLabel = (d: number) => d < 60 ? `${d}min` : `${d / 60}h`;

  return (
    <div className="bg-card/50 border border-border/20 rounded-xl overflow-hidden max-h-[300px] flex flex-col">
      <div className="flex border-b border-border/20 px-1 pt-1">
        {durations.map(d => (
          <button
            key={d}
            onClick={() => setActiveDur(d)}
            className={`flex-1 px-2 py-1.5 text-[10px] font-bold transition-all border-b-2 ${
              activeDur === d
                ? 'text-amber-400 border-amber-400'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {durLabel(d)}
          </button>
        ))}
      </div>
      <div className="p-2 overflow-y-auto flex-1 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-[10px] py-4">No markets</div>
        ) : (
          filtered.map(m => (
            <Link
              key={m.id}
              href={`/markets/${m.id}`}
              className={`flex items-center justify-between p-2 rounded-lg transition-all no-underline ${
                m.id === currentId ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{ASSET_ICONS[m.asset]}</span>
                <span className="text-xs font-bold">{m.asset}</span>
                {m.status === 'active' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono">${formatPrice(m.currentPrice)}</span>
                <span className={`text-[9px] font-bold ${m.currentPrice >= m.startPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.currentPrice >= m.startPrice ? '+' : ''}{m.priceChangePercent.toFixed(2)}%
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
