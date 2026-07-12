-- 009_add_wakatime_os.sql
-- Adds the operating_systems JSONB column to wakatime_daily so the coding
-- activity page can show an OS/machines breakdown matching the WakaTime dashboard.
-- Safe to run on existing databases - uses ADD COLUMN IF NOT EXISTS.
-- Run: paste into Supabase SQL Editor and execute.

alter table wakatime_daily
  add column if not exists operating_systems jsonb default '[]';
