
DROP POLICY IF EXISTS "authenticated upload event covers" ON storage.objects;
DROP POLICY IF EXISTS "authenticated update event covers" ON storage.objects;
DROP POLICY IF EXISTS "authenticated delete event covers" ON storage.objects;
DROP POLICY IF EXISTS "public read event covers" ON storage.objects;

CREATE POLICY "public read event covers"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-covers');

CREATE POLICY "authenticated upload event covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-covers');

CREATE POLICY "authenticated update event covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-covers')
  WITH CHECK (bucket_id = 'event-covers');

CREATE POLICY "authenticated delete event covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-covers');
