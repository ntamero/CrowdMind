'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Bell, Shield, Palette,
  Eye, Moon, Sun, Monitor, Volume2, Mail, Smartphone, Save, LogOut, Trash2,
  CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/supabase/auth-context';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Profile form state — loaded from real user data
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [notifications, setNotifications] = useState({
    votes: true, comments: true, predictions: true, achievements: true,
    email: false, push: true, daily: true,
  });
  const [privacyToggles, setPrivacyToggles] = useState({
    publicProfile: true, showVotingHistory: false,
    showPredictionAccuracy: true, allowReferralTracking: true,
  });
  const [accentColor, setAccentColor] = useState('#6366f1');

  // Load real user data
  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setDisplayName(data.user.displayName || '');
          setUsername(data.user.username || '');
          setEmail(data.user.email || '');
          setBio(data.user.bio || '');
        }
      })
      .catch(() => {});
  }, []);

  // Fallback to profile context if API hasn't loaded yet
  useEffect(() => {
    if (profile && !displayName && !username) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
    }
  }, [profile, displayName, username]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, username, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch {
      window.location.href = '/auth';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const themeOptions = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="mx-auto max-w-[900px] py-5">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2.5 text-[28px] font-extrabold text-foreground"
      >
        <Settings size={28} className="text-primary" /> Settings
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-fit rounded-xl border border-border/30 bg-card/50 p-3"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2.5 rounded-[10px] border-none px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer ${
                  active ? 'bg-primary/10 font-semibold text-primary' : 'bg-transparent font-medium text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border/30 bg-card/50 p-7"
        >
          {/* ═══ PROFILE ═══ */}
          {activeTab === 'profile' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Profile Settings</h3>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.text}
                </div>
              )}

              <div className="mb-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Display Name</label>
                  <Input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Username</label>
                  <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                </div>
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Email</label>
                <Input type="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Bio</label>
                <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {activeTab === 'notifications' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Notification Preferences</h3>
              {[
                { key: 'votes', label: 'Vote updates', desc: 'When someone votes on your question', icon: <Eye size={18} /> },
                { key: 'comments', label: 'Comments', desc: 'New comments on your questions', icon: <Mail size={18} /> },
                { key: 'predictions', label: 'Prediction results', desc: 'When predictions are resolved', icon: <Bell size={18} /> },
                { key: 'achievements', label: 'Achievements', desc: 'When you unlock new badges', icon: <Shield size={18} /> },
                { key: 'email', label: 'Email digest', desc: 'Weekly email summary', icon: <Mail size={18} /> },
                { key: 'push', label: 'Push notifications', desc: 'Browser push notifications', icon: <Smartphone size={18} /> },
                { key: 'daily', label: 'Daily questions', desc: 'Notification for daily challenge', icon: <Volume2 size={18} /> },
              ].map((item) => {
                const checked = notifications[item.key as keyof typeof notifications];
                return (
                  <div key={item.key} className="flex items-center justify-between border-b border-border/20 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{item.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-border'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${checked ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ PRIVACY ═══ */}
          {activeTab === 'privacy' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Privacy & Security</h3>
              {[
                { key: 'publicProfile', label: 'Public profile', desc: 'Allow others to see your profile and stats' },
                { key: 'showVotingHistory', label: 'Show voting history', desc: 'Display your votes on your profile' },
                { key: 'showPredictionAccuracy', label: 'Show prediction accuracy', desc: 'Display your prediction track record' },
                { key: 'allowReferralTracking', label: 'Allow referral tracking', desc: 'Track friends you invite' },
              ].map((item) => {
                const checked = privacyToggles[item.key as keyof typeof privacyToggles];
                return (
                  <div key={item.key} className="flex items-center justify-between border-b border-border/20 py-3.5">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setPrivacyToggles(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-border'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${checked ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}

              <Separator className="my-6" />

              <div>
                <h4 className="mb-3 text-[15px] font-bold text-red-500">Danger Zone</h4>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleLogout} className="flex items-center gap-1.5 text-muted-foreground">
                    <LogOut size={16} /> Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ APPEARANCE ═══ */}
          {activeTab === 'appearance' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Appearance</h3>

              {/* Theme Selection */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-foreground">Theme</label>
                <div className="flex gap-3">
                  {mounted && themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl p-4 text-sm font-semibold transition-all border-0 ${
                          isActive
                            ? 'border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                            : 'border border-border bg-card hover:bg-secondary text-foreground'
                        }`}
                        style={isActive ? { borderWidth: 2, borderColor: 'var(--primary)', borderStyle: 'solid' } : { borderWidth: 1, borderColor: 'var(--border)', borderStyle: 'solid' }}
                      >
                        <Icon size={18} /> {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-foreground">Accent Color</label>
                <div className="flex gap-2.5">
                  {[
                    { color: '#6366f1', label: 'Indigo' },
                    { color: '#ef4444', label: 'Red' },
                    { color: '#10b981', label: 'Green' },
                    { color: '#f59e0b', label: 'Amber' },
                    { color: '#ec4899', label: 'Pink' },
                    { color: '#06b6d4', label: 'Cyan' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => setAccentColor(item.color)}
                      title={item.label}
                      className={`h-10 w-10 cursor-pointer rounded-[10px] transition-transform hover:scale-110 border-0 ${
                        accentColor === item.color ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : ''
                      }`}
                      style={{ background: item.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
