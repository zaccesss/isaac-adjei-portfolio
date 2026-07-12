-- 045_add_cron_runs.sql
-- Idempotency ledger for scheduled cron jobs. Every time-pinned cron now fires from TWO crons
-- (a GMT branch and a BST branch) and gates on Europe/London local time so exactly one run acts.
-- This table is the belt-and-braces guard: a job that SENDS a user-facing message (digests,
-- reminders, alerts) records (job, run_date) before sending and skips if that row already exists,
-- so even a badly-delayed GitHub Actions run that slips into the target hour can never double-post.
-- Pure syncs/cleanups do not use it - re-running an upsert or delete-expired is harmless.
--
-- Written only by the Next.js server (lib/supabase.ts) and the automations workflow scripts, both
-- via the Supabase service-role key. RLS is ENABLED with no policy so the anon role is default-deny,
-- matching 037_lock_down_rls.sql. Safe to run on existing databases and safe to re-run.
-- Run: psql "$(cat /tmp/supabase_db_url.txt)" -f sql/migrations/045_add_cron_runs.sql
--   (or paste into the Supabase SQL Editor).

create table if not exists cron_runs (
  job       text        not null,          -- stable job slug, e.g. 'weekly-digest'
  run_date  date        not null,          -- the UK calendar day the job acted for
  ran_at    timestamptz not null default now(),
  primary key (job, run_date)              -- one row per job per day = the idempotency key
);

-- Enable RLS with no policy: the service-role key bypasses it, anon is default-deny (matches 036).
alter table cron_runs enable row level security;

comment on table cron_runs is
  'Idempotency ledger for cron jobs: one row per (job, UK day), written before a job sends so a delayed duplicate run cannot re-send.';
