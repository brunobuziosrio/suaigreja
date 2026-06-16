import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listPrayerRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updatePrayerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "approved", "archived"]),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("prayer_requests").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePrayerRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("prayer_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --------- PUBLIC ---------

async function resolveAccountId(siteId: string): Promise<string | null> {
  const lookup = siteId.toLowerCase();
  const { data: a1 } = await supabaseAdmin
    .from("accounts").select("id").eq("custom_slug", lookup).maybeSingle();
  if (a1) return a1.id;
  const { data: a2 } = await supabaseAdmin
    .from("accounts").select("id").eq("site_id", siteId).maybeSingle();
  return a2?.id ?? null;
}

export const getPublicPrayers = createServerFn({ method: "GET" })
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
      .select("brand_title, primary_color")
      .eq("id", accountId)
      .maybeSingle();
    const { data: prayers } = await supabaseAdmin
      .from("prayer_requests")
      .select("id, name, message, is_anonymous, prayer_count, created_at")
      .eq("account_id", accountId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100);
    return {
      account: account ?? { brand_title: "Igreja", primary_color: "#467da5" },
      accountId,
      prayers: (prayers ?? []).map((p) => ({
        ...p,
        name: p.is_anonymous ? "Anônimo" : p.name,
      })),
    };
  });

const SubmitInput = z.object({
  siteId: z.string().min(1).max(64),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  message: z.string().min(5).max(2000),
  is_anonymous: z.boolean().default(false),
});

export const submitPrayerRequest = createServerFn({ method: "POST" })
  .inputValidator((i) => SubmitInput.parse(i))
  .handler(async ({ data }) => {
    const accountId = await resolveAccountId(data.siteId);
    if (!accountId) throw new Error("Comunidade não encontrada.");
    const { error } = await supabaseAdmin.from("prayer_requests").insert({
      account_id: accountId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      message: data.message,
      is_anonymous: data.is_anonymous,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const prayForRequest = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      prayerId: z.string().uuid(),
      fingerprint: z.string().min(4).max(80),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const { error: insErr } = await supabaseAdmin
      .from("prayer_interactions")
      .insert({ prayer_request_id: data.prayerId, visitor_fingerprint: data.fingerprint });
    if (insErr) {
      // already prayed → no-op
      return { ok: true, alreadyPrayed: true };
    }
    const { data: cur } = await supabaseAdmin
      .from("prayer_requests").select("prayer_count").eq("id", data.prayerId).single();
    await supabaseAdmin
      .from("prayer_requests")
      .update({ prayer_count: (cur?.prayer_count ?? 0) + 1 })
      .eq("id", data.prayerId);
    return { ok: true, alreadyPrayed: false };
  });