'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Bell, Shield, Globe, Palette, CreditCard,
  Eye, Moon, Volume2, Mail, Smartphone, Save, LogOut, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    votes: true, comments: true, predictions: true, achievements: true,
    email: false, push: true, daily: true,
  });
  const [privacyToggles, setPrivacyToggles] = useState({
    publicProfile: true,
    showVotingHistory: false,
    showPredictionAccuracy: true,
    allowReferralTracking: true,
  });
  const [selectedTheme, setSelectedTheme] = useState('Dark');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  };

  return (
    <div className="mx-auto max-w-[900px] py-5">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2.5 text-[28px] font-extrabold text-foreground"
      >
        <Settings size={28} className="text-primary" /> Settings
      </motion.h1>

      <div className="grid grid-cols-[220px_1fr] gap-5">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-fit rounded-xl border border-border/30 bg-card/50 p-3"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2.5 rounded-[10px] border-none px-4 py-3 text-left text-sm transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'bg-transparent font-medium text-muted-foreground hover:bg-secondary'
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-border/30 bg-card/50 p-7"
        >
          {activeTab === 'profile' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Profile Settings</h3>
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Display Name</label>
                  <Input type="text" defaultValue="Alex Chen" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Username</label>
                  <Input type="text" defaultValue="alexchen" />
                </div>
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Email</label>
                <Input type="email" defaultValue="alex@example.com" />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Bio</label>
                <Textarea rows={3} defaultValue="Tech enthusiast, startup founder, and prediction market addict." />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Language</label>
                <select
                  defaultValue="en"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="en">English</option>
                  <option value="tr">Turkce</option>
                  <option value="es">Espanol</option>
                  <option value="fr">Francais</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <Button className="flex items-center gap-2">
                <Save size={16} /> Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Notification Preferences</h3>
              {[
                { key: 'votes', label: 'Vote updates', desc: 'When someone votes on your question', icon: <Eye size={18} /> },
                { key: 'comments', label: 'Comments', desc: 'New comments on your questions', icon: <Mail size={18} /> },
                { key: 'predictions', label: 'Prediction results', desc: 'When predictions are resolved', icon: <Globe size={18} /> },
                { key: 'achievements', label: 'Achievements', desc: 'When you unlock new badges', icon: <Shield size={18} /> },
                { key: 'email', label: 'Email digest', desc: 'Weekly email summary', icon: <Mail size={18} /> },
                { key: 'push', label: 'Push notifications', desc: 'Browser push notifications', icon: <Smartphone size={18} /> },
                { key: 'daily', label: 'Daily questions', desc: 'Notification for daily challenge', icon: <Volume2 size={18} /> },
              ].map((item) => {
                const checked = notifications[item.key as keyof typeof notifications];
                return (
                  <div key={item.key} className="flex items-center justify-between border-b border-border py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{item.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${
                        checked ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${
                          checked ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

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
                  <div key={item.key} className="flex items-center justify-between border-b border-border py-3.5">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setPrivacyToggles((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${
                        checked ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${
                          checked ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}

              <Separator className="my-6" />

              <div>
                <h4 className="mb-3 text-[15px] font-bold text-red-500">Danger Zone</h4>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-1.5 text-muted-foreground">
                    <LogOut size={16} /> Sign Out
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-1.5 border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  >
                    <Trash2 size={16} /> Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Appearance</h3>
              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-foreground">Theme</label>
                <div className="flex gap-3">
                  {['Dark', 'Light', 'System'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl p-4 text-sm font-semibold text-foreground transition-all ${
                        selectedTheme === theme
                          ? 'border-2 border-primary bg-primary/10'
                          : 'border border-border bg-card hover:bg-secondary'
                      }`}
                    >
                      <Moon size={18} /> {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-foreground">Accent Color</label>
                <div className="flex gap-2.5">
                  {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'].map((color) => (
                    <div
                      key={color}
                      className={`h-10 w-10 cursor-pointer rounded-[10px] transition-transform hover:scale-110 ${
                        color === '#6366f1' ? 'border-[3px] border-white' : 'border-2 border-transparent'
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h3 className="mb-5 text-lg font-bold text-foreground">Billing & Subscription</h3>
              <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-1 text-base font-bold text-foreground">Pro Plan</div>
                    <div className="text-[13px] text-muted-foreground">$9.99/month · Renews April 15, 2026</div>
                  </div>
                  <a href="/pricing" className="no-underline">
                    <Button variant="outline">Manage Plan</Button>
                  </a>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Payment method: Visa ending in 4242</p>
                <p>Next billing date: April 15, 2026</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
