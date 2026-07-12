-- Mercado Pago becomes the platform checkout provider for subscriptions,
-- marketplace products, paid events and WhatsApp credit purchases.

ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_tx_mercadopago_unique
  ON public.payment_transactions(mercadopago_payment_id)
  WHERE mercadopago_payment_id IS NOT NULL;

DROP INDEX IF EXISTS public.idx_payment_tx_ativopay_unique;
DROP INDEX IF EXISTS public.idx_payment_tx_ativopay;

ALTER TABLE public.payment_transactions
  DROP COLUMN IF EXISTS ativopay_transaction_id;

ALTER TABLE public.platform_payment_settings
  DROP COLUMN IF EXISTS ativopay_api_key,
  DROP COLUMN IF EXISTS ativopay_webhook_secret;
