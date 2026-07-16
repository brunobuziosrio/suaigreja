// Funcoes de servidor de Equipe e Permissoes (Fase 1).
//
// Leitura da equipe e da matriz de permissoes por cargo, e edicao da matriz pelo
// dono. Convites e enforcement multiusuario ficam para as fases seguintes.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccountContext } from "@/lib/account-context.server";
import { getRoleDefinition, sanitizePermissions, type RolePermissions } from "@/lib/permissions";
import { requirePermission } from "@/lib/permission-guard.server";

type MemberRow = {
  id: string;
  user_id: string | null;
  invited_email: string | null;
  role: string;
  status: string;
  created_at: string;
};

export const getTeamAndPermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "team", "view");
    const { accountId, role: myRole } = await resolveAccountContext(context.userId);

    const [membersRes, permsRes] = await Promise.all([
      supabaseAdmin
        .from("account_members" as never)
        .select("id, user_id, invited_email, role, status, created_at")
        .eq("account_id", accountId)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("account_role_permissions" as never)
        .select("role, permissions")
        .eq("account_id", accountId),
    ]);

    if (membersRes.error) throw new Error(membersRes.error.message);
    if (permsRes.error) throw new Error(permsRes.error.message);

    const members = (membersRes.data ?? []) as MemberRow[];

    // Resolve e-mail e confirmacao dos usuarios vinculados.
    const infoById = new Map<string, { email: string | null; confirmed: boolean }>();
    await Promise.all(
      members
        .filter((m) => m.user_id)
        .map(async (m) => {
          const { data } = await supabaseAdmin.auth.admin.getUserById(m.user_id!);
          infoById.set(m.user_id!, {
            email: data?.user?.email ?? null,
            confirmed: !!(data?.user?.email_confirmed_at || data?.user?.confirmed_at),
          });
        }),
    );

    const overrides: Record<string, RolePermissions> = {};
    for (const row of (permsRes.data ?? []) as Array<{
      role: string;
      permissions: RolePermissions;
    }>) {
      overrides[row.role] = row.permissions ?? {};
    }

    return {
      accountId,
      myRole,
      canManage: myRole === "owner",
      members: members.map((m) => {
        const info = m.user_id ? infoById.get(m.user_id) : undefined;
        // Status de exibicao: convite enviado, aguardando 1o acesso ou ativo.
        let displayStatus: "invited" | "pending" | "active" | "suspended";
        if (m.status === "suspended") displayStatus = "suspended";
        else if (!m.user_id) displayStatus = "invited";
        else if (info && !info.confirmed) displayStatus = "pending";
        else displayStatus = "active";
        return {
          id: m.id,
          userId: m.user_id,
          email: m.user_id ? (info?.email ?? null) : m.invited_email,
          role: m.role,
          status: displayStatus,
          createdAt: m.created_at,
        };
      }),
      overrides,
    };
  });

const SITE_URL = process.env.PUBLIC_SITE_URL ?? "https://suaigreja.top";

const inviteSchema = z.object({
  email: z.string().email().max(255),
  role: z.string().min(1).max(60),
});

// Convida um usuario por e-mail para a conta com um cargo. O vinculo efetivo
// acontece no signup (gatilho handle_new_user), que reconhece o convite pendente.
export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => inviteSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId, role: myRole } = await resolveAccountContext(context.userId);
    if (myRole !== "owner") throw new Error("Apenas o proprietario pode convidar usuarios.");

    const def = getRoleDefinition(data.role);
    if (!def) throw new Error("Cargo desconhecido.");
    if (def.fullAccess) throw new Error("Nao e possivel convidar outro proprietario.");

    const email = data.email.trim().toLowerCase();

    // Convite pendente existente para o mesmo e-mail: apenas atualiza o cargo.
    const { data: existing } = await supabaseAdmin
      .from("account_members" as never)
      .select("id, user_id, status")
      .eq("account_id", accountId)
      .eq("invited_email", email)
      .is("user_id", null)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("account_members" as never)
        .update({ role: data.role, updated_at: new Date().toISOString() } as never)
        .eq("id", (existing as { id: string }).id);
    } else {
      const { error: insErr } = await supabaseAdmin.from("account_members" as never).insert({
        account_id: accountId,
        invited_email: email,
        role: data.role,
        status: "invited",
        invited_by: context.userId,
      } as never);
      if (insErr) throw new Error(insErr.message);
    }

    // Gera o link de convite (nao depende de SMTP). O convidado define a senha
    // em /update-password e entra direto nesta conta com o cargo escolhido.
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo: `${SITE_URL}/update-password` },
    });

    if (linkErr) {
      const code = "code" in linkErr ? String(linkErr.code ?? "") : "";
      const msg = (linkErr.message ?? "").toLowerCase();
      const alreadyExists =
        code === "email_exists" || msg.includes("already") || msg.includes("registered");
      if (alreadyExists) {
        // Usuario ja existe na plataforma: vincula direto (acessa com a propria senha).
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const user = list?.users?.find((u) => u.email?.toLowerCase() === email);
        if (user) {
          await supabaseAdmin
            .from("account_members" as never)
            .update({
              user_id: user.id,
              status: "active",
              updated_at: new Date().toISOString(),
            } as never)
            .eq("account_id", accountId)
            .eq("invited_email", email)
            .is("user_id", null);
          return { ok: true, linked: true, inviteLink: null as string | null };
        }
      }
      throw new Error(linkErr.message);
    }

    const inviteLink = linkData.properties?.action_link ?? null;
    return { ok: true, linked: false, inviteLink };
  });

