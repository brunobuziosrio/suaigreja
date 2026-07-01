/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 *
 * LGPD (Lei Geral de Proteção de Dados) compliance tables
 */

-- Consent tracking table
CREATE TABLE IF NOT EXISTS public.lgpd_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL, -- privacy_policy, whatsapp_contact, marketing_emails, data_processing, cookies
  accepted boolean NOT NULL,
  ip_address text,
  user_agent text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own consents" ON public.lgpd_consent_records FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_lgpd_consent_user ON public.lgpd_consent_records(user_id);
CREATE INDEX idx_lgpd_consent_account ON public.lgpd_consent_records(account_id);
CREATE INDEX idx_lgpd_consent_type ON public.lgpd_consent_records(consent_type);

GRANT SELECT, INSERT ON public.lgpd_consent_records TO authenticated;
GRANT ALL ON public.lgpd_consent_records TO service_role;

-- Data deletion requests
CREATE TABLE IF NOT EXISTS public.lgpd_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, rejected
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own requests" ON public.lgpd_deletion_requests FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_lgpd_deletion_user ON public.lgpd_deletion_requests(user_id);
CREATE INDEX idx_lgpd_deletion_status ON public.lgpd_deletion_requests(status);

GRANT SELECT, INSERT ON public.lgpd_deletion_requests TO authenticated;
GRANT ALL ON public.lgpd_deletion_requests TO service_role;

-- Audit log for data access
CREATE TABLE IF NOT EXISTS public.lgpd_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL, -- read, create, update, delete, export
  resource_type text NOT NULL, -- member, donation, prayer_request, etc
  resource_id uuid,
  description text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own logs" ON public.lgpd_audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "service role full access" ON public.lgpd_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_lgpd_audit_user ON public.lgpd_audit_logs(user_id);
CREATE INDEX idx_lgpd_audit_account ON public.lgpd_audit_logs(account_id);
CREATE INDEX idx_lgpd_audit_timestamp ON public.lgpd_audit_logs(timestamp);
CREATE INDEX idx_lgpd_audit_action ON public.lgpd_audit_logs(action);

GRANT SELECT ON public.lgpd_audit_logs TO authenticated;
GRANT ALL ON public.lgpd_audit_logs TO service_role;

-- Privacy policy versioning
CREATE TABLE IF NOT EXISTS public.privacy_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  version text NOT NULL,
  content text NOT NULL,
  effective_date date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.privacy_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads policies" ON public.privacy_policies FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts policies" ON public.privacy_policies FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());

CREATE INDEX idx_policies_account ON public.privacy_policies(account_id);
CREATE INDEX idx_policies_current ON public.privacy_policies(is_current);

GRANT SELECT, INSERT ON public.privacy_policies TO authenticated;
GRANT ALL ON public.privacy_policies TO service_role;

-- Insert default privacy policy template
INSERT INTO public.privacy_policies (account_id, version, content, effective_date, is_current)
SELECT
  id,
  '1.0',
  'POLÍTICA DE PRIVACIDADE

Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).

1. DADOS COLETADOS
- Nome, telefone, endereço, data de nascimento
- Dados de participação em eventos e contribuições
- Informações de comunicação via WhatsApp (com consentimento)

2. FINALIDADE
- Gerenciamento de membros
- Comunicação sobre eventos
- Gestão de contribuições e dízimos
- Envio de informações pastoral

3. COMPARTILHAMENTO
Seus dados não serão compartilhados com terceiros sem seu consentimento explícito.

4. DIREITOS
- Acessar seus dados
- Solicitar correção
- Solicitar exclusão
- Retirar consentimento

5. CONTATO
Para exercer seus direitos LGPD, entre em contato através do WhatsApp ou email da nossa comunidade.',
  CURRENT_DATE,
  true
FROM public.accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM public.privacy_policies p WHERE p.account_id = a.id
)
ON CONFLICT DO NOTHING;

-- Data subject rights form template
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL, -- access, rectification, deletion, portability, objection
  description text NOT NULL,
  status text NOT NULL DEFAULT 'received', -- received, in_progress, completed, rejected
  received_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own requests" ON public.data_subject_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner submits requests" ON public.data_subject_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_data_subject_user ON public.data_subject_requests(user_id);
CREATE INDEX idx_data_subject_status ON public.data_subject_requests(status);

GRANT SELECT, INSERT ON public.data_subject_requests TO authenticated;
GRANT ALL ON public.data_subject_requests TO service_role;
