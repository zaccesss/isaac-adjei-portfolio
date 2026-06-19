-- Adds linear_issue_id to uni_deadlines so each deadline can be tracked as a Linear issue.
-- The column is nullable - deadlines created before Linear sync was set up have null here.
alter table uni_deadlines
  add column if not exists linear_issue_id text default null;

create index if not exists uni_deadlines_linear_idx on uni_deadlines (linear_issue_id)
  where linear_issue_id is not null;

-- Down:
-- alter table uni_deadlines drop column if exists linear_issue_id;
-- drop index if exists uni_deadlines_linear_idx;
