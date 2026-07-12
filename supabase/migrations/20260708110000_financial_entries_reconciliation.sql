alter table public.financial_entries
  add column if not exists reconciled_at date,
  add column if not exists reconciliation_notes text;

create index if not exists idx_financial_entries_reconciled
  on public.financial_entries(account_id, reconciled_at, entry_date desc);

notify pgrst, 'reload schema';
