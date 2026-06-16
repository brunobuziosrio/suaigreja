import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

async function isAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

// ---------- System updates (admin posts) ----------

export const listSystemUpdates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("system_updates")
      .select("id, title, content, version, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const updateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(1).max(4000),
  version: z.string().trim().max(40).optional().nullable(),
});

export const createSystemUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const { error } = await supabaseAdmin.from("system_updates").insert({
      title: data.title,
      content: data.content,
      version: data.version || null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSystemUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const { error } = await supabaseAdmin.from("system_updates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Feature suggestions (user → admin) ----------

const suggestionSchema = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(2000),
});

export const createSuggestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => suggestionSchema.parse(input))
  .handler(async ({ data, context }) => {
    // try to attach account_id if exists
    const { data: acc } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("id", context.userId)
      .maybeSingle();
    const { error } = await supabaseAdmin.from("feature_suggestions").insert({
      user_id: context.userId,
      account_id: acc?.id ?? null,
      title: data.title,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMySuggestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("feature_suggestions")
      .select("id, title, message, status, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllSuggestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const { data, error } = await supabaseAdmin
      .from("feature_suggestions")
      .select("id, title, message, status, created_at, user_id, account_id")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    // attach emails + account name
    const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id).filter(Boolean))) as string[];
    const emailMap = new Map<string, string>();
    if (userIds.length) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      for (const u of usersData?.users ?? []) {
        if (u.email) emailMap.set(u.id, u.email);
      }
    }
    const accIds = Array.from(new Set((data ?? []).map((r) => r.account_id).filter(Boolean))) as string[];
    const accMap = new Map<string, string>();
    if (accIds.length) {
      const { data: accs } = await supabaseAdmin
        .from("accounts")
        .select("id, brand_title")
        .in("id", accIds);
      for (const a of accs ?? []) accMap.set(a.id, a.brand_title ?? "");
    }
    return (data ?? []).map((r) => ({
      ...r,
      email: r.user_id ? emailMap.get(r.user_id) ?? null : null,
      account_name: r.account_id ? accMap.get(r.account_id) ?? null : null,
    }));
  });

export const deleteSuggestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const { error } = await supabaseAdmin.from("feature_suggestions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });