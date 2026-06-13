-- Ensures the activity_log table exists. Safe to run multiple times.
-- Run this in the Supabase SQL editor if the Activity log page shows nothing.

create table if not exists activity_log (
  id         uuid        primary key default gen_random_uuid(),
  action     text        not null,
  detail     text,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'activity_log' and policyname = 'allow all'
  ) then
    create policy "allow all" on activity_log for all using (true) with check (true);
  end if;
end
$$;
