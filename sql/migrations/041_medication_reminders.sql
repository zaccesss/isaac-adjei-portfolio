-- Medication and recurring health reminders, managed from /dashboard/health/medication-reminder and
-- sent by the automations repo through the day. Each reminder fires at one or more local times within
-- an optional date range, to one channel (Discord for me, email or SMS for someone not in Discord).

create table if not exists medication_reminders (
  id uuid primary key default gen_random_uuid(),
  label text not null,                        -- who it is for, e.g. "Mum", "Me"
  name text not null,                         -- e.g. "Dexamethasone 0.1% Eye Drops"
  dose text,                                  -- e.g. "1 drop - left eye"
  notes text,
  times text[] not null default '{}',         -- local HH:MM times to fire, e.g. {"08:00","18:00"}
  start_date date,                            -- null = no start bound
  end_date date,                              -- null = ongoing
  channel text not null default 'discord' check (channel in ('discord', 'email', 'sms')),
  recipient text,                             -- email address or phone number; null for discord
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only the service-role key (the dashboard server and the automations jobs) touches this table, matching
-- the rest of the schema. No public policies, so RLS denies everyone else by default.
alter table medication_reminders enable row level security;

create index if not exists medication_reminders_active_idx on medication_reminders (active);

-- A log of every reminder actually sent, so the analytics page can chart sends over time, by
-- medication and by person, and (later) adherence once a dose can be marked taken.
create table if not exists medication_doses (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid references medication_reminders (id) on delete cascade,
  label text not null,
  name text not null,
  channel text not null,
  scheduled_time text,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'taken', 'missed')),
  taken_at timestamptz
);

alter table medication_doses enable row level security;

create index if not exists medication_doses_sent_at_idx on medication_doses (sent_at);
