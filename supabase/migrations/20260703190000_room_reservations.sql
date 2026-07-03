-- Reserva de Ambientes: reservar salas/locais ja cadastrados (public.locations)
-- com deteccao de conflito de horario, evitando dupla marcacao da mesma sala.
--
-- Tabela nova, RLS ja baseada em membership desde a criacao.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE TABLE public.room_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  title text NOT NULL,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_phone text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected | cancelled
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_reservations_time_order CHECK (end_at > start_at)
);

CREATE INDEX idx_room_reservations_account_location
  ON public.room_reservations(account_id, location_id, start_at);

ALTER TABLE public.room_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read reservations"
  ON public.room_reservations FOR SELECT TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members insert reservations"
  ON public.room_reservations FOR INSERT TO authenticated
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members update reservations"
  ON public.room_reservations FOR UPDATE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "members delete reservations"
  ON public.room_reservations FOR DELETE TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE TRIGGER touch_room_reservations BEFORE UPDATE ON public.room_reservations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_reservations TO authenticated;
GRANT ALL ON public.room_reservations TO service_role;

NOTIFY pgrst, 'reload schema';
