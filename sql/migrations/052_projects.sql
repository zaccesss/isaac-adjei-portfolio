-- A general project tracker (hardware builds, personal software projects, coursework projects
-- like the audio amplifier) - University/Study/Modules already cover coursework marks and study
-- time, but nothing tracks the projects themselves: what they are, their status and a link back
-- to their own repo or report.

create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null,
  description  text,
  category     text not null default 'Personal',
  status       text not null default 'planning',
  repo_url     text,
  start_date   date,
  end_date     date
);
create index if not exists projects_status_idx on projects (status);

-- Per-project tasks/milestones, each with a start and end date, backing a Gantt chart per project.
create table if not exists project_tasks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'planned'
);
create index if not exists project_tasks_project_idx on project_tasks (project_id, start_date);

-- Service-role only, like every other table. No public policies.
alter table projects enable row level security;
alter table project_tasks enable row level security;
