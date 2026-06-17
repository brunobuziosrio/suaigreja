import { c as createSsrRpc } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
const listCheckinSessions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("514f5210ea460b4733a80082389a266355cd01a46b70486d386ea969b4e5306a"));
const listCheckinEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  session_id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("656b2725ba30b01798af4865aac02024ecbf26cc5c564a1bb572b4e209ebc8dc"));
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  session_date: z.string(),
  start_time: z.string().optional().nullable(),
  notes: z.string().max(2e3).optional().nullable(),
  active: z.boolean().default(true)
});
const upsertCheckinSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("48ed0650c06125c6742264f9c6fe66713f81f0b5e2b0e3fbe5f535d1ec97bff3"));
const deleteCheckinSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("a807cc612cbbbba0c7d94dfdce7e3e9ceb087679951fb8fe87038e6e6ff5aeac"));
const publicSchema = z.object({
  session_id: z.string().uuid(),
  member_id: z.string().uuid().optional().nullable(),
  visitor_name: z.string().max(120).optional().nullable(),
  visitor_phone: z.string().max(40).optional().nullable()
});
const publicCheckin = createServerFn({
  method: "POST"
}).inputValidator((i) => publicSchema.parse(i)).handler(createSsrRpc("172eae4784224f3149420f5a20758ac94ad509831aeb225d075486739f56ed1c"));
const getPublicCheckinSession = createServerFn({
  method: "GET"
}).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("21a5d2452424aa2f06825ae4bade4822073d9792037827ca81fd180facab58f6"));
export {
  listCheckinEntries as a,
  deleteCheckinSession as d,
  getPublicCheckinSession as g,
  listCheckinSessions as l,
  publicCheckin as p,
  upsertCheckinSession as u
};
