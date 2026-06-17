import { c as createSsrRpc } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
import { z } from "zod";
const listSystemUpdates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b4ab6fdd475a5e269db098380b97b7e982cf9489646a8c8871d5e3ae400064b0"));
const updateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(1).max(4e3),
  version: z.string().trim().max(40).optional().nullable()
});
const createSystemUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => updateSchema.parse(input)).handler(createSsrRpc("a559b56dc36487c8c22e1e3efc70c4d4b19abf5084b3eb8c5ea8e5b6ec7a5460"));
const deleteSystemUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("e4b7436126fe609eb0b8c49acc757ec9f4a2fbd8256afaf3d83d2f7b8b50edf5"));
const suggestionSchema = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(2e3)
});
const createSuggestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => suggestionSchema.parse(input)).handler(createSsrRpc("792ed849e53a88e2a75aabd128f78503e1b0368d9a172614ddbf47e991f75e76"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4b620a3cd65805f5e944347844894d2350dfd2193f663c1562d679604c9fce66"));
const listAllSuggestions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9bfec0e40bfc14620d9709280eeda6476af6aff12f38578456c6fcb50e6a265b"));
const deleteSuggestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("96e03f61931eb7c243384fbe6d08294f255a3b20c178b619cad5ee7e586157cf"));
export {
  listAllSuggestions as a,
  createSystemUpdate as b,
  createSuggestion as c,
  deleteSystemUpdate as d,
  deleteSuggestion as e,
  listSystemUpdates as l
};
