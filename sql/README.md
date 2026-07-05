# sql/

SQL files for the Supabase PostgreSQL database backing the portfolio dashboard.

## When to use which file

| Situation | What to run |
|---|---|
| Fresh Supabase project (or full wipe) | `schema.sql` - drops everything and recreates from scratch |
| Existing database, applying new features | Individual files in `migrations/` in order |

## Files

| File | Description |
|---|---|
| `schema.sql` | Full DROP + CREATE schema for a fresh install. Includes all tables, indexes, RLS policies, seed data and the `blog_read_funnel()` RPC function. |
| `migrations/` | Incremental migration files numbered 001-043. Safe to run on a live database. |

## Fresh-install guide

> **Warning:** `schema.sql` drops all existing tables. Export any data you want to keep before running it.

1. In Supabase Table Editor, export `applications` → **Export to CSV**. Save the file.
2. Open the **SQL Editor** in Supabase and paste the contents of `schema.sql`. Run it.
3. Re-import: Table Editor → `applications` → **Import from CSV** with the saved file.

## Existing-database guide

Run only the migrations that have not yet been applied, in order:

```text
001_add_jobs_table.sql
002_add_vault_table.sql
003_add_blog_reactions.sql
004_add_opensource_contributions.sql
005_add_blog_read_events.sql
006_add_wakatime_daily.sql
007_add_blog_read_funnel_function.sql
008_add_inventory_url.sql
008_add_wakatime_os.sql
009_ensure_activity_log.sql
010_add_trash_table.sql
011_add_contacts_table.sql
012_add_detail_to_activity_log.sql
013_add_contacts_phone_github.sql
014_add_linear_issue_id.sql
015_add_markdown_column_comments.sql
```

Note: two files are numbered 008 (inventory URL and WakaTime OS columns were added in the same batch). Both are safe to run in either order.

All migration files use `IF NOT EXISTS` / `CREATE OR REPLACE` so they are safe to re-run.
