-- Religion profile enum
CREATE TYPE public.religion_profile AS ENUM (
  'catolico',
  'evangelico',
  'adventista',
  'batista',
  'pentecostal',
  'comunidade_crista'
);

CREATE TYPE public.subscription_status AS ENUM (
  'trial',
  'active',
  'past_due',
  'canceled'
);

-- helper: short random site id (lower-alnum, 10 chars)
CREATE OR REPLACE FUNCTION public.generate_site_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'abcdefghijkmnpqrstuvwxyz23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- accounts (1:1 with auth.users)
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id text NOT NULL UNIQUE DEFAULT public.generate_site_id(),
  religion_profile public.religion_profile NOT NULL DEFAULT 'catolico',
  onboarded boolean NOT NULL DEFAULT false,
  brand_title text NOT NULL DEFAULT 'Agenda de Celebrações',
  brand_subtitle text NOT NULL DEFAULT '',
  brand_empty_message text NOT NULL DEFAULT 'Nenhuma celebração programada. Volte em breve para conferir os próximos horários.',
  primary_color text NOT NULL DEFAULT '#467da5',
  subscription_status public.subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX accounts_site_id_idx ON public.accounts(site_id);

-- locations
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX locations_account_idx ON public.locations(account_id);

-- celebration_types
CREATE TABLE public.celebration_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX celebration_types_account_idx ON public.celebration_types(account_id);

-- events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  type_id uuid REFERENCES public.celebration_types(id) ON DELETE SET NULL,
  location_name text NOT NULL,
  type_name text NOT NULL,
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  description text,
  show_type boolean NOT NULL DEFAULT false,
  is_live boolean NOT NULL DEFAULT false,
  live_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX events_account_date_idx ON public.events(account_id, event_date, start_time);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER accounts_touch BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER locations_touch BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER types_touch BEFORE UPDATE ON public.celebration_types FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create account row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.accounts (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- accounts: owner only
CREATE POLICY "owner reads account" ON public.accounts FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "owner updates account" ON public.accounts FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- locations
CREATE POLICY "owner reads locations" ON public.locations FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts locations" ON public.locations FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates locations" ON public.locations FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes locations" ON public.locations FOR DELETE TO authenticated USING (account_id = auth.uid());

-- celebration_types
CREATE POLICY "owner reads types" ON public.celebration_types FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts types" ON public.celebration_types FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates types" ON public.celebration_types FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes types" ON public.celebration_types FOR DELETE TO authenticated USING (account_id = auth.uid());

-- events
CREATE POLICY "owner reads events" ON public.events FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts events" ON public.events FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates events" ON public.events FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes events" ON public.events FOR DELETE TO authenticated USING (account_id = auth.uid());