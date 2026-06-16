
CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_messages_tithe_dedup
  ON public.whatsapp_messages(account_id, member_id, scheduled_date)
  WHERE kind = 'tithe_reminder' AND member_id IS NOT NULL;
