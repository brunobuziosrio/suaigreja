-- Acao Social Digital: cadastro de familias em acompanhamento
-- assistencial e historico de entregas (cestas basicas, doacoes, etc).
--
-- Tabelas novas, RLS ja baseada em membership desde a criacao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.social_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  family_name text NOT NULL,
  responsible_name text NOT NULL,
  phone text,
  address text,
  family_size integer,
  needs text,
  status text NOT NULL DEFAULT 'active', -- active | inactive
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.social_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES public.social_families(id) ON DELETE CASCADE,
  delivered_at date NOT NULL DEFAULT CURRENT_DATE,
  items text NOT NULL,
  delivered_by text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_families_account ON public.social_families(account_id, status);
CREATE INDEX idx_social_deliveries_account ON public.social_deliveries(account_id, family_id, delivered_at DESC);

ALTER TABLE public.social_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read social_families"
  ON public.social_families FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));
CREATE POLICY "members insert social_families"
  ON public.social_families FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));
CREATE POLICY "members update social_families"
  ON public.social_families FOR UPDATE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));
CREATE POLICY "members delete social_families"
  ON public.social_families FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members read social_deliveries"
  ON public.social_deliveries FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));
CREATE POLICY "members insert social_deliveries"
  ON public.social_deliveries FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));
CREATE POLICY "members delete social_deliveries"
  ON public.social_deliveries FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE TRIGGER touch_social_families BEFORE UPDATE ON public.social_families
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_families TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.social_deliveries TO authenticated;
GRANT ALL ON public.social_families TO service_role;
GRANT ALL ON public.social_deliveries TO service_role;

NOTIFY pgrst, 'reload schema';
