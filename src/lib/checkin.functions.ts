import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listCheckinSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("checkin_sessions")
      .select("*")
      .eq("account_id", userId)
      .order("session_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listCheckinEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { session_id: string }) => z.object({ session_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("checkin_entries")
      .select("*, members(full_name, photo_url)")
      .eq("account_id", userId)
      .eq("session_id", data.session_id)
      .order("checked_in_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  session_date: z.string(),
  start_time: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  active: z.boolean().default(true),
});

export const upsertCheckinSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = { ...data, account_id: userId, updated_at: new Date().toISOString() };
    if (data.id) {
      const { error } = await supabase.from("checkin_sessions").update(payload).eq("id", data.id).eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("checkin_sessions").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCheckinSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("checkin_sessions").delete().eq("id", data.id).eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public: get active session info + register check-in
const publicSchema = z.object({
  session_id: z.string().uuid(),
  member_id: z.string().uuid().optional().nullable(),
  visitor_name: z.string().max(120).optional().nullable(),
  visitor_phone: z.string().max(40).optional().nullable(),
});

export const publicCheckin = createServerFn({ method: "POST" })
  .inputValidator((i) => publicSchema.parse(i))
  .handler(async ({ data }) => {
    const { data: session, error: sErr } = await supabaseAdmin
      .from("checkin_sessions")
      .select("id, account_id, active")
      .eq("id", data.session_id)
      .maybeSingle();
    if (sErr || !session || !session.active) throw new Error("Sessão não encontrada ou encerrada");
    const { error } = await supabaseAdmin.from("checkin_entries").insert({
      account_id: session.account_id,
      session_id: session.id,
      member_id: data.member_id || null,
      visitor_name: data.visitor_name || null,
      visitor_phone: data.visitor_phone || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPublicCheckinSession = createServerFn({ method: "GET" })
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("checkin_sessions")
      .select("id, title, session_date, start_time, active, account_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!session) return null;
    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("brand_title, brand_logo_url, primary_color")
      .eq("id", session.account_id)
      .maybeSingle();
    return { session, account };
  });