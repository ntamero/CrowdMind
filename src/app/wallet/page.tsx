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
  const { isConnected, address, balance, wsrBalance, chainName, connect, disconnect, isConnecting, switchToPolygon, refreshWsrBalance, sendWSR } = useWallet();
  const { profile } = useAuth();

  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState(1);
  const [showConvert, setShowConvert] = useState(false);
  const [convertDirection, setConvertDirection] = useState<'xp-to-wsr' | 'wsr-to-xp'>('xp-to-wsr');
  const [depositAmount, setDepositAmount] = useState(1);
  const [depositing, setDepositing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [onChainBalance, setOnChainBalance] = useState<{ wsr: string; pol: string } | null>(null);
  const [onchainDepositAmount, setOnchainDepositAmount] = useState(1);
  const [onchainDepositing, setOnchainDepositing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showOnchainDeposit, setShowOnchainDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [siteWallet, setSiteWallet] = useState<{ siteWalletAddress: string; siteWalletWSR: string } | null>(null);
  const [importing, setImporting] = useState(false);

  const POOL_WALLET = '0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119';

  const fetchSiteWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/site-wallet');
      if (res.ok) {
        const data = await res.json();
        setSiteWallet(data);
      }
    } catch {}
  }, []);

  // Import on-chain WSR from site wallet into account balance
  const handleImportBalance = async () => {
    if (importing) return;
    setImporting(true);
    setMessage(null);
    try {
      setMessage({ type: 'success', text: 'Importing WSR balance...' });
      const res = await fetch('/api/wallet/site-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchClaimData();
        fetchSiteWallet();
      } else {
        setMessage({ type: 'error', text: data.error || 'Import failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Import failed' });
    }
    setImporting(false);
  };

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

  const fetchOnChainBalance = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/wallet/balance?address=${addr}`);
      if (res.ok) {
        const data = await res.json();
        setOnChainBalance({ wsr: data.wsrBalance, pol: data.polBalance });
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchClaimData();
    fetchSiteWallet();
  }, [fetchClaimData, fetchSiteWallet]);

  useEffect(() => {
    if (address) fetchOnChainBalance(address);
  }, [address, fetchOnChainBalance]);

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

  const handleDeposit = async () => {
    if (depositing) return;
    setDepositing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: depositAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowConvert(false);
        fetchClaimData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Deposit failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setDepositing(false);
  };

  // On-chain deposit: MetaMask → Site (send WSR to pool wallet, backend credits account)
  const handleOnchainDeposit = async () => {
    if (onchainDepositing || !isConnected) return;
    setOnchainDepositing(true);
    setMessage(null);
    try {
      // Step 1: Send WSR from connected MetaMask wallet to user's site wallet
      const depositTo = siteWallet?.siteWalletAddress || POOL_WALLET;
      setMessage({ type: 'success', text: 'Confirm the transaction in MetaMask...' });
      const txHash = await sendWSR(depositTo, onchainDepositAmount);

      // Step 2: Wait for backend to verify on-chain and credit account (retry up to 6 times)
      setMessage({ type: 'success', text: 'Transaction sent! Verifying on chain...' });
      let verified = false;
      for (let attempt = 0; attempt < 6; attempt++) {
        if (attempt > 0) {
          setMessage({ type: 'success', text: `Waiting for confirmation... (attempt ${attempt + 1}/6)` });
          await new Promise(r => setTimeout(r, 5000));
        }
        const res = await fetch('/api/wallet/onchain-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({ type: 'success', text: data.message || `Deposited ${onchainDepositAmount} WSR!` });
          setShowOnchainDeposit(false);
          fetchClaimData();
          refreshWsrBalance();
          verified = true;
          break;
        } else if (data.error?.includes('not confirmed') && attempt < 5) {
          continue; // retry
        } else {
          setMessage({ type: 'error', text: data.error || 'Deposit verification failed' });
          verified = true;
          break;
        }
      }
      if (!verified) {
        setMessage({ type: 'error', text: 'Transaction sent but verification timed out. TX: ' + txHash.slice(0, 14) + '... Try refreshing the page.' });
      }
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setMessage({ type: 'error', text: 'Transaction rejected' });
      } else {
        setMessage({ type: 'error', text: err.message || 'Deposit failed' });
      }
    }
    setOnchainDepositing(false);
  };

  // On-chain withdraw: Site → MetaMask (backend sends WSR to user's wallet)
  const handleWithdraw = async () => {
    if (withdrawing || !isConnected) return;
    setWithdrawing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `${data.message} TX: ${data.txHash?.slice(0, 14)}...` });
        setShowWithdraw(false);
        fetchClaimData();
        refreshWsrBalance();
      } else {
        setMessage({ type: 'error', text: data.error || 'Withdrawal failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Withdrawal failed' });
    }
    setWithdrawing(false);
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

          {/* Site WSR Wallet Address */}
          {siteWallet?.siteWalletAddress && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-3 mt-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Coins size={14} className="text-purple-400 shrink-0" />
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Your WSR Wallet</p>
                <span className="text-[10px] font-bold font-mono text-purple-300 ml-auto">{parseFloat(siteWallet.siteWalletWSR || '0').toLocaleString()} WSR on-chain</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-purple-300 break-all select-all flex-1">{siteWallet.siteWalletAddress}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(siteWallet.siteWalletAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="shrink-0 px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer text-purple-300"
                >
                  {copied ? <><CheckCircle2 size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                </button>
                <a
                  href={`https://amoy.polygonscan.com/address/${siteWallet.siteWalletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer text-purple-300 no-underline"
                >
                  <ExternalLink size={10} /> Explorer
                </a>
              </div>
              {/* Import balance button */}
              {parseFloat(siteWallet.siteWalletWSR || '0') > 0 && (
                <button
                  type="button"
                  onClick={handleImportBalance}
                  disabled={importing}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 border-0"
                >
                  {importing ? <><RefreshCw size={12} className="animate-spin" /> Importing...</> : <><ArrowDownLeft size={12} /> Import {parseFloat(siteWallet.siteWalletWSR).toLocaleString()} WSR to Account</>}
                </button>
              )}
            </div>
          )}

          {/* MetaMask Wallet */}
          {(address || claimData?.walletAddress) && (
            <div className="bg-card/30 rounded-xl p-3 mt-2 flex items-center gap-2">
              <Wallet size={14} className="text-amber-400 shrink-0" />
              <p className="text-[10px] text-muted-foreground shrink-0">MetaMask:</p>
              <p className="text-xs font-mono text-amber-400 break-all select-all flex-1">{address || claimData?.walletAddress}</p>
            </div>
          )}

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

          {/* Convert buttons: XP↔WSR */}
          <div className="mt-5 flex items-center gap-3">
            <Button
              onClick={() => { setConvertDirection('xp-to-wsr'); setShowConvert(!showConvert || convertDirection !== 'xp-to-wsr'); }}
              disabled={claimableWSR < 1 && convertDirection === 'xp-to-wsr' && showConvert}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-2 h-12 text-sm font-bold shadow-lg shadow-amber-600/20"
            >
              <ArrowUpRight size={16} />
              XP → WSR
              {claimableWSR > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{claimableWSR} WSR</span>}
            </Button>
            <Button
              onClick={() => { setConvertDirection('wsr-to-xp'); setShowConvert(!showConvert || convertDirection !== 'wsr-to-xp'); }}
              disabled={unclaimedWSR < 1 && convertDirection === 'wsr-to-xp' && showConvert}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white gap-2 h-12 text-sm font-bold shadow-lg shadow-blue-600/20"
            >
              <ArrowDownLeft size={16} />
              WSR → XP
              {unclaimedWSR > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{unclaimedWSR} WSR</span>}
            </Button>
            {!isConnected && (
              <Button
                onClick={connect}
                disabled={isConnecting}
                variant="outline"
                className="gap-2 h-12 text-sm font-bold border-amber-500/30 text-amber-400"
              >
                <Wallet size={16} />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>

        {/* ─── Convert Panel (XP↔WSR) ─── */}
        <AnimatePresence>
          {showConvert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className={cn(
                'border rounded-2xl p-5',
                convertDirection === 'xp-to-wsr'
                  ? 'bg-card/50 border-amber-500/20'
                  : 'bg-card/50 border-blue-500/20'
              )}>
                {/* Direction tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setConvertDirection('xp-to-wsr')}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all',
                      convertDirection === 'xp-to-wsr'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-secondary/20 text-muted-foreground border border-transparent hover:bg-secondary/30'
                    )}
                  >
                    <ArrowUpRight size={14} /> XP → WSR
                  </button>
                  <button
                    onClick={() => setConvertDirection('wsr-to-xp')}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all',
                      convertDirection === 'wsr-to-xp'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-secondary/20 text-muted-foreground border border-transparent hover:bg-secondary/30'
                    )}
                  >
                    <ArrowDownLeft size={14} /> WSR → XP
                  </button>
                </div>

                {/* ══ XP → WSR ══ */}
                {convertDirection === 'xp-to-wsr' && (
                  <>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <ArrowUpRight size={16} className="text-amber-400" />
                      Convert XP to WSR Tokens
                    </h3>

                    <div className="bg-secondary/20 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-bold">{xpPerWSR} XP = 1 WSR</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-bold text-orange-400">{fee} XP per transaction</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your XP</span>
                        <span className="font-bold font-mono">{xp.toLocaleString()} XP</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Amount (WSR):</p>
                      <input
                        type="number"
                        min={1}
                        max={claimableWSR}
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(Math.max(1, Math.min(claimableWSR, parseInt(e.target.value) || 1)))}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/20 border border-amber-500/20 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-amber-500/50 mb-2"
                        placeholder="Enter WSR amount"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 5, 10, 25, 100].filter(a => a <= claimableWSR).map(amt => (
                          <button key={amt} onClick={() => setConvertAmount(amt)} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border', convertAmount === amt ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                            {amt}
                          </button>
                        ))}
                        {claimableWSR >= 1 && (
                          <button onClick={() => setConvertAmount(claimableWSR)} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border', convertAmount === claimableWSR ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                            MAX ({claimableWSR})
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">XP to spend</span>
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
                        <Clock size={12} /> Cooldown: wait {cooldown} minutes
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={handleConvert} disabled={converting || cooldown > 0 || claimableWSR < 1} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-11 font-bold gap-2">
                        {converting ? <><RefreshCw size={14} className="animate-spin" /> Converting...</> : <><ArrowUpRight size={14} /> Convert {convertAmount} WSR</>}
                      </Button>
                      <Button onClick={() => setShowConvert(false)} variant="outline" className="h-11 border-border/30">Cancel</Button>
                    </div>

                    {claimableWSR < 1 && (
                      <p className="text-[10px] text-muted-foreground mt-3">
                        Need at least {xpPerWSR + fee} XP ({xpPerWSR} XP + {fee} XP fee) to convert 1 WSR.
                      </p>
                    )}
                  </>
                )}

                {/* ══ WSR → XP ══ */}
                {convertDirection === 'wsr-to-xp' && (
                  <>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <ArrowDownLeft size={16} className="text-blue-400" />
                      Convert WSR to XP
                    </h3>

                    <div className="bg-secondary/20 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-bold">1 WSR = {xpPerWSR} XP</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-bold text-orange-400">{fee} XP per transaction</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Unclaimed WSR</span>
                        <span className="font-bold font-mono text-blue-400">{unclaimedWSR} WSR</span>
                      </div>
                    </div>

                    {unclaimedWSR >= 1 ? (
                      <>
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">Amount (WSR):</p>
                          <input
                            type="number"
                            min={1}
                            max={Math.floor(unclaimedWSR)}
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(Math.max(1, Math.min(Math.floor(unclaimedWSR), parseInt(e.target.value) || 1)))}
                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/20 border border-blue-500/20 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-blue-500/50 mb-2"
                            placeholder="Enter WSR amount"
                          />
                          <div className="flex items-center gap-2 flex-wrap">
                            {[1, 10, 100, 1000, 5000].filter(a => a <= Math.floor(unclaimedWSR)).map(amt => (
                              <button key={amt} onClick={() => setDepositAmount(amt)} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border', depositAmount === amt ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                                {amt.toLocaleString()}
                              </button>
                            ))}
                            <button onClick={() => setDepositAmount(Math.floor(unclaimedWSR))} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border', depositAmount === Math.floor(unclaimedWSR) ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                              MAX ({Math.floor(unclaimedWSR).toLocaleString()})
                            </button>
                          </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">WSR to convert</span>
                            <span className="font-bold font-mono">{depositAmount} WSR</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">XP value</span>
                            <span className="font-bold font-mono">{(depositAmount * xpPerWSR).toLocaleString()} XP</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Fee</span>
                            <span className="font-bold font-mono text-orange-400">-{fee} XP</span>
                          </div>
                          <div className="border-t border-blue-500/10 pt-2 mt-2 flex items-center justify-between text-sm">
                            <span className="font-bold text-emerald-400">You receive</span>
                            <span className="font-bold font-mono text-emerald-400">{(depositAmount * xpPerWSR - fee).toLocaleString()} XP</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button onClick={handleDeposit} disabled={depositing || unclaimedWSR < 1} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-11 font-bold gap-2">
                            {depositing ? <><RefreshCw size={14} className="animate-spin" /> Converting...</> : <><ArrowDownLeft size={14} /> Convert {depositAmount} WSR → {(depositAmount * xpPerWSR - fee).toLocaleString()} XP</>}
                          </Button>
                          <Button onClick={() => setShowConvert(false)} variant="outline" className="h-11 border-border/30">Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-2">No unclaimed WSR available</p>
                        <p className="text-xs text-muted-foreground">First convert XP → WSR, then you can convert back if needed.</p>
                      </div>
                    )}
                  </>
                )}
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
                  {(() => {
                    const wsr = wsrBalance || onChainBalance?.wsr;
                    return wsr ? parseFloat(wsr).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
                  })()} <span className="text-xs">WSR</span>
                </p>
              </div>
              <div className="bg-secondary/20 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">Native Balance (Gas)</p>
                <p className="text-lg font-bold font-mono text-purple-400">
                  {(() => {
                    const pol = balance || onChainBalance?.pol;
                    return pol ? parseFloat(pol).toFixed(4) : '0';
                  })()} <span className="text-xs">POL</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { refreshWsrBalance(); if (address) fetchOnChainBalance(address); }}
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

        {/* ─── On-Chain Operations (Deposit WSR from MetaMask / Withdraw WSR to MetaMask) ─── */}
        {isConnected && address && (
          <div className="bg-card/30 border border-purple-500/20 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <ArrowRightLeft size={14} className="text-purple-400" />
              On-Chain WSR Transfer
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Deposit from MetaMask */}
              <Button
                onClick={() => { setShowOnchainDeposit(!showOnchainDeposit); setShowWithdraw(false); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2 h-12 text-sm font-bold shadow-lg shadow-emerald-600/20"
              >
                <ArrowDownLeft size={16} />
                Deposit WSR
                <span className="text-[10px] opacity-70">MetaMask → Site</span>
              </Button>

              {/* Withdraw to MetaMask */}
              <Button
                onClick={() => { setShowWithdraw(!showWithdraw); setShowOnchainDeposit(false); }}
                disabled={(unclaimedWSR || 0) < 1}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2 h-12 text-sm font-bold shadow-lg shadow-violet-600/20"
              >
                <ArrowUpRight size={16} />
                Withdraw WSR
                <span className="text-[10px] opacity-70">Site → MetaMask</span>
              </Button>
            </div>

            {/* ═══ On-Chain Deposit Panel ═══ */}
            <AnimatePresence>
              {showOnchainDeposit && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="border border-emerald-500/20 rounded-xl p-4 bg-emerald-500/5">
                    <h4 className="text-xs font-bold mb-3 flex items-center gap-2 text-emerald-400">
                      <ArrowDownLeft size={14} />
                      Deposit WSR from MetaMask to Site
                    </h4>

                    <div className="bg-secondary/20 rounded-lg p-3 mb-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">From (MetaMask)</span>
                        <span className="font-mono text-[10px] text-amber-400">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MetaMask WSR</span>
                        <span className="font-bold font-mono text-emerald-400">
                          {(() => { const w = wsrBalance || onChainBalance?.wsr; return w ? parseFloat(w).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'; })()} WSR
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border/10 pt-1">
                        <span className="text-muted-foreground">To (Site Wallet)</span>
                        <span className="font-mono text-[10px] text-purple-400">{(siteWallet?.siteWalletAddress || POOL_WALLET).slice(0, 8)}...{(siteWallet?.siteWalletAddress || POOL_WALLET).slice(-6)}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Amount to deposit:</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 10, 100, 1000, 10000].map(amt => (
                          <button key={amt} onClick={() => setOnchainDepositAmount(amt)} className={cn('px-3 py-2 rounded-lg text-xs font-bold transition-all border', onchainDepositAmount === amt ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                            {amt.toLocaleString()} WSR
                          </button>
                        ))}
                        {wsrBalance && parseFloat(wsrBalance) >= 1 && (
                          <button onClick={() => setOnchainDepositAmount(Math.floor(parseFloat(wsrBalance)))} className={cn('px-3 py-2 rounded-lg text-xs font-bold transition-all border', onchainDepositAmount === Math.floor(parseFloat(wsrBalance || '0')) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                            MAX
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 mb-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WSR to deposit</span>
                        <span className="font-bold font-mono">{onchainDepositAmount.toLocaleString()} WSR</span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-500/10 pt-1">
                        <span className="font-bold text-emerald-400">Credited to your account</span>
                        <span className="font-bold font-mono text-emerald-400">{onchainDepositAmount.toLocaleString()} WSR</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mb-3">
                      MetaMask will open to confirm the WSR transfer. After confirmation, your site balance will be credited.
                    </p>

                    <div className="flex gap-3">
                      <Button onClick={handleOnchainDeposit} disabled={onchainDepositing} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-10 font-bold gap-2 text-xs">
                        {onchainDepositing ? <><RefreshCw size={12} className="animate-spin" /> Processing...</> : <><ArrowDownLeft size={12} /> Deposit {onchainDepositAmount.toLocaleString()} WSR</>}
                      </Button>
                      <Button onClick={() => setShowOnchainDeposit(false)} variant="outline" className="h-10 border-border/30 text-xs">Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Withdraw Panel ═══ */}
            <AnimatePresence>
              {showWithdraw && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="border border-violet-500/20 rounded-xl p-4 bg-violet-500/5">
                    <h4 className="text-xs font-bold mb-3 flex items-center gap-2 text-violet-400">
                      <ArrowUpRight size={14} />
                      Withdraw WSR to MetaMask
                    </h4>

                    <div className="bg-secondary/20 rounded-lg p-3 mb-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your unclaimed WSR</span>
                        <span className="font-bold font-mono text-violet-400">{unclaimedWSR} WSR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Withdraw to</span>
                        <span className="font-mono text-[10px]">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                      </div>
                    </div>

                    {unclaimedWSR >= 1 ? (
                      <>
                        <div className="mb-3">
                          <p className="text-[10px] text-muted-foreground mb-2">Amount to withdraw:</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[1, 5, 10, 50, 100].filter(a => a <= Math.floor(unclaimedWSR)).map(amt => (
                              <button key={amt} onClick={() => setWithdrawAmount(amt)} className={cn('px-3 py-2 rounded-lg text-xs font-bold transition-all border', withdrawAmount === amt ? 'bg-violet-500/20 text-violet-400 border-violet-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                                {amt} WSR
                              </button>
                            ))}
                            <button onClick={() => setWithdrawAmount(Math.floor(unclaimedWSR))} className={cn('px-3 py-2 rounded-lg text-xs font-bold transition-all border', withdrawAmount === Math.floor(unclaimedWSR) ? 'bg-violet-500/20 text-violet-400 border-violet-500/40' : 'bg-secondary/20 text-muted-foreground border-transparent hover:bg-secondary/40')}>
                              MAX ({Math.floor(unclaimedWSR)})
                            </button>
                          </div>
                        </div>

                        <div className="bg-violet-500/5 border border-violet-500/10 rounded-lg p-3 mb-3 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">WSR to withdraw</span>
                            <span className="font-bold font-mono">{withdrawAmount} WSR</span>
                          </div>
                          <div className="flex justify-between border-t border-violet-500/10 pt-1">
                            <span className="font-bold text-violet-400">Sent to your MetaMask</span>
                            <span className="font-bold font-mono text-violet-400">{withdrawAmount} WSR</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground mb-3">
                          WSR will be sent to your connected wallet on Polygon Amoy. This may take a few seconds.
                        </p>

                        <div className="flex gap-3">
                          <Button onClick={handleWithdraw} disabled={withdrawing} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white h-10 font-bold gap-2 text-xs">
                            {withdrawing ? <><RefreshCw size={12} className="animate-spin" /> Sending...</> : <><ArrowUpRight size={12} /> Withdraw {withdrawAmount} WSR</>}
                          </Button>
                          <Button onClick={() => setShowWithdraw(false)} variant="outline" className="h-10 border-border/30 text-xs">Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground">No unclaimed WSR available for withdrawal.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Convert XP → WSR first, or deposit WSR from MetaMask.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              { icon: Gift, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Earn XP', desc: 'Vote, predict, comment, create questions' },
              { icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Convert', desc: `${xpPerWSR} XP = 1 WSR (${fee} XP fee)` },
              { icon: ArrowDownLeft, color: 'text-teal-400', bg: 'bg-teal-500/10', title: 'Deposit', desc: 'Send WSR from MetaMask to site' },
              { icon: ArrowUpRight, color: 'text-violet-400', bg: 'bg-violet-500/10', title: 'Withdraw', desc: 'Send WSR from site to MetaMask' },
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
