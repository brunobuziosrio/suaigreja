import { c as createSsrRpc } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
const listLocations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("75abccc4853c268405b494314fb5cab2d18f5c761248a6990649b60b6969b3ac"));
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
const upsertLocation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("e93fd17da7bc0c6a55c490913024dc80c37aab66e3f0ba8297e6477eaaf30139"));
const deleteLocation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("6aed5c7bafc6fe6ac6bff5d14bcd75c464264911ca8bd5e2669fd8a862fef60c"));
export {
  deleteLocation as d,
  listLocations as l,
  upsertLocation as u
};
