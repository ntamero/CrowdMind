'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Share2,
  Bookmark,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import type { Question } from '@/types';
import { formatNumber, timeAgo } from '@/lib/utils';
import ShareModal from '@/components/shared/ShareModal';

export default function QuestionCard({ question }: { question: Question }) {
  const [voted, setVoted] = useState<string | null>(null);
  const [localOptions, setLocalOptions] = useState(question.options);
  const [localTotal, setLocalTotal] = useState(question.totalVotes);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleVote = (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    const newTotal = localTotal + 1;
    setLocalTotal(newTotal);
    setLocalOptions((prev) =>
      prev.map((opt) => {
        const newVotes = opt.id === optionId ? opt.votes + 1 : opt.votes;
        return {
          ...opt,
          votes: newVotes,
          percentage: Math.round((newVotes / newTotal) * 100),
        };
      })
    );
  };

  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: 'white',
            }}
          >
            {question.user.displayName.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {question.user.displayName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {timeAgo(question.createdAt)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {question.status === 'trending' && (
            <span
              className="badge"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
              }}
            >
              <TrendingUp size={12} /> Trending
            </span>
          )}
          {question.aiAnalysis && (
            <span
              className="badge"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-light)',
              }}
            >
              <Sparkles size={12} /> AI
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <Link
        href={`/questions/${question.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
            lineHeight: 1.4,
            cursor: 'pointer',
          }}
        >
          {question.title}
        </h3>
      </Link>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        {question.description}
      </p>

      {/* Voting Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {localOptions.map((option) => {
          const isVoted = voted === option.id;
          const showResults = !!voted;
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!voted}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                border: isVoted
                  ? `2px solid ${option.color}`
                  : '1px solid var(--border)',
                background: 'var(--bg-card)',
                cursor: voted ? 'default' : 'pointer',
                overflow: 'hidden',
                transition: 'all 0.3s',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                width: '100%',
                textAlign: 'left',
              }}
            >
              {showResults && (
                <div
                  className="vote-bar"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${option.percentage}%`,
                    background: `${option.color}15`,
                    borderRadius: 12,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {option.text}
              </span>
              {showResults && (
                <span
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    fontWeight: 700,
                    color: option.color,
                    fontSize: 15,
                  }}
                >
                  {option.percentage}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FooterStat icon={<BarChart3 size={14} />} value={formatNumber(localTotal)} label="votes" />
          <FooterStat icon={<MessageSquare size={14} />} value={formatNumber(question.totalComments)} label="comments" />
          {question.expiresAt && (
            <FooterStat icon={<Clock size={14} />} value={timeAgo(question.expiresAt)} label="" />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBtn
            icon={<Bookmark size={16} fill={bookmarked ? 'var(--accent)' : 'none'} color={bookmarked ? 'var(--accent)' : 'var(--text-muted)'} />}
            onClick={() => setBookmarked(!bookmarked)}
          />
          <IconBtn icon={<Share2 size={16} color="var(--text-muted)" />} onClick={() => setShowShare(true)} />
        </div>
      </div>

      {/* Tags */}
      {question.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 12,
          }}
        >
          {question.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={question.title}
        url={`/questions/${question.id}`}
      />
    </div>
  );
}

function FooterStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 13,
        color: 'var(--text-muted)',
      }}
    >
      {icon}
      <span style={{ fontWeight: 600 }}>{value}</span>
      {label && <span>{label}</span>}
    </div>
  );
}

function IconBtn({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'transparent',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {icon}
    </button>
  );
}
