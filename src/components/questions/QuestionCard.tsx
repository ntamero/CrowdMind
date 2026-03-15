'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, Share2, Bookmark, TrendingUp,
  BarChart3, Sparkles, Users,
} from 'lucide-react';
import type { Question } from '@/types';
import { formatNumber, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        return { ...opt, votes: newVotes, percentage: Math.round((newVotes / newTotal) * 100) };
      })
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-xl p-5 mb-3 hover:border-border transition-colors"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {question.user.displayName.charAt(0)}
          </div>
          <div>
            <span className="text-[13px] font-semibold">{question.user.displayName}</span>
            <span className="text-[11px] text-muted-foreground ml-2">{timeAgo(question.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {question.status === 'trending' && (
            <Badge variant="secondary" className="text-[10px] gap-1 bg-red-500/10 text-red-400 border-0">
              <TrendingUp size={10} /> Trending
            </Badge>
          )}
          {question.aiAnalysis && (
            <Badge variant="secondary" className="text-[10px] gap-1 bg-indigo-500/10 text-indigo-400 border-0">
              <Sparkles size={10} /> AI
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] border-0 capitalize">
            {question.category}
          </Badge>
        </div>
      </div>

      {/* Title & Description */}
      <Link href={`/questions/${question.id}`} className="no-underline text-inherit">
        <h3 className="text-[16px] font-bold leading-snug mb-1.5 hover:text-indigo-400 transition-colors cursor-pointer">
          {question.title}
        </h3>
      </Link>
      {question.description && (
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {question.description}
        </p>
      )}

      {/* Voting Options */}
      <div className="space-y-2 mb-4">
        {localOptions.map((option) => {
          const isVoted = voted === option.id;
          const showResults = !!voted;
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!voted}
              className={cn(
                'relative w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-[13px] font-medium transition-all overflow-hidden',
                isVoted
                  ? 'border-2 bg-card'
                  : 'border border-border/60 bg-secondary/30 hover:bg-secondary/60 cursor-pointer',
                voted && !isVoted && 'opacity-70',
              )}
              style={{ borderColor: isVoted ? option.color : undefined }}
            >
              {/* Progress fill */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${option.percentage}%` }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-y-0 left-0 rounded-lg"
                  style={{ background: `${option.color}12` }}
                />
              )}
              <span className="relative z-10">{option.text}</span>
              {showResults && (
                <span className="relative z-10 font-bold text-[14px]" style={{ color: option.color }}>
                  {option.percentage}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5 font-semibold">
            <Users size={13} /> {formatNumber(localTotal)} votes
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare size={13} /> {question.totalComments}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <Bookmark size={14} fill={bookmarked ? '#f59e0b' : 'none'} className={bookmarked ? 'text-amber-500' : 'text-muted-foreground'} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowShare(true)}
          >
            <Share2 size={14} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Tags */}
      {question.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-3">
          {question.tags.map((tag) => (
            <span key={tag} className="text-[11px] text-indigo-400/70 bg-indigo-500/5 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} title={question.title} url={`/questions/${question.id}`} />
    </motion.div>
  );
}
