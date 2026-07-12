import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccountContext } from "@/lib/account-context.server";

export const listLocations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const { data, error } = await supabase
      .from("locations")
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
type LocationPayload = {
  name: string;
  address: string | null;
  active: boolean;
  is_main: boolean;
  phone: string | null;
  whatsapp: string | null;
  office_hours: string | null;
  transport_info: string | null;
  maps_url: string | null;
  waze_url: string | null;
  uber_url: string | null;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};
export const upsertLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
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
    const payload: LocationPayload = {
      name: data.name,
      address: data.address ?? null,
      active: data.active ?? true,
      ...extra,
    };
    if (data.id) {
      const { error } = await supabase
        .from("locations")
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("locations")
        .insert({ ...payload, account_id: accountId } as never);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
