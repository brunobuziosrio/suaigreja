-- Self-service WhatsApp credit packages and paid purchase settlement.

INSERT INTO public.whatsapp_packages (name, description, message_count, price_cents, active, sort_order)
VALUES
  ('100 mensagens', 'Pacote inicial para aniversários, visitantes e avisos pontuais.', 100, 1900, true, 10),
  ('500 mensagens', 'Pacote recomendado para igrejas em crescimento.', 500, 7900, true, 20),
  ('1.000 mensagens', 'Melhor custo para comunicação semanal recorrente.', 1000, 13900, true, 30),
  ('5.000 mensagens', 'Volume para campanhas, boletins e operação multiunidade.', 5000, 49900, true, 40)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.complete_whatsapp_credit_purchase(
  p_purchase_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(balance integer, ledger_id uuid, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase public.whatsapp_credit_purchases%ROWTYPE;
  v_balance integer;
  v_ledger_id uuid;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_purchase
  FROM public.whatsapp_credit_purchases
  WHERE id = p_purchase_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::integer, NULL::uuid, 'purchase_not_found'::text;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.whatsapp_credit_ledger
    WHERE purchase_id = p_purchase_id
      AND entry_type = 'purchase'
  ) THEN
    SELECT credits_balance INTO v_balance
    FROM public.whatsapp_settings
    WHERE account_id = v_purchase.account_id;
    RETURN QUERY SELECT COALESCE(v_balance, 0), NULL::uuid, 'already_credited'::text;
    RETURN;
  END IF;

  IF v_purchase.status NOT IN ('pending', 'paid') THEN
    RETURN QUERY SELECT NULL::integer, NULL::uuid, 'invalid_purchase_status'::text;
    RETURN;
  END IF;

  INSERT INTO public.whatsapp_settings (account_id, credits_balance)
  VALUES (v_purchase.account_id, 0)
  ON CONFLICT (account_id) DO NOTHING;

  SELECT credits_balance INTO v_balance
  FROM public.whatsapp_settings
  WHERE account_id = v_purchase.account_id
  FOR UPDATE;

  v_balance := COALESCE(v_balance, 0) + v_purchase.message_count;

  UPDATE public.whatsapp_credit_purchases
  SET status = 'paid',
      paid_at = COALESCE(paid_at, now()),
      updated_at = now()
  WHERE id = p_purchase_id;

  UPDATE public.whatsapp_settings
  SET credits_balance = v_balance,
      updated_at = now()
  WHERE account_id = v_purchase.account_id;

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
    v_purchase.account_id,
    p_purchase_id,
    'purchase',
    v_purchase.message_count,
    v_balance,
    'purchase:' || p_purchase_id::text,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_ledger_id;

  RETURN QUERY SELECT v_balance, v_ledger_id, 'credited'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_whatsapp_credit_purchase(uuid, jsonb)
  TO authenticated, service_role;
