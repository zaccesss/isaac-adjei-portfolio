-- Contacts / network tracker for people met at career fairs, coffee chats, LinkedIn etc.
-- Run this in the Supabase SQL editor.

create table if not exists contacts (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  company       text,
  role          text,
  how_met       text,              -- e.g. "Career fair", "LinkedIn", "Coffee chat", "Referral"
  email         text,
  linkedin_url  text,
  last_contact  date,
  notes         text,
  follow_up     boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table contacts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'contacts' and policyname = 'allow all'
  ) then
    create policy "allow all" on contacts for all using (true) with check (true);
  end if;
end
$$;
