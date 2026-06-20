-- Body metrics: weight, body fat %, measurements over time.
-- metric: 'weight_kg' | 'body_fat_pct' | 'chest_cm' | 'waist_cm' | 'hips_cm' | 'arm_cm' | 'thigh_cm' | 'custom'
create table if not exists body_metrics (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  date        date not null default current_date,
  metric      text not null,
  value       numeric(7, 2) not null,
  unit        text not null default 'kg',
  notes       text default null
);

create index if not exists body_metrics_date_idx on body_metrics (date desc);
create index if not exists body_metrics_metric_idx on body_metrics (metric);

alter table body_metrics enable row level security;
create policy "allow all" on body_metrics for all using (true) with check (true);

-- Down:
-- drop table if exists body_metrics;
