'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, BarChart3, MessageSquare, Zap, Award, Settings, Check } from 'lucide-react';
import { mockNotifications } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';
import type { Notification } from '@/types';

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  vote: <BarChart3 size={16} color="#6366f1" />,
  comment: <MessageSquare size={16} color="#06b6d4" />,
  prediction: <Zap size={16} color="#f59e0b" />,
  achievement: <Award size={16} color="#10b981" />,
  system: <Settings size={16} color="#64748b" />,
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 40, height: 40, borderRadius: 10, background: 'var(--bg-card)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative',
          color: 'var(--text-secondary)',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16,
            borderRadius: 8, background: '#ef4444', fontSize: 10, fontWeight: 700,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }} className="pulse-dot">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setIsOpen(false)} />
          <div
            className="glass-card"
            style={{
              position: 'absolute', top: 48, right: 0, width: 380, maxHeight: 480,
              overflowY: 'auto', zIndex: 61, padding: 0,
            }}
          >
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 700 }}>Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: 12, color: 'var(--primary-light)', background: 'none',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            {notifications.map((notif) => {
              const content = (
                <div
                  key={notif.id}
                  style={{
                    padding: '12px 18px', borderBottom: '1px solid var(--border)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {typeIcons[notif.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: notif.read ? 500 : 700, marginBottom: 2 }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {timeAgo(notif.createdAt)}
                    </div>
                  </div>
                  {!notif.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)',
                      flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                </div>
              );

              return notif.link ? (
                <Link key={notif.id} href={notif.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {content}
                </Link>
              ) : (
                <div key={notif.id}>{content}</div>
              );
            })}

            <div style={{
              padding: '12px 18px', textAlign: 'center',
            }}>
              <Link
                href="/notifications"
                style={{ fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
