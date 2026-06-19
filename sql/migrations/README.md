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
| 008 | `008_add_wakatime_os.sql` | os column on wakatime_daily table | Both |
| 009 | `009_ensure_activity_log.sql` | Ensures activity_log table exists with RLS | Both |
| 010 | `010_add_trash_table.sql` | trash table with RLS | Both |
| 011 | `011_add_contacts_table.sql` | contacts table with RLS | Both |
| 012 | `012_add_detail_to_activity_log.sql` | detail column on activity_log table | Both |
| 013 | `013_add_contacts_phone_github.sql` | phone/github columns on contacts table | Both |
| 014 | `014_add_linear_issue_id.sql` | linear_issue_id column on applications table | Both |
| 015 | `015_add_markdown_column_comments.sql` | PostgreSQL column comments marking markdown-storing columns | Both |
| 016 | `016_add_applications_archived.sql` | archived flag + index on applications table | Both |
| 017 | `017_add_activity_log_created_at_index.sql` | index on activity_log.created_at | Both |

## Run order

Paste each file into the Supabase **SQL Editor** and execute in order 001 → 017. Skip any that are already applied.
