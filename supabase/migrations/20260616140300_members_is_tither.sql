
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS is_tither boolean NOT NULL DEFAULT false;
