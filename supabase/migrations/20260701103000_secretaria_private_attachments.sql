ALTER TABLE public.secretaria_requests
  ADD COLUMN IF NOT EXISTS assignee_name text,
  ADD COLUMN IF NOT EXISTS due_date date;

CREATE INDEX IF NOT EXISTS idx_secretaria_due_date
  ON public.secretaria_requests(account_id, due_date)
  WHERE due_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.secretaria_request_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.secretaria_requests(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  content_type text,
  file_size integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.secretaria_request_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads secretaria attachments"
  ON public.secretaria_request_attachments
  FOR SELECT TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "owner inserts secretaria attachments"
  ON public.secretaria_request_attachments
  FOR INSERT TO authenticated
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "owner deletes secretaria attachments"
  ON public.secretaria_request_attachments
  FOR DELETE TO authenticated
  USING (account_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_secretaria_attachments_request
  ON public.secretaria_request_attachments(account_id, request_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_secretaria_attachments_file_path
  ON public.secretaria_request_attachments(file_path);

INSERT INTO storage.buckets (id, name, public)
VALUES ('secretaria-attachments', 'secretaria-attachments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE OR REPLACE FUNCTION public.enforce_secretaria_attachment_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_account uuid;
BEGIN
  SELECT account_id INTO request_account
  FROM public.secretaria_requests
  WHERE id = NEW.request_id;

  IF request_account IS NULL THEN
    RAISE EXCEPTION 'Solicitação da Secretaria não encontrada.';
  END IF;

  IF request_account <> NEW.account_id THEN
    RAISE EXCEPTION 'Anexo vinculado a uma solicitação de outra igreja.';
  END IF;

  IF split_part(NEW.file_path, '/', 1) <> NEW.account_id::text THEN
    RAISE EXCEPTION 'Caminho do anexo não pertence a esta igreja.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_secretaria_attachment_account ON public.secretaria_request_attachments;
CREATE TRIGGER trg_secretaria_attachment_account
  BEFORE INSERT OR UPDATE OF account_id, request_id, file_path
  ON public.secretaria_request_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_secretaria_attachment_account();

GRANT SELECT, INSERT, DELETE ON public.secretaria_request_attachments TO authenticated;
GRANT ALL ON public.secretaria_request_attachments TO service_role;
