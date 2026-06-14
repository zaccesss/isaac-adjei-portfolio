-- Adds the detail column to an existing activity_log table that was created
-- before this column was introduced. Safe to run multiple times.

alter table activity_log add column if not exists detail text;