// Regenera um link de acesso para um convite pendente (ex.: o proprietario perdeu
// o link ou quer reenviar). Usa 'recovery' pois o usuario ja foi criado no convite.
export const generateInviteLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => memberIdSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId, role: myRole } = await resolveAccountContext(context.userId);
    if (myRole !== "owner") throw new Error("Apenas o proprietario pode gerar links de acesso.");

    const { data: row } = await supabaseAdmin
      .from("account_members" as never)
      .select("id, user_id, invited_email")
      .eq("id", data.memberId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (!row) throw new Error("Membro nao encontrado.");

    const member = row as { user_id: string | null; invited_email: string | null };
    let email = member.invited_email;
    if (member.user_id) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(member.user_id);
      email = u?.user?.email ?? email;
    }
    if (!email) throw new Error("Este membro nao tem e-mail para gerar link.");

    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
      type: member.user_id ? "recovery" : "invite",
      email: email.toLowerCase(),
      options: { redirectTo: `${SITE_URL}/update-password` },
    });
    if (error) throw new Error(error.message);

    const inviteLink = linkData.properties?.action_link ?? null;
    return { ok: true, inviteLink, email };
  });

const memberIdSchema = z.object({ memberId: z.string().uuid() });

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => memberIdSchema.extend({ role: z.string().min(1).max(60) }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId, role: myRole } = await resolveAccountContext(context.userId);
    if (myRole !== "owner") throw new Error("Apenas o proprietario pode alterar cargos.");

    const def = getRoleDefinition(data.role);
    if (!def) throw new Error("Cargo desconhecido.");
    if (def.fullAccess) throw new Error("Nao e possivel promover a proprietario.");

    const { data: row } = await supabaseAdmin
      .from("account_members" as never)
      .select("id, role")
      .eq("id", data.memberId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (!row) throw new Error("Membro nao encontrado.");
    if ((row as { role: string }).role === "owner")
      throw new Error("O proprietario nao pode ter o cargo alterado.");

    const { error } = await supabaseAdmin
      .from("account_members" as never)
      .update({ role: data.role, updated_at: new Date().toISOString() } as never)
      .eq("id", data.memberId)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => memberIdSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId, role: myRole } = await resolveAccountContext(context.userId);
    if (myRole !== "owner") throw new Error("Apenas o proprietario pode remover usuarios.");

    const { data: row } = await supabaseAdmin
      .from("account_members" as never)
      .select("id, role")
      .eq("id", data.memberId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (!row) throw new Error("Membro nao encontrado.");
    if ((row as { role: string }).role === "owner")
      throw new Error("O proprietario nao pode ser removido.");

    const { error } = await supabaseAdmin
      .from("account_members" as never)
      .delete()
      .eq("id", data.memberId)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateSchema = z.object({
  role: z.string().min(1).max(60),
  permissions: z.record(z.array(z.string())),
});

export const updateRolePermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => updateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId, role: myRole } = await resolveAccountContext(context.userId);
    if (myRole !== "owner") {
      throw new Error("Apenas o proprietario da conta pode editar permissoes.");
    }

    const def = getRoleDefinition(data.role);
    if (!def) throw new Error("Cargo desconhecido.");
    if (def.fullAccess)
      throw new Error("O cargo de proprietario tem acesso total e nao e editavel.");

    const permissions = sanitizePermissions(data.permissions);

    const { error } = await supabaseAdmin.from("account_role_permissions" as never).upsert(
      {
        account_id: accountId,
        role: data.role,
        permissions,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "account_id,role" },
    );
    if (error) throw new Error(error.message);

    return { ok: true };
  });
