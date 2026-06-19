-- Adds an index on activity_log.created_at - cheap now, recommended by the
-- long-term data governance review before this table grows large enough for
-- queries against it to slow down.
-- Safe to run multiple times - the index create is idempotent.
-- Run this in the Supabase SQL Editor.

create index if not exists activity_log_created_at_idx on activity_log (created_at);

-- To reverse:
-- drop index if exists activity_log_created_at_idx;
