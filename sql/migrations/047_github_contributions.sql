-- Stores real per-day GitHub contribution counts and per-year commit/PR/issue/review totals, so
-- both the public and dashboard contribution graphs can finally draw from a real history instead
-- of calling GitHub's live GraphQL API fresh on every page view. GitHub's contributionCalendar
-- only exposes a commit/PR/issue/review breakdown at the whole-collection (year) level, never per
-- day, so the two tables mirror exactly what the API actually gives: a daily total and a yearly
-- breakdown, not a fabricated daily breakdown that does not exist upstream.

create table if not exists github_contributions_days (
  date  date primary key,
  count integer not null default 0
);

create table if not exists github_contributions_years (
  year           integer primary key,
  commits        integer not null default 0,
  pull_requests  integer not null default 0,
  reviews        integer not null default 0,
  issues         integer not null default 0,
  total          integer not null default 0,
  synced_at      timestamptz not null default now()
);

-- Service-role only, like the other tables. No public policies.
alter table github_contributions_days enable row level security;
alter table github_contributions_years enable row level security;
