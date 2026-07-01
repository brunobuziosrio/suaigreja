ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS custom_domain text,
  ADD COLUMN IF NOT EXISTS custom_domain_status text NOT NULL DEFAULT 'not_configured',
  ADD COLUMN IF NOT EXISTS custom_domain_verification_token text,
  ADD COLUMN IF NOT EXISTS custom_domain_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS custom_domain_last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS custom_domain_error text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'accounts_custom_domain_status_check'
      AND conrelid = 'public.accounts'::regclass
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT accounts_custom_domain_status_check
      CHECK (custom_domain_status IN ('not_configured', 'pending', 'verified', 'failed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'accounts_custom_domain_format'
      AND conrelid = 'public.accounts'::regclass
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT accounts_custom_domain_format
      CHECK (
        custom_domain IS NULL
        OR custom_domain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS accounts_custom_domain_unique
  ON public.accounts (custom_domain)
  WHERE custom_domain IS NOT NULL;
