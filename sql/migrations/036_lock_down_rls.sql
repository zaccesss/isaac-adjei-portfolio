-- 036_lock_down_rls.sql
-- Drop the per-table "allow all" RLS policies. The Next.js server (lib/supabase.ts) and every
-- workflow now use the Supabase service-role key, which bypasses RLS, so the anon key can be left
-- with no access to any table. Applied to the live database via psql on 2026-06-22.
--
-- RLS stays ENABLED on every table; removing the policies leaves the public/anon role default-deny.
-- Run: paste into the Supabase SQL editor (or psql) and execute.

do $$
declare r record;
begin
  for r in select tablename from pg_policies where schemaname = 'public' and policyname = 'allow all'
  loop
    execute format('drop policy if exists %I on %I', 'allow all', r.tablename);
  end loop;
end $$;

-- ROLLBACK (run only if the service-role key is not active and server reads/writes break):
-- do $$
-- declare r record;
-- begin
--   for r in select tablename from pg_tables where schemaname = 'public' and rowsecurity
--   loop
--     execute format('create policy "allow all" on %I for all using (true) with check (true)', r.tablename);
--   end loop;
-- end $$;
