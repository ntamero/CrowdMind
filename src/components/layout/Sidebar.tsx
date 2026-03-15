'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp, Zap, Trophy, User, Settings,
  BarChart3, Flame, Globe, Star, Brain, Crown, Shield,
} from 'lucide-react';
import { categories } from '@/lib/mock-data';

const mainLinks = [
  { href: '/', icon: TrendingUp, label: 'Explore', color: '#6366f1' },
  { href: '/predictions', icon: Zap, label: 'Predictions', color: '#f59e0b' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: '#10b981' },
  { href: '/ai-analysis', icon: Brain, label: 'AI Engine', color: '#06b6d4' },
  { href: '/profile', icon: User, label: 'Profile', color: '#8b5cf6' },
  { href: '/pricing', icon: Crown, label: 'Premium', color: '#ec4899' },
  { href: '/settings', icon: Settings, label: 'Settings', color: '#64748b' },
  { href: '/admin', icon: Shield, label: 'Admin', color: '#64748b' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: 'fixed', left: 0, top: 70, bottom: 0, width: 240,
        background: 'rgba(8, 8, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--glass-border)',
        padding: '20px 10px',
        overflowY: 'auto',
        zIndex: 40,
      }}
      className="sidebar-desktop"
    >
      {/* Main nav */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 1.5,
          padding: '0 14px', marginBottom: 10,
        }}>
          Menu
        </div>
        {mainLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 12,
                textDecoration: 'none', fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: 2,
                position: 'relative',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: active ? `${link.color}18` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}>
                <Icon size={17} style={{ color: active ? link.color : 'inherit' }} />
              </div>
              {link.label}
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '0 2px 2px 0',
                  background: link.color,
                }} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 1.5,
          padding: '0 14px', marginBottom: 10,
        }}>
          Categories
        </div>
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.value}
            href={`/?category=${cat.value}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 10,
              textDecoration: 'none', fontSize: 13,
              color: 'var(--text-secondary)', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 15 }}>{cat.icon}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div style={{
        margin: '0 4px', padding: 16, borderRadius: 14,
        background: 'rgba(14, 14, 50, 0.6)',
        border: '1px solid var(--glass-border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 14, fontSize: 12, fontWeight: 700, color: 'var(--primary-light)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#10b981',
            display: 'inline-block',
          }} className="pulse-dot" />
          <Flame size={13} />
          Live Now
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StatItem icon={<Globe size={13} />} label="Online" value="3,420" color="#10b981" />
          <StatItem icon={<BarChart3 size={13} />} label="Votes today" value="24.5K" color="#6366f1" />
          <StatItem icon={<Star size={13} />} label="New questions" value="127" color="#f59e0b" />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>
    </aside>
  );
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        {icon} {label}
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}
