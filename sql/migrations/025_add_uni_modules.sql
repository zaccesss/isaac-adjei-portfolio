-- University modules: active modules per academic year and semester.
-- This is the anchor table for all other university sub-pages.
create table if not exists uni_modules (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  code         text not null,
  name         text not null,
  credits      int not null default 20,
  year         int not null default 2,
  semester     int not null default 1,
  target_grade text default null,
  color        text default '#6366f1',
  active       boolean not null default true,
  order_index  int default 0
);

alter table uni_modules enable row level security;
create policy "allow all" on uni_modules for all using (true) with check (true);

-- Down:
-- drop table if exists uni_modules;
