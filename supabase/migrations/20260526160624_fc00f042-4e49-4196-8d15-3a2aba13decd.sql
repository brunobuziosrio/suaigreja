ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS weekly_message text,
  ADD COLUMN IF NOT EXISTS weekly_verse text,
  ADD COLUMN IF NOT EXISTS weekly_verse_ref text,
  ADD COLUMN IF NOT EXISTS gallery_urls jsonb NOT NULL DEFAULT '[]'::jsonb;