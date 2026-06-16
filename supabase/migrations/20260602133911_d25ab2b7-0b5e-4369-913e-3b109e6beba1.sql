
-- system_updates: posted by admin, readable by any authenticated user
CREATE TABLE public.system_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  version text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.system_updates TO authenticated;
GRANT ALL ON public.system_updates TO service_role;

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read system updates"
ON public.system_updates FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage system updates"
ON public.system_updates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- feature_suggestions: any authenticated user can submit, admins read all
CREATE TABLE public.feature_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.feature_suggestions TO authenticated;
GRANT ALL ON public.feature_suggestions TO service_role;

ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their suggestions"
ON public.feature_suggestions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own suggestions"
ON public.feature_suggestions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage suggestions"
ON public.feature_suggestions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX feature_suggestions_created_at_idx ON public.feature_suggestions (created_at DESC);
CREATE INDEX system_updates_created_at_idx ON public.system_updates (created_at DESC);
