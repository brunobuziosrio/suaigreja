-- Documents: enforce tenant-safe member/template links.

UPDATE public.member_documents md
SET member_id = NULL
WHERE md.member_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.id = md.member_id
      AND m.account_id = md.account_id
  );

UPDATE public.member_documents md
SET template_id = NULL
WHERE md.template_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.document_templates dt
    WHERE dt.id = md.template_id
      AND (
        dt.is_global = true
        OR dt.account_id = md.account_id
      )
  );

CREATE OR REPLACE FUNCTION public.enforce_member_document_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.member_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.id = NEW.member_id
      AND m.account_id = NEW.account_id
  ) THEN
    RAISE EXCEPTION 'Member does not belong to this account';
  END IF;

  IF NEW.template_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.document_templates dt
    WHERE dt.id = NEW.template_id
      AND (
        dt.is_global = true
        OR dt.account_id = NEW.account_id
      )
  ) THEN
    RAISE EXCEPTION 'Document template does not belong to this account';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_document_integrity ON public.member_documents;
CREATE TRIGGER trg_member_document_integrity
  BEFORE INSERT OR UPDATE OF account_id, member_id, template_id ON public.member_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_member_document_integrity();

CREATE INDEX IF NOT EXISTS idx_member_documents_account_member
  ON public.member_documents(account_id, member_id)
  WHERE member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_member_documents_account_template
  ON public.member_documents(account_id, template_id)
  WHERE template_id IS NOT NULL;
