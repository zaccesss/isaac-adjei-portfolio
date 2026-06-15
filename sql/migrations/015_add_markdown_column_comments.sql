-- Adds PostgreSQL column-level comments to all text columns that store markdown.
-- Safe to run multiple times - COMMENT ON COLUMN is idempotent.
-- Run this in the Supabase SQL Editor after applying all prior migrations.

comment on column goals.description                   is 'Markdown';
comment on column modules.summary                     is 'Markdown';
comment on column modules.rules                       is 'Markdown';
comment on column assessments.my_notes                is 'Markdown';
comment on column vault.content                       is 'Markdown';
comment on column vault.notes                         is 'Markdown';
comment on column wishlist.notes                      is 'Markdown';
comment on column diary.content                       is 'Markdown';
comment on column notes.content                       is 'Markdown';
comment on column streaks.description                 is 'Markdown';
comment on column health_workouts.notes               is 'Markdown';
comment on column habits.description                  is 'Markdown';
comment on column habit_logs.notes                    is 'Markdown';
comment on column opensource_contributions.notes      is 'Markdown';
comment on column inventory_items.description         is 'Markdown';
comment on column inventory_items.notes               is 'Markdown';
comment on column contacts.notes                      is 'Markdown';
