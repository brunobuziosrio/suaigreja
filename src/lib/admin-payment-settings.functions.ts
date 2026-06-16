import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: somente administradores.");
}

export const getPlatformPaymentSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("platform_payment_settings")
      .select("ativopay_api_key, ativopay_webhook_secret, mercadopago_access_token")
      .eq("id", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      ativopayApiKey: data?.ativopay_api_key ?? "",
      ativopayWebhookSecret: data?.ativopay_webhook_secret ?? "",
      mercadopagoAccessToken: data?.mercadopago_access_token ?? "",
    };
  });

const paymentSettingsSchema = z.object({
  ativopayApiKey: z.string().max(500).optional().default(""),
  ativopayWebhookSecret: z.string().max(500).optional().default(""),
  mercadopagoAccessToken: z.string().max(500).optional().default(""),
});

export const updatePlatformPaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => paymentSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("platform_payment_settings")
      .update({
        ativopay_api_key: data.ativopayApiKey || null,
        ativopay_webhook_secret: data.ativopayWebhookSecret || null,
        mercadopago_access_token: data.mercadopagoAccessToken || null,
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

let cachedAtivoPayKey: { value: string; expiresAt: number } | null = null;
let cachedAtivoPayWebhookSecret: { value: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function resolveAtivoPayApiKey(): Promise<string> {
  const now = Date.now();
  if (cachedAtivoPayKey && cachedAtivoPayKey.expiresAt > now) return cachedAtivoPayKey.value;

  const { data } = await supabaseAdmin
    .from("platform_payment_settings")
    .select("ativopay_api_key")
    .eq("id", true)
    .maybeSingle();
  const value = data?.ativopay_api_key || process.env.ATIVOPAY_API_KEY || "";
  cachedAtivoPayKey = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}

export async function resolveAtivoPayWebhookSecret(): Promise<string> {
  const now = Date.now();
  if (cachedAtivoPayWebhookSecret && cachedAtivoPayWebhookSecret.expiresAt > now) {
    return cachedAtivoPayWebhookSecret.value;
  }

  const { data } = await supabaseAdmin
    .from("platform_payment_settings")
    .select("ativopay_webhook_secret")
    .eq("id", true)
    .maybeSingle();
  const value = data?.ativopay_webhook_secret || process.env.ATIVOPAY_WEBHOOK_SECRET || "";
  cachedAtivoPayWebhookSecret = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}
