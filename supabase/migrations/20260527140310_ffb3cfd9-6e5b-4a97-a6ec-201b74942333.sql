ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS brand_logo_url text,
  ADD COLUMN IF NOT EXISTS brand_logo_height_px integer NOT NULL DEFAULT 32;