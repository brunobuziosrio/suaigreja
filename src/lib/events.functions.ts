import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const listSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const listEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => listSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("events")
      .select("*")
      .eq("account_id", userId)
      .gte("event_date", data.from)
      .lte("event_date", data.to)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  location_id: z.string().uuid(),
  type_id: z.string().uuid(),
  description: z.string().max(500).optional().nullable(),
  show_type: z.boolean().optional(),
  is_live: z.boolean().optional(),
  live_url: z.string().url().max(500).optional().nullable(),
});

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Resolve location and type names (denormalize for public embed)
    const [{ data: loc, error: locErr }, { data: typ, error: typErr }] = await Promise.all([
      supabase.from("locations").select("name").eq("id", data.location_id).eq("account_id", userId).maybeSingle(),
      supabase.from("celebration_types").select("name").eq("id", data.type_id).eq("account_id", userId).maybeSingle(),
    ]);
    if (locErr) throw new Error(locErr.message);
    if (typErr) throw new Error(typErr.message);
    if (!loc) throw new Error("Local não encontrado");
    if (!typ) throw new Error("Tipo não encontrado");

    const payload = {
      account_id: userId,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time || null,
      location_id: data.location_id,
      type_id: data.type_id,
      location_name: loc.name,
      type_name: typ.name,
      description: data.description || null,
      show_type: data.show_type ?? false,
      is_live: data.is_live ?? false,
      live_url: data.live_url || null,
    };

    if (data.id) {
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });