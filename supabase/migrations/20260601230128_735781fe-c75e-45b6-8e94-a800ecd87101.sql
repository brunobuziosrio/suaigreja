ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS card_field_size_px integer DEFAULT 15,
  ADD COLUMN IF NOT EXISTS card_label_size_px integer DEFAULT 13;