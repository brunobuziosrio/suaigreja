
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly','annual')),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  ativopay_transaction_id TEXT,
  qr_code TEXT,
  copy_paste TEXT,
  pay_url TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  raw_response JSONB,
  webhook_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_tx_account ON public.payment_transactions(account_id);
CREATE INDEX idx_payment_tx_ativopay ON public.payment_transactions(ativopay_transaction_id);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (account_id = auth.uid());

CREATE POLICY "admins read all transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_payment_transactions
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS current_plan TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
