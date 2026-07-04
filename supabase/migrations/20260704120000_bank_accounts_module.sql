-- Cadastro dedicado de contas bancarias/chaves Pix da igreja, com "conta
-- principal" e "visivel para membros" (hoje so existe 1 chave Pix por conta
-- em Configuracoes e 1 chave Pix por campanha, sem cadastro multi-conta).
--
-- Tabela nova, RLS ja baseada em membership desde a criacao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  label text NOT NULL,
  bank_name text,
  account_kind text NOT NULL DEFAULT 'checking', -- checking | savings
  agency text,
  account_number text,
  holder_name text,
  pix_key text,
  pix_key_type text, -- cpf | cnpj | email | phone | random
  is_primary boolean NOT NULL DEFAULT false,
  visible_to_members boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bank_accounts_account ON public.bank_accounts(account_id, active);

-- So pode haver 1 conta marcada como principal por igreja.
CREATE UNIQUE INDEX idx_bank_accounts_one_primary
  ON public.bank_accounts(account_id)
  WHERE is_primary;

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read bank accounts"
  ON public.bank_accounts FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members insert bank accounts"
  ON public.bank_accounts FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members update bank accounts"
  ON public.bank_accounts FOR UPDATE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members delete bank accounts"
  ON public.bank_accounts FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE TRIGGER touch_bank_accounts BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;

NOTIFY pgrst, 'reload schema';
