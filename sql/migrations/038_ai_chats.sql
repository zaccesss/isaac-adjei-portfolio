-- I store opt-in saved assistant chats so I can choose to keep specific conversations (e.g. a useful
-- cover-letter draft) and reload them later. Nothing is ever saved automatically - only when I press
-- "Save this chat". RLS is auto-enabled by the ensure_rls event trigger with no policy, so the table is
-- reachable only through the service-role server, never the anon key.
create table if not exists ai_chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  messages jsonb not null default '[]'::jsonb
);

create index if not exists ai_chats_created_at_idx on ai_chats (created_at desc);
