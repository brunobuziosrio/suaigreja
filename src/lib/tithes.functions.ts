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

export const listTithes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePlanTier(context, "pro");
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("tithes")
      .select("*, members(full_name, email, phone)")
      .eq("account_id", userId)
      .order("contributed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTithesByMember = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ memberId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase, userId } = context;
    const { data: tithes, error } = await supabase
      .from("tithes")
      .select("*")
      .eq("account_id", userId)
      .eq("member_id", data.memberId)
      .order("contributed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return tithes ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional().nullable().transform(v => v || undefined),
  member_id: z.string().uuid(),
  amount_cents: z.number().int().min(0),
  contributed_at: z.string(),
  status: z.string().default("recorded"),
  notes: z.string().max(500).optional().nullable(),
});

export const upsertTithe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase: client, userId } = context;
    const payload = {
      member_id: data.member_id,
      amount_cents: data.amount_cents,
      contributed_at: data.contributed_at,
      status: data.status,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await client
        .from("tithes")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("tithes")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteTithe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("tithes")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getTithesReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase, userId } = context;
    let query = supabase
      .from("tithes")
      .select("*, members(full_name, email)")
      .eq("account_id", userId);

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
          ? Math.round(
              totalAmount /
                (tithes ?? []).filter((t) => t.status !== "cancelled").length
            )
          : 0,
      byMember: Array.from(byMember.entries()).map(([_, v]) => v),
    };
  });
