-- Bloqueio de indisponibilidade nas Escalas de Voluntarios: o
-- voluntario (ou a equipe por ele) marca um periodo em que nao pode
-- servir, e o sistema impede escalar ele nesse periodo.
--
-- Tabela nova, RLS ja baseada em membership desde a criacao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.volunteer_unavailability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT volunteer_unavailability_date_order CHECK (end_date >= start_date)
);

CREATE INDEX idx_volunteer_unavailability_account
  ON public.volunteer_unavailability(account_id, member_id, start_date, end_date);

ALTER TABLE public.volunteer_unavailability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read volunteer_unavailability"
  ON public.volunteer_unavailability FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members insert volunteer_unavailability"
  ON public.volunteer_unavailability FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members delete volunteer_unavailability"
  ON public.volunteer_unavailability FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

GRANT SELECT, INSERT, DELETE ON public.volunteer_unavailability TO authenticated;
GRANT ALL ON public.volunteer_unavailability TO service_role;

NOTIFY pgrst, 'reload schema';
