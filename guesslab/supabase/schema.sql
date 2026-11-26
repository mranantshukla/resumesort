-- GuessLab: Supabase schema for syncing progress across devices (Phase 2 storage adapter).
-- The app currently stores everything in the browser (src/lib/store.ts). A Supabase adapter
-- implementing StorageAdapter can read/write these tables. Row-level security keeps each
-- learner's data private.

create table if not exists public.sessions (
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null,
  state jsonb not null,               -- engine/types.ts SessionState
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

create table if not exists public.attempts (
  id text primary key,                -- e.g. "chai-cups-india-1764140000000"
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('guided', 'practice', 'interview', 'school')),
  problem_id text not null,
  title text not null,
  at timestamptz not null default now(),
  minutes int not null default 0,
  scores jsonb not null,              -- Partial<Record<SkillId, number>>
  overall int not null,
  mistakes text[] not null default '{}'
);
create index if not exists attempts_user_at on public.attempts (user_id, at desc);

create table if not exists public.practice_drafts (
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null,
  draft jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

create table if not exists public.school_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,          -- "<module>:<exercise>"
  done boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

alter table public.sessions enable row level security;
alter table public.attempts enable row level security;
alter table public.practice_drafts enable row level security;
alter table public.school_progress enable row level security;

create policy "own sessions" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attempts" on public.attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own drafts" on public.practice_drafts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own school" on public.school_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
