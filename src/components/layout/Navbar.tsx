'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Search, Plus, Menu, TrendingUp, Trophy, Zap,
  User, Settings, Crown, LogOut, Bell, X, LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/supabase/auth-context';

const navLinks = [
  { href: '/', icon: TrendingUp, label: 'Markets' },
  { href: '/predictions', icon: Zap, label: 'Predict' },
  { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a14]/90 backdrop-blur-xl border-b border-border/50">
      <div className="container h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block">
            Crowd<span className="text-indigo-400">Mind</span>
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            className="pl-9 h-9 bg-secondary/50 border-border/50 text-sm"
          />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 text-[13px]">
                <link.icon size={15} />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={16} />
          </Button>

          <Link href="/ask">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-8 px-3 text-[13px] font-semibold">
              <Plus size={14} />
              <span className="hidden sm:inline">Ask</span>
            </Button>
          </Link>

          {!loading && user && (
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </Button>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-lg bg-secondary animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-lg overflow-hidden border border-border/50 hover:border-indigo-500/50 transition-colors cursor-pointer"
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-[#141420] border border-border/50 shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">@{profile?.username || 'user'}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Lv.{profile?.level || 1}</Badge>
                        <span className="text-[10px] text-muted-foreground">{profile?.xp || 0} XP</span>
                      </div>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="p-1">
                      <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-secondary/50 transition-colors no-underline text-foreground">
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-secondary/50 transition-colors no-underline text-foreground">
                        <User size={14} /> Profile
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-secondary/50 transition-colors no-underline text-foreground">
                        <Settings size={14} /> Settings
                      </Link>
                      <Link href="/pricing" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-secondary/50 transition-colors no-underline text-foreground">
                        <Crown size={14} /> Premium
                      </Link>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="p-1">
                      <button
                        onClick={() => { setDropdownOpen(false); signOut(); }}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-secondary/50 transition-colors text-red-400 w-full cursor-pointer"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm" className="h-8 text-[13px] gap-1.5 border-border/50">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setMenuOpen(true)}>
            <Menu size={16} />
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/50 bg-[#0a0a14] overflow-hidden"
          >
            <div className="p-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search markets..." className="pl-9 h-9 bg-secondary/50 border-border/50" autoFocus />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile side menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-[#0c0c18] border-l border-border/50 z-50 p-4"
            >
              <div className="flex justify-end mb-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                      <link.icon size={18} /> {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
