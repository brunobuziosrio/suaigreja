import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
const listProducts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("51ad93d03c52987e0e52d0164e41771f8765a8919d8a537367eaf795dff9b9d8"));
const getProductBySlug = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  slug: z.string().min(1).max(120)
}).parse(i)).handler(createSsrRpc("934a19e0a64899030ca094a104b50f8fc2c2f2533d480be67184ceddaf6faaf0"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("db4061caf5c2ae47f6fddff2e099f60dd6dee13d425050ef65c9dcb0ccbb1154"));
const createProductPixPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  productId: z.string().uuid()
}).parse(i)).handler(createSsrRpc("a2061ef4eb54de177a9f0edbfb4fcbbc4a00519a56ae6157ddebcff4bd3db008"));
export {
  createProductPixPayment as c,
  getProductBySlug as g,
  listProducts as l
};
