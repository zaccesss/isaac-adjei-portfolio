-- 003_add_blog_reactions.sql
-- Adds updated_at to goals, creates the activity_log/habits/habit_logs tables
-- with RLS and seeds the theme_preference config key.
-- Safe to run on existing databases - CREATE TABLE IF NOT EXISTS throughout,
-- and the DO blocks make the RLS policies idempotent.
-- Run: paste into Supabase SQL Editor and execute.


-- ============================================================
-- B.1 ADD updated_at TO GOALS
-- I need updated_at on goals because the weekly digest queries it
-- to count "goals touched this week".
-- ============================================================

alter table goals add column if not exists updated_at timestamptz default now();


-- ============================================================
-- B.6 NEW TABLES - activity_log, habits, habit_logs
-- ============================================================

create table if not exists activity_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  action      text not null,
  entity_type text,
  entity_id   uuid,
  details     jsonb default '{}'
);

create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  frequency   text not null default 'daily',
  description text,
  active      boolean default true,
  color       text default '#6366f1',
  order_index int default 0
);

create table if not exists habit_logs (
  id        uuid primary key default gen_random_uuid(),
  habit_id  uuid references habits(id) on delete cascade,
  date      date not null,
  completed boolean default true,
  notes     text,
  unique(habit_id, date)
);

-- I enable RLS on the new tables.
alter table activity_log enable row level security;
alter table habits       enable row level security;
alter table habit_logs   enable row level security;

-- I create the RLS policies if they do not exist. The DO block
-- catches the "policy already exists" error so this is idempotent.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'activity_log' and policyname = 'allow all') then
    create policy "allow all" on activity_log for all using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'habits' and policyname = 'allow all') then
    create policy "allow all" on habits for all using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'habit_logs' and policyname = 'allow all') then
    create policy "allow all" on habit_logs for all using (true);
  end if;
end $$;


-- ============================================================
-- B.7 SEED - theme_preference CONFIG KEY
-- ============================================================

insert into config (key, value) values ('theme_preference', '"system"')
on conflict (key) do nothing;
