-- Patrimonio e Manutencao: cadastro de equipamentos, instrumentos e
-- moveis da igreja, com local de guarda, responsavel atual (emprestimo)
-- e status de manutencao.
--
-- Tabela nova, RLS ja baseada em membership desde a criacao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'outro', -- instrumento | som | projecao | moveis | informatica | outro
  photo_url text,
  serial_or_invoice text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'available', -- available | loaned | maintenance | retired
  holder_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  loaned_at date,
  acquired_at date,
  value_cents integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_account ON public.assets(account_id, status, category);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read assets"
  ON public.assets FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members insert assets"
  ON public.assets FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members update assets"
  ON public.assets FOR UPDATE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members delete assets"
  ON public.assets FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE TRIGGER touch_assets BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;

NOTIFY pgrst, 'reload schema';
