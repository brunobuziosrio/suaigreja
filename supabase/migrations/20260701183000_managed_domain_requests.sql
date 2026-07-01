alter table public.accounts
  add column if not exists managed_domain_requested_name text,
  add column if not exists managed_domain_status text not null default 'not_requested',
  add column if not exists managed_domain_holder_name text,
  add column if not exists managed_domain_holder_document text,
  add column if not exists managed_domain_holder_email text,
  add column if not exists managed_domain_holder_phone text,
  add column if not exists managed_domain_holder_address text,
  add column if not exists managed_domain_notes text,
  add column if not exists managed_domain_requested_at timestamptz,
  add column if not exists managed_domain_updated_at timestamptz;

do $$
begin
  alter table public.accounts
    add constraint accounts_managed_domain_status_check
    check (managed_domain_status in ('not_requested', 'requested', 'in_progress', 'registered', 'configured', 'blocked'));
exception
  when duplicate_object then null;
end $$;

create index if not exists accounts_managed_domain_status_idx
  on public.accounts (managed_domain_status)
  where managed_domain_status <> 'not_requested';
