-- Fase 2 de Equipe e Permissoes: convites de usuarios.
--
-- Torna o gatilho de signup ciente de convites. Se o e-mail do novo usuario tem
-- um convite pendente em account_members, ele e vinculado a conta que o convidou
-- (status 'active') em vez de ganhar uma conta/igreja propria. Sem convite
-- pendente, o comportamento continua identico: cria a conta do novo dono.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  linked_count int;
BEGIN
  -- Vincula convites pendentes deste e-mail (pode haver mais de uma igreja).
  UPDATE public.account_members
     SET user_id = NEW.id,
         status = 'active',
         updated_at = now()
   WHERE user_id IS NULL
     AND status = 'invited'
     AND NEW.email IS NOT NULL
     AND lower(invited_email) = lower(NEW.email);

  GET DIAGNOSTICS linked_count = ROW_COUNT;

  -- Usuario convidado nao recebe conta propria; usuario comum recebe.
  IF linked_count = 0 THEN
    INSERT INTO public.accounts (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;
