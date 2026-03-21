'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  BarChart3, Send, TrendingUp, Clock,
  Flame, Camera, Vote, Sparkles, Plus, Hash, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber, timeAgo } from '@/lib/utils';

type FeedFilter = 'all' | 'polls' | 'predictions' | 'trending';

export default function FeedPage() {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [composing, setComposing] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.ok ? r.json() : { questions: [] })
      .then(data => {
        setQuestions(data.questions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'polls') return q.category !== 'predictions';
    if (filter === 'predictions') return q.category === 'predictions' || q.category === 'crypto' || q.category === 'finance';
    if (filter === 'trending') return (q.totalVotes || 0) >= 5;
    return true;
  });

  const trendingTags = [...new Set(questions.flatMap((q: any) => {
    const tags: string[] = [];
    if (q.category) tags.push(`#${q.category}`);
    return tags;
  }))].slice(0, 8);

  return (
    <div className="max-w-full mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Feed */}
        <div>
          {/* Compose Box */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-md border border-border/30 rounded-2xl p-4 mb-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg shrink-0">
                🙂
              </div>
              <div className="flex-1">
                <div
                  onClick={() => setComposing(true)}
                  className={cn(
                    'w-full rounded-xl bg-secondary/30 border border-border/20 px-4 py-3 text-[14px] text-muted-foreground cursor-text hover:border-border/40 transition-colors',
                    composing && 'border-amber-500/30'
                  )}
                >
                  {composing ? (
                    <textarea
                      autoFocus
                      placeholder="What's on your mind? Ask a question..."
                      className="w-full bg-transparent outline-none resize-none text-foreground min-h-[60px]"
                    />
                  ) : (
                    "What's on your mind? Ask a question..."
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                      <Camera size={15} className="text-emerald-400" /> Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                      <BarChart3 size={15} className="text-amber-400" /> Poll
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                      <TrendingUp size={15} className="text-purple-400" /> Predict
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                      <Hash size={15} className="text-cyan-400" /> Tag
                    </Button>
                  </div>
                  <Link href="/ask">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white h-8 px-4 text-[12px] font-bold"
                    >
                      <Send size={13} className="mr-1" /> Post
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feed Filters */}
          <div className="flex gap-2 mb-5">
            {[
              { key: 'all' as const, label: 'All', icon: Sparkles },
              { key: 'polls' as const, label: 'Polls', icon: Vote },
              { key: 'predictions' as const, label: 'Predictions', icon: TrendingUp },
              { key: 'trending' as const, label: 'Trending', icon: Flame },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer border',
                  filter === f.key
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                    : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:bg-white/5'
                )}
              >
                <f.icon size={13} /> {f.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw size={24} className="animate-spin mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Loading feed...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-muted-foreground mb-3">No posts yet</p>
                <Link href="/ask">
                  <Button size="sm" className="bg-amber-600 text-white">Ask a Question</Button>
                </Link>
              </div>
            ) : (
              <AnimatePresence>
                {filteredQuestions.map((q: any, i: number) => {
                  const totalVotes = q.options?.reduce((sum: number, o: any) => sum + (o.voteCount || 0), 0) || q.totalVotes || 0;
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="bg-card/40 backdrop-blur-md border border-border/20 rounded-2xl overflow-hidden hover:border-border/40 transition-all"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-lg font-bold text-white">
                            {(q.user?.displayName || q.user?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-bold">{q.user?.displayName || q.user?.username || 'User'}</span>
                              {q.user?.level && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                                  Lv.{q.user.level}
                                </Badge>
                              )}
                              {q.category && (
                                <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-0 px-1.5 py-0 h-4">
                                  {q.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {q.user?.username ? `@${q.user.username}` : ''} · {timeAgo(q.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal size={16} />
                        </Button>
                      </div>

                      {/* Content */}
                      <div className="px-4 pb-3">
                        <Link href={`/questions/${q.id}`} className="no-underline text-inherit">
                          <p className="text-[14px] leading-relaxed mb-2 font-medium hover:text-primary transition-colors">
                            {q.title}
                          </p>
                        </Link>
                        {q.description && (
                          <p className="text-[13px] text-muted-foreground mb-2 line-clamp-2">{q.description}</p>
                        )}
                        {q.category && (
                          <span className="text-[11px] text-amber-400 font-medium cursor-pointer hover:underline">
                            #{q.category}
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      {q.imageUrl && (
                        <div className="px-4 pb-3">
                          <img
                            src={q.imageUrl}
                            alt=""
                            className="w-full rounded-xl object-cover max-h-[300px]"
                          />
                        </div>
                      )}

                      {/* Poll Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="px-4 pb-3 space-y-2">
                          {q.options.map((opt: any, idx: number) => {
                            const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                            return (
                              <Link
                                key={opt.id || idx}
                                href={`/questions/${q.id}`}
                                className="w-full relative rounded-xl border border-border/30 overflow-hidden h-11 flex items-center cursor-pointer hover:border-amber-500/30 transition-colors no-underline text-inherit block"
                              >
                                <div
                                  className="absolute inset-y-0 left-0 bg-amber-500/10 vote-bar"
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="relative flex items-center justify-between w-full px-4">
                                  <span className="text-[13px] font-medium">{opt.label}</span>
                                  <span className="text-[12px] font-bold text-amber-400">{pct}%</span>
                                </div>
                              </Link>
                            );
                          })}
                          <p className="text-[11px] text-muted-foreground text-center mt-1">
                            {formatNumber(totalVotes)} votes
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-border/10">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2 hover:text-red-400">
                            <Heart size={15} /> {formatNumber(totalVotes)}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                            <MessageCircle size={15} /> {q.totalComments || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                            <Share2 size={15} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Bookmark size={15} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block space-y-5">
          {/* Trending Tags */}
          <div className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2 mb-3">
              <Flame size={15} className="text-orange-400" />
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.length > 0 ? trendingTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-secondary/30 border border-border/20 text-[12px] font-medium text-amber-400 cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/20 transition-all"
                >
                  {tag}
                </span>
              )) : (
                <p className="text-[11px] text-muted-foreground">No trending tags yet</p>
              )}
            </div>
          </div>

          {/* Create CTA */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
            <h3 className="text-[14px] font-bold mb-1">Start a Poll</h3>
            <p className="text-[11px] text-muted-foreground mb-3">
              Ask anything and earn XP when people vote
            </p>
            <Link href="/ask">
              <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-[12px] h-9">
                <Plus size={14} className="mr-1" /> Create Poll
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
