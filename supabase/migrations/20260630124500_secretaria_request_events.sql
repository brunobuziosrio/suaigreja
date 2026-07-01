-- Secretaria Digital: audit trail for request lifecycle changes.

CREATE TABLE IF NOT EXISTS public.secretaria_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  request_id uuid,
  actor_id uuid,
  event_type text NOT NULL CHECK (event_type IN ('created', 'updated', 'status_changed', 'deleted')),
  from_status text,
  to_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secretaria_events_request
  ON public.secretaria_request_events(account_id, request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_secretaria_events_account_created
  ON public.secretaria_request_events(account_id, created_at DESC);

ALTER TABLE public.secretaria_request_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads secretaria events" ON public.secretaria_request_events;
CREATE POLICY "owner reads secretaria events" ON public.secretaria_request_events
  FOR SELECT TO authenticated
  USING (account_id = auth.uid());

GRANT SELECT ON public.secretaria_request_events TO authenticated;
GRANT ALL ON public.secretaria_request_events TO service_role;

CREATE OR REPLACE FUNCTION public.audit_secretaria_request_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_type text;
  v_account_id uuid;
  v_request_id uuid;
  v_from_status text;
  v_to_status text;
  v_metadata jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'created';
    v_account_id := NEW.account_id;
    v_request_id := NEW.id;
    v_to_status := NEW.status;
    v_metadata := jsonb_build_object(
      'request_type', NEW.request_type,
      'priority', NEW.priority,
      'requester_name', NEW.requester_name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_type := CASE
      WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_changed'
      ELSE 'updated'
    END;
    v_account_id := NEW.account_id;
    v_request_id := NEW.id;
    v_from_status := OLD.status;
    v_to_status := NEW.status;
    v_metadata := jsonb_build_object(
      'request_type', NEW.request_type,
      'priority', NEW.priority,
      'requester_name', NEW.requester_name
    );
  ELSE
    v_event_type := 'deleted';
    v_account_id := OLD.account_id;
    v_request_id := OLD.id;
    v_from_status := OLD.status;
    v_metadata := jsonb_build_object(
      'request_type', OLD.request_type,
      'priority', OLD.priority,
      'requester_name', OLD.requester_name
    );
  END IF;

  INSERT INTO public.secretaria_request_events (
    account_id,
    request_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    metadata
  )
  VALUES (
    v_account_id,
    v_request_id,
    auth.uid(),
    v_event_type,
    v_from_status,
    v_to_status,
    COALESCE(v_metadata, '{}'::jsonb)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_secretaria_request_audit ON public.secretaria_requests;
CREATE TRIGGER trg_secretaria_request_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.secretaria_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_secretaria_request_event();
