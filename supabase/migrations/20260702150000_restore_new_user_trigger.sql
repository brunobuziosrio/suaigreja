-- Correcao critica: o gatilho on_auth_user_created (em auth.users) nao existia
-- em produção — provavelmente removido durante alguma manutencao do schema auth
-- (ex.: configuracao de Google OAuth ou upgrade de Postgres). A funcao
-- public.handle_new_user() existia, mas sem o gatilho NENHUM novo cadastro
-- (nem signup normal, nem convite) criava conta ou vinculava membership.
--
-- Esta migration apenas recria o gatilho ja existente na funcao ja publicada.
-- Nao altera logica; apenas restaura a ligacao entre auth.users e a funcao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
