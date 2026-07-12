# sql/

SQL files for the Supabase PostgreSQL database backing the portfolio dashboard.

There is no `schema.sql` any more - it embedded real seed data, so it was removed and replaced by migration `035_baseline_core_tables.sql`, a structure-only baseline generated from the live database. Everything is done through the numbered files in `migrations/`.

## Files

| File | Description |
|---|---|
| `migrations/` | Incremental migration files numbered 001-045. Safe to run on a live database; each is idempotent. |

## Fresh-install guide

Run every file in `migrations/` in numeric order in the Supabase **SQL Editor**. The early files build the original tables, `035` baselines the core tables that predate the migration series and the rest add each later feature.

## Existing-database guide

Run only the migrations that have not yet been applied, in numeric order. The full list with what each one adds is in [`migrations/README.md`](migrations/README.md).

Note: two files are numbered 008 (inventory URL and WakaTime OS columns were added in the same batch). Both are safe to run in either order. The one-time 2026-07-12 renumbering of the later files is documented in `migrations/README.md`.

All migration files use `IF NOT EXISTS` / `CREATE OR REPLACE` so they are safe to re-run.
