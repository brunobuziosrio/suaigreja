ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS plan_tier text;

-- Clientes existentes mantêm os módulos que já utilizavam. Novas contas começam
-- no Essencial e podem subir de nível sem misturar produto com ciclo de cobrança.
UPDATE public.accounts SET plan_tier = 'premium' WHERE plan_tier IS NULL;

ALTER TABLE public.accounts
  ALTER COLUMN plan_tier SET DEFAULT 'essential',
  ALTER COLUMN plan_tier SET NOT NULL;

ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_plan_tier_check;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_plan_tier_check
  CHECK (plan_tier IN ('essential', 'pro', 'premium'));
