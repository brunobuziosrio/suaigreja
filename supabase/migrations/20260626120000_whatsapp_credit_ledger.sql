-- WhatsApp credits: immutable ledger plus atomic reserve/refund helpers.

CREATE TABLE IF NOT EXISTS public.whatsapp_credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  message_id uuid,
  purchase_id uuid REFERENCES public.whatsapp_credit_purchases(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('purchase', 'reserve', 'refund', 'adjustment')),
  credits_delta integer NOT NULL CHECK (credits_delta <> 0),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  idempotency_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_credit_ledger
  DROP CONSTRAINT IF EXISTS whatsapp_credit_ledger_message_id_fkey;

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_credit_ledger_idempotency
  ON public.whatsapp_credit_ledger(account_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_whatsapp_credit_ledger_account_created
  ON public.whatsapp_credit_ledger(account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_credit_ledger_message
  ON public.whatsapp_credit_ledger(message_id)
  WHERE message_id IS NOT NULL;

ALTER TABLE public.whatsapp_credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads whatsapp credit ledger" ON public.whatsapp_credit_ledger;
CREATE POLICY "owner reads whatsapp credit ledger" ON public.whatsapp_credit_ledger
  FOR SELECT TO authenticated
  USING (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.whatsapp_credit_ledger TO authenticated;
GRANT ALL ON public.whatsapp_credit_ledger TO service_role;

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS credit_reserved_at timestamptz,
  ADD COLUMN IF NOT EXISTS credit_refunded_at timestamptz;

CREATE OR REPLACE FUNCTION public.reserve_whatsapp_credits(
  p_account_id uuid,
  p_message_id uuid,
  p_cost integer,
  p_idempotency_key text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(ok boolean, balance integer, ledger_id uuid, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_ledger public.whatsapp_credit_ledger%ROWTYPE;
BEGIN
  IF p_cost IS NULL OR p_cost <= 0 THEN
    RAISE EXCEPTION 'Invalid WhatsApp credit cost';
  END IF;

  IF auth.role() <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND p_account_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_ledger
  FROM public.whatsapp_credit_ledger
  WHERE account_id = p_account_id
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_ledger.balance_after, v_ledger.id, 'idempotent'::text;
    RETURN;
  END IF;

  INSERT INTO public.whatsapp_settings (account_id, credits_balance)
  VALUES (p_account_id, 0)
  ON CONFLICT (account_id) DO NOTHING;

  SELECT credits_balance INTO v_balance
  FROM public.whatsapp_settings
  WHERE account_id = p_account_id
  FOR UPDATE;

  IF COALESCE(v_balance, 0) < p_cost THEN
    RETURN QUERY SELECT false, COALESCE(v_balance, 0), NULL::uuid, 'insufficient_credits'::text;
    RETURN;
  END IF;

  v_balance := v_balance - p_cost;

  UPDATE public.whatsapp_settings
  SET credits_balance = v_balance,
      updated_at = now()
  WHERE account_id = p_account_id;

  INSERT INTO public.whatsapp_credit_ledger (
    account_id,
    message_id,
    entry_type,
    credits_delta,
    balance_after,
    idempotency_key,
    metadata
  )
  VALUES (
    p_account_id,
    p_message_id,
    'reserve',
    -p_cost,
    v_balance,
    p_idempotency_key,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING * INTO v_ledger;

  RETURN QUERY SELECT true, v_balance, v_ledger.id, 'reserved'::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_whatsapp_message_credits(
  p_account_id uuid,
  p_message_id uuid,
  p_idempotency_key text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(ok boolean, balance integer, ledger_id uuid, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost integer;
  v_balance integer;
  v_ledger public.whatsapp_credit_ledger%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND p_account_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_ledger
  FROM public.whatsapp_credit_ledger
  WHERE account_id = p_account_id
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_ledger.balance_after, v_ledger.id, 'idempotent'::text;
    RETURN;
  END IF;

  SELECT cost_credits INTO v_cost
  FROM public.whatsapp_messages
  WHERE id = p_message_id
    AND account_id = p_account_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::integer, NULL::uuid, 'message_not_found'::text;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.whatsapp_credit_ledger
    WHERE account_id = p_account_id
      AND message_id = p_message_id
      AND entry_type = 'refund'
  ) THEN
    SELECT credits_balance INTO v_balance
    FROM public.whatsapp_settings
    WHERE account_id = p_account_id;
    RETURN QUERY SELECT true, COALESCE(v_balance, 0), NULL::uuid, 'already_refunded'::text;
    RETURN;
  END IF;

  INSERT INTO public.whatsapp_settings (account_id, credits_balance)
  VALUES (p_account_id, 0)
  ON CONFLICT (account_id) DO NOTHING;

  SELECT credits_balance INTO v_balance
  FROM public.whatsapp_settings
  WHERE account_id = p_account_id
  FOR UPDATE;

  v_balance := COALESCE(v_balance, 0) + COALESCE(v_cost, 1);

  UPDATE public.whatsapp_settings
  SET credits_balance = v_balance,
      updated_at = now()
  WHERE account_id = p_account_id;

  UPDATE public.whatsapp_messages
  SET credit_refunded_at = COALESCE(credit_refunded_at, now())
  WHERE id = p_message_id
    AND account_id = p_account_id;

  INSERT INTO public.whatsapp_credit_ledger (
    account_id,
    message_id,
    entry_type,
    credits_delta,
    balance_after,
    idempotency_key,
    metadata
  )
  VALUES (
    p_account_id,
    p_message_id,
    'refund',
    COALESCE(v_cost, 1),
    v_balance,
    p_idempotency_key,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING * INTO v_ledger;

  RETURN QUERY SELECT true, v_balance, v_ledger.id, 'refunded'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_whatsapp_credits(uuid, uuid, integer, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_whatsapp_message_credits(uuid, uuid, text, jsonb) TO authenticated, service_role;
