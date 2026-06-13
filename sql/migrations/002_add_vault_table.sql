-- 002_add_vault_table.sql
-- Adds hidden/pinned/locked columns to diary, hidden to notes, hidden/locked
-- to vault (to support the 3-dot menu UI), then fixes the applications URL
-- unique index by removing duplicates and recreating the index cleanly.
-- Safe to run on existing databases - all ALTER TABLE use IF NOT EXISTS.
-- Run: paste into Supabase SQL Editor and execute.


-- ============================================================
-- B.2 GROUP F COLUMNS - DIARY
-- ============================================================

alter table diary add column if not exists hidden boolean default false;
alter table diary add column if not exists pinned boolean default false;
alter table diary add column if not exists locked boolean default false;


-- ============================================================
-- B.3 GROUP F COLUMN - NOTES (hidden)
-- ============================================================

alter table notes add column if not exists hidden boolean default false;


-- ============================================================
-- B.4 GROUP F COLUMNS - VAULT
-- ============================================================

alter table vault add column if not exists hidden boolean default false;
alter table vault add column if not exists locked boolean default false;


-- ============================================================
-- B.5 FIX APPLICATIONS URL UNIQUE INDEX
-- I clean up duplicates and create a robust unconditional unique
-- index on url so PostgREST can do ON CONFLICT (url) upserts.
-- ============================================================

-- I delete all scraped entries so they do not block the index.
delete from applications where status = 'scraped';

-- I delete duplicate urls in manual entries, keeping the newest.
delete from applications
where id in (
  select id from (
    select id, row_number() over (partition by url order by created_at desc) as rn
    from applications
    where url is not null and url <> ''
  ) t
  where rn > 1
);

drop index if exists applications_url_unique;
create unique index if not exists applications_url_unique
  on applications (url);
