-- Historical record of the control page's dispatchable job runs and Healthchecks status, fed by
-- isaac-adjei-automations' control-status-sync job (dispatched every 15 min via cron-ops). GitHub's
-- own Actions API only exposes the last ~20-100 runs per workflow and Healthchecks only exposes
-- current status, neither can answer a "how healthy was this over the last 30 days" query, so this
-- is a real snapshot history instead of a live pass-through like control-status/route.ts's own
-- Healthchecks/GitHub reads. Rows past 90 days are pruned by the sync job itself, matching
-- cron_runs' own retention pattern (045_add_cron_runs.sql).

create table if not exists control_job_runs (
  job_id         text not null,
  github_run_id  bigint not null,
  conclusion     text,
  status         text not null,
  started_at     timestamptz not null,
  duration_s     integer,
  url            text,
  synced_at      timestamptz not null default now(),
  primary key (job_id, github_run_id)
);
create index if not exists control_job_runs_started_idx on control_job_runs (job_id, started_at desc);

create table if not exists control_check_snapshots (
  hc_slug     text not null,
  project     text not null,
  status      text not null,
  last_ping   timestamptz,
  checked_at  timestamptz not null default now(),
  primary key (hc_slug, checked_at)
);
create index if not exists control_check_snapshots_checked_idx on control_check_snapshots (hc_slug, checked_at desc);

-- Service-role only, like every other table. No public policies.
alter table control_job_runs enable row level security;
alter table control_check_snapshots enable row level security;
