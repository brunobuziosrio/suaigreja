CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | archived
  prayer_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prayer_requests_account ON public.prayer_requests(account_id, status, created_at DESC);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners manage prayer requests"
  ON public.prayer_requests FOR ALL
  TO authenticated
  USING (auth.uid() = account_id)
  WITH CHECK (auth.uid() = account_id);

CREATE TABLE public.prayer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  visitor_fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prayer_request_id, visitor_fingerprint)
);

ALTER TABLE public.prayer_interactions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_prayer_requests_updated
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();