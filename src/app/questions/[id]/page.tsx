'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, BarChart3, MessageSquare, Share2, Bookmark, TrendingUp,
  ArrowUp, ArrowDown, Minus, Sparkles, Clock, Users, Target,
  Lightbulb, ChevronRight, ThumbsUp, Send,
} from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/supabase/auth-context';
import ShareModal from '@/components/shared/ShareModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Question, Comment } from '@/types';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { refreshProfile } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        // Try API first (real DB)
        const res = await fetch(`/api/questions/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setQuestion(data);
            // Fetch comments
            const commRes = await fetch(`/api/comments?questionId=${id}`);
            if (commRes.ok) {
              const commData = await commRes.json();
              setComments(commData.comments || []);
            }
            return;
          }
        }
      } catch {
        // API failed
      }
    }
    fetchQuestion();
  }, [id]);

  if (!question) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-muted-foreground text-lg">Question not found</h2>
      </div>
    );
  }

  const handleVote = async (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    setVoteMessage(null);
    // Optimistic update
    setQuestion((prev) => {
      if (!prev) return prev;
      const newTotal = prev.totalVotes + 1;
      return {
        ...prev,
        totalVotes: newTotal,
        options: prev.options.map((opt) => {
          const newVotes = opt.id === optionId ? opt.votes + 1 : opt.votes;
          return { ...opt, votes: newVotes, percentage: Math.round((newVotes / newTotal) * 100) };
        }),
      };
    });
    // Send to API
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id, optionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'Already voted') {
          setVoteMessage('You already voted on this question!');
        } else if (res.status === 401) {
          setVoteMessage('Please sign in to vote.');
        } else {
          setVoteMessage(data.error || 'Vote failed');
        }
        setVoted(null);
        // Revert optimistic update
        setQuestion((prev) => {
          if (!prev) return prev;
          const newTotal = prev.totalVotes - 1;
          return {
            ...prev,
            totalVotes: newTotal,
            options: prev.options.map((opt) => {
              const newVotes = opt.id === optionId ? opt.votes - 1 : opt.votes;
              return { ...opt, votes: newVotes, percentage: newTotal > 0 ? Math.round((newVotes / newTotal) * 100) : 0 };
            }),
          };
        });
        return;
      }
      setVoteMessage('Vote recorded! +1 XP earned');
      refreshProfile(); // Update XP in navbar/profile
    } catch {
      setVoted(null);
      setVoteMessage('Network error');
    }
    setTimeout(() => setShowAI(true), 800);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id, text: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post comment');
      }
    } catch {
      alert('Network error');
    }
  };

  const analysis = question.aiAnalysis;
  const trendIcon =
    analysis?.trendDirection === 'up' ? <ArrowUp className="size-4 text-emerald-500" />
    : analysis?.trendDirection === 'down' ? <ArrowDown className="size-4 text-red-500" />
    : <Minus className="size-4 text-amber-500" />;

  return (
    <div className="mx-auto max-w-[800px] py-5">
      {/* Question Header */}
      <motion.div
        className="mb-5 rounded-xl border border-border/30 bg-card/50 p-8 backdrop-blur-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
            {question.user.displayName.charAt(0)}
          </div>
          <div>
            <div className="text-base font-bold text-foreground">{question.user.displayName}</div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="size-3" /> {timeAgo(question.createdAt)}
              <span className="mx-1">·</span>
              <Users className="size-3" /> {formatNumber(question.totalVotes)} votes
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            {question.status === 'trending' && (
              <Badge variant="destructive" className="gap-1">
                <TrendingUp className="size-3" /> Trending
              </Badge>
            )}
          </div>
        </div>

        <h1 className="mb-3 text-[28px] font-extrabold leading-tight text-foreground">
          {question.title}
        </h1>
        <p className="mb-5 text-base leading-relaxed text-muted-foreground">
          {question.description}
        </p>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Voting Options */}
        <motion.div
          className="mb-5 flex flex-col gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {question.options.map((option) => {
            const isVoted = voted === option.id;
            const showResults = !!voted;
            return (
              <motion.button
                key={option.id}
                variants={fadeInUp}
                onClick={() => handleVote(option.id)}
                disabled={!!voted}
                className={cn(
                  'relative flex w-full items-center justify-between overflow-hidden rounded-[14px] border bg-card px-5 py-4 text-left text-[15px] font-semibold text-foreground transition-all duration-300',
                  isVoted
                    ? 'border-2'
                    : 'border-border/50 hover:border-indigo-500/40 hover:bg-card/80',
                  voted ? 'cursor-default' : 'cursor-pointer'
                )}
                style={isVoted ? { borderColor: option.color } : undefined}
              >
                {showResults && (
                  <motion.div
                    className="vote-bar absolute inset-y-0 left-0 rounded-[14px]"
                    style={{ backgroundColor: `${option.color}18` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${option.percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                <span className="relative z-10">{option.text}</span>
                {showResults && (
                  <motion.div
                    className="relative z-10 flex items-center gap-2.5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-[13px] text-muted-foreground">{formatNumber(option.votes)}</span>
                    <span className="text-lg font-extrabold" style={{ color: option.color }}>
                      {option.percentage}%
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Vote Message */}
        {voteMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mb-4 rounded-lg border p-3 text-sm font-semibold text-center',
              voteMessage.includes('XP')
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
            {voteMessage}
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-1.5"
          >
            <MessageSquare className="size-4" /> {comments.length} Comments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShare(true)}
            className="gap-1.5"
          >
            <Share2 className="size-4" /> Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBookmarked(!bookmarked)}
            className={cn('gap-1.5', bookmarked && 'border-indigo-500/40 text-indigo-400')}
          >
            <Bookmark
              className="size-4"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>
      </motion.div>

      {/* AI Analysis Panel */}
      <AnimatePresence>
        {analysis && (voted || showAI) && (
          <motion.div
            className="mb-5 rounded-xl border border-indigo-500/25 bg-card/50 p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex size-[42px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain className="size-[22px] text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">AI Analysis</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3 text-indigo-400" />
                  Confidence: {analysis.confidence}%
                  <span className="mx-1">·</span>
                  Trend: {trendIcon}
                </div>
              </div>
            </div>

            <motion.div
              className="mb-5 rounded-xl bg-indigo-500/[0.08] p-4 text-[15px] leading-relaxed text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {analysis.summary}
            </motion.div>

            <div className="mb-5">
              <h4 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
                <Lightbulb className="size-4 text-amber-500" /> Key Insights
              </h4>
              <motion.div
                className="flex flex-col gap-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {analysis.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="flex items-start gap-2 rounded-[10px] bg-card p-2.5 px-3.5 text-sm text-muted-foreground"
                  >
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-indigo-400" />
                    {insight}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {analysis.recommendation && (
              <motion.div
                className="flex items-start gap-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Target className="mt-0.5 size-[18px] shrink-0 text-emerald-500" />
                <div>
                  <div className="mb-1 text-[13px] font-bold text-emerald-500">AI Recommendation</div>
                  <div className="text-sm leading-normal text-muted-foreground">{analysis.recommendation}</div>
                </div>
              </motion.div>
            )}

            {analysis.demographics && (
              <div className="mt-5">
                <h4 className="mb-3 text-sm font-bold text-foreground">Vote Distribution by Age</h4>
                <div className="flex gap-3">
                  {analysis.demographics.map((demo) => (
                    <div key={demo.label} className="flex-1 text-center">
                      <div className="relative mb-1.5 h-20 overflow-hidden rounded-lg bg-card">
                        <motion.div
                          className="absolute inset-x-0 bottom-0 rounded-lg bg-gradient-to-t from-indigo-500 to-purple-600"
                          initial={{ height: 0 }}
                          animate={{ height: `${demo.value}%` }}
                          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-foreground">{demo.value}%</div>
                      <div className="text-[11px] text-muted-foreground">{demo.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt to vote */}
      <AnimatePresence>
        {!voted && (
          <motion.div
            className="mb-5 rounded-xl border border-amber-500/20 bg-card/50 p-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Sparkles className="mx-auto mb-2 size-6 text-amber-500" />
            <p className="mb-1 text-[15px] font-semibold text-foreground">Vote to unlock AI Analysis</p>
            <p className="text-[13px] text-muted-foreground">Cast your vote above to see AI-powered insights and recommendations</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="rounded-xl border border-border/30 bg-card/50 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
              <MessageSquare className="size-5 text-indigo-400" />
              Comments ({comments.length})
            </h3>

            {/* Add comment */}
            <div className="mb-6 flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                A
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="mb-2 resize-y bg-card/80"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className={cn(
                      'gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700',
                      !newComment.trim() && 'opacity-50'
                    )}
                  >
                    <Send className="size-3.5" /> Post
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Comments list */}
            <motion.div
              className="flex flex-col gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  variants={fadeInUp}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-[13px] font-bold text-white">
                      {comment.user.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{comment.user.displayName}</div>
                      <div className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</div>
                    </div>
                  </div>
                  <p className="mb-2.5 text-sm leading-normal text-muted-foreground">
                    {comment.text}
                  </p>
                  <Button
                    variant="outline"
                    size="xs"
                    className={cn(
                      'gap-1.5',
                      comment.isLiked ? 'border-indigo-500/40 text-indigo-400' : 'text-muted-foreground'
                    )}
                  >
                    <ThumbsUp className="size-3" /> {comment.likes}
                  </Button>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={question.title}
        url={`/questions/${question.id}`}
      />
    </div>
  );
}
