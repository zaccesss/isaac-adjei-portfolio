-- Hand-logged frequency-response readings for EECS lab work (no sensor pipeline exists, this is
-- manual entry), backing a Bode plot. measurement_set groups readings taken as one sweep (e.g.
-- "RC filter, R=1k C=100nF") so multiple sweeps for the same project stay distinguishable.

create table if not exists lab_measurements (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  project_label  text not null,
  measurement_set text not null,
  frequency_hz   double precision not null,
  magnitude_db   double precision,
  phase_deg      double precision
);
create index if not exists lab_measurements_set_idx on lab_measurements (project_label, measurement_set, frequency_hz);

-- Service-role only, like every other table. No public policies.
alter table lab_measurements enable row level security;
