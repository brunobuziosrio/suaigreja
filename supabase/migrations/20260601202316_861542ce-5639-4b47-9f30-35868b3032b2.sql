
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS card_logo_url text,
  ADD COLUMN IF NOT EXISTS card_logo_height_px integer DEFAULT 72,
  ADD COLUMN IF NOT EXISTS card_accent_color text DEFAULT '#c8102e',
  ADD COLUMN IF NOT EXISTS card_footer_text text DEFAULT 'É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva. Art 5º, VII, Constituição Federal.';

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS congregation text;
