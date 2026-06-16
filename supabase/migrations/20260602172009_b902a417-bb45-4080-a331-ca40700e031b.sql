
-- Members: drop overly-broad anon SELECT and revoke direct anon grant.
-- Public member-card page reads via supabaseAdmin in a server function.
DROP POLICY IF EXISTS "public reads active members for card" ON public.members;
REVOKE SELECT ON public.members FROM anon;

-- Small groups: drop overly-broad anon SELECT and revoke direct anon grant.
-- Public hub pages read via supabaseAdmin scoped by account_id.
DROP POLICY IF EXISTS "public reads active small_groups" ON public.small_groups;
REVOKE SELECT ON public.small_groups FROM anon;
