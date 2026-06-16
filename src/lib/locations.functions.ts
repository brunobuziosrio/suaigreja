import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listLocations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("locations")
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
  address: z.string().max(240).optional().nullable(),
  active: z.boolean().optional(),
  is_main: z.boolean().optional(),
  phone: z.string().max(40).optional().nullable(),
  whatsapp: z.string().max(40).optional().nullable(),
  office_hours: z.string().max(400).optional().nullable(),
  transport_info: z.string().max(600).optional().nullable(),
  maps_url: z.string().max(500).optional().nullable(),
  waze_url: z.string().max(500).optional().nullable(),
  uber_url: z.string().max(500).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  place_id: z.string().max(200).optional().nullable(),
  neighborhood: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
});

export const upsertLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const extra = {
      is_main: data.is_main ?? false,
      phone: data.phone ?? null,
      whatsapp: data.whatsapp ?? null,
      office_hours: data.office_hours ?? null,
      transport_info: data.transport_info ?? null,
      maps_url: data.maps_url ?? null,
      waze_url: data.waze_url ?? null,
      uber_url: data.uber_url ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      place_id: data.place_id ?? null,
      neighborhood: data.neighborhood ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      postal_code: data.postal_code ?? null,
      country: data.country ?? null,
    };
    if (data.id) {
      const { error } = await supabase
        .from("locations")
        .update({ name: data.name, address: data.address ?? null, active: data.active ?? true, ...extra } as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("locations").insert({
        account_id: userId,
        name: data.name,
        address: data.address ?? null,
        active: data.active ?? true,
        ...extra,
      } as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });