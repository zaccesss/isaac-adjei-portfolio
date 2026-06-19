-- Study section: log focused study sessions by subject.
-- subject links to a free-text topic or module code.
create table if not exists study_sessions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  date         date not null default current_date,
  subject      text not null,
  duration_m   int not null default 0,
  notes        text,
  technique    text default null,
  productive   boolean default true
);

create index if not exists study_sessions_date_idx on study_sessions (date desc);
create index if not exists study_sessions_subject_idx on study_sessions (subject);

alter table study_sessions enable row level security;
create policy "allow all" on study_sessions for all using (true) with check (true);

-- Down:
-- drop table if exists study_sessions;
