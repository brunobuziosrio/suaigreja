import { c as createSsrRpc } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
const listTypes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8630dbc933fd37e262b4e12d2f3d872918fcb3a820867b983891641c26986b62"));
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  active: z.boolean().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(8).optional()
});
const upsertType = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("d2698d757da9e7ab3735f3cc22ae08e6dbd5cc3dc42d0fc644a05092413d7de1"));
const deleteType = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("e210c93408e1024b87db0bb69ce6731f58410fc743dca9f3021ad2bae36584c6"));
export {
  deleteType as d,
  listTypes as l,
  upsertType as u
};
