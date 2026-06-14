-- Recycle bin: soft-delete storage for dashboard items.
-- Items are automatically purged after 7 days by the /api/dashboard/trash-cleanup cron.
-- Run this in the Supabase SQL editor.

create table if not exists trash (
  id           uuid        primary key default gen_random_uuid(),
  table_name   text        not null,
  original_id  text        not null,
  display_name text,
  data         jsonb       not null,
  deleted_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '7 days')
);

alter table trash enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'trash' and policyname = 'allow all'
  ) then
    create policy "allow all" on trash for all using (true) with check (true);
  end if;
end
$$;

create index if not exists trash_expires_at_idx on trash (expires_at);
