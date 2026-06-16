
-- Fix: Public Bucket Allows Listing — drop broad SELECT policies on storage.objects.
-- Public buckets continue to serve files via /storage/v1/object/public/... (CDN, bypasses RLS).
-- Removing these policies blocks the LIST endpoint so attackers cannot enumerate files.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "event covers public read" ON storage.objects;

-- Fix: RLS Enabled No Policy — prayer_interactions is only accessed via the
-- service-role admin client. Add an explicit deny-all-to-anon policy so the linter is satisfied
-- while still blocking direct access from authenticated/anon clients.
CREATE POLICY "no direct client access to prayer_interactions"
  ON public.prayer_interactions
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- Fix: RLS Policy Always True — tighten the public insert policy on visitors so anonymous
-- callers can only insert rows targeting a real account (prevents spamming arbitrary account_ids
-- with bogus or non-existent values being trivially accepted).
DROP POLICY IF EXISTS "public can insert visitors" ON public.visitors;
CREATE POLICY "public can insert visitors"
  ON public.visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    account_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = visitors.account_id)
  );
