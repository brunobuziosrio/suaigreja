import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccountContext } from "@/lib/account-context.server";

export const listDevotionals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const { data, error } = await supabase
      .from("devotionals")
      .select("*")
      .eq("account_id", accountId)
      .order("devotional_date", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  devotional_date: z.string(),
  verse_ref: z.string().min(1).max(120),
  verse_text: z.string().min(1).max(2000),
  message: z.string().max(4000).optional().nullable(),
  published: z.boolean().default(true),
});

export const upsertDevotional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const payload = { ...data, account_id: accountId, updated_at: new Date().toISOString() };
    if (data.id) {
      const { error } = await supabase
        .from("devotionals")
        .update(payload)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("devotionals")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteDevotional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const { error } = await supabase
      .from("devotionals")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public: today's devotional for a given account
export const getTodayDevotional = createServerFn({ method: "GET" })
  .validator((i: { account_id: string }) => z.object({ account_id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data: row } = await supabaseAdmin
      .from("devotionals")
      .select("verse_ref, verse_text, message, devotional_date")
      .eq("account_id", data.account_id)
      .eq("published", true)
      .lte("devotional_date", today)
      .order("devotional_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    return row;
  });
