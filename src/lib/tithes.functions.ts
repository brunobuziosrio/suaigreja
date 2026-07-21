/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

// String vazia ("") vinda do formulário de registro novo nao e nem
// undefined nem null, entao .optional().nullable() nao intercepta antes
// da checagem .uuid() -- precisa normalizar ANTES via preprocess.
// Ver memoria fix_uuid_validation.md.
const optionalUuid = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().uuid().optional(),
);

export const listTithes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "finances", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("tithes")
      .select("*, members(full_name, email, phone)")
      .eq("account_id", accountId)
      .order("contributed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTithesByMember = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ memberId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "finances", "view");
    const { supabase } = context;
    const { data: tithes, error } = await supabase
      .from("tithes")
      .select("*")
      .eq("account_id", accountId)
      .eq("member_id", data.memberId)
      .order("contributed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return tithes ?? [];
  });

const upsertSchema = z.object({
  id: optionalUuid,
  member_id: z.string().uuid(),
  amount_cents: z.number().int().min(0),
  contributed_at: z.string(),
  status: z.string().default("recorded"),
  notes: z.string().max(500).optional().nullable(),
});

type TithePayload = {
  member_id: string;
  amount_cents: number;
  contributed_at: string;
  status: string;
  notes: string | null;
};

export const upsertTithe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "finances", data.id ? "edit" : "create");
    const { supabase: client } = context;
    const payload: TithePayload = {
      member_id: data.member_id,
      amount_cents: data.amount_cents,
      contributed_at: data.contributed_at,
      status: data.status,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await client
        .from("tithes")
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("tithes")
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteTithe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "finances", "delete");
    const { supabase: client } = context;
    const { error } = await client
      .from("tithes")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getTithesReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((i) =>
    z
      .object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "finances", "view");
    const { supabase } = context;
    let query = supabase
      .from("tithes")
      .select("*, members(full_name, email)")
      .eq("account_id", accountId);

    if (data.startDate) {
      query = query.gte("contributed_at", data.startDate);
    }
    if (data.endDate) {
      query = query.lte("contributed_at", data.endDate);
    }

    const { data: tithes, error } = await query.order("contributed_at", {
      ascending: false,
    });
    if (error) throw new Error(error.message);

    const totalAmount = (tithes ?? [])
      .filter((t) => t.status !== "cancelled")
      .reduce((sum, t) => sum + t.amount_cents, 0);

    const byMember = new Map<
      string,
      { name: string; email: string; total: number; count: number }
    >();
    (tithes ?? [])
      .filter((t) => t.status !== "cancelled")
      .forEach((t) => {
        const key = t.member_id;
        if (!byMember.has(key)) {
          byMember.set(key, {
            name: t.members?.full_name || "Desconhecido",
            email: t.members?.email || "",
            total: 0,
            count: 0,
          });
        }
        const entry = byMember.get(key)!;
        entry.total += t.amount_cents;
        entry.count += 1;
      });

    return {
      totalAmount,
      count: (tithes ?? []).filter((t) => t.status !== "cancelled").length,
      averageAmount:
        (tithes ?? []).filter((t) => t.status !== "cancelled").length > 0
          ? Math.round(totalAmount / (tithes ?? []).filter((t) => t.status !== "cancelled").length)
          : 0,
      byMember: Array.from(byMember.entries()).map(([_, v]) => v),
    };
  });
