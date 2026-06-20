/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

-- Add event pricing and capacity fields
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_inscriptions int DEFAULT 999;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS current_inscriptions int DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price_cents bigint DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promotional_price_cents bigint;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promotional_until date;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS certificate_template text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_checkin boolean DEFAULT false;

-- Event inscriptions table
CREATE TABLE IF NOT EXISTS public.event_inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  attendance_count int NOT NULL DEFAULT 1,
  total_price_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, pending
  inscribed_at timestamptz NOT NULL DEFAULT now(),
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads inscriptions" ON public.event_inscriptions FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts inscriptions" ON public.event_inscriptions FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates inscriptions" ON public.event_inscriptions FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes inscriptions" ON public.event_inscriptions FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_event_inscriptions_event ON public.event_inscriptions(event_id);
CREATE INDEX idx_event_inscriptions_account ON public.event_inscriptions(account_id);
CREATE INDEX idx_event_inscriptions_status ON public.event_inscriptions(status);

CREATE TRIGGER touch_event_inscriptions BEFORE UPDATE ON public.event_inscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Event certificates
CREATE TABLE IF NOT EXISTS public.event_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  inscription_id uuid NOT NULL REFERENCES public.event_inscriptions(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  certificate_number text NOT NULL,
  issued_at date NOT NULL DEFAULT CURRENT_DATE,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads certificates" ON public.event_certificates FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts certificates" ON public.event_certificates FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());

CREATE INDEX idx_event_certificates_event ON public.event_certificates(event_id);
CREATE INDEX idx_event_certificates_inscription ON public.event_certificates(inscription_id);

CREATE TRIGGER touch_event_certificates BEFORE UPDATE ON public.event_certificates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Event promotional codes
CREATE TABLE IF NOT EXISTS public.event_promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  discount_percent int,
  discount_fixed_cents bigint,
  max_uses int,
  used_count int DEFAULT 0,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads codes" ON public.event_promo_codes FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts codes" ON public.event_promo_codes FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates codes" ON public.event_promo_codes FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());

CREATE INDEX idx_promo_code ON public.event_promo_codes(code);
CREATE INDEX idx_promo_event ON public.event_promo_codes(event_id);

CREATE TRIGGER touch_event_promo_codes BEFORE UPDATE ON public.event_promo_codes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_inscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_promo_codes TO authenticated;

GRANT ALL ON public.event_inscriptions TO service_role;
GRANT ALL ON public.event_certificates TO service_role;
GRANT ALL ON public.event_promo_codes TO service_role;
