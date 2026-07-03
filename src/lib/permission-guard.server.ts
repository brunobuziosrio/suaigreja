// Enforcement da matriz de permissoes por verbo (Fase 3, etapa final).
//
// Ate aqui a matriz configurada em /equipe era honesta na intenção mas nao
// restringia nada de fato: RLS libera qualquer membro ativo, e requirePlanTier
// so checa o plano da conta. Este guard fecha essa lacuna checando o verbo
// (view/create/edit/delete/manage) do cargo do usuario contra o modulo, com o
// mesmo padrao de requirePlanTier: resolve o contexto, valida, retorna
// { accountId, role } para a funcao reaproveitar.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccountContext } from "@/lib/account-context.server";
import { roleCan, type PermissionVerb, type RolePermissions } from "@/lib/permissions";

export type PermissionCheck = {
  accountId: string;
  role: string;
};

export async function requirePermission(
  context: { userId: string },
  moduleId: string,
  verb: PermissionVerb,
): Promise<PermissionCheck> {
  const { accountId, role } = await resolveAccountContext(context.userId);

  // Dono sempre pode tudo; evita 1 query extra no caso comum (conta sem equipe).
  if (role === "owner") return { accountId, role };

  const { data, error } = await supabaseAdmin
    .from("account_role_permissions" as never)
    .select("permissions")
    .eq("account_id", accountId)
    .eq("role", role)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const overrides = (data as { permissions: RolePermissions } | null)?.permissions ?? null;

  if (!roleCan(role, moduleId, verb, overrides)) {
    throw new Error("Seu cargo não tem permissão para esta ação.");
  }

  return { accountId, role };
}
