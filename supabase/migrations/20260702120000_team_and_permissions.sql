-- Fase 1 de Equipe e Permissoes: fundacao de multiusuario por conta.
--
-- Introduz o vinculo entre usuarios e contas (account_members) e a matriz de
-- permissoes por cargo (account_role_permissions). NAO altera a RLS das tabelas
-- existentes nem o fluxo de login atual: o dono continua sendo dono da propria
-- conta. O enforcement multiusuario (RLS baseada em membership) fica para a fase
-- de aplicacao, com deploy dedicado e rollback.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

-- 1. Vinculo usuario <-> conta (equipe da igreja) ----------------------------
CREATE TABLE IF NOT EXISTS public.account_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text,
  role text NOT NULL DEFAULT 'membro',
  status text NOT NULL DEFAULT 'active',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_members_status_check CHECK (status IN ('active', 'invited', 'suspended')),
  CONSTRAINT account_members_user_or_email CHECK (user_id IS NOT NULL OR invited_email IS NOT NULL)
);

-- Um usuario so pode ter um vinculo por conta.
CREATE UNIQUE INDEX IF NOT EXISTS account_members_account_user_uidx
  ON public.account_members (account_id, user_id)
  WHERE user_id IS NOT NULL;

-- Um convite pendente unico por conta/email.
CREATE UNIQUE INDEX IF NOT EXISTS account_members_account_email_uidx
  ON public.account_members (account_id, lower(invited_email))
  WHERE invited_email IS NOT NULL AND user_id IS NULL;

CREATE INDEX IF NOT EXISTS account_members_account_idx ON public.account_members (account_id);
CREATE INDEX IF NOT EXISTS account_members_user_idx ON public.account_members (user_id);

-- 2. Matriz de permissoes por cargo (apenas overrides; defaults ficam no app) -
CREATE TABLE IF NOT EXISTS public.account_role_permissions (
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  role text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, role)
);

CREATE INDEX IF NOT EXISTS account_role_permissions_account_idx
  ON public.account_role_permissions (account_id);

-- 2.1 Privilegios para os roles do Supabase (a RLS ainda restringe as linhas).
-- Sem estes GRANTs o PostgREST responde "permission denied" mesmo para o
-- service_role, pois tabelas criadas por 'postgres' nao herdam os privilegios.
GRANT ALL ON TABLE public.account_members TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.account_role_permissions TO anon, authenticated, service_role;

-- Recarrega o cache de schema do PostgREST para enxergar as tabelas novas.
NOTIFY pgrst, 'reload schema';

-- 3. Helpers SECURITY DEFINER para evitar recursao de RLS ---------------------
CREATE OR REPLACE FUNCTION public.is_account_member(_account_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = _account_id
      AND user_id = _user_id
      AND status = 'active'
  ) OR _account_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_account_owner(_account_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _account_id = _user_id OR EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = _account_id
      AND user_id = _user_id
      AND role = 'owner'
      AND status = 'active'
  );
$$;

-- 4. RLS das tabelas novas ---------------------------------------------------
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_role_permissions ENABLE ROW LEVEL SECURITY;

-- Membros da conta leem a equipe; donos gerenciam.
CREATE POLICY "members read own team"
  ON public.account_members FOR SELECT
  TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "owners manage team"
  ON public.account_members FOR ALL
  TO authenticated
  USING (public.is_account_owner(account_id, auth.uid()))
  WITH CHECK (public.is_account_owner(account_id, auth.uid()));

-- Membros leem a matriz; donos editam.
CREATE POLICY "members read role permissions"
  ON public.account_role_permissions FOR SELECT
  TO authenticated
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "owners manage role permissions"
  ON public.account_role_permissions FOR ALL
  TO authenticated
  USING (public.is_account_owner(account_id, auth.uid()))
  WITH CHECK (public.is_account_owner(account_id, auth.uid()));

-- 5. Backfill: cada conta existente ganha o dono como membro 'owner' ----------
INSERT INTO public.account_members (account_id, user_id, role, status)
SELECT a.id, a.id, 'owner', 'active'
FROM public.accounts a
ON CONFLICT DO NOTHING;

-- 6. Gatilho para novos donos entrarem como 'owner' automaticamente ----------
CREATE OR REPLACE FUNCTION public.handle_new_account_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.account_members (account_id, user_id, role, status)
  VALUES (NEW.id, NEW.id, 'owner', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS accounts_owner_membership ON public.accounts;
CREATE TRIGGER accounts_owner_membership
  AFTER INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_account_owner();

-- 7. touch updated_at ---------------------------------------------------------
DROP TRIGGER IF EXISTS account_members_touch ON public.account_members;
CREATE TRIGGER account_members_touch BEFORE UPDATE ON public.account_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS account_role_permissions_touch ON public.account_role_permissions;
CREATE TRIGGER account_role_permissions_touch BEFORE UPDATE ON public.account_role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
