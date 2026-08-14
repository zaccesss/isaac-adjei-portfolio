-- Optional link from a study session to the module it was for, enabling a study-hours-vs-module
-- -mark scatter. Nullable so every existing session (and any future free-text-only logging) keeps
-- working unchanged - this is a way forward for new sessions, not a forced migration of history.
-- on delete set null rather than cascade: deleting a module should not delete the study time
-- logged against it, just detach it.

alter table study_sessions add column if not exists module_id uuid references modules(id) on delete set null;
create index if not exists study_sessions_module_idx on study_sessions (module_id);
