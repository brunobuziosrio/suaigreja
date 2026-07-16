-- Matriz administrável de recursos por plano.
-- Os valores abaixo reproduzem a política atual, para uma migração sem perda de acesso.
create table if not exists public.plan_feature_flags (
  feature_id text not null,
  plan_tier text not null check (plan_tier in ('essential', 'pro', 'premium')),
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (feature_id, plan_tier)
);

alter table public.plan_feature_flags enable row level security;

drop policy if exists "admins manage plan feature flags" on public.plan_feature_flags;
create policy "admins manage plan feature flags"
  on public.plan_feature_flags
  for all
  using (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ));

insert into public.plan_feature_flags (feature_id, plan_tier, enabled) values
  ('reports', 'essential', false), ('reports', 'pro', true), ('reports', 'premium', true),
  ('whatsapp', 'essential', false), ('whatsapp', 'pro', true), ('whatsapp', 'premium', true),
  ('members', 'essential', false), ('members', 'pro', true), ('members', 'premium', true),
  ('congregations', 'essential', false), ('congregations', 'pro', false), ('congregations', 'premium', true),
  ('visitors', 'essential', false), ('visitors', 'pro', true), ('visitors', 'premium', true),
  ('events', 'essential', false), ('events', 'pro', true), ('events', 'premium', true),
  ('checkin', 'essential', false), ('checkin', 'pro', true), ('checkin', 'premium', true),
  ('child_checkin', 'essential', false), ('child_checkin', 'pro', false), ('child_checkin', 'premium', true),
  ('campaigns', 'essential', false), ('campaigns', 'pro', true), ('campaigns', 'premium', true),
  ('small_groups', 'essential', false), ('small_groups', 'pro', false), ('small_groups', 'premium', true),
  ('education', 'essential', false), ('education', 'pro', false), ('education', 'premium', true),
  ('documents', 'essential', false), ('documents', 'pro', false), ('documents', 'premium', true),
  ('finances', 'essential', false), ('finances', 'pro', false), ('finances', 'premium', true),
  ('bank_accounts', 'essential', false), ('bank_accounts', 'pro', false), ('bank_accounts', 'premium', true),
  ('cash_book', 'essential', false), ('cash_book', 'pro', false), ('cash_book', 'premium', true),
  ('volunteer_shifts', 'essential', false), ('volunteer_shifts', 'pro', false), ('volunteer_shifts', 'premium', true),
  ('secretaria', 'essential', false), ('secretaria', 'pro', true), ('secretaria', 'premium', true)
on conflict (feature_id, plan_tier) do nothing;
