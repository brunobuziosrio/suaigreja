-- Administrative WhatsApp credit grants with purchase and ledger traceability.

CREATE OR REPLACE FUNCTION public.admin_grant_whatsapp_credits(
  p_account_id uuid,
  p_credits integer,
  p_amount_cents integer DEFAULT 0,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(balance integer, purchase_id uuid, ledger_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_purchase_id uuid := gen_random_uuid();
  v_ledger_id uuid;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_credits IS NULL OR p_credits <= 0 THEN
    RAISE EXCEPTION 'Credits must be greater than zero';
  END IF;

  IF p_amount_cents IS NULL OR p_amount_cents < 0 THEN
    RAISE EXCEPTION 'Amount must be zero or greater';
  END IF;

  INSERT INTO public.whatsapp_settings (account_id, credits_balance)
  VALUES (p_account_id, 0)
  ON CONFLICT (account_id) DO NOTHING;

  SELECT credits_balance INTO v_balance
  FROM public.whatsapp_settings
  WHERE account_id = p_account_id
  FOR UPDATE;

  v_balance := COALESCE(v_balance, 0) + p_credits;

  INSERT INTO public.whatsapp_credit_purchases (
    id,
    account_id,
    package_id,
    message_count,
    amount_cents,
    status,
    paid_at
  )
  VALUES (
    v_purchase_id,
    p_account_id,
    NULL,
    p_credits,
    p_amount_cents,
    'paid',
    now()
  );

  UPDATE public.whatsapp_settings
  SET credits_balance = v_balance,
      updated_at = now()
  WHERE account_id = p_account_id;

  INSERT INTO public.whatsapp_credit_ledger (
    account_id,
    purchase_id,
    entry_type,
    credits_delta,
    balance_after,
    idempotency_key,
    metadata
  )
  VALUES (
    p_account_id,
    v_purchase_id,
    'purchase',
    p_credits,
    v_balance,
    'admin-grant:' || v_purchase_id::text,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_ledger_id;

  RETURN QUERY SELECT v_balance, v_purchase_id, v_ledger_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_grant_whatsapp_credits(uuid, integer, integer, jsonb)
  TO authenticated, service_role;
