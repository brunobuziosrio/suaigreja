CREATE TABLE public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  age_range text,
  how_found text,
  is_first_time boolean NOT NULL DEFAULT true,
  prayer_request text,
  allow_contact boolean NOT NULL DEFAULT true,
  notes text,
  status text NOT NULL DEFAULT 'new', -- new | contacted | member | archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitors_account ON public.visitors(account_id, status, created_at DESC);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners manage visitors"
  ON public.visitors FOR ALL
  TO authenticated
  USING (auth.uid() = account_id)
  WITH CHECK (auth.uid() = account_id);

CREATE POLICY "public can insert visitors"
  ON public.visitors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TRIGGER trg_visitors_updated
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Add visitor WhatsApp contact field on accounts (for pastor notification)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS visitor_whatsapp text,
  ADD COLUMN IF NOT EXISTS visitor_welcome_message text DEFAULT 'Seja muito bem-vindo(a) à nossa igreja! Que alegria ter você aqui. 🙏';