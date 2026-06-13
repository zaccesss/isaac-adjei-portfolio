-- 004_add_opensource_contributions.sql
-- Creates the opensource_contributions table for tracking merged PRs
-- submitted to external repos.
-- Safe to run on existing databases - CREATE TABLE IF NOT EXISTS.
-- Run: paste into Supabase SQL Editor and execute.


create table if not exists opensource_contributions (
  id            uuid primary key default gen_random_uuid(),
  repo          text not null,
  pr_title      text not null,
  pr_url        text,
  pr_number     integer,
  status        text not null default 'open',
  language      text,
  notes         text,
  submitted_at  date not null default current_date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table opensource_contributions enable row level security;

create policy "allow all" on opensource_contributions for all using (true);
