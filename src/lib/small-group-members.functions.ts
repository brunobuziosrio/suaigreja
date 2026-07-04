// Membros de uma celula/pequeno grupo -- completa small_group_members,
// que ja existia com RLS/GRANT completos (policy "FOR ALL") e ja e lida
// por reports.functions.ts (relatorio de saude do grupo), mas nunca
// tinha nenhuma tela pra de fato adicionar/remover membros.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export type SmallGroupMemberRow = {
  id: string;
  group_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  members?: { full_name: string; photo_url: string | null; phone: string | null } | null;
};

export const listSmallGroupMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ group_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", "view");
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("small_group_members" as never)
      .select("*, members(full_name, photo_url, phone)")
      .eq("account_id", accountId)
      .eq("group_id", data.group_id)
      .order("role", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as SmallGroupMemberRow[];
  });

export const addSmallGroupMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      group_id: z.string().uuid(),
      member_id: z.string().uuid(),
      role: z.string().max(40).optional().default("membro"),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", "edit");
    const { supabase } = context;

    const { data: existing, error: checkErr } = await supabase
      .from("small_group_members" as never)
      .select("id")
      .eq("account_id", accountId)
      .eq("group_id", data.group_id)
      .eq("member_id", data.member_id)
      .maybeSingle();
    if (checkErr) throw new Error(checkErr.message);
    if (existing) throw new Error("Este membro já está nesta célula.");

    const { error } = await supabase.from("small_group_members" as never).insert({
      account_id: accountId,
      group_id: data.group_id,
      member_id: data.member_id,
      role: data.role || "membro",
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setSmallGroupMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), role: z.string().min(1).max(40) }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", "edit");
    const { supabase } = context;
    const { error } = await supabase
      .from("small_group_members" as never)
      .update({ role: data.role } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeSmallGroupMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("small_group_members" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
