# sql/migrations/

Incremental migration files for the Supabase PostgreSQL database. Run these on an existing database rather than `schema.sql` (which is for fresh installs only).

All files use `IF NOT EXISTS`, `CREATE OR REPLACE`, or `DO` blocks so they are safe to re-run without side effects.

## Migrations

| # | File | What it adds | Fresh or existing |
|---|---|---|---|
| 001 | `001_add_jobs_table.sql` | Applications tracker columns (opening_date, housing_location, cv_required, etc.) and last_scraped_at / sponsors_visa | Existing |
| 002 | `002_add_vault_table.sql` | hidden/pinned/locked on diary, hidden on notes, hidden/locked on vault; fixes applications URL unique index | Existing |
| 003 | `003_add_blog_reactions.sql` | updated_at on goals; activity_log, habits, habit_logs tables with RLS; theme_preference config seed | Existing |
| 004 | `004_add_opensource_contributions.sql` | opensource_contributions table with RLS | Both |
| 005 | `005_add_blog_read_events.sql` | blog_read_events table + unique index with RLS | Both |
| 006 | `006_add_wakatime_daily.sql` | wakatime_daily table with RLS | Both |
| 007 | `007_add_blog_read_funnel_function.sql` | blog_read_funnel() RPC function (requires migration 005) | Both |
| 008 | `008_add_inventory_url.sql` | url column on inventory_items table | Both |

## Run order

Paste each file into the Supabase **SQL Editor** and execute in order 001 → 008. Skip any that are already applied.
