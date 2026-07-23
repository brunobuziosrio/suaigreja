// Resolucao do contexto de conta a partir do usuario autenticado.
//
// Hoje o dono da conta tem user_id = account_id. Com multiusuario, um usuario da
// equipe autentica com o proprio login e pertence a uma conta atraves de
// account_members. Este resolvedor centraliza essa traducao para que as funcoes
// de servidor deixem de assumir account_id = userId (base para a fase de
// enforcement). Enquanto o enforcement nao e ligado, o dono continua resolvendo
// para a propria conta, sem mudanca de comportamento.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AccountContext = {
  accountId: string;
  role: string;
};

export type ActiveAccountMembership = {
  account_id: string;
  role: string;
  created_at: string;
};

export function resolveAccountContextFromMemberships(
  userId: string,
  memberships: readonly ActiveAccountMembership[],
): AccountContext {
  if (memberships.length === 0) return { accountId: userId, role: "owner" };

  const owner = memberships.find((membership) => membership.role === "owner");
  const chosen = owner ?? [...memberships].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  return { accountId: chosen.account_id, role: chosen.role };
}

// Resolve a conta ativa e o cargo do usuario. Prefere o vinculo de dono quando o
// usuario participa de mais de uma conta. Faz fallback seguro para a conta
// propria (compatibilidade pre-backfill).
export async function resolveAccountContext(userId: string): Promise<AccountContext> {
  const { data, error } = await supabaseAdmin
    .from("account_members" as never)
    .select("account_id, role, status, created_at")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    // Falha fechada: o service role ignora RLS e nunca pode conceder o
    // contexto legado de proprietário quando não foi possível verificar vínculos.
    throw new Error("Não foi possível validar o vínculo da conta ativa.");
  }

  return resolveAccountContextFromMemberships(
    userId,
    (data ?? []) as ActiveAccountMembership[],
  );
}
