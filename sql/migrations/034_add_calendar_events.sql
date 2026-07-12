-- Calendar custom events (user-created events + timetable custom events)
create table if not exists calendar_events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  user_id      uuid references auth.users(id) on delete cascade,
  title        text not null,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  location     text,
  description  text,
  colour       text not null default '#6366f1',
  all_day      boolean not null default false,
  event_type   text not null default 'general',  -- 'general' | 'timetable'
  is_deleted   boolean not null default false,
  deleted_at   timestamptz
);
alter table calendar_events enable row level security;
create policy "users manage own calendar events"
  on calendar_events for all
  using (auth.uid() = user_id);
create index if not exists calendar_events_user_start on calendar_events(user_id, start_at);
