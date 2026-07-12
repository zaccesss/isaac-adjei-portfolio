-- I sync my Strava activities (runs, rides, swims and the rest) into this table so the health analytics
-- page can chart distance, pace, heart rate and training frequency from stored rows without calling
-- Strava on load. Only the sync code (service role) ever writes here; RLS is auto-enabled by the
-- ensure_rls event trigger with no policy, so the table is reachable only through the service-role
-- server, never the anon key. strava_id is unique so re-syncs upsert rather than duplicate.
create table if not exists strava_activities (
  id uuid primary key default gen_random_uuid(),
  strava_id bigint not null unique,
  name text,
  sport_type text,
  distance_m double precision,
  moving_time_s integer,
  elapsed_time_s integer,
  total_elevation_gain_m double precision,
  average_speed_ms double precision,
  max_speed_ms double precision,
  average_heartrate double precision,
  max_heartrate double precision,
  calories double precision,
  start_date timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists strava_activities_start_date_idx on strava_activities (start_date desc);
