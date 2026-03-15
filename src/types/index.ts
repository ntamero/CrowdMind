// ============================================
// CrowdMind AI - Core Type Definitions
// ============================================

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  reputation: number;
  level: number;
  badge: 'newcomer' | 'contributor' | 'expert' | 'oracle' | 'legend';
  totalVotes: number;
  totalQuestions: number;
  totalPredictions: number;
  predictionAccuracy: number;
  streak: number;
  joinedAt: string;
  isPremium: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  color: string;
}

export interface Question {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  category: QuestionCategory;
  options: QuestionOption[];
  totalVotes: number;
  totalComments: number;
  aiAnalysis?: AIAnalysis;
  tags: string[];
  status: 'active' | 'closed' | 'trending' | 'sponsored';
  visibility: 'public' | 'premium';
  createdAt: string;
  expiresAt?: string;
  isBookmarked?: boolean;
  userVote?: string;
}

export type QuestionCategory =
  | 'business'
  | 'technology'
  | 'design'
  | 'lifestyle'
  | 'finance'
  | 'sports'
  | 'politics'
  | 'entertainment'
  | 'education'
  | 'health'
  | 'other';

export interface Vote {
  id: string;
  questionId: string;
  userId: string;
  optionId: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  category: string;
  currentValue?: number;
  targetDate: string;
  options: PredictionOption[];
  totalParticipants: number;
  status: 'open' | 'closed' | 'resolved';
  result?: string;
  prize?: number;
  createdAt: string;
}

export interface PredictionOption {
  id: string;
  text: string;
  odds: number;
  participants: number;
  isCorrect?: boolean;
}

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  insights: string[];
  recommendation?: string;
  demographics?: {
    label: string;
    value: number;
  }[];
  trendDirection: 'up' | 'down' | 'stable';
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  accuracy: number;
  streak: number;
  change: number;
}

export interface Notification {
  id: string;
  type: 'vote' | 'comment' | 'prediction' | 'achievement' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  questionId: string;
  text: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface DailyQuestion {
  id: string;
  title: string;
  description: string;
  category: QuestionCategory;
  xpReward: number;
  expiresAt: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalQuestions: number;
  totalVotes: number;
  totalPredictions: number;
  activeNow: number;
  questionsToday: number;
}
