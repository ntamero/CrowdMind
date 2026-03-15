'use client';

import { useState } from 'react';
import { X, Link2, Check, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const platforms = [
    { name: 'Twitter / X', icon: '𝕏', color: '#000', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, color: '#25D366', url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'LinkedIn', icon: 'in', color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Reddit', icon: 'R', color: '#FF4500', url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { name: 'Telegram', icon: '✈', color: '#0088cc', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ padding: 28, width: 420, maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Share this question</h3>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.4 }}>
          &quot;{title}&quot;
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: 12, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)',
                textDecoration: 'none', color: 'var(--text-primary)', fontSize: 11, transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: `${p.color}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: p.color,
              }}>
                {p.icon}
              </div>
              {p.name}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-input)',
            border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {shareUrl}
          </div>
          <button
            onClick={copyLink}
            className="btn-glow"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13, flexShrink: 0 }}
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
