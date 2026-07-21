-- Agrupa disparos de WhatsApp para auditoria e métricas de entrega por campanha.
CREATE TABLE public.whatsapp_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_count integer NOT NULL DEFAULT 0 CHECK (requested_count >= 0),
  queued_count integer NOT NULL DEFAULT 0 CHECK (queued_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, id)
);

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS campaign_id uuid;

ALTER TABLE public.whatsapp_messages
  ADD CONSTRAINT whatsapp_messages_campaign_account_fkey
  FOREIGN KEY (account_id, campaign_id)
  REFERENCES public.whatsapp_campaigns(account_id, id)
  ON DELETE SET NULL (campaign_id);

CREATE INDEX idx_whatsapp_campaigns_account_created
  ON public.whatsapp_campaigns(account_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_campaign
  ON public.whatsapp_messages(campaign_id) WHERE campaign_id IS NOT NULL;

ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account members manage whatsapp campaigns" ON public.whatsapp_campaigns FOR ALL TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE TRIGGER touch_whatsapp_campaigns BEFORE UPDATE ON public.whatsapp_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_campaigns TO authenticated;
GRANT ALL ON public.whatsapp_campaigns TO service_role;
NOTIFY pgrst, 'reload schema';
