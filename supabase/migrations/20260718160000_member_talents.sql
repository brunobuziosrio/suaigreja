-- Banco de talentos: competências declaradas pelos participantes, separadas do cadastro base.
CREATE TABLE public.member_talents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  profession text,
  skills text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  availability text,
  notes text,
  contact_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, member_id)
);

CREATE INDEX idx_member_talents_account ON public.member_talents(account_id, profession);
ALTER TABLE public.member_talents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account members manage member talents" ON public.member_talents FOR ALL TO authenticated
  USING (public.is_account_member(account_id, auth.uid()))
  WITH CHECK (public.is_account_member(account_id, auth.uid()));
CREATE TRIGGER touch_member_talents BEFORE UPDATE ON public.member_talents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_talents TO authenticated;
GRANT ALL ON public.member_talents TO service_role;
NOTIFY pgrst, 'reload schema';
