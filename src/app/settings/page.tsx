'use client';

import { useState } from 'react';
import {
  Settings, User, Bell, Shield, Globe, Palette, CreditCard,
  Eye, Moon, Volume2, Mail, Smartphone, Save, LogOut, Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    votes: true, comments: true, predictions: true, achievements: true,
    email: false, push: true, daily: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Settings size={28} color="var(--primary)" /> Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar */}
        <div className="glass-card" style={{ padding: 12, height: 'fit-content' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="glass-card" style={{ padding: 28 }}>
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Profile Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Display Name</label>
                  <input type="text" defaultValue="Alex Chen" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Username</label>
                  <input type="text" defaultValue="alexchen" />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Email</label>
                <input type="email" defaultValue="alex@example.com" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Bio</label>
                <textarea rows={3} defaultValue="Tech enthusiast, startup founder, and prediction market addict." />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Language</label>
                <select defaultValue="en">
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
              <button className="btn-glow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h3>
              {[
                { key: 'votes', label: 'Vote updates', desc: 'When someone votes on your question', icon: <Eye size={18} /> },
                { key: 'comments', label: 'Comments', desc: 'New comments on your questions', icon: <Mail size={18} /> },
                { key: 'predictions', label: 'Prediction results', desc: 'When predictions are resolved', icon: <Globe size={18} /> },
                { key: 'achievements', label: 'Achievements', desc: 'When you unlock new badges', icon: <Shield size={18} /> },
                { key: 'email', label: 'Email digest', desc: 'Weekly email summary', icon: <Mail size={18} /> },
                { key: 'push', label: 'Push notifications', desc: 'Browser push notifications', icon: <Smartphone size={18} /> },
                { key: 'daily', label: 'Daily questions', desc: 'Notification for daily challenge', icon: <Volume2 size={18} /> },
              ].map((item) => (
                <div key={item.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: 'var(--text-muted)' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                  <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: notifications[item.key as keyof typeof notifications] ? 'var(--primary)' : 'var(--border)',
                      transition: 'background 0.2s', position: 'relative',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                        position: 'absolute', top: 2,
                        left: notifications[item.key as keyof typeof notifications] ? 22 : 2,
                        transition: 'left 0.2s',
                      }} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Privacy & Security</h3>
              {[
                { label: 'Public profile', desc: 'Allow others to see your profile and stats', default: true },
                { label: 'Show voting history', desc: 'Display your votes on your profile', default: false },
                { label: 'Show prediction accuracy', desc: 'Display your prediction track record', default: true },
                { label: 'Allow referral tracking', desc: 'Track friends you invite', default: true },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={item.default} style={{ display: 'none' }} />
                    <div style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: item.default ? 'var(--primary)' : 'var(--border)',
                      position: 'relative',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                        position: 'absolute', top: 2, left: item.default ? 22 : 2,
                      }} />
                    </div>
                  </label>
                </div>
              ))}

              <div style={{ marginTop: 32 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Danger Zone</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
                    borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  }}>
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Appearance</h3>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block' }}>Theme</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Dark', 'Light', 'System'].map((theme) => (
                    <button key={theme} style={{
                      flex: 1, padding: '16px', borderRadius: 12,
                      border: theme === 'Dark' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: theme === 'Dark' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <Moon size={18} /> {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block' }}>Accent Color</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'].map((color) => (
                    <div key={color} style={{
                      width: 40, height: 40, borderRadius: 10, background: color, cursor: 'pointer',
                      border: color === '#6366f1' ? '3px solid white' : '2px solid transparent',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Billing & Subscription</h3>
              <div className="glass-card" style={{
                padding: 20, marginBottom: 20,
                background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pro Plan</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>$9.99/month · Renews April 15, 2026</div>
                  </div>
                  <a href="/pricing" style={{ textDecoration: 'none' }}>
                    <button className="btn-secondary">Manage Plan</button>
                  </a>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: 8 }}>Payment method: Visa ending in 4242</p>
                <p>Next billing date: April 15, 2026</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
