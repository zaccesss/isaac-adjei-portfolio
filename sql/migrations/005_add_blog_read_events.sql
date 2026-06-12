-- 005_add_blog_read_events.sql
-- Creates the blog_read_events table for recording scroll-depth events from
-- blog post readers. The unique index makes upserts idempotent per visitor per post.
-- Safe to run on existing databases — CREATE TABLE IF NOT EXISTS.
-- Run: paste into Supabase SQL Editor and execute.


create table if not exists blog_read_events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  depth       integer not null,
  ip_hash     text not null,
  created_at  timestamptz default now()
);

create unique index if not exists blog_read_events_unique
  on blog_read_events (slug, depth, ip_hash);

alter table blog_read_events enable row level security;

create policy "allow all" on blog_read_events for all using (true);
