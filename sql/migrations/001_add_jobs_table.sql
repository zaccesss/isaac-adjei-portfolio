-- 001_add_jobs_table.sql
-- Adds the applications tracker columns introduced in the 2026-05-21 rebuild,
-- then adds last_scraped_at and sponsors_visa from the 2026-05-28 scraper update.
-- Safe to run on existing databases - every ALTER TABLE uses IF NOT EXISTS.
-- Run: paste into Supabase SQL Editor and execute.


-- ============================================================
-- B.8 ADD APPLICATIONS TRACKER COLUMNS (2026-05-21)
-- ============================================================

-- I store the opening and last-year opening dates so I can colour-code
-- how early or late I am applying relative to historical patterns.
alter table applications add column if not exists opening_date          date;
alter table applications add column if not exists last_year_opening     date;
-- I store housing info, CV and cover letter requirements as text because the
-- values come from scraper notes and can be free-form strings.
alter table applications add column if not exists housing_location      text;
alter table applications add column if not exists cv_required           text;
alter table applications add column if not exists cover_letter_required text;
alter table applications add column if not exists written_answers       text;
-- I use category to group applications by role type in the dashboard.
-- The default of 'Software Engineering' is intentional - it matches the
-- Section A default so existing rows are not treated as uncategorised.
alter table applications add column if not exists category text default 'Software Engineering';


-- ============================================================
-- B.9 ADD last_scraped_at AND sponsors_visa (2026-05-28)
-- ============================================================

-- I add last_scraped_at to track when each scraped row was last seen so I can
-- expire entries that have not appeared in 30 days.
alter table applications add column if not exists last_scraped_at timestamptz;
-- I use TEXT for sponsors_visa so I can store TRUE, FALSE or Unknown as strings.
alter table applications add column if not exists sponsors_visa text;
-- I backfill last_scraped_at from created_at for existing scraped rows so they
-- are not immediately treated as 30-day-stale on the first run after migration.
update applications
  set last_scraped_at = created_at
  where status = 'scraped' and last_scraped_at is null;
