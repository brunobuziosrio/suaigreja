-- WhatsApp provider connections per tenant. Secrets are referenced, not stored.

CREATE TABLE IF NOT EXISTS public.whatsapp_provider_connections (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('meta_cloud', 'uazapi')),
  active boolean NOT NULL DEFAULT false,
  sender_phone text,
  phone_number_id text,
  business_account_id text,
  instance_id text,
  api_base_url text,
  access_token_secret_name text NOT NULL,
  webhook_secret_name text,
  last_error text,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_provider_connections_active
  ON public.whatsapp_provider_connections(provider, active);

ALTER TABLE public.whatsapp_provider_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads whatsapp provider connection" ON public.whatsapp_provider_connections;
CREATE POLICY "owner reads whatsapp provider connection" ON public.whatsapp_provider_connections
  FOR SELECT TO authenticated
  USING (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin manages whatsapp provider connection" ON public.whatsapp_provider_connections;
CREATE POLICY "admin manages whatsapp provider connection" ON public.whatsapp_provider_connections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.whatsapp_provider_connections TO authenticated;
GRANT ALL ON public.whatsapp_provider_connections TO service_role;

DROP TRIGGER IF EXISTS trg_whatsapp_provider_connections_touch ON public.whatsapp_provider_connections;
CREATE TRIGGER trg_whatsapp_provider_connections_touch
  BEFORE UPDATE ON public.whatsapp_provider_connections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS provider text CHECK (provider IS NULL OR provider IN ('meta_cloud', 'uazapi')),
  ADD COLUMN IF NOT EXISTS provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_attempts integer NOT NULL DEFAULT 0 CHECK (delivery_attempts >= 0),
  ADD COLUMN IF NOT EXISTS locked_until timestamptz;

CREATE INDEX IF NOT EXISTS idx_wa_messages_queue_claim
  ON public.whatsapp_messages(status, scheduled_for, locked_until)
  WHERE status IN ('queued', 'sending');

CREATE OR REPLACE FUNCTION public.claim_whatsapp_messages(
  p_limit integer DEFAULT 20,
  p_lock_seconds integer DEFAULT 300
)
RETURNS TABLE(
  id uuid,
  account_id uuid,
  phone text,
  content text,
  delivery_attempts integer,
  cost_credits integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  WITH picked AS (
    SELECT m.id
    FROM public.whatsapp_messages m
    WHERE (
        (m.status = 'queued' AND m.scheduled_for <= now())
        OR (m.status = 'sending' AND m.locked_until IS NOT NULL AND m.locked_until <= now())
      )
      AND (m.locked_until IS NULL OR m.locked_until <= now())
      AND m.credit_reserved_at IS NOT NULL
      AND m.credit_refunded_at IS NULL
    ORDER BY m.scheduled_for ASC, m.created_at ASC
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.whatsapp_messages m
  SET status = 'sending',
      delivery_attempts = m.delivery_attempts + 1,
      locked_until = now() + make_interval(secs => LEAST(GREATEST(p_lock_seconds, 30), 1800)),
      updated_at = now()
  FROM picked
  WHERE m.id = picked.id
  RETURNING m.id, m.account_id, m.phone, m.content, m.delivery_attempts, m.cost_credits;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_whatsapp_messages(integer, integer) TO service_role;
