
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS hub_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hub_bio text,
  ADD COLUMN IF NOT EXISTS hub_cover_url text,
  ADD COLUMN IF NOT EXISTS hub_show_agenda boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hub_show_events boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hub_show_prayer boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hub_show_visitor boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_youtube text,
  ADD COLUMN IF NOT EXISTS social_facebook text,
  ADD COLUMN IF NOT EXISTS social_website text,
  ADD COLUMN IF NOT EXISTS pix_key text,
  ADD COLUMN IF NOT EXISTS live_url text;

-- Public read access to limited hub fields via existing public-agenda flow
-- (we already expose via SECURITY DEFINER server functions, so no RLS change needed)
