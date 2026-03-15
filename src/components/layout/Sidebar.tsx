'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Zap,
  Trophy,
  User,
  Settings,
  BarChart3,
  Flame,
  Globe,
  Star,
  Brain,
  Crown,
  LogIn,
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
  { href: '/admin', icon: Settings, label: 'Admin', color: '#64748b' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 70,
        bottom: 0,
        width: 240,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--glass-border)',
        padding: '20px 12px',
        overflowY: 'auto',
        zIndex: 40,
      }}
      className="sidebar-desktop"
    >
      {/* Main nav */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            padding: '0 12px',
            marginBottom: 8,
          }}
        >
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
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                transition: 'all 0.2s',
                marginBottom: 2,
              }}
            >
              <Icon size={18} style={{ color: active ? link.color : 'inherit' }} />
              {link.label}
              {active && (
                <div
                  style={{
                    width: 3,
                    height: 20,
                    borderRadius: 2,
                    background: link.color,
                    marginLeft: 'auto',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            padding: '0 12px',
            marginBottom: 8,
          }}
        >
          Categories
        </div>
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.value}
            href={`/?category=${cat.value}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 13,
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div
        className="glass-card"
        style={{
          padding: 16,
          margin: '0 4px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--primary-light)',
          }}
        >
          <Flame size={14} />
          Live Now
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <StatItem icon={<Globe size={14} />} label="Online" value="3,420" />
          <StatItem icon={<BarChart3 size={14} />} label="Votes today" value="24.5K" />
          <StatItem icon={<Star size={14} />} label="New questions" value="127" />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .sidebar-desktop {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        {icon}
        {label}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
