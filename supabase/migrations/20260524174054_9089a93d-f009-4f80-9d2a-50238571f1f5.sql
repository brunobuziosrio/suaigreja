
CREATE TABLE public.platform_branding (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  brand_text TEXT NOT NULL DEFAULT 'suaigreja',
  subtitle TEXT NOT NULL DEFAULT 'painel',
  icon_text TEXT NOT NULL DEFAULT 's',
  icon_url TEXT,
  logo_url TEXT,
  logo_height_px INTEGER NOT NULL DEFAULT 32 CHECK (logo_height_px BETWEEN 16 AND 96),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_branding (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE public.platform_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view branding"
ON public.platform_branding FOR SELECT
USING (true);

CREATE POLICY "Admins can update branding"
ON public.platform_branding FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert branding"
ON public.platform_branding FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_platform_branding()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER platform_branding_updated_at
BEFORE UPDATE ON public.platform_branding
FOR EACH ROW EXECUTE FUNCTION public.touch_platform_branding();
