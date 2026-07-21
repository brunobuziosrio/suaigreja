-- Fila única de cuidado: registra a ação da equipe sem duplicar os dados de
-- visitantes, decisões, pedidos ou membros.
CREATE TABLE public.pastoral_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('visitor', 'decision', 'prayer', 'absence')),
  source_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  assignee_user_id uuid,
  next_contact_at date,
  outcome text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, source_type, source_id),
  UNIQUE(account_id, id)
);
CREATE INDEX idx_pastoral_followups_queue ON public.pastoral_followups(account_id, status, next_contact_at);
ALTER TABLE public.pastoral_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account members manage pastoral followups" ON public.pastoral_followups FOR ALL TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_pastoral_followup_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.assignee_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = NEW.account_id
      AND user_id = NEW.assignee_user_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Pastoral assignee must be an active member of the same account';
  END IF;

  IF NEW.source_type = 'visitor' AND NOT EXISTS (
    SELECT 1 FROM public.visitors WHERE id = NEW.source_id AND account_id = NEW.account_id
  ) THEN
    RAISE EXCEPTION 'Pastoral visitor source must belong to the same account';
  ELSIF NEW.source_type = 'decision' AND NOT EXISTS (
    SELECT 1 FROM public.decisions WHERE id = NEW.source_id AND account_id = NEW.account_id
  ) THEN
    RAISE EXCEPTION 'Pastoral decision source must belong to the same account';
  ELSIF NEW.source_type = 'prayer' AND NOT EXISTS (
    SELECT 1 FROM public.prayer_requests WHERE id = NEW.source_id AND account_id = NEW.account_id
  ) THEN
    RAISE EXCEPTION 'Pastoral prayer source must belong to the same account';
  ELSIF NEW.source_type = 'absence' AND NOT EXISTS (
    SELECT 1 FROM public.members WHERE id = NEW.source_id AND account_id = NEW.account_id
  ) THEN
    RAISE EXCEPTION 'Pastoral absence source must belong to the same account';
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_pastoral_followup_reference
  BEFORE INSERT OR UPDATE ON public.pastoral_followups
  FOR EACH ROW EXECUTE FUNCTION public.validate_pastoral_followup_reference();
CREATE TRIGGER touch_pastoral_followups BEFORE UPDATE ON public.pastoral_followups FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pastoral_followups TO authenticated;
GRANT ALL ON public.pastoral_followups TO service_role;
NOTIFY pgrst, 'reload schema';
