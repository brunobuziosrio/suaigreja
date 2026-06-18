import { T as TSS_SERVER_FUNCTION, h as getServerFnById, e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getPlatformPaymentSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("91b2ee6bfe866a4cbe677f5030e9aff4e15aa97dee4de00b4367b04162c935bc"));
const paymentSettingsSchema = z.object({
  ativopayApiKey: z.string().max(500).optional().default(""),
  ativopayWebhookSecret: z.string().max(500).optional().default(""),
  mercadopagoAccessToken: z.string().max(500).optional().default("")
});
const updatePlatformPaymentSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => paymentSettingsSchema.parse(input)).handler(createSsrRpc("9e68731ce0df65c92e4c561cc078f114fd4a0f7a57671058e17c7777e2958f28"));
let cachedAtivoPayKey = null;
let cachedAtivoPayWebhookSecret = null;
const CACHE_TTL_MS = 6e4;
async function resolveAtivoPayApiKey() {
  const now = Date.now();
  if (cachedAtivoPayKey && cachedAtivoPayKey.expiresAt > now) return cachedAtivoPayKey.value;
  const {
    data
  } = await supabaseAdmin.from("platform_payment_settings").select("ativopay_api_key").eq("id", true).maybeSingle();
  const value = data?.ativopay_api_key || process.env.ATIVOPAY_API_KEY || "";
  cachedAtivoPayKey = {
    value,
    expiresAt: now + CACHE_TTL_MS
  };
  return value;
}
async function resolveAtivoPayWebhookSecret() {
  const now = Date.now();
  if (cachedAtivoPayWebhookSecret && cachedAtivoPayWebhookSecret.expiresAt > now) {
    return cachedAtivoPayWebhookSecret.value;
  }
  const {
    data
  } = await supabaseAdmin.from("platform_payment_settings").select("ativopay_webhook_secret").eq("id", true).maybeSingle();
  const value = data?.ativopay_webhook_secret || process.env.ATIVOPAY_WEBHOOK_SECRET || "";
  cachedAtivoPayWebhookSecret = {
    value,
    expiresAt: now + CACHE_TTL_MS
  };
  return value;
}
export {
  resolveAtivoPayWebhookSecret as a,
  createSsrRpc as c,
  getPlatformPaymentSettings as g,
  resolveAtivoPayApiKey as r,
  updatePlatformPaymentSettings as u
};
