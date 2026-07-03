-- Central de Decisoes e Acolhimento: formulario publico para "quero
-- aceitar Jesus", "quero voltar pra igreja", "quero conversar com
-- alguem", "quero me batizar", "quero entrar numa celula" e "preciso de
-- aconselhamento", com painel para a equipe pastoral acompanhar.
--
-- Tabela nova criada ja com RLS baseada em membership (nao repete o erro
-- historico de account_id = auth.uid() que precisou de correcao em massa
-- na Fase 3b).
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  kind text NOT NULL, -- aceitar_jesus | voltar_igreja | conversar | batismo | celula | aconselhamento
  name text NOT NULL,
  phone text,
  email text,
  message text,
  status text NOT NULL DEFAULT 'pending', -- pending | contacted | done
  assignee_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_decisions_account ON public.decisions(account_id, status, created_at DESC);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read decisions"
  ON public.decisions FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members update decisions"
  ON public.decisions FOR UPDATE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members delete decisions"
  ON public.decisions FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

-- Insercao publica (formulario do site) restrita a contas reais existentes,
-- mesmo padrao ja usado em visitors/prayer_requests.
CREATE POLICY "public can insert decisions"
  ON public.decisions FOR INSERT TO anon, authenticated
  WITH CHECK (
    account_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = decisions.account_id)
  );

CREATE TRIGGER touch_decisions BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT INSERT ON public.decisions TO anon;
GRANT ALL ON public.decisions TO service_role;

NOTIFY pgrst, 'reload schema';
