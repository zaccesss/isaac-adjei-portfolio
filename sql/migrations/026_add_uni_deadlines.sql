-- University deadlines: assignments, courseworks, exams, presentations.
-- type: 'assignment' | 'coursework' | 'exam' | 'presentation' | 'quiz' | 'other'
-- status: 'not_started' | 'in_progress' | 'submitted' | 'graded'
create table if not exists uni_deadlines (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  module_id      uuid references uni_modules(id) on delete set null,
  title          text not null,
  type           text not null default 'assignment',
  due_date       timestamptz not null,
  weight_pct     numeric(5, 2) default null,
  status         text not null default 'not_started',
  submitted_at   timestamptz default null,
  grade_received text default null,
  notes          text default null,
  semester       int default 1
);

create index if not exists uni_deadlines_due_date_idx on uni_deadlines (due_date asc);
create index if not exists uni_deadlines_module_idx on uni_deadlines (module_id);

alter table uni_deadlines enable row level security;
create policy "allow all" on uni_deadlines for all using (true) with check (true);

-- Down:
-- drop table if exists uni_deadlines;
