'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(0);
  useEffect(() => {
    fetch('/api/visitors').then(r => r.json()).then(d => setVisitorCount(d.online || 0)).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border/30 bg-[#080810] mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-base font-bold">Wis<span className="text-amber-400">ery</span></span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              The wisdom of the crowd. Ask questions, vote, predict outcomes, and earn WSR tokens.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider mb-3">Platform</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Explore</Link>
              <Link href="/feed" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Feed</Link>
              <Link href="/predictions" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Predictions</Link>
              <Link href="/leaderboard" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Leaderboard</Link>
              <Link href="/earn" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Earn</Link>
              <Link href="/token" className="block text-[12px] text-amber-400 hover:text-amber-300 no-underline font-semibold">🪙 WSR Token Guide</Link>
            </div>
          </div>

          {/* Rules & Legal */}
          <div>
            <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider mb-3">Rules & Legal</h4>
            <div className="space-y-2">
              <Link href="/terms" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Terms of Service</Link>
              <Link href="/privacy" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Privacy Policy</Link>
              <Link href="/guidelines" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Community Guidelines</Link>
              <Link href="/disclaimer" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Token Disclaimer</Link>
              <Link href="/rules" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Platform Rules</Link>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider mb-3">Community</h4>
            <div className="space-y-2">
              <a href="https://t.me/wisery" target="_blank" rel="noopener" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Telegram</a>
              <a href="https://x.com/wisery" target="_blank" rel="noopener" className="block text-[12px] text-muted-foreground hover:text-amber-400 no-underline">Twitter / X</a>
              <span className="block text-[12px] text-muted-foreground">Discord</span>
              <span className="block text-[12px] text-muted-foreground">Blog</span>
            </div>
          </div>
        </div>

        {/* Rules Summary */}
        <div className="bg-secondary/20 border border-border/20 rounded-xl p-4 mb-6">
          <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">Platform Rules</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-muted-foreground">
            <div>1. You cannot vote on your own question</div>
            <div>2. One vote per question per user</div>
            <div>3. Questions have expiry time (15min - 30 days)</div>
            <div>4. +3 XP for creating a question</div>
            <div>5. +1 XP for each vote cast</div>
            <div>6. 250 XP = 1 WSR Token</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t border-border/20">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Wisery. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground" id="visitor-tracker">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {visitorCount} online now
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
