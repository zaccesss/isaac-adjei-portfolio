-- 006_add_wakatime_daily.sql
-- Creates the wakatime_daily table for storing one row per calendar day of
-- coding activity synced from the WakaTime API via the wakatime-sync workflow.
-- Safe to run on existing databases - CREATE TABLE IF NOT EXISTS.
-- Run: paste into Supabase SQL Editor and execute.


create table if not exists wakatime_daily (
  id             uuid primary key default gen_random_uuid(),
  date           date not null unique,
  total_seconds  integer not null default 0,
  languages      jsonb default '[]',
  projects       jsonb default '[]',
  editors        jsonb default '[]'
);

alter table wakatime_daily enable row level security;

drop policy if exists "allow all" on wakatime_daily;
create policy "allow all" on wakatime_daily for all using (true);
