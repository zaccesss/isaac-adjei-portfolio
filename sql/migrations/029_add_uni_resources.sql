-- University resources: links, slides, handouts per module.
-- type: 'link' | 'slide' | 'handout' | 'past_paper' | 'book' | 'video' | 'other'
create table if not exists uni_resources (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  module_id   uuid references uni_modules(id) on delete set null,
  title       text not null,
  url         text default null,
  type        text not null default 'link',
  notes       text default null,
  semester    int default 1
);

create index if not exists uni_resources_module_idx on uni_resources (module_id);

alter table uni_resources enable row level security;
create policy "allow all" on uni_resources for all using (true) with check (true);

-- Down:
-- drop table if exists uni_resources;
