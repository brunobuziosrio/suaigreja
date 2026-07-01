/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-23
 *
 * Portal da Secretaria — solicitações de batismo, casamento, catequese,
 * visita pastoral, aconselhamento, declarações e demais atendimentos.
 */

CREATE TABLE IF NOT EXISTS public.secretaria_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  request_type text NOT NULL, -- batismo, casamento, catequese, visita_pastoral, aconselhamento, declaracao, certidao, apresentacao_crianca, outro
  requester_name text NOT NULL,
  requester_phone text,
  requester_email text,
  details text,
  status text NOT NULL DEFAULT 'recebido', -- recebido, em_andamento, agendado, concluido, cancelado
  priority text NOT NULL DEFAULT 'normal', -- baixa, normal, alta
  preferred_date date,
  scheduled_at timestamptz,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.secretaria_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads secretaria" ON public.secretaria_requests FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts secretaria" ON public.secretaria_requests FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates secretaria" ON public.secretaria_requests FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes secretaria" ON public.secretaria_requests FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_secretaria_account_id ON public.secretaria_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_secretaria_status ON public.secretaria_requests(account_id, status);
CREATE INDEX IF NOT EXISTS idx_secretaria_type ON public.secretaria_requests(account_id, request_type);
CREATE INDEX IF NOT EXISTS idx_secretaria_member ON public.secretaria_requests(member_id);

CREATE TRIGGER touch_secretaria_requests BEFORE UPDATE ON public.secretaria_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.secretaria_requests TO authenticated;
GRANT ALL ON public.secretaria_requests TO service_role;
