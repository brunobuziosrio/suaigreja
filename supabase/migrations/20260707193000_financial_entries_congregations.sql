alter table public.financial_entries
  add column if not exists congregation_id uuid references public.congregations(id) on delete set null;

create index if not exists idx_financial_entries_congregation
  on public.financial_entries(account_id, congregation_id, entry_date desc);

create or replace function public.enforce_financial_entry_congregation_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.congregation_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.congregations c
    where c.id = new.congregation_id
      and c.account_id = new.account_id
  ) then
    raise exception 'Congregation does not belong to the financial entry account';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_financial_entry_congregation_account on public.financial_entries;
create trigger enforce_financial_entry_congregation_account
  before insert or update of account_id, congregation_id on public.financial_entries
  for each row execute function public.enforce_financial_entry_congregation_account();

notify pgrst, 'reload schema';