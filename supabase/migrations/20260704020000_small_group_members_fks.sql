-- small_group_members nunca teve foreign keys de verdade pra
-- small_groups/members -- so a PK. Sem FK, o PostgREST nao consegue
-- fazer embed (select "*, members(...)") e retorna "Could not find a
-- relationship between 'small_group_members' and 'members' in the
-- schema cache". Achado testando de verdade a gestao de membros de
-- celula recem-publicada.
--
-- @author Bruno Linhares da Silveira
-- @copyright 2026 Digital Lagos
-- @contact contato@digitallagos.com.br

ALTER TABLE public.small_group_members
  ADD CONSTRAINT small_group_members_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES public.small_groups(id) ON DELETE CASCADE,
  ADD CONSTRAINT small_group_members_member_id_fkey
    FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
