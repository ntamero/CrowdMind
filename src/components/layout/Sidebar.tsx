'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp, Zap, Trophy, User, Settings,
  Brain, Crown, Shield, BarChart3, Flame, Globe, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

const mainLinks = [
  { href: '/', icon: TrendingUp, label: 'Explore' },
  { href: '/predictions', icon: Zap, label: 'Predictions' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/ai-analysis', icon: Brain, label: 'AI Engine' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/pricing', icon: Crown, label: 'Premium' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/admin', icon: Shield, label: 'Admin' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-[240px] bg-[#0a0a14]/95 backdrop-blur-xl border-r border-border/40 flex-col z-40 overflow-y-auto">
      {/* Navigation */}
      <div className="p-3 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[1.5px] px-3 mb-2">
          Menu
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
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <link.icon size={16} />
                {link.label}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-border/30" />

        {/* Categories */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[1.5px] px-3 mb-2">
          Topics
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
      <div className="p-3 border-t border-border/30">
        <div className="bg-secondary/30 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <Flame size={12} className="text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-400">Live</span>
          </div>
          <div className="space-y-2.5">
            <StatRow icon={<Globe size={12} />} label="Online" value="3,420" />
            <StatRow icon={<BarChart3 size={12} />} label="Votes today" value="24.5K" />
            <StatRow icon={<Star size={12} />} label="Questions" value="127" />
          </div>
        </div>
      </div>
    </aside>
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
