-- Adds an archived flag to applications so they can be hidden from the default
-- views without being deleted (scraped applications are retained permanently).
-- Safe to run multiple times - the column add and index are both idempotent.
-- Run this in the Supabase SQL Editor.

alter table applications add column if not exists archived boolean not null default false;
create index if not exists applications_archived_idx on applications (archived);

-- To reverse:
-- drop index if exists applications_archived_idx;
-- alter table applications drop column if exists archived;
