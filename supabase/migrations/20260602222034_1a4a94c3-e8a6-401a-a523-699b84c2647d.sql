
CREATE TABLE public.instagram_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,
  ig_user_id text NOT NULL,
  username text,
  access_token text NOT NULL,
  token_expires_at timestamptz,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_connections TO authenticated;
GRANT ALL ON public.instagram_connections TO service_role;

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own ig connection"
  ON public.instagram_connections FOR SELECT TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "owner manages own ig connection"
  ON public.instagram_connections FOR ALL TO authenticated
  USING (account_id = auth.uid())
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "admins read all ig connections"
  ON public.instagram_connections FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER instagram_connections_touch
  BEFORE UPDATE ON public.instagram_connections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
