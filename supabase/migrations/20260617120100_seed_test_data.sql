-- Seed test data for comprehensive testing
-- This data is marked with is_test_data = true for easy cleanup

-- We'll create test data for the current authenticated user's account
-- This is a helper script - in practice, data will be generated via admin API

-- Create 30 test members with various roles
INSERT INTO public.members (account_id, full_name, email, phone, gender, marital_status, role, status, birth_date, member_since, address_street, address_number, address_city, address_state, is_test_data)
SELECT
  account_id,
  CASE (row_number() - 1) % 10
    WHEN 0 THEN 'Pedro Silva [Teste]'
    WHEN 1 THEN 'Maria Santos [Teste]'
    WHEN 2 THEN 'João Oliveira [Teste]'
    WHEN 3 THEN 'Ana Costa [Teste]'
    WHEN 4 THEN 'Carlos Souza [Teste]'
    WHEN 5 THEN 'Julia Mendes [Teste]'
    WHEN 6 THEN 'Roberto Ferreira [Teste]'
    WHEN 7 THEN 'Fernanda Rocha [Teste]'
    WHEN 8 THEN 'Lucas Martins [Teste]'
    ELSE 'Camila Gomes [Teste]'
  END || ' ' || row_number()::text,
  'teste.' || row_number()::text || '@seuigreja.test',
  '(11) ' || lpad((row_number() % 90000 + 10000)::text, 5, '0') || '-' || lpad((row_number() % 9999 + 1000)::text, 4, '0'),
  CASE row_number() % 2 WHEN 0 THEN 'Masculino' ELSE 'Feminino' END,
  CASE row_number() % 4 WHEN 0 THEN 'Solteiro' WHEN 1 THEN 'Casado' ELSE 'Divorciado' END,
  CASE row_number() % 6
    WHEN 0 THEN 'membro'
    WHEN 1 THEN 'visitante'
    WHEN 2 THEN 'lider'
    WHEN 3 THEN 'pastor'
    WHEN 4 THEN 'diacono'
    ELSE 'obreiro'
  END,
  CASE WHEN row_number() % 10 = 0 THEN 'inativo' ELSE 'ativo' END,
  CURRENT_DATE - (row_number() * 7)::int,
  CURRENT_DATE - (row_number() * 30)::int,
  'Rua ' || CHR(65 + (row_number() % 26)),
  (row_number() % 999 + 1)::text,
  'São Paulo',
  'SP',
  true
FROM (
  SELECT * FROM public.accounts WHERE id = auth.uid()
), generate_series(1, 30) AS gs(row_number);

-- Create 30 test events (cultos, EBD, cells, transmissões, etc.)
INSERT INTO public.events (account_id, location_name, type_name, event_date, start_time, end_time, description, is_live, is_test_data)
SELECT
  account_id,
  CASE (row_number() - 1) % 5
    WHEN 0 THEN 'Sede Principal'
    WHEN 1 THEN 'Filial Centro'
    WHEN 2 THEN 'Filial Vila'
    WHEN 3 THEN 'Filial Leste'
    ELSE 'Online'
  END,
  CASE (row_number() - 1) % 6
    WHEN 0 THEN 'Culto Domingo'
    WHEN 1 THEN 'Culto Quarta'
    WHEN 2 THEN 'EBD'
    WHEN 3 THEN 'Célula'
    WHEN 4 THEN 'Transmissão'
    ELSE 'Devocional'
  END,
  CURRENT_DATE + (row_number()::int % 60),
  CASE (row_number() - 1) % 3
    WHEN 0 THEN '09:00:00'::time
    WHEN 1 THEN '19:00:00'::time
    ELSE '15:00:00'::time
  END,
  CASE (row_number() - 1) % 3
    WHEN 0 THEN '10:30:00'::time
    WHEN 1 THEN '20:30:00'::time
    ELSE '16:30:00'::time
  END,
  'Evento de teste #' || row_number()::text,
  CASE WHEN row_number() % 7 = 0 THEN true ELSE false END,
  true
FROM (
  SELECT * FROM public.accounts WHERE id = auth.uid()
), generate_series(1, 30) AS gs(row_number);

-- Create 30 test donations
INSERT INTO public.donations (account_id, donor_name, donor_email, donor_phone, amount_cents, status, paid_at, is_test_data)
SELECT
  account_id,
  'Doador Teste ' || row_number()::text,
  'doador.' || row_number()::text || '@test.local',
  '(11) 99999-' || lpad((row_number() % 9999 + 1000)::text, 4, '0'),
  ((row_number() % 50 + 5) * 100)::int,
  CASE WHEN row_number() % 5 = 0 THEN 'pending' WHEN row_number() % 3 = 0 THEN 'failed' ELSE 'paid' END,
  CASE WHEN row_number() % 5 != 0 AND row_number() % 3 != 0 THEN NOW() - ((row_number() % 30)::int || ' days')::interval ELSE NULL END,
  true
FROM (
  SELECT * FROM public.accounts WHERE id = auth.uid()
), generate_series(1, 30) AS gs(row_number);

-- Create 5 EBD test classes
INSERT INTO public.ebd_classes (account_id, name, teacher_name, weekday, start_time, age_range, is_test_data)
SELECT
  account_id,
  'Classe ' || CASE gs.row_number
    WHEN 1 THEN 'de Crianças'
    WHEN 2 THEN 'de Adolescentes'
    WHEN 3 THEN 'de Jovens'
    WHEN 4 THEN 'de Adultos'
    ELSE 'Especial'
  END || ' [Teste]',
  'Professor Teste ' || gs.row_number::text,
  0,
  '09:00:00'::time,
  CASE gs.row_number
    WHEN 1 THEN 'crianças'
    WHEN 2 THEN 'adolescentes'
    WHEN 3 THEN 'jovens'
    WHEN 4 THEN 'adultos'
    ELSE 'idosos'
  END,
  true
FROM (
  SELECT * FROM public.accounts WHERE id = auth.uid()
) acc, generate_series(1, 5) AS gs(row_number);

-- Create enrollments (link members to EBD classes)
INSERT INTO public.ebd_enrollments (account_id, class_id, member_id, is_test_data)
SELECT
  acc.account_id,
  ebd.id,
  m.id,
  true
FROM (
  SELECT * FROM public.accounts WHERE id = auth.uid()
) acc
JOIN public.ebd_classes ebd ON ebd.account_id = acc.account_id AND ebd.is_test_data = true
JOIN public.members m ON m.account_id = acc.account_id AND m.is_test_data = true
WHERE (
  SELECT COUNT(*)
  FROM ebd_enrollments
  WHERE class_id = ebd.id AND member_id = m.id
) = 0
LIMIT 30;

-- Create attendance records
INSERT INTO public.ebd_attendance (account_id, class_id, member_id, attendance_date, present, is_test_data)
SELECT
  ee.account_id,
  ee.class_id,
  ee.member_id,
  CURRENT_DATE - (days.n::int),
  (days.n % 3) > 0,
  true
FROM (
  SELECT * FROM ebd_enrollments
  WHERE is_test_data = true AND account_id = auth.uid()
) ee
CROSS JOIN generate_series(0, 10) days(n)
WHERE NOT EXISTS (
  SELECT 1 FROM ebd_attendance
  WHERE class_id = ee.class_id
    AND member_id = ee.member_id
    AND attendance_date = (CURRENT_DATE - (days.n::int))
);
