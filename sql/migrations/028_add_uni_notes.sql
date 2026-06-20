-- University notes: lecture notes, tutor meeting summaries, personal notes tagged by module.
create table if not exists uni_notes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  module_id   uuid references uni_modules(id) on delete set null,
  title       text not null,
  content     text default '',
  type        text not null default 'lecture',
  tags        text[] default '{}',
  pinned      boolean not null default false
);

create index if not exists uni_notes_module_idx on uni_notes (module_id);
create index if not exists uni_notes_updated_at_idx on uni_notes (updated_at desc);

alter table uni_notes enable row level security;
create policy "allow all" on uni_notes for all using (true) with check (true);

-- Down:
-- drop table if exists uni_notes;
