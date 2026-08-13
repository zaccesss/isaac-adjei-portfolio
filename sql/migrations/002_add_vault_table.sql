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

-- These cleanups were a ONE-TIME step to let the unique index be created. They are now guarded so
-- re-running this migration can NEVER wipe data again: the original `delete from applications where
-- status = 'scraped'` here deleted every scraped row on replay - that was the "disappearing rows".
-- The blanket scraped-delete is removed entirely (scraped rows with a null url do not block a unique
-- index and real url duplicates are handled below) and the duplicate cleanup only runs on a genuine
-- first run (when the index does not yet exist).
do $$
begin
  if not exists (select 1 from pg_class where relname = 'applications_url_unique') then
    -- Remove duplicate urls in manual entries, keeping the newest, so the index can be built.
    delete from applications
    where id in (
      select id from (
        select id, row_number() over (partition by url order by created_at desc) as rn
        from applications
        where url is not null and url <> ''
      ) t
      where rn > 1
    );
  end if;
end $$;

create unique index if not exists applications_url_unique
  on applications (url);
