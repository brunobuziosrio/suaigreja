ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS card_title_size_px integer DEFAULT 36,
  ADD COLUMN IF NOT EXISTS card_footer_size_px integer DEFAULT 12;