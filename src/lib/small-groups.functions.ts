import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export const listSmallGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("small_groups")
      .select("*")
      .eq("account_id", accountId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  leader_name: z.string().max(120).optional().nullable(),
  leader_phone: z.string().max(40).optional().nullable(),
  weekday: z.number().int().min(0).max(6).optional().nullable(),
  start_time: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  neighborhood: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  capacity: z.number().int().min(0).max(9999).optional().nullable(),
  active: z.boolean().default(true),
});

export const upsertSmallGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", data.id ? "edit" : "create");
    const { supabase } = context;
    const payload = { ...data, account_id: accountId, updated_at: new Date().toISOString() };
    if (data.id) {
      const { error } = await supabase.from("small_groups").update(payload).eq("id", data.id).eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("small_groups").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteSmallGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "small_groups", "delete");
    const { supabase } = context;
    const { error } = await supabase.from("small_groups").delete().eq("id", data.id).eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
