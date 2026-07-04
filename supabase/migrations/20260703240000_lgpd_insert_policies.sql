-- Corrige RLS incompleta em lgpd_consent_records e lgpd_deletion_requests:
-- so existia policy de SELECT ("owner reads own..."), nenhuma de INSERT.
-- Resultado: toda tentativa de gravar consentimento ou pedido de exclusao
-- falhava silenciosamente (0 linhas em produção desde a criacao destas
-- tabelas em 20-06). Achado testando de verdade a pagina /privacidade.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE POLICY "owner inserts own consents"
  ON public.lgpd_consent_records FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner inserts own deletion requests"
  ON public.lgpd_deletion_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
