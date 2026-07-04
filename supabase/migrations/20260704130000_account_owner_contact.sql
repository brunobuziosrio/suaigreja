-- Onboarding guiado: etapa "responsavel" precisa de onde guardar nome/telefone
-- de quem administra a conta. Colunas novas, nullable, sem efeito em contas
-- existentes.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS owner_phone text;

NOTIFY pgrst, 'reload schema';
