/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

-- Add more template fields to whatsapp_settings if they don't exist
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS event_reminder_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS event_reminder_template text DEFAULT 'Olá, {nome}! Lembrete: temos {evento} em {data} às {hora} na {local}. Te esperamos!';

ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS new_visitor_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS new_visitor_template text DEFAULT 'Olá, {nome}! Ficamos felizes com sua visita à {igreja} no dia {data}. Gostaríamos de conhecê-lo melhor. Pode voltar para nosso próximo evento? 🙏';

ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS event_confirmation_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS event_confirmation_template text DEFAULT 'Olá, {nome}! Você confirmou presença em {evento} em {data}. Que Deus te abençoe! 🙌';

ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS schedule_change_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS schedule_change_template text DEFAULT 'Olá, {nome}! Houve uma mudança na sua escala de {ministério}. Nova data: {data} às {hora}. Pode confirmar? ✅';

ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS volunteer_confirmation_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS volunteer_confirmation_template text DEFAULT 'Olá, {nome}! Você está escalado para {ministério} em {data} às {hora}. Pode confirmar sua presença? 🙏';

ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS campaign_update_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS campaign_update_template text DEFAULT 'Olá, {nome}! A campanha "{campanha}" já atingiu {percentual}% da meta! Que Deus multiplique suas bênçãos. 💰';

ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS weekly_bulletin_enabled boolean DEFAULT false;
ALTER TABLE public.whatsapp_settings ADD COLUMN IF NOT EXISTS weekly_bulletin_template text DEFAULT 'Olá, {nome}! Confira as novidades da semana em {igreja}: {conteudo} 📰';

-- Create a template library table for better management
CREATE TABLE IF NOT EXISTS public.whatsapp_template_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL, -- birthday, welcome, event_reminder, new_visitor, prayer_request, tithe_reminder, etc
  content text NOT NULL,
  preview text,
  is_active boolean NOT NULL DEFAULT true,
  usage_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_template_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads templates" ON public.whatsapp_template_library FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts templates" ON public.whatsapp_template_library FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates templates" ON public.whatsapp_template_library FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes templates" ON public.whatsapp_template_library FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_whatsapp_templates_account ON public.whatsapp_template_library(account_id);
CREATE INDEX idx_whatsapp_templates_kind ON public.whatsapp_template_library(kind);

CREATE TRIGGER touch_whatsapp_templates BEFORE UPDATE ON public.whatsapp_template_library FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_template_library TO authenticated;
GRANT ALL ON public.whatsapp_template_library TO service_role;

-- Add automation rule table for scheduled messages
CREATE TABLE IF NOT EXISTS public.whatsapp_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL, -- birthday, new_visitor, new_member, anniversary, payment_received
  template_id uuid REFERENCES public.whatsapp_template_library(id) ON DELETE SET NULL,
  custom_content text,
  is_active boolean NOT NULL DEFAULT false,
  send_hour_brt int DEFAULT 9,
  days_offset int DEFAULT 0,
  filters jsonb, -- {"status": ["active"], "role": ["membro", "lider"], "has_whatsapp_consent": true}
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads automation" ON public.whatsapp_automation_rules FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts automation" ON public.whatsapp_automation_rules FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates automation" ON public.whatsapp_automation_rules FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes automation" ON public.whatsapp_automation_rules FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_whatsapp_automation_account ON public.whatsapp_automation_rules(account_id);
CREATE INDEX idx_whatsapp_automation_active ON public.whatsapp_automation_rules(is_active);

CREATE TRIGGER touch_whatsapp_automation BEFORE UPDATE ON public.whatsapp_automation_rules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_automation_rules TO authenticated;
GRANT ALL ON public.whatsapp_automation_rules TO service_role;
