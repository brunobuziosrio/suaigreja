import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";

export const listTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "events", "view");
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const { data, error } = await supabase
      .from("celebration_types")
      .select("*")
      .eq("account_id", accountId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  active: z.boolean().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  icon: z.string().max(8).optional(),
});

export const upsertType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    await requirePermission(context, "events", data.id ? "edit" : "create");
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    if (data.id) {
      const { error } = await supabase
        .from("celebration_types")
        .update({
          name: data.name,
          active: data.active ?? true,
          color: data.color ?? "#467da5",
          icon: data.icon ?? "",
        })
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("celebration_types").insert({
        account_id: accountId,
        name: data.name,
        active: data.active ?? true,
        color: data.color ?? "#467da5",
        icon: data.icon ?? "",
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePermission(context, "events", "delete");
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const { error } = await supabase
      .from("celebration_types")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
