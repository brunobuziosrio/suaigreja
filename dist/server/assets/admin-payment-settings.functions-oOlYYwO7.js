import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn } from "./server-aNfUBU9s.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
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
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: somente administradores.");
}
const getPlatformPaymentSettings_createServerFn_handler = createServerRpc({
  id: "91b2ee6bfe866a4cbe677f5030e9aff4e15aa97dee4de00b4367b04162c935bc",
  name: "getPlatformPaymentSettings",
  filename: "src/lib/admin-payment-settings.functions.ts"
}, (opts) => getPlatformPaymentSettings.__executeServer(opts));
const getPlatformPaymentSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getPlatformPaymentSettings_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("platform_payment_settings").select("ativopay_api_key, ativopay_webhook_secret, mercadopago_access_token").eq("id", true).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    ativopayApiKey: data?.ativopay_api_key ?? "",
    ativopayWebhookSecret: data?.ativopay_webhook_secret ?? "",
    mercadopagoAccessToken: data?.mercadopago_access_token ?? ""
  };
});
const paymentSettingsSchema = z.object({
  ativopayApiKey: z.string().max(500).optional().default(""),
  ativopayWebhookSecret: z.string().max(500).optional().default(""),
  mercadopagoAccessToken: z.string().max(500).optional().default("")
});
const updatePlatformPaymentSettings_createServerFn_handler = createServerRpc({
  id: "9e68731ce0df65c92e4c561cc078f114fd4a0f7a57671058e17c7777e2958f28",
  name: "updatePlatformPaymentSettings",
  filename: "src/lib/admin-payment-settings.functions.ts"
}, (opts) => updatePlatformPaymentSettings.__executeServer(opts));
const updatePlatformPaymentSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => paymentSettingsSchema.parse(input)).handler(updatePlatformPaymentSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("platform_payment_settings").update({
    ativopay_api_key: data.ativopayApiKey || null,
    ativopay_webhook_secret: data.ativopayWebhookSecret || null,
    mercadopago_access_token: data.mercadopagoAccessToken || null
  }).eq("id", true);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  getPlatformPaymentSettings_createServerFn_handler,
  updatePlatformPaymentSettings_createServerFn_handler
};
