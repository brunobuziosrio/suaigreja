-- WhatsApp delivery webhooks: provider status events and message reconciliation.

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS provider_delivery_status text,
  ADD COLUMN IF NOT EXISTS provider_status_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_wa_messages_provider_message
  ON public.whatsapp_messages(provider, provider_message_id)
  WHERE provider_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.whatsapp_delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.whatsapp_messages(id) ON DELETE SET NULL,
  provider text NOT NULL CHECK (provider IN ('meta_cloud', 'uazapi')),
  provider_message_id text,
  provider_status text NOT NULL,
  recipient_phone text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_delivery_events_account_created
  ON public.whatsapp_delivery_events(account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wa_delivery_events_provider_message
  ON public.whatsapp_delivery_events(provider, provider_message_id)
  WHERE provider_message_id IS NOT NULL;

ALTER TABLE public.whatsapp_delivery_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads whatsapp delivery events" ON public.whatsapp_delivery_events;
CREATE POLICY "owner reads whatsapp delivery events" ON public.whatsapp_delivery_events
  FOR SELECT TO authenticated
  USING (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.whatsapp_delivery_events TO authenticated;
GRANT ALL ON public.whatsapp_delivery_events TO service_role;
