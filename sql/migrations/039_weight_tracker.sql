-- Weight-loss tracker: food/calorie logs and manual workout logs.
-- Weight itself reuses body_metrics (metric = 'weight_kg'); auto-synced workouts reuse strava_activities;
-- the weight goal (start/target weight + target date) lives in the config table under key 'weight_goal'.

create table if not exists nutrition_logs (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  meal        text not null default 'snack',   -- breakfast | lunch | dinner | snack
  name        text not null,
  calories    integer not null default 0,
  protein_g   numeric(6, 1) default null,
  carbs_g     numeric(6, 1) default null,
  fat_g       numeric(6, 1) default null,
  notes       text default null,
  created_at  timestamptz not null default now()
);

create index if not exists nutrition_logs_date_idx on nutrition_logs (date desc);

alter table nutrition_logs enable row level security;
create policy "allow all" on nutrition_logs for all using (true) with check (true);

create table if not exists workout_logs (
  id           uuid primary key default gen_random_uuid(),
  date         date not null default current_date,
  type         text not null default 'workout', -- gym | run | cycle | swim | walk | other
  duration_min integer default null,
  calories     integer default null,
  notes        text default null,
  created_at   timestamptz not null default now()
);

create index if not exists workout_logs_date_idx on workout_logs (date desc);

alter table workout_logs enable row level security;
create policy "allow all" on workout_logs for all using (true) with check (true);

-- Down:
-- drop table if exists nutrition_logs;
-- drop table if exists workout_logs;
