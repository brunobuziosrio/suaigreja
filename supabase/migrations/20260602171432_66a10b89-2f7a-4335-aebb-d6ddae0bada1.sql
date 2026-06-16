
-- Tighten event-covers storage policies to enforce per-user folder ownership
DROP POLICY IF EXISTS "authenticated upload event covers" ON storage.objects;
DROP POLICY IF EXISTS "authenticated update event covers" ON storage.objects;
DROP POLICY IF EXISTS "authenticated delete event covers" ON storage.objects;

CREATE POLICY "users upload own event covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'event-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users update own event covers"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'event-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users delete own event covers"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'event-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Same tightening for member-photos (uploads use userId folder via client code)
DROP POLICY IF EXISTS "auth uploads member photos" ON storage.objects;
DROP POLICY IF EXISTS "auth updates own member photos" ON storage.objects;
DROP POLICY IF EXISTS "auth deletes own member photos" ON storage.objects;

CREATE POLICY "users upload own member photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'member-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users update own member photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'member-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'member-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users delete own member photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'member-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Drop broad public SELECT policies on storage.objects for public buckets.
-- Public buckets still serve files via getPublicUrl without a SELECT policy;
-- removing these prevents anonymous listing of all files in the bucket.
DROP POLICY IF EXISTS "public read event covers" ON storage.objects;
DROP POLICY IF EXISTS "public reads member photos" ON storage.objects;
