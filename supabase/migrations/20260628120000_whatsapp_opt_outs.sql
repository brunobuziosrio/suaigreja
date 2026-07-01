-- WhatsApp opt-out tracking and consent withdrawal.

CREATE TABLE IF NOT EXISTS public.whatsapp_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  message_id uuid,
  phone_normalized text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, phone_normalized)
);

ALTER TABLE public.whatsapp_opt_outs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads whatsapp opt outs" ON public.whatsapp_opt_outs;
CREATE POLICY "owner reads whatsapp opt outs" ON public.whatsapp_opt_outs
  FOR SELECT TO authenticated
  USING (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin manages whatsapp opt outs" ON public.whatsapp_opt_outs;
CREATE POLICY "admin manages whatsapp opt outs" ON public.whatsapp_opt_outs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.whatsapp_opt_outs TO authenticated;
GRANT ALL ON public.whatsapp_opt_outs TO service_role;

CREATE INDEX IF NOT EXISTS idx_whatsapp_opt_outs_account_phone
  ON public.whatsapp_opt_outs(account_id, phone_normalized);

DROP TRIGGER IF EXISTS trg_whatsapp_opt_outs_touch ON public.whatsapp_opt_outs;
CREATE TRIGGER trg_whatsapp_opt_outs_touch
  BEFORE UPDATE ON public.whatsapp_opt_outs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.normalize_whatsapp_phone(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g') = '' THEN ''
    WHEN regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g') LIKE '55%' THEN regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g')
    ELSE '55' || regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g')
  END;
$$;

CREATE OR REPLACE FUNCTION public.record_whatsapp_opt_out(
  p_account_id uuid,
  p_phone text,
  p_member_id uuid DEFAULT NULL,
  p_message_id uuid DEFAULT NULL,
  p_source text DEFAULT 'manual',
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(opt_out_id uuid, phone_normalized text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
  v_id uuid;
BEGIN
  IF auth.role() <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND p_account_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_phone := public.normalize_whatsapp_phone(p_phone);
  IF v_phone = '' THEN
    RAISE EXCEPTION 'Invalid WhatsApp phone';
  END IF;

  INSERT INTO public.whatsapp_opt_outs (
    account_id,
    member_id,
    message_id,
    phone_normalized,
    source,
    reason,
    metadata
  )
  VALUES (
    p_account_id,
    p_member_id,
    p_message_id,
    v_phone,
    COALESCE(NULLIF(p_source, ''), 'manual'),
    p_reason,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (account_id, phone_normalized)
  DO UPDATE SET
    member_id = COALESCE(EXCLUDED.member_id, public.whatsapp_opt_outs.member_id),
    message_id = COALESCE(EXCLUDED.message_id, public.whatsapp_opt_outs.message_id),
    source = EXCLUDED.source,
    reason = EXCLUDED.reason,
    metadata = public.whatsapp_opt_outs.metadata || EXCLUDED.metadata,
    updated_at = now()
  RETURNING id INTO v_id;

  UPDATE public.members
  SET whatsapp_consent = false,
      updated_at = now()
  WHERE account_id = p_account_id
    AND (
      id = p_member_id
      OR public.normalize_whatsapp_phone(phone) = v_phone
    );

  RETURN QUERY SELECT v_id, v_phone;
END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_whatsapp_phone(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_whatsapp_opt_out(uuid, text, uuid, uuid, text, text, jsonb)
  TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.claim_whatsapp_messages(integer, integer);

CREATE OR REPLACE FUNCTION public.claim_whatsapp_messages(
  p_limit integer DEFAULT 20,
  p_lock_seconds integer DEFAULT 300
)
RETURNS TABLE(
  id uuid,
  account_id uuid,
  member_id uuid,
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
  RETURNING m.id, m.account_id, m.member_id, m.phone, m.content, m.delivery_attempts, m.cost_credits;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_whatsapp_messages(integer, integer) TO service_role;
