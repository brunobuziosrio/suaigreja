-- Liberações pontuais para pilotos, demonstrações e homologação por instituição.
create table if not exists public.account_feature_overrides (
  account_id uuid not null references public.accounts(id) on delete cascade,
  feature_id text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (account_id, feature_id)
);

alter table public.account_feature_overrides enable row level security;

drop policy if exists "admins manage account feature overrides" on public.account_feature_overrides;
create policy "admins manage account feature overrides"
  on public.account_feature_overrides for all
  using (exists (select 1 from public.user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin'));
