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
    // Tabela ausente ou erro transitorio: mantem o comportamento legado.
    return { accountId: userId, role: "owner" };
  }

  const rows = (data ?? []) as Array<{ account_id: string; role: string; created_at: string }>;
  if (rows.length === 0) {
    return { accountId: userId, role: "owner" };
  }

  const owner = rows.find((row) => row.role === "owner");
  const chosen = owner ?? rows.sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  return { accountId: chosen.account_id, role: chosen.role };
}
