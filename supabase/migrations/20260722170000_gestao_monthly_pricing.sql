-- Tabela comercial mensal: Presença, Gestão e Rede.
-- Os IDs internos permanecem para manter compatibilidade com assinaturas já registradas.
insert into public.plan_feature_flags (feature_id, plan_tier, enabled) values
  ('congregations', 'pro', true),
  ('child_checkin', 'pro', true),
  ('small_groups', 'pro', true),
  ('finances', 'pro', true),
  ('bank_accounts', 'pro', true),
  ('cash_book', 'pro', true),
  ('volunteer_shifts', 'pro', true)
on conflict (feature_id, plan_tier) do update set enabled = excluded.enabled;
