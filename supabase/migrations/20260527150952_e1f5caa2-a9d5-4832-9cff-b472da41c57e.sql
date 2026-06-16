
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS cta_label text NOT NULL DEFAULT 'Doar Agora',
  ADD COLUMN IF NOT EXISTS cta_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.donation_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  pix_key text NOT NULL,
  pix_key_type text NOT NULL DEFAULT 'aleatoria',
  recipient_name text NOT NULL,
  recipient_city text NOT NULL DEFAULT 'BRASIL',
  suggested_amounts_cents jsonb NOT NULL DEFAULT '[]'::jsonb,
  goal_cents integer,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.donation_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_campaigns TO authenticated;
GRANT ALL ON public.donation_campaigns TO service_role;

ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads active donation campaigns"
  ON public.donation_campaigns FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "owner reads own donation campaigns"
  ON public.donation_campaigns FOR SELECT
  TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "owner inserts donation campaigns"
  ON public.donation_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "owner updates donation campaigns"
  ON public.donation_campaigns FOR UPDATE
  TO authenticated
  USING (account_id = auth.uid())
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "owner deletes donation campaigns"
  ON public.donation_campaigns FOR DELETE
  TO authenticated
  USING (account_id = auth.uid());

CREATE TRIGGER touch_donation_campaigns_updated_at
  BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_donation_campaigns_account ON public.donation_campaigns(account_id, active, sort_order);
