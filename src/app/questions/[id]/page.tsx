'use client';

import { useState, useEffect, use } from 'react';
import {
  Brain, BarChart3, MessageSquare, Share2, Bookmark, TrendingUp,
  ArrowUp, ArrowDown, Minus, Sparkles, Clock, Users, Target,
  Lightbulb, ChevronRight, ThumbsUp, Send,
} from 'lucide-react';
import { mockQuestions, mockComments } from '@/lib/mock-data';
import { formatNumber, timeAgo } from '@/lib/utils';
import ShareModal from '@/components/shared/ShareModal';
import type { Question, Comment } from '@/types';

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [question, setQuestion] = useState<Question | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const q = mockQuestions.find((q) => q.id === id);
    if (q) {
      setQuestion(q);
      setComments(mockComments.filter((c) => c.questionId === id));
    }
  }, [id]);

  if (!question) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Question not found</h2>
      </div>
    );
  }

  const handleVote = (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
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
    setTimeout(() => setShowAI(true), 800);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: 'c' + Date.now(),
      userId: 'u1',
      user: mockQuestions[0].user,
      questionId: id,
      text: newComment,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const analysis = question.aiAnalysis;
  const trendIcon =
    analysis?.trendDirection === 'up' ? <ArrowUp size={16} color="#10b981" />
    : analysis?.trendDirection === 'down' ? <ArrowDown size={16} color="#ef4444" />
    : <Minus size={16} color="#f59e0b" />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
      {/* Question Header */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: 'white',
          }}>
            {question.user.displayName.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{question.user.displayName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} /> {timeAgo(question.createdAt)}
              <span style={{ margin: '0 4px' }}>·</span>
              <Users size={12} /> {formatNumber(question.totalVotes)} votes
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {question.status === 'trending' && (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <TrendingUp size={12} /> Trending
              </span>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>
          {question.title}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          {question.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {question.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        {/* Voting Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {question.options.map((option) => {
            const isVoted = voted === option.id;
            const showResults = !!voted;
            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={!!voted}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 14,
                  border: isVoted ? `2px solid ${option.color}` : '1px solid var(--border)',
                  background: 'var(--bg-card)', cursor: voted ? 'default' : 'pointer',
                  overflow: 'hidden', transition: 'all 0.3s',
                  color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, width: '100%', textAlign: 'left',
                }}
              >
                {showResults && (
                  <div className="vote-bar" style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${option.percentage}%`, background: `${option.color}18`, borderRadius: 14,
                  }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{option.text}</span>
                {showResults && (
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatNumber(option.votes)}</span>
                    <span style={{ fontWeight: 800, color: option.color, fontSize: 18 }}>{option.percentage}%</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowComments(!showComments)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={16} /> {comments.length} Comments
          </button>
          <button className="btn-secondary" onClick={() => setShowShare(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={16} /> Share
          </button>
          <button className="btn-secondary" onClick={() => setBookmarked(!bookmarked)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bookmark size={16} fill={bookmarked ? 'var(--accent)' : 'none'} color={bookmarked ? 'var(--accent)' : 'currentColor'} />
            {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {analysis && (voted || showAI) && (
        <div className="glass-card" style={{ padding: 32, marginBottom: 20, border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={22} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>AI Analysis</h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={12} color="var(--primary-light)" />
                Confidence: {analysis.confidence}%
                <span style={{ margin: '0 4px' }}>·</span>
                Trend: {trendIcon}
              </div>
            </div>
          </div>

          <div style={{
            padding: 16, borderRadius: 12, background: 'rgba(99, 102, 241, 0.08)',
            marginBottom: 20, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)',
          }}>
            {analysis.summary}
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={16} color="var(--accent)" /> Key Insights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.insights.map((insight, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px',
                  borderRadius: 10, background: 'var(--bg-card)', fontSize: 14, color: 'var(--text-secondary)',
                }}>
                  <ChevronRight size={16} color="var(--primary-light)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {analysis.recommendation && (
            <div style={{
              padding: 16, borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <Target size={18} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>AI Recommendation</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.recommendation}</div>
              </div>
            </div>
          )}

          {analysis.demographics && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Vote Distribution by Age</h4>
              <div style={{ display: 'flex', gap: 12 }}>
                {analysis.demographics.map((demo) => (
                  <div key={demo.label} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 80, borderRadius: 8, background: 'var(--bg-card)', position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
                      <div className="vote-bar" style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${demo.value}%`, background: 'var(--gradient-primary)', borderRadius: 8,
                      }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{demo.value}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{demo.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompt to vote */}
      {!voted && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: 20 }}>
          <Sparkles size={24} color="var(--accent)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Vote to unlock AI Analysis</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cast your vote above to see AI-powered insights and recommendations</p>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={20} color="var(--primary-light)" />
            Comments ({comments.length})
          </h3>

          {/* Add comment */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              A
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                style={{ marginBottom: 8, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-glow"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  style={{
                    padding: '8px 20px', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: newComment.trim() ? 1 : 0.5,
                  }}
                >
                  <Send size={14} /> Post
                </button>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{
                padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white',
                  }}>
                    {comment.user.displayName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{comment.user.displayName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(comment.createdAt)}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  {comment.text}
                </p>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                  borderRadius: 8, background: 'transparent', border: '1px solid var(--border)',
                  color: comment.isLiked ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  <ThumbsUp size={13} /> {comment.likes}
                </button>
              </div>
            ))}

            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      )}

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
