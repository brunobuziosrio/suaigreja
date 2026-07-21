-- Camada de apresentação por instituição. Não altera regras ou permissões.
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS religion_terms jsonb NOT NULL DEFAULT '{}'::jsonb;
NOTIFY pgrst, 'reload schema';
