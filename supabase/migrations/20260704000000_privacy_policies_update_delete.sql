-- privacy_policies so tinha policy de SELECT e INSERT desde a criacao --
-- faltava UPDATE (marcar uma versao como vigente, desmarcando as
-- outras) e DELETE (remover rascunho). Sem isso a feature de Politica
-- de Privacidade versionada nao funciona (mesma classe de problema ja
-- corrigida em lgpd_consent_records/lgpd_deletion_requests nesta sessao).
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE POLICY "owner updates policies"
  ON public.privacy_policies FOR UPDATE TO authenticated
  USING (is_account_member(account_id, auth.uid()))
  WITH CHECK (is_account_member(account_id, auth.uid()));

CREATE POLICY "owner deletes policies"
  ON public.privacy_policies FOR DELETE TO authenticated
  USING (is_account_member(account_id, auth.uid()));

NOTIFY pgrst, 'reload schema';
