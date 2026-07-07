create table if not exists public.congregations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  code text,
  address text,
  city text,
  state text,
  leader_name text,
  leader_phone text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint congregations_name_length check (char_length(name) between 1 and 160)
);

create index if not exists congregations_account_id_idx on public.congregations(account_id);
create unique index if not exists congregations_account_name_unique
  on public.congregations(account_id, lower(name));

alter table public.congregations enable row level security;
create policy "Account members can view congregations" on public.congregations
  for select using (public.is_account_member(account_id, auth.uid()));
create policy "Account members can create congregations" on public.congregations
  for insert with check (public.is_account_member(account_id, auth.uid()));
create policy "Account members can update congregations" on public.congregations
  for update using (public.is_account_member(account_id, auth.uid()))
  with check (public.is_account_member(account_id, auth.uid()));
create policy "Account members can delete congregations" on public.congregations
  for delete using (public.is_account_member(account_id, auth.uid()));

alter table public.members
  add column if not exists congregation_id uuid references public.congregations(id) on delete set null;
create index if not exists members_congregation_id_idx on public.members(congregation_id);

