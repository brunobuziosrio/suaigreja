-- Pequenos grupos / células
CREATE TABLE public.small_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  name text NOT NULL,
  leader_name text,
  leader_phone text,
  weekday smallint,
  start_time time,
  address text,
  neighborhood text,
  description text,
  capacity int,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.small_groups TO authenticated;
GRANT SELECT ON public.small_groups TO anon;
GRANT ALL ON public.small_groups TO service_role;
ALTER TABLE public.small_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages small_groups" ON public.small_groups FOR ALL TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "public reads active small_groups" ON public.small_groups FOR SELECT TO anon, authenticated USING (active = true);

CREATE TABLE public.small_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  group_id uuid NOT NULL,
  member_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'membro',
  joined_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.small_group_members TO authenticated;
GRANT ALL ON public.small_group_members TO service_role;
ALTER TABLE public.small_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages sg_members" ON public.small_group_members FOR ALL TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());

-- Check-in de cultos
CREATE TABLE public.checkin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  title text NOT NULL,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_sessions TO authenticated;
GRANT SELECT ON public.checkin_sessions TO anon;
GRANT ALL ON public.checkin_sessions TO service_role;
ALTER TABLE public.checkin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages checkin_sessions" ON public.checkin_sessions FOR ALL TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "public reads active checkin_sessions" ON public.checkin_sessions FOR SELECT TO anon, authenticated USING (active = true);

CREATE TABLE public.checkin_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  session_id uuid NOT NULL,
  member_id uuid,
  visitor_name text,
  visitor_phone text,
  checked_in_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_entries TO authenticated;
GRANT INSERT ON public.checkin_entries TO anon;
GRANT ALL ON public.checkin_entries TO service_role;
ALTER TABLE public.checkin_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages checkin_entries" ON public.checkin_entries FOR ALL TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "public inserts checkin on active session" ON public.checkin_entries FOR INSERT TO anon, authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.checkin_sessions s WHERE s.id = session_id AND s.active = true AND s.account_id = checkin_entries.account_id)
);

-- Devocional diário (versículos)
CREATE TABLE public.devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  devotional_date date NOT NULL DEFAULT CURRENT_DATE,
  verse_ref text NOT NULL,
  verse_text text NOT NULL,
  message text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devotionals TO authenticated;
GRANT SELECT ON public.devotionals TO anon;
GRANT ALL ON public.devotionals TO service_role;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages devotionals" ON public.devotionals FOR ALL TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "public reads published devotionals" ON public.devotionals FOR SELECT TO anon, authenticated USING (published = true);

CREATE INDEX idx_devotionals_account_date ON public.devotionals(account_id, devotional_date DESC);
CREATE INDEX idx_checkin_entries_session ON public.checkin_entries(session_id);
CREATE INDEX idx_sg_members_group ON public.small_group_members(group_id);