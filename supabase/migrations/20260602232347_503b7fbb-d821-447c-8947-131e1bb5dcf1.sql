ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS instagram_post_count integer NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS instagram_columns integer NOT NULL DEFAULT 3;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_instagram_post_count_chk CHECK (instagram_post_count BETWEEN 3 AND 30),
  ADD CONSTRAINT accounts_instagram_columns_chk CHECK (instagram_columns BETWEEN 2 AND 6);