# sql/migrations/

Incremental migration files for the Supabase PostgreSQL database. There is no `schema.sql` any more - a fresh install runs every file here in numeric order (036 baselines the core tables that predate the series).

All files use `IF NOT EXISTS`, `CREATE OR REPLACE` or `DO` blocks so they are safe to re-run without side effects.

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
| 009 | `009_add_wakatime_os.sql` | os column on wakatime_daily table | Both |
| 010 | `010_ensure_activity_log.sql` | Ensures activity_log table exists with RLS | Both |
| 011 | `011_add_trash_table.sql` | trash table with RLS | Both |
| 012 | `012_add_contacts_table.sql` | contacts table with RLS | Both |
| 013 | `013_add_detail_to_activity_log.sql` | detail column on activity_log table | Both |
| 014 | `014_add_contacts_phone_github.sql` | phone/github columns on contacts table | Both |
| 015 | `015_add_linear_issue_id.sql` | linear_issue_id column on applications table | Both |
| 016 | `016_add_markdown_column_comments.sql` | PostgreSQL column comments marking markdown-storing columns | Both |
| 017 | `017_add_applications_archived.sql` | archived flag + index on applications table | Both |
| 018 | `018_add_activity_log_created_at_index.sql` | index on activity_log.created_at | Both |
| 019 | `019_add_applications_interview_prep.sql` | interview_prep jsonb on applications (notes, questions, company research) | Both |
| 020 | `020_wakatime_daily_hours.sql` | hours jsonb on wakatime_daily (per-hour coding breakdown, backfilled by the sync) | Both |
| 021 | `021_blog_read_events_post_type.sql` | post_type on blog_read_events + widened unique constraint (blog and TIL tracked apart) | Both |
| 022 | `022_posts_read_heatmap_function.sql` | posts_read_heatmap() RPC for the 7x24 when-posts-are-read heatmap | Both |
| 023 | `023_add_faith_entries.sql` | faith_entries table (Bible reading, prayer, church) with RLS | Both |
| 024 | `024_add_study_sessions.sql` | study_sessions table (focused study by subject) with RLS | Both |
| 025 | `025_add_body_metrics.sql` | body_metrics table (weight, body fat, measurements) with RLS | Both |
| 026 | `026_add_uni_modules.sql` | uni_modules table - the anchor for the university pages | Both |
| 027 | `027_add_uni_deadlines.sql` | uni_deadlines table (assignments, exams, presentations) | Both |
| 028 | `028_add_uni_submissions.sql` | uni_submissions table (permanent submission log + storage link) | Both |
| 029 | `029_add_uni_notes.sql` | uni_notes table (lecture and meeting notes per module) | Both |
| 030 | `030_add_uni_resources.sql` | uni_resources table (links, slides, past papers per module) | Both |
| 031 | `031_add_uni_library.sql` | uni_library_books table (borrowed books + return dates) | Both |
| 032 | `032_add_health_activity_subtype.sql` | subtype + metadata on health_sections for activity sections | Both |
| 033 | `033_add_linear_issue_id_uni_deadlines.sql` | linear_issue_id on uni_deadlines | Both |
| 034 | `034_add_calendar_events.sql` | calendar_events table (custom + timetable events, soft delete) | Both |
| 035 | `035_add_user_files.sql` | user_files table (file manager metadata, storage backed, soft delete) | Both |
| 036 | `036_baseline_core_tables.sql` | baseline of the core tables that previously lived in schema.sql (structure only) | Fresh |
| 037 | `037_lock_down_rls.sql` | drops the per-table allow-all RLS policies (service role only from here) | Both |
| 038 | `038_ai_chats.sql` | ai_chats table (opt-in saved assistant conversations) | Both |
| 039 | `039_strava_activities.sql` | strava_activities table (synced runs and rides for health analytics) | Both |
| 040 | `040_weight_tracker.sql` | nutrition_logs + workout_logs tables (weight tracker; goal in config) | Both |
| 041 | `041_medication_reminders.sql` | medication_reminders + medication_doses tables | Both |
| 042 | `042_medication_channels.sql` | multi-channel medication reminders (channels array + per-type recipients) | Both |
| 043 | `043_reminders.sql` | reminders table (one-off appointment and meeting reminders with lead times) | Both |
| 044 | `044_listening_history.sql` | listening_history table (every Spotify play, deduped by played_at) | Both |
| 045 | `045_add_cron_runs.sql` | cron_runs idempotency ledger for the time-pinned scheduled jobs | Both |
| 046 | `046_revoke_public_grants.sql` | revokes anon/authenticated grants on schema public + default privileges | Both |
| 047 | `047_github_contributions.sql` | github_contributions_days + github_contributions_years tables (real per-day contribution history) | Both |
| 048 | `048_control_history.sql` | control_job_runs + control_check_snapshots tables (historical job/check status, fed by automations' control-status-sync) | Both |

## The 2026-07-12 renumbering

The sequence originally had two duplicate numbers: two files were numbered 008 (`008_add_inventory_url` and `008_add_wakatime_os`) and, briefly, two were numbered 042. On 2026-07-12 every file was renumbered into the unique 001-046 sequence above. All of them had already been applied to the live database under their old names, so the renumber is purely cosmetic and every file is unchanged and safe to re-run.

The rule, if you are decoding an older commit, PR or note: `008_add_inventory_url` keeps 008, `008_add_wakatime_os` became 009 and every file that was 009 or higher moved up by one. So a migration number cited before this date is one lower than its current filename from the old 009 onward (for example the old `036_lock_down_rls` is now 037 and the cron_runs ledger once called 043 is now 045).
