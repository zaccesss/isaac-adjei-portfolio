-- 046: revoke the default table grants from the API roles on schema public.
--
-- Every table already has RLS enabled with no policies (default deny) and every runtime
-- path uses the service role, so the anon and authenticated roles have no legitimate use
-- here. Their default grants only weaken the posture: any future table created with RLS
-- accidentally off would be fully readable through the public Data API. Revoking the
-- grants (and the default privileges for future objects) makes RLS the second line of
-- defence instead of the only one. service_role keeps its own grants and is unaffected.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- Future objects created by postgres (how every migration here runs) stop granting to
-- the API roles as well.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
