import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
const listLocations_createServerFn_handler = createServerRpc({
  id: "75abccc4853c268405b494314fb5cab2d18f5c761248a6990649b60b6969b3ac",
  name: "listLocations",
  filename: "src/lib/locations.functions.ts"
}, (opts) => listLocations.__executeServer(opts));
const listLocations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listLocations_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("locations").select("*").eq("account_id", userId).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: true
  });
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
  country: z.string().max(80).optional().nullable()
});
const upsertLocation_createServerFn_handler = createServerRpc({
  id: "e93fd17da7bc0c6a55c490913024dc80c37aab66e3f0ba8297e6477eaaf30139",
  name: "upsertLocation",
  filename: "src/lib/locations.functions.ts"
}, (opts) => upsertLocation.__executeServer(opts));
const upsertLocation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertLocation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
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
    country: data.country ?? null
  };
  if (data.id) {
    const {
      error
    } = await supabase.from("locations").update({
      name: data.name,
      address: data.address ?? null,
      active: data.active ?? true,
      ...extra
    }).eq("id", data.id).eq("account_id", userId);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabase.from("locations").insert({
      account_id: userId,
      name: data.name,
      address: data.address ?? null,
      active: data.active ?? true,
      ...extra
    });
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const deleteLocation_createServerFn_handler = createServerRpc({
  id: "6aed5c7bafc6fe6ac6bff5d14bcd75c464264911ca8bd5e2669fd8a862fef60c",
  name: "deleteLocation",
  filename: "src/lib/locations.functions.ts"
}, (opts) => deleteLocation.__executeServer(opts));
const deleteLocation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteLocation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("locations").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteLocation_createServerFn_handler,
  listLocations_createServerFn_handler,
  upsertLocation_createServerFn_handler
};
