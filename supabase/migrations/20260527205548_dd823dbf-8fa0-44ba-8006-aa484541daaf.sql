
CREATE TABLE public.live_streams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  title text NOT NULL,
  recurrence text NOT NULL DEFAULT 'weekly',
  weekday smallint,
  event_date date,
  start_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 90,
  minutes_before integer NOT NULL DEFAULT 10,
  default_live_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT live_streams_recurrence_chk CHECK (recurrence IN ('weekly','once')),
  CONSTRAINT live_streams_weekday_chk CHECK (weekday IS NULL OR (weekday BETWEEN 0 AND 6))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_streams TO authenticated;
GRANT ALL ON public.live_streams TO service_role;

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads live_streams" ON public.live_streams
  FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts live_streams" ON public.live_streams
  FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates live_streams" ON public.live_streams
  FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes live_streams" ON public.live_streams
  FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE TRIGGER trg_live_streams_updated_at
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_live_streams_account ON public.live_streams(account_id) WHERE active;

CREATE TABLE public.live_stream_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  live_stream_id uuid NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  event_date date NOT NULL,
  live_url text,
  cancelled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(live_stream_id, event_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_stream_overrides TO authenticated;
GRANT ALL ON public.live_stream_overrides TO service_role;

ALTER TABLE public.live_stream_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads overrides" ON public.live_stream_overrides
  FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts overrides" ON public.live_stream_overrides
  FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates overrides" ON public.live_stream_overrides
  FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes overrides" ON public.live_stream_overrides
  FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE TRIGGER trg_live_stream_overrides_updated_at
  BEFORE UPDATE ON public.live_stream_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_overrides_stream_date ON public.live_stream_overrides(live_stream_id, event_date);
