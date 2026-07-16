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
      .select("mercadopago_access_token")
      .eq("id", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Segredos de gateway nunca devem ser serializados para o navegador, nem
    // mesmo para administradores. A tela só precisa saber se há configuração.
    return { hasMercadoPagoAccessToken: Boolean(data?.mercadopago_access_token) };
  });

const paymentSettingsSchema = z.object({
  mercadopagoAccessToken: z.string().trim().max(500).optional(),
  clearMercadoPagoAccessToken: z.boolean().optional().default(false),
});

export const updatePlatformPaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => paymentSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const token = data.mercadopagoAccessToken?.trim();

    // Um formulário sem token não pode desativar pagamentos por acidente.
    // A remoção só ocorre quando a ação explícita é enviada pela interface.
    if (!data.clearMercadoPagoAccessToken && !token) {
      return { ok: true, unchanged: true };
    }

    const { error } = await supabaseAdmin
      .from("platform_payment_settings")
      .update({
        mercadopago_access_token: data.clearMercadoPagoAccessToken ? null : token,
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    cachedMercadoPagoAccessToken = null;
    return { ok: true };
  });

let cachedMercadoPagoAccessToken: { value: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function resolveMercadoPagoAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedMercadoPagoAccessToken && cachedMercadoPagoAccessToken.expiresAt > now) {
    return cachedMercadoPagoAccessToken.value;
  }

  const { data } = await supabaseAdmin
    .from("platform_payment_settings")
    .select("mercadopago_access_token")
    .eq("id", true)
    .maybeSingle();
  const value = data?.mercadopago_access_token || process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  cachedMercadoPagoAccessToken = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}

export function buildMercadoPagoPlatformNotificationUrl(host: string | null | undefined): string {
  if (!host) throw new Error("Não foi possível determinar o domínio para o webhook do Mercado Pago.");
  const protocol = host.includes("localhost") ? "http" : "https";
  const url = new URL(`${protocol}://${host}/api/public/mercadopago-webhook`);
  url.searchParams.set("source", "platform");
  return url.toString();
}
