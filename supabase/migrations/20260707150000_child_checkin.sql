create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.accounts(id) on delete cascade,
  full_name text not null, birth_date date, guardian_name text not null, guardian_phone text not null,
  authorized_pickups text, allergies text, medical_notes text, photo_url text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.child_checkin_entries (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.accounts(id) on delete cascade,
  child_id uuid not null references public.child_profiles(id) on delete restrict,
  session_id uuid references public.checkin_sessions(id) on delete set null,
  pickup_code_hash text not null, checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz, checked_out_by text, pickup_person text, incident_notes text,
  created_at timestamptz not null default now()
);
create unique index if not exists child_one_open_checkin on public.child_checkin_entries(child_id) where checked_out_at is null;
create index if not exists child_profiles_account_idx on public.child_profiles(account_id, active, full_name);
create index if not exists child_checkin_account_idx on public.child_checkin_entries(account_id, checked_in_at desc);
grant select, insert, update, delete on public.child_profiles to authenticated;
grant select, insert, update, delete on public.child_checkin_entries to authenticated;
grant all on public.child_profiles to service_role;
grant all on public.child_checkin_entries to service_role;
alter table public.child_profiles enable row level security;
alter table public.child_checkin_entries enable row level security;
drop policy if exists "members manage child profiles" on public.child_profiles;
create policy "members manage child profiles" on public.child_profiles for all
  using (public.is_account_member(account_id, auth.uid())) with check (public.is_account_member(account_id, auth.uid()));
drop policy if exists "members manage child checkins" on public.child_checkin_entries;
create policy "members manage child checkins" on public.child_checkin_entries for all
  using (public.is_account_member(account_id, auth.uid())) with check (public.is_account_member(account_id, auth.uid()));
