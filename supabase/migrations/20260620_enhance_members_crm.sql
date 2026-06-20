/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

-- ============ ENHANCE MEMBERS TABLE ============
-- Add fields for better CRM: neighborhood, ministry, pastoral, family links, WhatsApp consent

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS ministry text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS pastoral text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS family_head_id uuid REFERENCES public.members(id) ON DELETE SET NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS whatsapp_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_event_attendance timestamptz;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS congregation text;

-- Create attendance history table for general events (not just EBD)
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attended boolean NOT NULL DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, event_id)
);

ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads attendance" ON public.event_attendance FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts attendance" ON public.event_attendance FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates attendance" ON public.event_attendance FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes attendance" ON public.event_attendance FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_event_attendance_member ON public.event_attendance(member_id);
CREATE INDEX idx_event_attendance_event ON public.event_attendance(event_id);

CREATE TRIGGER touch_event_attendance BEFORE UPDATE ON public.event_attendance FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Create campaigns table for targeted giving/tithes
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  goal_amount_cents bigint NOT NULL,
  current_amount_cents bigint NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  pix_key text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads campaigns" ON public.campaigns FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts campaigns" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates campaigns" ON public.campaigns FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes campaigns" ON public.campaigns FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_campaigns_account ON public.campaigns(account_id);

CREATE TRIGGER touch_campaigns BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Link donations to campaigns
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Create tithes table (structured giving)
CREATE TABLE IF NOT EXISTS public.tithes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL,
  contributed_at date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'recorded', -- recorded | verified | cancelled
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tithes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads tithes" ON public.tithes FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts tithes" ON public.tithes FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates tithes" ON public.tithes FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes tithes" ON public.tithes FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_tithes_member ON public.tithes(member_id);
CREATE INDEX idx_tithes_date ON public.tithes(contributed_at);

CREATE TRIGGER touch_tithes BEFORE UPDATE ON public.tithes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Create ministry assignments
CREATE TABLE IF NOT EXISTS public.ministry_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  ministry text NOT NULL,
  role text, -- coordinator, assistant, volunteer
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, ministry, start_date)
);

ALTER TABLE public.ministry_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads assignments" ON public.ministry_assignments FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts assignments" ON public.ministry_assignments FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates assignments" ON public.ministry_assignments FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes assignments" ON public.ministry_assignments FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_ministry_member ON public.ministry_assignments(member_id);
CREATE INDEX idx_ministry_active ON public.ministry_assignments(active);

CREATE TRIGGER touch_ministry_assignments BEFORE UPDATE ON public.ministry_assignments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ VOLUNTEER SCHEDULES ============
CREATE TABLE IF NOT EXISTS public.volunteer_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  volunteer_type text NOT NULL, -- louvor, intercessão, recepção, liturgia, ministros, catequese, limpeza, transmissão
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads schedules" ON public.volunteer_schedules FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts schedules" ON public.volunteer_schedules FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates schedules" ON public.volunteer_schedules FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes schedules" ON public.volunteer_schedules FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_volunteer_schedules_account ON public.volunteer_schedules(account_id);

CREATE TRIGGER touch_volunteer_schedules BEFORE UPDATE ON public.volunteer_schedules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ VOLUNTEER SHIFTS ============
CREATE TABLE IF NOT EXISTS public.volunteer_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  schedule_id uuid NOT NULL REFERENCES public.volunteer_schedules(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  shift_start_time time NOT NULL,
  shift_end_time time,
  confirmed boolean NOT NULL DEFAULT false,
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads shifts" ON public.volunteer_shifts FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts shifts" ON public.volunteer_shifts FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates shifts" ON public.volunteer_shifts FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes shifts" ON public.volunteer_shifts FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE INDEX idx_volunteer_shifts_member ON public.volunteer_shifts(member_id);
CREATE INDEX idx_volunteer_shifts_date ON public.volunteer_shifts(shift_date);
CREATE INDEX idx_volunteer_shifts_confirmed ON public.volunteer_shifts(confirmed);

CREATE TRIGGER touch_volunteer_shifts BEFORE UPDATE ON public.volunteer_shifts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tithes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministry_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_shifts TO authenticated;

GRANT ALL ON public.event_attendance TO service_role;
GRANT ALL ON public.campaigns TO service_role;
GRANT ALL ON public.tithes TO service_role;
GRANT ALL ON public.ministry_assignments TO service_role;
GRANT ALL ON public.volunteer_schedules TO service_role;
GRANT ALL ON public.volunteer_shifts TO service_role;
