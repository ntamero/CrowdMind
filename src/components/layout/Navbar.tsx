'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Brain, Search, Plus, Menu, X,
  TrendingUp, Trophy, User, Settings, Zap, LogOut, Crown,
} from 'lucide-react';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import { useAuth } from '@/lib/supabase/auth-context';

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10, 10, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={22} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Crowd<span style={{ color: 'var(--primary-light)' }}>Mind</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '0 1 420px', display: 'flex', alignItems: 'center' }} className="hidden-mobile">
          <Search size={18} style={{ position: 'absolute', left: 14, color: searchFocused ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.3s' }} />
          <input
            type="text"
            placeholder="Search questions, predictions, users..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ paddingLeft: 42, borderRadius: 12, height: 42, fontSize: 14 }}
          />
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden-mobile">
          <NavLink href="/" icon={<TrendingUp size={18} />} label="Explore" />
          <NavLink href="/predictions" icon={<Zap size={18} />} label="Predict" />
          <NavLink href="/leaderboard" icon={<Trophy size={18} />} label="Ranks" />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/ask" style={{ textDecoration: 'none' }}>
            <button className="btn-glow" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
              <Plus size={18} />
              <span className="hidden-mobile">Ask</span>
            </button>
          </Link>

          {!loading && user && <NotificationDropdown />}

          {/* Auth State */}
          {loading ? (
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }} />
          ) : user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
                  cursor: 'pointer', border: '2px solid var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--gradient-primary)',
                }}
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={18} color="white" />
                )}
              </div>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', top: 50, right: 0, width: 240,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: 8, zIndex: 99,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{profile?.display_name || 'User'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{profile?.username || 'user'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', fontSize: 10 }}>
                          Level {profile?.level || 1}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {profile?.xp || 0} XP
                        </span>
                      </div>
                    </div>
                    <DropdownLink href="/profile" icon={<User size={16} />} label="Profile" onClick={() => setUserMenuOpen(false)} />
                    <DropdownLink href="/settings" icon={<Settings size={16} />} label="Settings" onClick={() => setUserMenuOpen(false)} />
                    <DropdownLink href="/pricing" icon={<Crown size={16} />} label="Go Premium" onClick={() => setUserMenuOpen(false)} />
                    <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                    <button
                      onClick={async () => { setUserMenuOpen(false); await signOut(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 14px', borderRadius: 8, border: 'none',
                        background: 'transparent', color: '#ef4444',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13,
              }}>
                <User size={16} /> Sign In
              </button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', width: 40, height: 40, borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-primary)',
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
          padding: 20, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <input type="text" placeholder="Search..." style={{ marginBottom: 8 }} />
          <MobileLink href="/" icon={<TrendingUp size={18} />} label="Explore" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/predictions" icon={<Zap size={18} />} label="Predictions" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/leaderboard" icon={<Trophy size={18} />} label="Leaderboard" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/profile" icon={<User size={18} />} label="Profile" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/admin" icon={<Settings size={18} />} label="Admin" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderRadius: 10, color: 'var(--text-secondary)', textDecoration: 'none',
        fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
    >
      {icon} {label}
    </Link>
  );
}

function DropdownLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 8, color: 'var(--text-secondary)', textDecoration: 'none',
      fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
    }}>
      {icon} {label}
    </Link>
  );
}

function MobileLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
      borderRadius: 10, color: 'var(--text-secondary)', textDecoration: 'none',
      fontSize: 15, fontWeight: 500,
    }}>
      {icon} {label}
    </Link>
  );
}
