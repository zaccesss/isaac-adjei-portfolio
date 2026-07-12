-- University submissions: permanent log of every submission made.
-- file_url points to Supabase Storage bucket 'uni-submissions' if a file was uploaded.
create table if not exists uni_submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  deadline_id  uuid references uni_deadlines(id) on delete set null,
  module_id    uuid references uni_modules(id) on delete set null,
  title        text not null,
  submitted_at timestamptz not null default now(),
  file_name    text default null,
  file_url     text default null,
  notes        text default null
);

create index if not exists uni_submissions_submitted_at_idx on uni_submissions (submitted_at desc);

alter table uni_submissions enable row level security;
create policy "allow all" on uni_submissions for all using (true) with check (true);

-- Down:
-- drop table if exists uni_submissions;
