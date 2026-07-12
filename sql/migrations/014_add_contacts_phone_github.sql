-- Adds phone and github_url columns to the contacts table.
-- Safe to run multiple times.

alter table contacts add column if not exists phone text;
alter table contacts add column if not exists github_url text;
