-- privacy_policies tinha GRANT de INSERT/SELECT pro role authenticated,
-- mas nao de UPDATE/DELETE -- RLS policy sozinha nao basta no
-- PostgREST, precisa do GRANT de tabela tambem (mesmo padrao ja visto
-- nesta sessao: toda tabela nova precisa GRANT + NOTIFY reload schema).
-- Achado testando de verdade a publicacao de uma nova versao da
-- politica ("permission denied for table privacy_policies").
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

GRANT UPDATE, DELETE ON public.privacy_policies TO authenticated;

NOTIFY pgrst, 'reload schema';
