# sql/migrations/

Incremental migration files for the Supabase PostgreSQL database. There is no `schema.sql` any more - a fresh install runs every file here in numeric order (035 baselines the core tables that predate the series).

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
| 018 | `018_add_applications_interview_prep.sql` | interview_prep jsonb on applications (notes, questions, company research) | Both |
| 019 | `019_wakatime_daily_hours.sql` | hours jsonb on wakatime_daily (per-hour coding breakdown, backfilled by the sync) | Both |
| 020 | `020_blog_read_events_post_type.sql` | post_type on blog_read_events + widened unique constraint (blog and TIL tracked apart) | Both |
| 021 | `021_posts_read_heatmap_function.sql` | posts_read_heatmap() RPC for the 7x24 when-posts-are-read heatmap | Both |
| 022 | `022_add_faith_entries.sql` | faith_entries table (Bible reading, prayer, church) with RLS | Both |
| 023 | `023_add_study_sessions.sql` | study_sessions table (focused study by subject) with RLS | Both |
| 024 | `024_add_body_metrics.sql` | body_metrics table (weight, body fat, measurements) with RLS | Both |
| 025 | `025_add_uni_modules.sql` | uni_modules table - the anchor for the university pages | Both |
| 026 | `026_add_uni_deadlines.sql` | uni_deadlines table (assignments, exams, presentations) | Both |
| 027 | `027_add_uni_submissions.sql` | uni_submissions table (permanent submission log + storage link) | Both |
| 028 | `028_add_uni_notes.sql` | uni_notes table (lecture and meeting notes per module) | Both |
| 029 | `029_add_uni_resources.sql` | uni_resources table (links, slides, past papers per module) | Both |
| 030 | `030_add_uni_library.sql` | uni_library_books table (borrowed books + return dates) | Both |
| 031 | `031_add_health_activity_subtype.sql` | subtype + metadata on health_sections for activity sections | Both |
| 032 | `032_add_linear_issue_id_uni_deadlines.sql` | linear_issue_id on uni_deadlines | Both |
| 033 | `033_add_calendar_events.sql` | calendar_events table (custom + timetable events, soft delete) | Both |
| 034 | `034_add_user_files.sql` | user_files table (file manager metadata, storage backed, soft delete) | Both |
| 035 | `035_baseline_core_tables.sql` | baseline of the core tables that previously lived in schema.sql (structure only) | Fresh |
| 036 | `036_lock_down_rls.sql` | drops the per-table allow-all RLS policies (service role only from here) | Both |
| 037 | `037_ai_chats.sql` | ai_chats table (opt-in saved assistant conversations) | Both |
| 038 | `038_strava_activities.sql` | strava_activities table (synced runs and rides for health analytics) | Both |
| 039 | `039_weight_tracker.sql` | nutrition_logs + workout_logs tables (weight tracker; goal in config) | Both |
| 040 | `040_medication_reminders.sql` | medication_reminders + medication_doses tables | Both |
| 041 | `041_medication_channels.sql` | multi-channel medication reminders (channels array + per-type recipients) | Both |
| 042 | `042_reminders.sql` | reminders table (one-off appointment and meeting reminders with lead times) | Both |
| 043 | `043_listening_history.sql` | listening_history table (every Spotify play, deduped by played_at) | Both |
| 044 | `044_add_cron_runs.sql` | cron_runs idempotency ledger for the time-pinned scheduled jobs | Both |
| 045 | `045_revoke_public_grants.sql` | revokes anon/authenticated grants on schema public + default privileges | Both |

## The 2026-07-12 renumbering

Two migrations once shared number 042 (`042_reminders.sql` and `042_listening_history.sql` landed in the same window from different branches), so the later files were renumbered for a clean sequence. All of them were already applied to the live database under their old names, so anything written before this date maps as follows:

| Old name | Current name |
|---|---|
| `042_listening_history.sql` | `043_listening_history.sql` |
| `043_add_cron_runs.sql` | `044_add_cron_runs.sql` |
| `044_revoke_public_grants.sql` | `045_revoke_public_grants.sql` |

`042_reminders.sql` kept its number (it landed first). The files themselves are unchanged and safe to re-run.


