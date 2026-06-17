-- Add is_test_data flag to track test data for cleanup

ALTER TABLE public.members ADD COLUMN is_test_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.donations ADD COLUMN is_test_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN is_test_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.ebd_classes ADD COLUMN is_test_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.ebd_enrollments ADD COLUMN is_test_data boolean NOT NULL DEFAULT false;
ALTER TABLE public.ebd_attendance ADD COLUMN is_test_data boolean NOT NULL DEFAULT false;

-- Create indexes for efficient cleanup queries
CREATE INDEX idx_members_is_test_data ON public.members(account_id, is_test_data);
CREATE INDEX idx_donations_is_test_data ON public.donations(account_id, is_test_data);
CREATE INDEX idx_events_is_test_data ON public.events(account_id, is_test_data);
CREATE INDEX idx_ebd_classes_is_test_data ON public.ebd_classes(account_id, is_test_data);
CREATE INDEX idx_ebd_enrollments_is_test_data ON public.ebd_enrollments(account_id, is_test_data);
CREATE INDEX idx_ebd_attendance_is_test_data ON public.ebd_attendance(account_id, is_test_data);

-- Create function to count test data
CREATE OR REPLACE FUNCTION public.count_test_data(p_account_id uuid)
RETURNS TABLE(
  members_count bigint,
  donations_count bigint,
  events_count bigint,
  ebd_classes_count bigint,
  ebd_enrollments_count bigint,
  ebd_attendance_count bigint,
  total_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM members WHERE account_id = p_account_id AND is_test_data = true),
    (SELECT COUNT(*) FROM donations WHERE account_id = p_account_id AND is_test_data = true),
    (SELECT COUNT(*) FROM events WHERE account_id = p_account_id AND is_test_data = true),
    (SELECT COUNT(*) FROM ebd_classes WHERE account_id = p_account_id AND is_test_data = true),
    (SELECT COUNT(*) FROM ebd_enrollments WHERE account_id = p_account_id AND is_test_data = true),
    (SELECT COUNT(*) FROM ebd_attendance WHERE account_id = p_account_id AND is_test_data = true),
    (SELECT COUNT(*) FROM members WHERE account_id = p_account_id AND is_test_data = true) +
    (SELECT COUNT(*) FROM donations WHERE account_id = p_account_id AND is_test_data = true) +
    (SELECT COUNT(*) FROM events WHERE account_id = p_account_id AND is_test_data = true) +
    (SELECT COUNT(*) FROM ebd_classes WHERE account_id = p_account_id AND is_test_data = true) +
    (SELECT COUNT(*) FROM ebd_enrollments WHERE account_id = p_account_id AND is_test_data = true) +
    (SELECT COUNT(*) FROM ebd_attendance WHERE account_id = p_account_id AND is_test_data = true)
$$;

-- Create function to delete all test data for an account
CREATE OR REPLACE FUNCTION public.delete_all_test_data(p_account_id uuid)
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted bigint := 0;
BEGIN
  -- Delete in correct order (respecting foreign keys)
  DELETE FROM ebd_attendance WHERE account_id = p_account_id AND is_test_data = true;
  v_deleted := v_deleted + FOUND::int;

  DELETE FROM ebd_enrollments WHERE account_id = p_account_id AND is_test_data = true;
  v_deleted := v_deleted + FOUND::int;

  DELETE FROM ebd_classes WHERE account_id = p_account_id AND is_test_data = true;
  v_deleted := v_deleted + FOUND::int;

  DELETE FROM donations WHERE account_id = p_account_id AND is_test_data = true;
  v_deleted := v_deleted + FOUND::int;

  DELETE FROM events WHERE account_id = p_account_id AND is_test_data = true;
  v_deleted := v_deleted + FOUND::int;

  DELETE FROM members WHERE account_id = p_account_id AND is_test_data = true;
  v_deleted := v_deleted + FOUND::int;

  RETURN QUERY SELECT v_deleted;
END;
$$;
