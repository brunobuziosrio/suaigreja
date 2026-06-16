
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.donation_campaigns(id) ON DELETE SET NULL,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  donor_name text,
  donor_email text,
  donor_phone text,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  mercadopago_payment_id text,
  qr_code text,
  copy_paste text,
  paid_at timestamptz,
  raw_response jsonb,
  webhook_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_mercadopago_payment_id
  ON public.donations(mercadopago_payment_id)
  WHERE mercadopago_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_account_status ON public.donations(account_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON public.donations(campaign_id);

GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (account_id = auth.uid());

CREATE TRIGGER touch_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
