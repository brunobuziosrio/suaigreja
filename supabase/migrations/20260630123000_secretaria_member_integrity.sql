-- Secretaria Digital: prevent requests from linking members from another tenant.

UPDATE public.secretaria_requests sr
SET member_id = NULL
WHERE sr.member_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.id = sr.member_id
      AND m.account_id = sr.account_id
  );

CREATE OR REPLACE FUNCTION public.enforce_secretaria_member_account()
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_secretaria_member_account ON public.secretaria_requests;
CREATE TRIGGER trg_secretaria_member_account
  BEFORE INSERT OR UPDATE OF account_id, member_id ON public.secretaria_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_secretaria_member_account();

CREATE INDEX IF NOT EXISTS idx_secretaria_account_member
  ON public.secretaria_requests(account_id, member_id)
  WHERE member_id IS NOT NULL;
