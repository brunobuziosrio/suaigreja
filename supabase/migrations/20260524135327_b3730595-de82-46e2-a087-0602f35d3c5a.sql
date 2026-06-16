
ALTER TABLE public.accounts
  ADD COLUMN custom_slug text;

-- Validation: lowercase letters, numbers, hyphens; 3-40 chars; not starting/ending with hyphen
ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_custom_slug_format
  CHECK (
    custom_slug IS NULL
    OR (custom_slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$')
  );

-- Unique (case-insensitive via lowercase storage requirement above)
CREATE UNIQUE INDEX accounts_custom_slug_unique
  ON public.accounts (custom_slug)
  WHERE custom_slug IS NOT NULL;
