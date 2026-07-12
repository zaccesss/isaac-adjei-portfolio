-- One-off appointment, meeting and general reminders, managed from /dashboard/reminders and sent by the
-- automations repo. Unlike medication reminders, which fire at recurring local times, each of these fires
-- at one or more lead times before the event (a week before and a day before, say), to Discord, email and
-- or SMS. sent_leads records which lead times have already gone out so each fires exactly once, and
-- reminded_at is stamped once every lead time has fired (or the event has passed) so the row drops out of
-- the send job's scan.

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'appointment' check (kind in ('appointment', 'meeting', 'other')),
  title text not null,                          -- e.g. "Dentist", "Standup with the team"
  location text,                                -- e.g. "Boots, High Street" or a meeting link
  notes text,
  event_at timestamptz not null,                -- when the appointment or meeting is (absolute, stored UTC)
  lead_minutes integer[] not null default '{1440}', -- one or more lead times, minutes before event_at
  sent_leads integer[] not null default '{}',   -- which of those lead times have already fired
  channels text[] not null default '{discord}', -- any of 'discord', 'email', 'sms'
  email text,                                   -- recipient for the email channel
  phone text,                                   -- recipient (E.164) for the SMS channel
  reminded_at timestamptz,                       -- stamped once every lead time has fired, or the event passed
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service-role only, like the rest of the schema. RLS on with no public policy denies everyone else.
alter table reminders enable row level security;

-- The send job scans for active reminders that still have a lead time left to fire.
create index if not exists reminders_pending_idx on reminders (active, reminded_at, event_at);
