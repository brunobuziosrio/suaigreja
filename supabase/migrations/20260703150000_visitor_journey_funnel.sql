-- Jornada do Visitante: expande o funil de 4 para 6 etapas e adiciona
-- rastreio de quanto tempo o visitante esta parado na etapa atual.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

-- Backfill deterministico: para linhas existentes, assume que a etapa atual
-- comecou na criacao do registro (nao tinhamos rastreio de transicao antes).
UPDATE public.visitors
SET status_changed_at = created_at
WHERE status_changed_at IS NULL;

ALTER TABLE public.visitors
  ALTER COLUMN status_changed_at SET DEFAULT now(),
  ALTER COLUMN status_changed_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visitors_status_changed
  ON public.visitors(account_id, status, status_changed_at);
