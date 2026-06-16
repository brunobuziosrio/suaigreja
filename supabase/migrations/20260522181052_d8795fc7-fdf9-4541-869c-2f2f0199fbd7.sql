
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS brand_today_title text NOT NULL DEFAULT 'Celebrações de hoje',
  ADD COLUMN IF NOT EXISTS show_end_time boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_live_fields boolean NOT NULL DEFAULT true;
