import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listVisitors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateVisitorStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "contacted", "member", "archived"]),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("visitors").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateVisitorNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), notes: z.string().max(2000) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("visitors").update({ notes: data.notes }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVisitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("visitors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getVisitorSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("accounts")
      .select("site_id, custom_slug, visitor_whatsapp, visitor_welcome_message, brand_title, primary_color")
      .eq("id", userId)
      .single();
    return data;
  });

export const saveVisitorSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      visitor_whatsapp: z.string().max(40).optional(),
      visitor_welcome_message: z.string().max(500).optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("accounts")
      .update({
        visitor_whatsapp: data.visitor_whatsapp || null,
        visitor_welcome_message: data.visitor_welcome_message || null,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- PUBLIC ----------

async function resolveAccountId(siteId: string): Promise<string | null> {
  const lookup = siteId.toLowerCase();
  const { data: a1 } = await supabaseAdmin
    .from("accounts").select("id").eq("custom_slug", lookup).maybeSingle();
  if (a1) return a1.id;
  const { data: a2 } = await supabaseAdmin
    .from("accounts").select("id").eq("site_id", siteId).maybeSingle();
  return a2?.id ?? null;
}

export const getPublicVisitorForm = createServerFn({ method: "GET" })
  .inputValidator((i: { siteId: string }) => {
    const siteId = String(i?.siteId || "").slice(0, 64);
    if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
    return { siteId };
  })
  .handler(async ({ data }) => {
    const accountId = await resolveAccountId(data.siteId);
    if (!accountId) return null;
    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("brand_title, primary_color, visitor_welcome_message")
      .eq("id", accountId)
      .maybeSingle();
    return account;
  });

const VisitorInput = z.object({
  siteId: z.string().min(1).max(64),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30).optional().or(z.literal("")),
  email: z.string().email().max(160).optional().or(z.literal("")),
  age_range: z.string().max(20).optional(),
  how_found: z.string().max(80).optional(),
  is_first_time: z.boolean().default(true),
  prayer_request: z.string().max(1000).optional(),
  allow_contact: z.boolean().default(true),
});

export const submitVisitor = createServerFn({ method: "POST" })
  .inputValidator((i) => VisitorInput.parse(i))
  .handler(async ({ data }) => {
    const accountId = await resolveAccountId(data.siteId);
    if (!accountId) throw new Error("Comunidade não encontrada.");
    const { error } = await supabaseAdmin.from("visitors").insert({
      account_id: accountId,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      age_range: data.age_range || null,
      how_found: data.how_found || null,
      is_first_time: data.is_first_time,
      prayer_request: data.prayer_request || null,
      allow_contact: data.allow_contact,
      status: "new",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });