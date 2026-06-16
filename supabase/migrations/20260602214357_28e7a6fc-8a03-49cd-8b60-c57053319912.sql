REVOKE ALL ON ALL FUNCTIONS IN SCHEMA extensions FROM PUBLIC, anon, authenticated;
REVOKE USAGE ON SCHEMA extensions FROM anon, authenticated;
GRANT USAGE ON SCHEMA extensions TO postgres, service_role;