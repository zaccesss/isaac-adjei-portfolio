# sql/

SQL files for the Supabase PostgreSQL database backing the portfolio dashboard.

There is no `schema.sql` any more - it embedded real seed data, so it was removed and replaced by migration `036_baseline_core_tables.sql`, a structure-only baseline generated from the live database. Everything is done through the numbered files in `migrations/`.

## Files

| File | Description |
|---|---|
| `migrations/` | Incremental migration files numbered 001-053. Safe to run on a live database; each is idempotent. |

## Fresh-install guide

Run every file in `migrations/` in numeric order in the Supabase **SQL Editor**. The early files build the original tables, `036` baselines the core tables that predate the migration series and the rest add each later feature.

## Existing-database guide

Run only the migrations that have not yet been applied, in numeric order. The full list with what each one adds is in [`migrations/README.md`](migrations/README.md).

The files are a clean unique sequence 001-051. They were renumbered once, on 2026-07-12, to remove two historical duplicate numbers - the mapping and the decode rule are documented in [`migrations/README.md`](migrations/README.md), so a number cited in an older commit or note may be one lower than its current filename.

All migration files use `IF NOT EXISTS` / `CREATE OR REPLACE` so they are safe to re-run.
