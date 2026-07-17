-- Atendimento humano no WhatsApp Inbox.
-- As mensagens enviadas continuam na fila whatsapp_messages; esta migration
-- apenas garante que conversas recebidas possam ser assumidas e auditadas.

alter table public.whatsapp_conversations
  add column if not exists closed_at timestamptz,
  add column if not exists last_inbound_preview text;

create index if not exists idx_whatsapp_conversations_open
  on public.whatsapp_conversations(account_id, status, last_message_at desc);
