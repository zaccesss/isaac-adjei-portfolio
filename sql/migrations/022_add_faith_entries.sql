-- Faith section: log daily Bible reading, prayer, church attendance and any other faith activity.
-- type: 'bible' | 'prayer' | 'church' | 'devotional' | 'other'
create table if not exists faith_entries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  date        date not null default current_date,
  type        text not null default 'bible',
  title       text,
  notes       text,
  duration_m  int default null,
  completed   boolean not null default true
);

create index if not exists faith_entries_date_idx on faith_entries (date desc);

alter table faith_entries enable row level security;
create policy "allow all" on faith_entries for all using (true) with check (true);

-- Down:
-- drop table if exists faith_entries;
