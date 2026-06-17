import { c as createSsrRpc } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
const listSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
const listEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => listSchema.parse(i)).handler(createSsrRpc("c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9"));
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
  live_url: z.string().url().max(500).optional().nullable()
});
const upsertEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("f783d064126a6698039e7eec74f0fcc451e4bfd0e3115f6a3e31192fd1c505a6"));
const deleteEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da"));
export {
  deleteEvent as d,
  listEvents as l,
  upsertEvent as u
};
