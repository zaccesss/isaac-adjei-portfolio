-- University library: books borrowed from the library with return date tracking.
create table if not exists uni_library_books (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  title        text not null,
  author       text default null,
  isbn         text default null,
  module_id    uuid references uni_modules(id) on delete set null,
  borrowed_at  date not null default current_date,
  due_date     date not null,
  returned_at  date default null,
  notes        text default null
);

create index if not exists uni_library_due_date_idx on uni_library_books (due_date asc);

alter table uni_library_books enable row level security;
create policy "allow all" on uni_library_books for all using (true) with check (true);

-- Down:
-- drop table if exists uni_library_books;
