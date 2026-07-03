-- Certificados automaticos: numeracao sequencial por conta/ano em cima do
-- sistema de documentos ja existente (member_documents). O id do documento
-- (uuid, ja publico via GRANT SELECT anonimo com policy restrita) serve de
-- token de validacao publica — mesmo padrao usado na carteirinha do membro.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

ALTER TABLE public.member_documents
  ADD COLUMN IF NOT EXISTS certificate_number text;

CREATE INDEX IF NOT EXISTS idx_member_documents_certificate_number
  ON public.member_documents(account_id, certificate_number)
  WHERE certificate_number IS NOT NULL;

-- Leitura publica restrita: so expoe colunas de validacao (via server fn com
-- supabaseAdmin) para documentos que tenham numero de certificado — nunca o
-- corpo do texto, que pode conter informacao pastoral sensivel.
