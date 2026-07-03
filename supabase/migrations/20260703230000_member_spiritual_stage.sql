-- Jornada Espiritual do Membro: etapa de crescimento espiritual de cada
-- fiel, pra acao pastoral direcionada (quem precisa de acompanhamento,
-- quem esta pronto pra servir, etc).
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS spiritual_stage text;

CREATE INDEX IF NOT EXISTS idx_members_spiritual_stage ON public.members(account_id, spiritual_stage);

NOTIFY pgrst, 'reload schema';
