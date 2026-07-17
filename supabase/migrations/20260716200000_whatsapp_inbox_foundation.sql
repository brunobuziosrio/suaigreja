create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider text not null,
  provider_conversation_id text,
  contact_phone text not null,
  contact_name text,
  status text not null default 'bot' check (status in ('bot','human','closed')),
  assigned_user_id uuid references auth.users(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(account_id, provider, contact_phone)
);
create table if not exists public.whatsapp_inbound_messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  provider text not null,
  provider_message_id text not null,
  sender_phone text not null,
  message_type text not null default 'text',
  content text,
  raw_payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(provider, provider_message_id)
);
create index if not exists idx_whatsapp_conversations_account_activity on public.whatsapp_conversations(account_id, last_message_at desc);
create index if not exists idx_whatsapp_inbound_conversation_time on public.whatsapp_inbound_messages(conversation_id, received_at desc);
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_inbound_messages enable row level security;
create policy "account members view whatsapp conversations" on public.whatsapp_conversations for select using (public.is_account_member(account_id, auth.uid()));
create policy "account members manage whatsapp conversations" on public.whatsapp_conversations for update using (public.is_account_member(account_id, auth.uid())) with check (public.is_account_member(account_id, auth.uid()));
create policy "account members view inbound whatsapp" on public.whatsapp_inbound_messages for select using (public.is_account_member(account_id, auth.uid()));
