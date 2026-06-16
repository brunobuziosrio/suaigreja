ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS hub_whatsapp text,
  ADD COLUMN IF NOT EXISTS hub_show_whatsapp boolean NOT NULL DEFAULT true;