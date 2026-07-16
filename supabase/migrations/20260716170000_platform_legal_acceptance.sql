-- Aceite obrigatório, versionado e auditável dos documentos da Plataforma.
-- O navegador melhora a experiência; esta validação no banco impede criar conta
-- sem as versões vigentes, inclusive por chamadas diretas à API de autenticação.
create table if not exists public.platform_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_key text not null check (document_key in ('terms_of_use', 'platform_privacy')),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'signup',
  unique (user_id, document_key, document_version)
);
alter table public.platform_legal_acceptances enable row level security;
create policy "users read their platform legal acceptances" on public.platform_legal_acceptances for select to authenticated using (user_id = auth.uid());
grant select on public.platform_legal_acceptances to authenticated;
grant all on public.platform_legal_acceptances to service_role;

create or replace function public.enforce_platform_legal_acceptance()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  required_version constant text := '2026-07-16';
begin
  if coalesce(new.raw_user_meta_data ->> 'platform_terms_version', '') <> required_version
    or coalesce(new.raw_user_meta_data ->> 'platform_privacy_version', '') <> required_version then
    raise exception 'É necessário aceitar os Termos de Uso e a Política de Privacidade vigentes.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_platform_legal_acceptance_on_signup on auth.users;
create trigger enforce_platform_legal_acceptance_on_signup
  before insert on auth.users
  for each row execute function public.enforce_platform_legal_acceptance();

-- Preserva a lógica de convites e de criação de conta, acrescentando o recibo
-- de aceite depois que o usuário foi criado com sucesso.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  linked_count int;
  accepted_version constant text := '2026-07-16';
begin
  update public.account_members
     set user_id = new.id, status = 'active', updated_at = now()
   where user_id is null and status = 'invited' and new.email is not null
     and lower(invited_email) = lower(new.email);
  get diagnostics linked_count = row_count;
  if linked_count = 0 then
    insert into public.accounts (id) values (new.id);
  end if;
  insert into public.platform_legal_acceptances (user_id, document_key, document_version, source)
  values
    (new.id, 'terms_of_use', accepted_version, 'signup'),
    (new.id, 'platform_privacy', accepted_version, 'signup')
  on conflict (user_id, document_key, document_version) do nothing;
  return new;
end;
$$;
