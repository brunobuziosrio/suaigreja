DROP POLICY IF EXISTS "event covers owner upload" ON storage.objects;
DROP POLICY IF EXISTS "event covers owner update" ON storage.objects;
DROP POLICY IF EXISTS "event covers owner delete" ON storage.objects;

CREATE POLICY "authenticated upload event covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-covers');

CREATE POLICY "authenticated update event covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-covers')
WITH CHECK (bucket_id = 'event-covers');

CREATE POLICY "authenticated delete event covers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-covers');