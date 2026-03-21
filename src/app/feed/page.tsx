'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Image, BarChart3, Smile, Send, TrendingUp, Clock,
  Flame, Camera, Vote, Sparkles, Plus, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PostType = 'text' | 'poll' | 'image_poll' | 'prediction';

interface Post {
  id: string;
  user: { name: string; username: string; avatar: string; level: number; };
  content: string;
  type: PostType;
  image?: string;
  pollOptions?: { label: string; votes: number; percentage: number; }[];
  totalVotes?: number;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  tags?: string[];
  earned?: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    user: { name: 'Ayse Demir', username: 'aysedemir', avatar: '👩‍💼', level: 12 },
    content: 'Which outfit should I wear to the tech conference tomorrow? Help me decide! 👗',
    type: 'image_poll',
    image: 'https://picsum.photos/600/400?random=1',
    pollOptions: [
      { label: 'Option A — Blazer + Jeans', votes: 1240, percentage: 62 },
      { label: 'Option B — Full Suit', votes: 760, percentage: 38 },
    ],
    totalVotes: 2000,
    likes: 342,
    comments: 89,
    shares: 23,
    timeAgo: '15m',
    tags: ['fashion', 'conference'],
    earned: '+50 XP',
  },
  {
    id: '2',
    user: { name: 'CryptoKing', username: 'cryptoking', avatar: '👑', level: 24 },
    content: 'Bitcoin just broke $95K resistance. I predict it hits $120K before June. What do you think? 📈',
    type: 'poll',
    pollOptions: [
      { label: 'Yes, $120K+ by June', votes: 8450, percentage: 67 },
      { label: 'No, it will correct first', votes: 2890, percentage: 23 },
      { label: '$150K+ easily', votes: 1260, percentage: 10 },
    ],
    totalVotes: 12600,
    likes: 1823,
    comments: 456,
    shares: 234,
    timeAgo: '1h',
    tags: ['bitcoin', 'crypto', 'prediction'],
    earned: '+100 XP',
  },
  {
    id: '3',
    user: { name: 'FoodieAnna', username: 'foodieanna', avatar: '🍕', level: 8 },
    content: 'Made two versions of my pasta recipe. Which one looks better? Vote and I\'ll share the recipe of the winner! 🍝',
    type: 'image_poll',
    image: 'https://picsum.photos/600/400?random=3',
    pollOptions: [
      { label: 'Creamy Alfredo', votes: 3200, percentage: 55 },
      { label: 'Spicy Arrabbiata', votes: 2600, percentage: 45 },
    ],
    totalVotes: 5800,
    likes: 892,
    comments: 145,
    shares: 67,
    timeAgo: '2h',
    tags: ['food', 'recipe', 'cooking'],
    earned: '+75 XP',
  },
  {
    id: '4',
    user: { name: 'TechGuru', username: 'techguru', avatar: '🤖', level: 18 },
    content: 'Apple is reportedly working on a foldable iPhone. Will it launch in 2027? The crowd\'s wisdom has been surprisingly accurate on Apple predictions. MIA analysis shows 72% confidence.',
    type: 'prediction',
    pollOptions: [
      { label: 'Yes, 2027 launch', votes: 15200, percentage: 58 },
      { label: 'No, 2028 or later', votes: 8400, percentage: 32 },
      { label: 'Never happening', votes: 2600, percentage: 10 },
    ],
    totalVotes: 26200,
    likes: 3241,
    comments: 892,
    shares: 445,
    timeAgo: '4h',
    tags: ['apple', 'tech', 'prediction'],
    earned: '+150 XP',
  },
  {
    id: '5',
    user: { name: 'DesignPro', username: 'designpro', avatar: '🎨', level: 15 },
    content: 'Working on a new brand identity. Which color palette resonates more with "innovation & trust"? Your votes literally shape my design! 🎯',
    type: 'poll',
    pollOptions: [
      { label: 'Deep Blue + Gold', votes: 4100, percentage: 48 },
      { label: 'Teal + Coral', votes: 2800, percentage: 33 },
      { label: 'Purple + Silver', votes: 1600, percentage: 19 },
    ],
    totalVotes: 8500,
    likes: 567,
    comments: 123,
    shares: 45,
    timeAgo: '6h',
    tags: ['design', 'branding', 'color'],
  },
];

const trendingTags = ['#bitcoin', '#fashion', '#ai', '#food', '#tech', '#sports', '#crypto', '#design'];

type FeedFilter = 'all' | 'polls' | 'predictions' | 'trending';

export default function FeedPage() {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [composing, setComposing] = useState(false);

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
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white h-8 px-4 text-[12px] font-bold"
                  >
                    <Send size={13} className="mr-1" /> Post
                  </Button>
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
            <AnimatePresence>
              {mockPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-card/40 backdrop-blur-md border border-border/20 rounded-2xl overflow-hidden hover:border-border/40 transition-all"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-lg">
                        {post.user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold">{post.user.name}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                            Lv.{post.user.level}
                          </Badge>
                          {post.type === 'prediction' && (
                            <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-0 px-1.5 py-0 h-4">
                              <TrendingUp size={8} className="mr-0.5" /> Prediction
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">@{post.user.username} · {post.timeAgo} ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-3">
                    <p className="text-[14px] leading-relaxed mb-3">{post.content}</p>
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[11px] text-amber-400 font-medium cursor-pointer hover:underline">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image */}
                  {post.image && (
                    <div className="px-4 pb-3">
                      <img
                        src={post.image}
                        alt=""
                        className="w-full rounded-xl object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  {/* Poll Options */}
                  {post.pollOptions && (
                    <div className="px-4 pb-3 space-y-2">
                      {post.pollOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          className="w-full relative rounded-xl border border-border/30 overflow-hidden h-11 flex items-center cursor-pointer hover:border-amber-500/30 transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-amber-500/10"
                            style={{ width: `${opt.percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between w-full px-4">
                            <span className="text-[13px] font-medium">{opt.label}</span>
                            <span className="text-[12px] font-bold text-amber-400">{opt.percentage}%</span>
                          </div>
                        </button>
                      ))}
                      <p className="text-[11px] text-muted-foreground text-center mt-1">
                        {post.totalVotes?.toLocaleString()} votes
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/10">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2 hover:text-red-400">
                        <Heart size={15} /> {post.likes.toLocaleString()}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                        <MessageCircle size={15} /> {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 text-[12px] h-8 px-2">
                        <Share2 size={15} /> {post.shares}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.earned && (
                        <span className="text-[11px] font-bold text-emerald-400">{post.earned}</span>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Bookmark size={15} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
              {trendingTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-secondary/30 border border-border/20 text-[12px] font-medium text-amber-400 cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/20 transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl p-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-amber-400" />
              Who to Follow
            </h3>
            <div className="space-y-3">
              {[
                { name: 'CryptoQueen', username: 'cryptoqueen', avatar: '👸', followers: '12.4K' },
                { name: 'DataWizard', username: 'datawizard', avatar: '🧙', followers: '8.9K' },
                { name: 'StyleGuru', username: 'styleguru', avatar: '💃', followers: '15.2K' },
              ].map((user) => (
                <div key={user.username} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center text-base">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.followers} followers</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-3 font-bold border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Create CTA */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
            <h3 className="text-[14px] font-bold mb-1">Start a Poll</h3>
            <p className="text-[11px] text-muted-foreground mb-3">
              Ask anything and earn XP when people vote
            </p>
            <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-[12px] h-9">
              <Plus size={14} className="mr-1" /> Create Poll
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
