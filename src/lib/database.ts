// ============================================
// CrowdMind AI - Database Layer
// Uses Supabase when configured, falls back to mock data
// ============================================

import { createClient } from '@supabase/supabase-js';
import { mockQuestions, mockPredictions } from '@/lib/mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

const OPTION_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// ─── Questions ──────────────────────────────────────

export async function getQuestions(filters: {
  category?: string | null;
  status?: string | null;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const { category, status, sort = 'trending', page = 1, limit = 10 } = filters;
  const db = getSupabase();

  if (!db) {
    // Mock fallback
    let questions = [...mockQuestions];
    if (category) questions = questions.filter((q) => q.category === category);
    if (status) questions = questions.filter((q) => q.status === status);
    if (sort === 'newest') questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else questions.sort((a, b) => b.totalVotes - a.totalVotes);
    const start = (page - 1) * limit;
    return { questions: questions.slice(start, start + limit), total: questions.length };
  }

  let query = db.from('questions').select(`
    *,
    user:profiles!questions_user_id_fkey(*),
    options:question_options(*)
  `, { count: 'exact' });

  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else query = query.order('total_votes', { ascending: false });

  const start = (page - 1) * limit;
  query = query.range(start, start + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const questions = (data || []).map(transformQuestion);
  return { questions, total: count || 0 };
}

export async function getQuestionById(id: string) {
  const db = getSupabase();

  if (!db) {
    return mockQuestions.find((q) => q.id === id) || null;
  }

  const { data, error } = await db
    .from('questions')
    .select(`
      *,
      user:profiles!questions_user_id_fkey(*),
      options:question_options(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return transformQuestion(data);
}

export async function createQuestion(userId: string, body: {
  title: string;
  description?: string;
  category: string;
  options: string[];
  tags?: string[];
  visibility?: string;
}) {
  const db = getSupabase();

  if (!db) {
    const newQ = {
      id: 'q' + Date.now(),
      userId,
      user: mockQuestions[0].user,
      title: body.title,
      description: body.description || '',
      category: body.category,
      options: body.options.map((text, i) => ({
        id: 'o' + (i + 1),
        text,
        votes: 0,
        percentage: 0,
        color: OPTION_COLORS[i % OPTION_COLORS.length],
      })),
      totalVotes: 0,
      totalComments: 0,
      tags: body.tags || [],
      status: 'active' as const,
      visibility: (body.visibility || 'public') as 'public' | 'premium',
      createdAt: new Date().toISOString(),
    };
    return newQ;
  }

  // Insert question
  const { data: question, error: qErr } = await db
    .from('questions')
    .insert({
      user_id: userId,
      title: body.title,
      description: body.description || '',
      category: body.category,
      tags: body.tags || [],
      visibility: body.visibility || 'public',
    })
    .select()
    .single();

  if (qErr || !question) throw qErr || new Error('Failed to create question');

  // Insert options
  const optionRows = body.options.map((text, i) => ({
    question_id: question.id,
    text,
    color: OPTION_COLORS[i % OPTION_COLORS.length],
    sort_order: i,
  }));

  await db.from('question_options').insert(optionRows);

  return getQuestionById(question.id);
}

// ─── Votes ──────────────────────────────────────────

export async function castVote(userId: string, questionId: string, optionId: string) {
  const db = getSupabase();

  if (!db) {
    return { id: 'v' + Date.now(), questionId, userId, optionId, createdAt: new Date().toISOString() };
  }

  const { data, error } = await db
    .from('votes')
    .insert({ user_id: userId, question_id: questionId, option_id: optionId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Already voted');
    throw error;
  }

  return data;
}

// ─── Predictions ────────────────────────────────────

export async function getPredictions() {
  const db = getSupabase();

  if (!db) return mockPredictions;

  const { data, error } = await db
    .from('predictions')
    .select(`
      *,
      user:profiles!predictions_user_id_fkey(*),
      options:prediction_options(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(transformPrediction);
}

// ─── Users / Leaderboard ────────────────────────────

export async function getLeaderboard(limit = 20) {
  const db = getSupabase();

  if (!db) {
    const { mockLeaderboard } = await import('@/lib/mock-data');
    return mockLeaderboard;
  }

  const { data, error } = await db
    .from('profiles')
    .select('*')
    .order('reputation', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map((p, i) => ({
    rank: i + 1,
    user: transformProfile(p),
    score: p.reputation,
    accuracy: p.prediction_accuracy,
    streak: p.streak,
    change: 0,
  }));
}

// ─── Comments ───────────────────────────────────────

export async function getComments(questionId: string) {
  const db = getSupabase();

  if (!db) {
    const { mockComments } = await import('@/lib/mock-data');
    return mockComments.filter((c) => c.questionId === questionId);
  }

  const { data, error } = await db
    .from('comments')
    .select(`*, user:profiles!comments_user_id_fkey(*)`)
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(transformComment);
}

export async function createComment(userId: string, questionId: string, text: string) {
  const db = getSupabase();

  if (!db) {
    return { id: 'c' + Date.now(), userId, questionId, text, likes: 0, createdAt: new Date().toISOString() };
  }

  const { data, error } = await db
    .from('comments')
    .insert({ user_id: userId, question_id: questionId, text })
    .select(`*, user:profiles!comments_user_id_fkey(*)`)
    .single();

  if (error) throw error;
  return transformComment(data);
}

// ─── Platform Stats ─────────────────────────────────

export async function getPlatformStats() {
  const db = getSupabase();

  if (!db) {
    const { mockStats } = await import('@/lib/mock-data');
    return mockStats;
  }

  const [users, questions, votes, predictions] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('questions').select('id', { count: 'exact', head: true }),
    db.from('votes').select('id', { count: 'exact', head: true }),
    db.from('predictions').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: users.count || 0,
    totalQuestions: questions.count || 0,
    totalVotes: votes.count || 0,
    totalPredictions: predictions.count || 0,
    activeNow: Math.floor(Math.random() * 500) + 100,
    questionsToday: Math.floor(Math.random() * 50) + 10,
  };
}

// ─── Transformers (DB → App types) ──────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function transformProfile(p: any) {
  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    email: p.email || '',
    avatar: p.avatar_url || '',
    reputation: p.reputation || 0,
    level: p.level || 1,
    badge: p.badge || 'newcomer',
    totalVotes: p.total_votes || 0,
    totalQuestions: p.total_questions || 0,
    totalPredictions: p.total_predictions || 0,
    predictionAccuracy: p.prediction_accuracy || 0,
    streak: p.streak || 0,
    joinedAt: p.created_at,
    isPremium: p.is_premium || false,
  };
}

function transformQuestion(q: any) {
  const options = (q.options || [])
    .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((o: any) => ({
      id: o.id,
      text: o.text,
      votes: o.votes || 0,
      percentage: q.total_votes > 0 ? Math.round((o.votes / q.total_votes) * 100) : 0,
      color: o.color || '#6366f1',
    }));

  return {
    id: q.id,
    userId: q.user_id,
    user: q.user ? transformProfile(q.user) : undefined,
    title: q.title,
    description: q.description || '',
    category: q.category,
    options,
    totalVotes: q.total_votes || 0,
    totalComments: q.total_comments || 0,
    aiAnalysis: q.ai_analysis || undefined,
    tags: q.tags || [],
    status: q.status || 'active',
    visibility: q.visibility || 'public',
    createdAt: q.created_at,
    expiresAt: q.expires_at,
  };
}

function transformPrediction(p: any) {
  return {
    id: p.id,
    userId: p.user_id,
    user: p.user ? transformProfile(p.user) : undefined,
    title: p.title,
    description: p.description || '',
    category: p.category,
    targetDate: p.target_date,
    options: (p.options || []).map((o: any) => ({
      id: o.id,
      text: o.text,
      odds: o.odds || 50,
      participants: o.participants || 0,
      isCorrect: o.is_correct,
    })),
    totalParticipants: p.total_participants || 0,
    status: p.status || 'open',
    result: p.result,
    prize: p.prize,
    createdAt: p.created_at,
  };
}

function transformComment(c: any) {
  return {
    id: c.id,
    userId: c.user_id,
    user: c.user ? transformProfile(c.user) : undefined,
    questionId: c.question_id,
    text: c.text,
    likes: c.likes || 0,
    createdAt: c.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
