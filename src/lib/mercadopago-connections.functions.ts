import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyMercadoPagoConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("mercadopago_connections")
      .select("public_key, connected_at")
      .eq("account_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { connected: !!data, publicKey: data?.public_key ?? null, connectedAt: data?.connected_at ?? null };
  });

const saveSchema = z.object({
  accessToken: z.string().min(10).max(500),
  publicKey: z.string().max(500).nullable().optional(),
});

export const saveMercadoPagoConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("mercadopago_connections").upsert(
      {
        account_id: userId,
        access_token: data.accessToken.trim(),
        public_key: data.publicKey?.trim() || null,
      },
      { onConflict: "account_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const disconnectMercadoPago = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("mercadopago_connections").delete().eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
