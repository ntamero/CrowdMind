-- ============================================
-- CrowdMind AI - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users (extends Supabase auth.users) ────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  email text,
  avatar_url text default 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  bio text default '',
  reputation integer default 0,
  level integer default 1,
  xp integer default 0,
  badge text default 'newcomer' check (badge in ('newcomer', 'contributor', 'expert', 'oracle', 'legend')),
  total_votes integer default 0,
  total_questions integer default 0,
  total_predictions integer default 0,
  prediction_accuracy real default 0,
  streak integer default 0,
  is_premium boolean default false,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Questions ──────────────────────────────
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  category text not null check (category in (
    'business', 'technology', 'design', 'lifestyle', 'finance',
    'sports', 'politics', 'entertainment', 'education', 'health', 'other'
  )),
  tags text[] default '{}',
  total_votes integer default 0,
  total_comments integer default 0,
  status text default 'active' check (status in ('active', 'closed', 'trending', 'sponsored')),
  visibility text default 'public' check (visibility in ('public', 'premium')),
  ai_analysis jsonb,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Question Options ───────────────────────
create table public.question_options (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  text text not null,
  votes integer default 0,
  color text default '#6366f1',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── Votes ──────────────────────────────────
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  option_id uuid references public.question_options(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(question_id, user_id)  -- one vote per user per question
);

-- ─── Comments ───────────────────────────────
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  likes integer default 0,
  created_at timestamptz default now()
);

-- ─── Comment Likes ──────────────────────────
create table public.comment_likes (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

-- ─── Predictions ────────────────────────────
create table public.predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  category text not null,
  target_date timestamptz not null,
  total_participants integer default 0,
  status text default 'open' check (status in ('open', 'closed', 'resolved')),
  result text,
  prize real default 0,
  created_at timestamptz default now()
);

-- ─── Prediction Options ─────────────────────
create table public.prediction_options (
  id uuid default uuid_generate_v4() primary key,
  prediction_id uuid references public.predictions(id) on delete cascade not null,
  text text not null,
  odds real default 50,
  participants integer default 0,
  is_correct boolean default false,
  sort_order integer default 0
);

-- ─── Prediction Participations ──────────────
create table public.prediction_participations (
  id uuid default uuid_generate_v4() primary key,
  prediction_id uuid references public.predictions(id) on delete cascade not null,
  option_id uuid references public.prediction_options(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(prediction_id, user_id)
);

-- ─── Bookmarks ──────────────────────────────
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(question_id, user_id)
);

-- ─── Notifications ──────────────────────────
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('vote', 'comment', 'prediction', 'achievement', 'system')),
  title text not null,
  message text not null,
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ─── Achievements ───────────────────────────
create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_key)
);

-- ============================================
-- Indexes
-- ============================================
create index idx_questions_category on public.questions(category);
create index idx_questions_status on public.questions(status);
create index idx_questions_user_id on public.questions(user_id);
create index idx_questions_created_at on public.questions(created_at desc);
create index idx_votes_question_id on public.votes(question_id);
create index idx_votes_user_id on public.votes(user_id);
create index idx_comments_question_id on public.comments(question_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_predictions_status on public.predictions(status);
create index idx_profiles_reputation on public.profiles(reputation desc);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.predictions enable row level security;
alter table public.prediction_options enable row level security;
alter table public.prediction_participations enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;
alter table public.user_achievements enable row level security;

-- Profiles: public read, own write
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Questions: public read, authenticated write
create policy "Questions are viewable by everyone" on public.questions for select using (true);
create policy "Authenticated users can create questions" on public.questions for insert with check (auth.uid() = user_id);
create policy "Users can update own questions" on public.questions for update using (auth.uid() = user_id);
create policy "Users can delete own questions" on public.questions for delete using (auth.uid() = user_id);

-- Question Options: public read, question owner write
create policy "Options are viewable by everyone" on public.question_options for select using (true);
create policy "Authenticated users can create options" on public.question_options for insert with check (
  exists (select 1 from public.questions where id = question_id and user_id = auth.uid())
);

-- Votes: public read, authenticated write
create policy "Votes are viewable by everyone" on public.votes for select using (true);
create policy "Authenticated users can vote" on public.votes for insert with check (auth.uid() = user_id);

-- Comments: public read, authenticated write
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Comment Likes
create policy "Comment likes are viewable by everyone" on public.comment_likes for select using (true);
create policy "Authenticated users can like" on public.comment_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.comment_likes for delete using (auth.uid() = user_id);

-- Predictions
create policy "Predictions are viewable by everyone" on public.predictions for select using (true);
create policy "Authenticated users can create predictions" on public.predictions for insert with check (auth.uid() = user_id);

-- Prediction Options
create policy "Prediction options viewable by everyone" on public.prediction_options for select using (true);

-- Prediction Participations
create policy "Participations viewable by everyone" on public.prediction_participations for select using (true);
create policy "Authenticated users can participate" on public.prediction_participations for insert with check (auth.uid() = user_id);

-- Bookmarks: own read/write
create policy "Users can view own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can create bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

-- Notifications: own read/write
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Achievements: own read
create policy "Users can view own achievements" on public.user_achievements for select using (auth.uid() = user_id);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id)
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update vote counts when a vote is cast
create or replace function public.handle_new_vote()
returns trigger as $$
begin
  -- Increment option votes
  update public.question_options set votes = votes + 1 where id = new.option_id;
  -- Increment question total
  update public.questions set total_votes = total_votes + 1, updated_at = now() where id = new.question_id;
  -- Increment user total_votes
  update public.profiles set total_votes = total_votes + 1 where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_vote_created
  after insert on public.votes
  for each row execute procedure public.handle_new_vote();

-- Update comment count
create or replace function public.handle_new_comment()
returns trigger as $$
begin
  update public.questions set total_comments = total_comments + 1 where id = new.question_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.handle_new_comment();

-- Update question count on profile
create or replace function public.handle_new_question()
returns trigger as $$
begin
  update public.profiles set total_questions = total_questions + 1 where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_question_created
  after insert on public.questions
  for each row execute procedure public.handle_new_question();
