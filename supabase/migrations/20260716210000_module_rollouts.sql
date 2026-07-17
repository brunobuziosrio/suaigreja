-- Controle central de lançamento comercial. A matriz por plano decide quem pode
-- contratar; esta tabela decide se o recurso está desligado, em teste ou liberado.
create table if not exists public.module_rollouts (
  feature_id text primary key,
  status text not null check (status in ('hidden', 'internal', 'beta', 'live')) default 'internal',
  updated_at timestamptz not null default now()
);

alter table public.module_rollouts enable row level security;

drop policy if exists "admins manage module rollouts" on public.module_rollouts;
create policy "admins manage module rollouts"
  on public.module_rollouts
  for all
  using (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ));

insert into public.module_rollouts (feature_id, status) values
  ('reports', 'live'), ('whatsapp', 'beta'), ('members', 'live'),
  ('congregations', 'live'), ('visitors', 'live'), ('events', 'live'),
  ('festinhas', 'beta'), ('checkin', 'live'), ('child_checkin', 'live'),
  ('campaigns', 'live'), ('small_groups', 'live'), ('education', 'live'),
  ('documents', 'beta'), ('finances', 'live'), ('bank_accounts', 'live'),
  ('cash_book', 'live'), ('volunteer_shifts', 'live'), ('secretaria', 'beta')
on conflict (feature_id) do nothing;

insert into public.plan_feature_flags (feature_id, plan_tier, enabled) values
  ('festinhas', 'essential', false), ('festinhas', 'pro', true), ('festinhas', 'premium', true)
on conflict (feature_id, plan_tier) do nothing;
