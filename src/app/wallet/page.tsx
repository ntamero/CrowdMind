'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink,
  Shield, Zap, RefreshCw, Clock, ArrowRightLeft,
  CheckCircle2, AlertCircle, Coins, Gift, TrendingUp,
  ChevronRight, Flame, Award, LogOut, Unplug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/lib/supabase/auth-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClaimData {
  currentXP: number;
  xpPerWSR: number;
  conversionFee: number;
  claimableWSR: number;
  unclaimedWSR: number;
  totalClaimedWSR: number;
  walletConnected: boolean;
  walletAddress: string | null;
  cooldownRemaining: number;
  recentTxs: {
    id: string;
    type: string;
    amount: number;
    status: string;
    txHash: string | null;
    description: string | null;
    createdAt: string;
  }[];
}

export default function WalletPage() {
  const { isConnected, address, balance, wsrBalance, chainName, connect, disconnect, isConnecting, switchToPolygon, refreshWsrBalance } = useWallet();
  const { profile } = useAuth();

  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState(1);
  const [showConvert, setShowConvert] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchClaimData = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/claim');
      if (res.ok) {
        const data = await res.json();
        setClaimData(data);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClaimData();
  }, [fetchClaimData]);

  const handleConvert = async () => {
    if (converting || !claimData) return;
    setConverting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/wallet/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: convertAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowConvert(false);
        fetchClaimData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Conversion failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setConverting(false);
  };

  const xp = claimData?.currentXP ?? profile?.xp ?? 0;
  const xpPerWSR = claimData?.xpPerWSR ?? 250;
  const fee = claimData?.conversionFee ?? 10;
  const claimableWSR = claimData?.claimableWSR ?? 0;
  const unclaimedWSR = claimData?.unclaimedWSR ?? 0;
  const totalClaimedWSR = claimData?.totalClaimedWSR ?? 0;
  const cooldown = claimData?.cooldownRemaining ?? 0;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* ─── XP Wallet Card ─── */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/5 border border-amber-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/20">
                <Wallet size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">XP Wallet</p>
                <h1 className="text-3xl font-black font-mono">{xp.toLocaleString()} <span className="text-amber-400 text-lg">XP</span></h1>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => fetchClaimData()}
              variant="ghost"
              className="text-[11px] gap-1 text-muted-foreground"
            >
              <RefreshCw size={12} /> Refresh
            </Button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="bg-card/30 rounded-xl p-3 text-center">
              <Coins size={14} className="text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Available XP</p>
              <p className="text-base font-bold font-mono">{xp.toLocaleString()}</p>
            </div>
            <div className="bg-card/30 rounded-xl p-3 text-center">
              <ArrowRightLeft size={14} className="text-blue-400 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Convertible</p>
              <p className="text-base font-bold font-mono text-blue-400">{claimableWSR} WSR</p>
            </div>
            <div className="bg-card/30 rounded-xl p-3 text-center">
              <Clock size={14} className="text-orange-400 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Pending</p>
              <p className="text-base font-bold font-mono text-orange-400">{unclaimedWSR} WSR</p>
            </div>
            <div className="bg-card/30 rounded-xl p-3 text-center">
              <CheckCircle2 size={14} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Claimed</p>
              <p className="text-base font-bold font-mono text-emerald-400">{totalClaimedWSR} WSR</p>
            </div>
          </div>

          {/* Convert XP → WSR button */}
          <div className="mt-5 flex items-center gap-3">
            <Button
              onClick={() => setShowConvert(!showConvert)}
              disabled={claimableWSR < 1}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-2 h-12 text-sm font-bold shadow-lg shadow-amber-600/20"
            >
              <ArrowRightLeft size={16} />
              Convert XP to WSR
              {claimableWSR > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{claimableWSR} WSR available</span>}
            </Button>
            {!isConnected && (
              <Button
                onClick={connect}
                disabled={isConnecting}
                variant="outline"
                className="gap-2 h-12 text-sm font-bold border-amber-500/30 text-amber-400"
              >
                <Wallet size={16} />
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
            )}
          </div>
        </div>

        {/* ─── Convert Panel ─── */}
        <AnimatePresence>
          {showConvert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-card/50 border border-amber-500/20 rounded-2xl p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-amber-400" />
                  Convert XP to WSR Tokens
                </h3>

                {/* Conversion info */}
                <div className="bg-secondary/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-bold">{xpPerWSR} XP = 1 WSR</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Conversion Fee</span>
                    <span className="font-bold text-orange-400">{fee} XP per transaction</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your XP</span>
                    <span className="font-bold font-mono">{xp.toLocaleString()} XP</span>
                  </div>
                </div>

                {/* Amount selector */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Amount to convert:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[1, 5, 10, 25].filter(a => a <= claimableWSR).map(amt => (
                      <button
                        key={amt}
                        onClick={() => setConvertAmount(amt)}
                        className={cn(
                          'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                          convertAmount === amt
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40'
                        )}
                      >
                        {amt} WSR
                      </button>
                    ))}
                    <button
                      onClick={() => setConvertAmount(claimableWSR)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                        convertAmount === claimableWSR
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40'
                      )}
                    >
                      MAX ({claimableWSR} WSR)
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">XP to convert</span>
                    <span className="font-bold font-mono">{(convertAmount * xpPerWSR).toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-bold font-mono text-orange-400">-{fee} XP</span>
                  </div>
                  <div className="border-t border-amber-500/10 pt-2 mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold">Total deducted</span>
                    <span className="font-bold font-mono">{(convertAmount * xpPerWSR + fee).toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="font-bold text-emerald-400">You receive</span>
                    <span className="font-bold font-mono text-emerald-400">{convertAmount} WSR</span>
                  </div>
                </div>

                {cooldown > 0 && (
                  <div className="text-xs text-orange-400 mb-3 flex items-center gap-1.5">
                    <Clock size={12} />
                    Cooldown: wait {cooldown} minutes before next conversion
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={converting || cooldown > 0 || claimableWSR < 1}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white h-11 font-bold gap-2"
                  >
                    {converting ? (
                      <><RefreshCw size={14} className="animate-spin" /> Converting...</>
                    ) : (
                      <><CheckCircle2 size={14} /> Convert {convertAmount} WSR</>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowConvert(false)}
                    variant="outline"
                    className="h-11 border-border/30"
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-3">
                  WSR tokens will be held as unclaimed until MetaMask wallet is connected for on-chain distribution.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Success/Error Message ─── */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-2',
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              )}
            >
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── MetaMask Connection (if not connected) ─── */}
        {!isConnected && (
          <div className="bg-card/30 border border-border/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Wallet size={22} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-0.5">Connect MetaMask to Withdraw</h3>
                <p className="text-[11px] text-muted-foreground">
                  Connect your wallet to withdraw WSR tokens to Polygon network. You can convert XP without a wallet — tokens are held until withdrawal.
                </p>
              </div>
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white gap-2 h-10 text-xs font-bold"
              >
                <Wallet size={14} /> {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Connected Wallet Info ─── */}
        {isConnected && address && (
          <div className="bg-card/30 border border-emerald-500/20 rounded-2xl p-5 mb-6">
            {/* Header: address + actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Connected Wallet</p>
                  <p className="text-sm font-mono font-bold">{address.slice(0, 6)}...{address.slice(-4)}</p>
                </div>
              </div>
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-0">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block mr-1" />
                {chainName || 'Polygon'}
              </Badge>
            </div>

            {/* Full address with copy */}
            <div className="bg-secondary/20 rounded-xl p-3 mb-3 flex items-center gap-2">
              <p className="text-xs font-mono text-muted-foreground flex-1 break-all select-all">{address}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-secondary/40 hover:bg-secondary/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <><CheckCircle2 size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-secondary/20 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">WSR Token Balance</p>
                <p className="text-lg font-bold font-mono text-amber-400">
                  {wsrBalance ? parseFloat(wsrBalance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'} <span className="text-xs">WSR</span>
                </p>
              </div>
              <div className="bg-secondary/20 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">Native Balance (Gas)</p>
                <p className="text-lg font-bold font-mono text-purple-400">
                  {balance ? parseFloat(balance).toFixed(4) : '0'} <span className="text-xs">POL</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => refreshWsrBalance()}
                className="px-3 py-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={11} /> Refresh Balances
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await (window as any).ethereum?.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC20',
                        options: {
                          address: process.env.NEXT_PUBLIC_WSR_CONTRACT || '',
                          symbol: 'WSR',
                          decimals: 18,
                        },
                      },
                    });
                  } catch {}
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Coins size={11} /> Add WSR to MetaMask
              </button>
              <a
                href={`https://amoy.polygonscan.com/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer no-underline text-foreground"
              >
                <ExternalLink size={11} /> Explorer
              </a>
              {chainName !== 'Polygon Amoy' && chainName !== 'Polygon' && (
                <button
                  type="button"
                  onClick={() => switchToPolygon()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap size={11} /> Switch to Polygon
                </button>
              )}
              <button
                type="button"
                onClick={() => disconnect()}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
              >
                <Unplug size={11} /> Disconnect
              </button>
            </div>
          </div>
        )}

        {/* ─── How It Works ─── */}
        <div className="bg-card/30 border border-border/20 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            How XP Wallet Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { icon: Gift, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Earn XP', desc: 'Vote, predict, and bet correctly' },
              { icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Convert', desc: `${xpPerWSR} XP = 1 WSR (${fee} XP fee)` },
              { icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Connect', desc: 'Link MetaMask wallet' },
              { icon: ArrowUpRight, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Withdraw', desc: 'Claim WSR on Polygon' },
            ].map((step, i) => (
              <div key={step.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/10">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', step.bg)}>
                  <step.icon size={16} className={step.color} />
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{i + 1}.</span> {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Transaction History ─── */}
        <div className="bg-card/30 border border-border/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              Transaction History
            </h3>
            <Button variant="ghost" size="sm" onClick={fetchClaimData} className="text-[11px] gap-1.5">
              <RefreshCw size={12} /> Refresh
            </Button>
          </div>

          <div className="space-y-0.5">
            {(!claimData?.recentTxs || claimData.recentTxs.length === 0) && (
              <p className="text-center text-muted-foreground text-xs py-8">
                No transactions yet. Earn XP by voting, predicting, and betting in Quick Markets!
              </p>
            )}
            {claimData?.recentTxs?.map((tx) => {
              const isCredit = ['earn', 'win', 'daily_bonus', 'referral'].includes(tx.type);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-border/10 last:border-0"
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    isCredit ? 'bg-emerald-500/10' : tx.type === 'claim' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                  )}>
                    {isCredit ? (
                      <ArrowDownLeft size={16} className="text-emerald-400" />
                    ) : tx.type === 'claim' ? (
                      <ArrowRightLeft size={16} className="text-blue-400" />
                    ) : (
                      <ArrowUpRight size={16} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{tx.description || tx.type}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge className={cn(
                        'text-[8px] border-0 px-1.5 py-0',
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-red-500/10 text-red-400'
                      )}>
                        {tx.status}
                      </Badge>
                      {tx.txHash && (
                        <span className="text-[9px] font-mono text-muted-foreground">{tx.txHash.slice(0, 10)}...</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-bold font-mono',
                      isCredit ? 'text-emerald-400' : tx.type === 'claim' ? 'text-blue-400' : 'text-foreground'
                    )}>
                      {isCredit ? '+' : ''}{tx.amount} {tx.type === 'claim' ? 'WSR' : 'XP'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
