ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS is_main boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS office_hours text,
  ADD COLUMN IF NOT EXISTS transport_info text,
  ADD COLUMN IF NOT EXISTS maps_url text,
  ADD COLUMN IF NOT EXISTS waze_url text,
  ADD COLUMN IF NOT EXISTS uber_url text;

-- Permitir leitura pública das unidades ativas para o site
DROP POLICY IF EXISTS "public reads active locations" ON public.locations;
CREATE POLICY "public reads active locations"
ON public.locations
FOR SELECT
TO anon, authenticated
USING (active = true);

GRANT SELECT ON public.locations TO anon;