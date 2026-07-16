import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildMercadoPagoPlatformNotificationUrl,
  resolveMercadoPagoAccessToken,
} from "@/lib/admin-payment-settings.functions";
import { resolveAccountContext } from "@/lib/account-context.server";
import { createMercadoPagoPixPayment } from "@/lib/mercadopago-payments.server";
import { requirePermission } from "@/lib/permission-guard.server";
import { z } from "zod";

async function getMercadoPagoAccessToken() {
  const key = await resolveMercadoPagoAccessToken();
  if (!key) throw new Error("Access token do Mercado Pago não configurado.");
  return key;
}

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ slug: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "view");
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) throw new Error("Produto não encontrado.");
    const { data: purchase } = await supabase
      .from("product_purchases")
      .select("id, status, purchased_at")
      .eq("account_id", accountId)
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { product, purchase: purchase ?? null };
  });

export const listMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "view");
    const { data, error } = await supabase
      .from("product_purchases")
      .select(
        "id, status, amount_cents, purchased_at, created_at, product:products(id, name, slug, image_url)",
      )
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createProductPixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ productId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { claims } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    const { data: product, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price_cents, active")
      .eq("id", data.productId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!product || !product.active) throw new Error("Produto indisponível.");
    if (product.price_cents <= 0) throw new Error("Produto sem preço definido.");

    const customerEmail = typeof claims.email === "string" ? claims.email : "cliente@email.com";
    const customerName =
      typeof claims.user_metadata === "object" &&
      claims.user_metadata &&
      "name" in claims.user_metadata
        ? String((claims.user_metadata as Record<string, unknown>).name)
        : "Cliente";

    const payment = await createMercadoPagoPixPayment({
      accessToken: await getMercadoPagoAccessToken(),
      amountCents: product.price_cents,
      description: product.name,
      payerEmail: customerEmail,
      payerName: customerName,
      notificationUrl: buildMercadoPagoPlatformNotificationUrl(getRequestHost()),
      externalReference: `${accountId}:product:${product.id}:${Date.now()}`,
      idempotencyKey: `product:${accountId}:${product.id}:${Date.now()}`,
      metadata: { account_id: accountId, kind: "product", product_id: product.id },
    });

    const { data: tx, error: txErr } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        account_id: accountId,
        kind: "product",
        product_id: product.id,
        plan: null,
        amount_cents: product.price_cents,
        status: payment.status,
        mercadopago_payment_id: payment.id || null,
        copy_paste: payment.copyPaste,
        qr_code: payment.qrCode,
        pay_url: payment.payUrl,
        expires_at: payment.expiresAt,
        raw_response: payment.raw as never,
      })
      .select("id, amount_cents, status, copy_paste, pay_url, qr_code, expires_at")
      .single();
    if (txErr) throw new Error(txErr.message);

    const { error: ppErr } = await supabaseAdmin.from("product_purchases").insert({
      account_id: accountId,
      product_id: product.id,
      transaction_id: tx.id,
      status: "pending",
      amount_cents: product.price_cents,
    });
    if (ppErr) throw new Error(ppErr.message);

    return tx;
  });
