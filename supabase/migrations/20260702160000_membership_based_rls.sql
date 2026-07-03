-- Fase 3 de Equipe e Permissoes: RLS baseada em membership (nao mais 1 login = 1 conta).
--
-- Ate aqui, toda tabela de tenant restringia acesso com `account_id = auth.uid()`
-- (ou a variante invertida). Isso significa que um usuario convidado (Fase 2), mesmo
-- vinculado corretamente em account_members, nao enxergava NENHUM dado da conta: o
-- Postgres comparava account_id com o proprio id do convidado, que nunca bate.
--
-- Esta migration reescreve essas politicas para usar is_account_member(account_id,
-- auth.uid()) — que ja cobre tanto o dono (accountId = userId) quanto um membro ativo
-- (linha em account_members). A tabela accounts recebe tratamento especial: leitura
-- por qualquer membro ativo, escrita restrita ao proprietario (is_account_owner).
--
-- Importante (comunicar): esta etapa concede a QUALQUER membro ativo o mesmo acesso
-- de leitura/escrita que o dono ja tinha. Ainda NAO aplica a matriz de permissoes por
-- verbo (ver/criar/editar/excluir) configurada em /equipe — isso e' a proxima etapa
-- (checagem em codigo nas funcoes de servidor, usando roleCan()/account_role_permissions).
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

-- 1. Caso especial: accounts (coluna e' "id", nao "account_id") -----------------
ALTER POLICY "owner reads account" ON public.accounts
  USING (public.is_account_member(id, auth.uid()));

ALTER POLICY "owner updates account" ON public.accounts
  USING (public.is_account_owner(id, auth.uid()))
  WITH CHECK (public.is_account_owner(id, auth.uid()));

-- 2. Generico: toda politica de tabela de tenant com account_id = auth.uid() ----
DO $$
DECLARE
  pol RECORD;
  new_qual text;
  new_check text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual ILIKE '%account_id = auth.uid()%' OR qual ILIKE '%auth.uid() = account_id%'
        OR with_check ILIKE '%account_id = auth.uid()%' OR with_check ILIKE '%auth.uid() = account_id%'
      )
  LOOP
    new_qual := NULL;
    new_check := NULL;

    IF pol.qual IS NOT NULL THEN
      new_qual := replace(replace(pol.qual,
        'account_id = auth.uid()', 'is_account_member(account_id, auth.uid())'),
        'auth.uid() = account_id', 'is_account_member(account_id, auth.uid())');
    END IF;

    IF pol.with_check IS NOT NULL THEN
      new_check := replace(replace(pol.with_check,
        'account_id = auth.uid()', 'is_account_member(account_id, auth.uid())'),
        'auth.uid() = account_id', 'is_account_member(account_id, auth.uid())');
    END IF;

    IF new_qual IS NOT NULL AND new_check IS NOT NULL THEN
      EXECUTE format('ALTER POLICY %I ON public.%I USING (%s) WITH CHECK (%s)',
        pol.policyname, pol.tablename, new_qual, new_check);
    ELSIF new_qual IS NOT NULL THEN
      EXECUTE format('ALTER POLICY %I ON public.%I USING (%s)',
        pol.policyname, pol.tablename, new_qual);
    ELSIF new_check IS NOT NULL THEN
      EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)',
        pol.policyname, pol.tablename, new_check);
    END IF;

    RAISE NOTICE 'Atualizada politica % em %', pol.policyname, pol.tablename;
  END LOOP;
END $$;
