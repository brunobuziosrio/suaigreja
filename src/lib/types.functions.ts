import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("celebration_types")
      .select("*")
      .eq("account_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  active: z.boolean().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(8).optional(),
});

export const upsertType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
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
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("celebration_types").insert({
        account_id: userId,
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
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("celebration_types")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });