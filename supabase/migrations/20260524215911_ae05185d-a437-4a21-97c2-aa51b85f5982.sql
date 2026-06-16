-- Event pages (landings de eventos pagos ou gratuitos)
CREATE TABLE public.event_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image_url text,
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  location_name text NOT NULL DEFAULT '',
  location_address text,
  price_cents integer NOT NULL DEFAULT 0,
  max_attendees integer,
  allow_free boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  primary_color text NOT NULL DEFAULT '#467da5',
  whatsapp_contact text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_pages_account ON public.event_pages(account_id);
CREATE INDEX idx_event_pages_slug ON public.event_pages(slug);

ALTER TABLE public.event_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own event pages" ON public.event_pages
  FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts event pages" ON public.event_pages
  FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates event pages" ON public.event_pages
  FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes event pages" ON public.event_pages
  FOR DELETE TO authenticated USING (account_id = auth.uid());
CREATE POLICY "public reads active event pages" ON public.event_pages
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE TRIGGER touch_event_pages_updated_at
  BEFORE UPDATE ON public.event_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Event registrations
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_page_id uuid NOT NULL REFERENCES public.event_pages(id) ON DELETE CASCADE,
  account_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  transaction_id uuid,
  notes text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_page_id);
CREATE INDEX idx_event_registrations_account ON public.event_registrations(account_id);
CREATE INDEX idx_event_registrations_transaction ON public.event_registrations(transaction_id);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner updates own registrations" ON public.event_registrations
  FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes own registrations" ON public.event_registrations
  FOR DELETE TO authenticated USING (account_id = auth.uid());
CREATE POLICY "public inserts registrations on active events" ON public.event_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_pages
      WHERE id = event_page_id AND active = true AND account_id = event_registrations.account_id
    )
  );

CREATE TRIGGER touch_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket for cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-covers', 'event-covers', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "event covers public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-covers');

CREATE POLICY "event covers owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "event covers owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'event-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "event covers owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'event-covers' AND auth.uid()::text = (storage.foldername(name))[1]);