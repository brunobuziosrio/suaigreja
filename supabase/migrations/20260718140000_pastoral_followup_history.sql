CREATE TABLE public.pastoral_followup_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  followup_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'done')),
  note text,
  next_contact_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pastoral_followup_events
  ADD CONSTRAINT pastoral_followup_events_followup_account_fkey
  FOREIGN KEY (account_id, followup_id)
  REFERENCES public.pastoral_followups(account_id, id)
  ON DELETE CASCADE;
CREATE INDEX idx_pastoral_followup_events ON public.pastoral_followup_events(followup_id, created_at DESC);
ALTER TABLE public.pastoral_followup_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account members read pastoral history" ON public.pastoral_followup_events FOR SELECT TO authenticated USING (public.is_account_member(account_id, auth.uid()));
CREATE POLICY "account members write pastoral history" ON public.pastoral_followup_events FOR INSERT TO authenticated WITH CHECK (public.is_account_member(account_id, auth.uid()));
GRANT SELECT, INSERT ON public.pastoral_followup_events TO authenticated;
GRANT ALL ON public.pastoral_followup_events TO service_role;
NOTIFY pgrst, 'reload schema';
