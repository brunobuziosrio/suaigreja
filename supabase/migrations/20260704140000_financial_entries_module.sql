-- Livro Caixa: lancamentos financeiros manuais (entradas/saidas) com
-- categoria, contribuinte e forma de pagamento, base para importacao CSV
-- de lancamentos e filtros avancados com totalizadores.
--
-- Tabela nova, RLS ja baseada em membership desde a criacao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  entry_type text NOT NULL, -- income | expense
  category text NOT NULL,
  description text,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  contributor_name text,
  payment_method text, -- pix | dinheiro | cartao | transferencia | outro
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_financial_entries_account ON public.financial_entries(account_id, entry_date DESC);
CREATE INDEX idx_financial_entries_type ON public.financial_entries(account_id, entry_type);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read financial entries"
  ON public.financial_entries FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members insert financial entries"
  ON public.financial_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members update financial entries"
  ON public.financial_entries FOR UPDATE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members delete financial entries"
  ON public.financial_entries FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE TRIGGER touch_financial_entries BEFORE UPDATE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_entries TO authenticated;
GRANT ALL ON public.financial_entries TO service_role;

NOTIFY pgrst, 'reload schema';
