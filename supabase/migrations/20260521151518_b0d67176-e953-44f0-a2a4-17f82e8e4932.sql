INSERT INTO public.user_roles (user_id, role)
VALUES ('6bf9f3e0-3567-499c-942b-cbd8672b506c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
