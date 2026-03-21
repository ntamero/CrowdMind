'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp, Zap, Trophy, User, Settings,
  Brain, Crown, Shield, BarChart3, Flame, Globe, Star,
  LayoutDashboard, Rss, Wallet, Gift, MessageCircle,
  Hash, Sparkles, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

const mainLinks = [
  { href: '/', icon: TrendingUp, label: 'Explore' },
  { href: '/feed', icon: Rss, label: 'Feed' },
  { href: '/markets', icon: Activity, label: 'Quick Markets', badge: 'LIVE' },
  { href: '/predictions', icon: Zap, label: 'Predictions' },
  { href: '/earn', icon: Gift, label: 'Earn' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/ai-analysis', icon: Brain, label: 'MIA Engine' },
];

const accountLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/admin', icon: Shield, label: 'Admin' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-[240px] bg-[#0a0a14]/95 backdrop-blur-xl border-r border-border/40 flex-col z-40 overflow-y-auto">
      {/* Main Navigation */}
      <div className="p-3 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[1.5px] px-3 mb-2">
          Explore
        </p>
        <div className="space-y-0.5">
          {mainLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all relative no-underline',
                  active
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <link.icon size={16} />
                {link.label}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-500" />
                )}
                {(link as any).badge === 'LIVE' && (
                  <span className="ml-auto text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
                {link.label === 'Earn' && (
                  <span className="ml-auto text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">NEW</span>
                )}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-border/30" />

        {/* Account */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[1.5px] px-3 mb-2">
          Account
        </p>
        <div className="space-y-0.5">
          {accountLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all relative no-underline',
                  active
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <link.icon size={16} />
                {link.label}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-500" />
                )}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-border/30" />

        {/* Trending Topics */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[1.5px] px-3 mb-2">
          <Hash size={10} className="inline mr-1" />
          Trending
        </p>
        <div className="space-y-0.5">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.value}
              href={`/?category=${cat.value}`}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors no-underline"
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Live Stats Footer */}
      <SidebarStats />
    </aside>
  );
}

function SidebarStats() {
  const [stats, setStats] = React.useState<any>(null);
  React.useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);
  const d = stats?.display || { online: 0, votesCast: 0, markets: 0, earned: 0 };
  return (
    <div className="p-3 border-t border-border/30">
      <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-xl p-3.5">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          <Sparkles size={12} className="text-amber-400" />
          <span className="text-[11px] font-semibold text-amber-400">Wisery Live</span>
        </div>
        <div className="space-y-2.5">
          <StatRow icon={<Globe size={12} />} label="Users" value={String(d.online)} />
          <StatRow icon={<BarChart3 size={12} />} label="Votes" value={String(d.votesCast)} />
          <StatRow icon={<Star size={12} />} label="Questions" value={String(d.markets)} />
          <StatRow icon={<Flame size={12} />} label="WSR Earned" value={String(d.earned)} />
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon} {label}
      </div>
      <span className="text-[12px] font-bold text-foreground">{value}</span>
    </div>
  );
}
