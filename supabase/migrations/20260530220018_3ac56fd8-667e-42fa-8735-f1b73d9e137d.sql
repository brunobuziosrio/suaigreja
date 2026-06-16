
-- ============ MEMBERS ============
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  full_name text NOT NULL,
  photo_url text,
  email text,
  phone text,
  birth_date date,
  gender text,
  marital_status text,
  role text NOT NULL DEFAULT 'membro', -- membro | visitante | lider | pastor | diacono | obreiro
  member_since date,
  status text NOT NULL DEFAULT 'ativo', -- ativo | inativo | transferido | falecido
  address_street text,
  address_number text,
  address_city text,
  address_state text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.members TO anon; -- needed for public card validation (restricted via policy)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads members" ON public.members FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts members" ON public.members FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates members" ON public.members FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes members" ON public.members FOR DELETE TO authenticated USING (account_id = auth.uid());
-- public validation: only active members exposed (server-fn projects safe columns)
CREATE POLICY "public reads active members for card" ON public.members FOR SELECT TO anon USING (status = 'ativo');

CREATE INDEX idx_members_account ON public.members(account_id);

CREATE TRIGGER touch_members BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ DOCUMENT TEMPLATES ============
CREATE TABLE public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid, -- NULL = global template provided by platform
  kind text NOT NULL, -- declaracao_membro | certificado_batismo | oficio | recomendacao | apresentacao | outro
  title text NOT NULL,
  body text NOT NULL DEFAULT '', -- with placeholders like {{nome}} {{igreja}} {{data}}
  is_global boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_templates TO authenticated;
GRANT ALL ON public.document_templates TO service_role;

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own or global templates" ON public.document_templates FOR SELECT TO authenticated USING (is_global = true OR account_id = auth.uid());
CREATE POLICY "owner inserts templates" ON public.document_templates FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid() AND is_global = false);
CREATE POLICY "owner updates templates" ON public.document_templates FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes templates" ON public.document_templates FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE TRIGGER touch_doc_templates BEFORE UPDATE ON public.document_templates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed global templates
INSERT INTO public.document_templates (kind, title, body, is_global, sort_order) VALUES
('declaracao_membro', 'Declaração de Membresia', 'Declaramos, para os devidos fins, que {{nome}} é membro ativo de nossa congregação desde {{data_membresia}}, encontrando-se em plena comunhão.', true, 1),
('certificado_batismo', 'Certificado de Batismo', 'Certificamos que {{nome}} recebeu o santo batismo nas águas em {{data}}, conforme a doutrina de nossa igreja.', true, 2),
('carta_recomendacao', 'Carta de Recomendação', 'Recomendamos o(a) irmão(ã) {{nome}}, membro de nossa congregação, ao acolhimento da igreja receptora.', true, 3),
('oficio', 'Ofício', 'Pelo presente ofício, vimos solicitar...', true, 4),
('apresentacao_crianca', 'Apresentação de Criança', 'Certificamos que a criança {{nome}} foi apresentada ao Senhor em {{data}}.', true, 5);

-- ============ MEMBER DOCUMENTS (issued) ============
CREATE TABLE public.member_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  template_id uuid REFERENCES public.document_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  issued_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_documents TO authenticated;
GRANT ALL ON public.member_documents TO service_role;

ALTER TABLE public.member_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads docs" ON public.member_documents FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts docs" ON public.member_documents FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates docs" ON public.member_documents FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes docs" ON public.member_documents FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE TRIGGER touch_member_docs BEFORE UPDATE ON public.member_documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ EBD ============
CREATE TABLE public.ebd_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  teacher_name text,
  weekday smallint, -- 0=domingo
  start_time time,
  age_range text, -- crianças, adolescentes, jovens, adultos
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebd_classes TO authenticated;
GRANT ALL ON public.ebd_classes TO service_role;

ALTER TABLE public.ebd_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads classes" ON public.ebd_classes FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts classes" ON public.ebd_classes FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates classes" ON public.ebd_classes FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes classes" ON public.ebd_classes FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE TRIGGER touch_ebd_classes BEFORE UPDATE ON public.ebd_classes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ebd_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  class_id uuid NOT NULL REFERENCES public.ebd_classes(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  enrolled_at date NOT NULL DEFAULT CURRENT_DATE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, member_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebd_enrollments TO authenticated;
GRANT ALL ON public.ebd_enrollments TO service_role;

ALTER TABLE public.ebd_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads enrollments" ON public.ebd_enrollments FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts enrollments" ON public.ebd_enrollments FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates enrollments" ON public.ebd_enrollments FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes enrollments" ON public.ebd_enrollments FOR DELETE TO authenticated USING (account_id = auth.uid());

CREATE TABLE public.ebd_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  class_id uuid NOT NULL REFERENCES public.ebd_classes(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  present boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, member_id, attendance_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebd_attendance TO authenticated;
GRANT ALL ON public.ebd_attendance TO service_role;

ALTER TABLE public.ebd_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads attendance" ON public.ebd_attendance FOR SELECT TO authenticated USING (account_id = auth.uid());
CREATE POLICY "owner inserts attendance" ON public.ebd_attendance FOR INSERT TO authenticated WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner updates attendance" ON public.ebd_attendance FOR UPDATE TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE POLICY "owner deletes attendance" ON public.ebd_attendance FOR DELETE TO authenticated USING (account_id = auth.uid());

-- Member photo storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('member-photos', 'member-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public reads member photos" ON storage.objects FOR SELECT USING (bucket_id = 'member-photos');
CREATE POLICY "auth uploads member photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'member-photos');
CREATE POLICY "auth updates own member photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'member-photos');
CREATE POLICY "auth deletes own member photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'member-photos');
