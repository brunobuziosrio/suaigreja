-- Billing integrity for tiered plans and idempotent AtivoPay processing.

ALTER TABLE public.payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_plan_check;

ALTER TABLE public.payment_transactions
  ADD CONSTRAINT payment_transactions_plan_check
  CHECK (
    plan IN (
      'monthly',
      'annual',
      'essential_monthly',
      'essential_annual',
      'pro_monthly',
      'pro_annual',
      'premium_monthly',
      'premium_annual'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_tx_ativopay_unique
  ON public.payment_transactions(ativopay_transaction_id)
  WHERE ativopay_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_tx_account_status_created
  ON public.payment_transactions(account_id, status, created_at DESC);
