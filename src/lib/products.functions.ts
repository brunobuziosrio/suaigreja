import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAtivoPayApiKey } from "@/lib/admin-payment-settings.functions";
import QRCode from "qrcode";
import { z } from "zod";

const ATIVOPAY_BASE_URL = "https://api-gateway.ativopay.com";

async function getAtivoPayKey() {
  const key = await resolveAtivoPayApiKey();
  if (!key) throw new Error("ATIVOPAY_API_KEY não configurada.");
  return key;
}

function pickText(v: unknown) {
  return typeof v === "string" && v.length > 0 ? v : null;
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
  .inputValidator((i) => z.object({ slug: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
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
      .eq("account_id", userId)
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { product, purchase: purchase ?? null };
  });

export const listMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("product_purchases")
      .select("id, status, amount_cents, purchased_at, created_at, product:products(id, name, slug, image_url)")
      .eq("account_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createProductPixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ productId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const { data: product, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price_cents, active")
      .eq("id", data.productId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!product || !product.active) throw new Error("Produto indisponível.");
    if (product.price_cents <= 0) throw new Error("Produto sem preço definido.");

    const host = getRequestHost();
    const protocol = host?.includes("localhost") ? "http" : "https";
    const postbackUrl = `${protocol}://${host}/api/public/ativopay-webhook`;
    const customerEmail = typeof claims.email === "string" ? claims.email : "cliente@email.com";
    const customerName =
      typeof claims.user_metadata === "object" && claims.user_metadata && "name" in claims.user_metadata
        ? String((claims.user_metadata as Record<string, unknown>).name)
        : "Cliente";

    const response = await fetch(`${ATIVOPAY_BASE_URL}/api/user/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AtivoB2B/1.0",
        "x-api-key": await getAtivoPayKey(),
      },
      body: JSON.stringify({
        pix: { expiresInDays: 1 },
        items: [
          {
            title: product.name,
            quantity: 1,
            tangible: false,
            unitPrice: product.price_cents,
            externalRef: `product-${product.id}`,
          },
        ],
        amount: product.price_cents,
        currency: "BRL",
        customer: {
          name: customerName,
          email: customerEmail,
          phone: "11999999999",
          document: { type: "CPF", number: "00000000000" },
        },
        metadata: JSON.stringify({ accountId: userId, kind: "product", productId: product.id }),
        traceable: false,
        externalRef: `${userId}:product:${product.id}:${Date.now()}`,
        postbackUrl,
        paymentMethod: "PIX",
      }),
    });

    const raw = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error((raw as { message?: string } | null)?.message ?? "Falha ao gerar PIX.");
    }

    const payment = ((raw as { data?: Record<string, unknown> })?.data ?? raw) as Record<string, unknown>;
    const pix = (payment.pix && typeof payment.pix === "object" ? payment.pix : {}) as Record<string, unknown>;
    const copyPaste = pickText(pix.qrcode) ?? pickText(payment.qrCode) ?? pickText(payment.copyPaste);
    const qrCode = copyPaste ? await QRCode.toDataURL(copyPaste, { margin: 1, width: 280 }) : null;

    const { data: tx, error: txErr } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        account_id: userId,
        kind: "product",
        product_id: product.id,
        plan: null,
        amount_cents: product.price_cents,
        status: String(payment.status ?? "pending").toLowerCase(),
        ativopay_transaction_id: pickText(payment.id),
        copy_paste: copyPaste,
        qr_code: qrCode,
        pay_url: pickText(payment.payUrl) ?? pickText(payment.webUrl) ?? pickText(payment.appUrl),
        expires_at: pickText(pix.expirationDate) ?? null,
        raw_response: raw as never,
      })
      .select("id, amount_cents, status, copy_paste, pay_url, qr_code, expires_at")
      .single();
    if (txErr) throw new Error(txErr.message);

    const { error: ppErr } = await supabaseAdmin.from("product_purchases").insert({
      account_id: userId,
      product_id: product.id,
      transaction_id: tx.id,
      status: "pending",
      amount_cents: product.price_cents,
    });
    if (ppErr) throw new Error(ppErr.message);

    return tx;
  });