-- Add per-hour coding breakdown to each wakatime_daily row.
-- 24-element JSONB array [h0, h1, ..., h23] of integer seconds (UTC).
-- Null for rows synced before this migration; backfilled by wakatime-sync on next run.
alter table wakatime_daily
  add column if not exists hours jsonb default null;

-- Down:
-- alter table wakatime_daily drop column if exists hours;
