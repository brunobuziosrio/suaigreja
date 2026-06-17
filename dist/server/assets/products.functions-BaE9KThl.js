import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn, a as getRequestHost } from "./server-aNfUBU9s.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { r as resolveAtivoPayApiKey } from "./admin-payment-settings.functions-DPCtUTO2.js";
import QRCode from "qrcode";
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
const ATIVOPAY_BASE_URL = "https://api-gateway.ativopay.com";
async function getAtivoPayKey() {
  const key = await resolveAtivoPayApiKey();
  if (!key) throw new Error("ATIVOPAY_API_KEY não configurada.");
  return key;
}
function pickText(v) {
  return typeof v === "string" && v.length > 0 ? v : null;
}
const listProducts_createServerFn_handler = createServerRpc({
  id: "51ad93d03c52987e0e52d0164e41771f8765a8919d8a537367eaf795dff9b9d8",
  name: "listProducts",
  filename: "src/lib/products.functions.ts"
}, (opts) => listProducts.__executeServer(opts));
const listProducts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listProducts_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("products").select("*").eq("active", true).order("featured", {
    ascending: false
  }).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const getProductBySlug_createServerFn_handler = createServerRpc({
  id: "934a19e0a64899030ca094a104b50f8fc2c2f2533d480be67184ceddaf6faaf0",
  name: "getProductBySlug",
  filename: "src/lib/products.functions.ts"
}, (opts) => getProductBySlug.__executeServer(opts));
const getProductBySlug = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  slug: z.string().min(1).max(120)
}).parse(i)).handler(getProductBySlug_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: product,
    error
  } = await supabase.from("products").select("*").eq("slug", data.slug).eq("active", true).maybeSingle();
  if (error) throw new Error(error.message);
  if (!product) throw new Error("Produto não encontrado.");
  const {
    data: purchase
  } = await supabase.from("product_purchases").select("id, status, purchased_at").eq("account_id", userId).eq("product_id", product.id).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  return {
    product,
    purchase: purchase ?? null
  };
});
const listMyPurchases_createServerFn_handler = createServerRpc({
  id: "db4061caf5c2ae47f6fddff2e099f60dd6dee13d425050ef65c9dcb0ccbb1154",
  name: "listMyPurchases",
  filename: "src/lib/products.functions.ts"
}, (opts) => listMyPurchases.__executeServer(opts));
const listMyPurchases = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyPurchases_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("product_purchases").select("id, status, amount_cents, purchased_at, created_at, product:products(id, name, slug, image_url)").eq("account_id", userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const createProductPixPayment_createServerFn_handler = createServerRpc({
  id: "a2061ef4eb54de177a9f0edbfb4fcbbc4a00519a56ae6157ddebcff4bd3db008",
  name: "createProductPixPayment",
  filename: "src/lib/products.functions.ts"
}, (opts) => createProductPixPayment.__executeServer(opts));
const createProductPixPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  productId: z.string().uuid()
}).parse(i)).handler(createProductPixPayment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId,
    claims
  } = context;
  const {
    data: product,
    error: pErr
  } = await supabaseAdmin.from("products").select("id, name, price_cents, active").eq("id", data.productId).maybeSingle();
  if (pErr) throw new Error(pErr.message);
  if (!product || !product.active) throw new Error("Produto indisponível.");
  if (product.price_cents <= 0) throw new Error("Produto sem preço definido.");
  const host = getRequestHost();
  const protocol = host?.includes("localhost") ? "http" : "https";
  const postbackUrl = `${protocol}://${host}/api/public/ativopay-webhook`;
  const customerEmail = typeof claims.email === "string" ? claims.email : "cliente@email.com";
  const customerName = typeof claims.user_metadata === "object" && claims.user_metadata && "name" in claims.user_metadata ? String(claims.user_metadata.name) : "Cliente";
  const response = await fetch(`${ATIVOPAY_BASE_URL}/api/user/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "AtivoB2B/1.0",
      "x-api-key": await getAtivoPayKey()
    },
    body: JSON.stringify({
      pix: {
        expiresInDays: 1
      },
      items: [{
        title: product.name,
        quantity: 1,
        tangible: false,
        unitPrice: product.price_cents,
        externalRef: `product-${product.id}`
      }],
      amount: product.price_cents,
      currency: "BRL",
      customer: {
        name: customerName,
        email: customerEmail,
        phone: "11999999999",
        document: {
          type: "CPF",
          number: "00000000000"
        }
      },
      metadata: JSON.stringify({
        accountId: userId,
        kind: "product",
        productId: product.id
      }),
      traceable: false,
      externalRef: `${userId}:product:${product.id}:${Date.now()}`,
      postbackUrl,
      paymentMethod: "PIX"
    })
  });
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(raw?.message ?? "Falha ao gerar PIX.");
  }
  const payment = raw?.data ?? raw;
  const pix = payment.pix && typeof payment.pix === "object" ? payment.pix : {};
  const copyPaste = pickText(pix.qrcode) ?? pickText(payment.qrCode) ?? pickText(payment.copyPaste);
  const qrCode = copyPaste ? await QRCode.toDataURL(copyPaste, {
    margin: 1,
    width: 280
  }) : null;
  const {
    data: tx,
    error: txErr
  } = await supabaseAdmin.from("payment_transactions").insert({
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
    raw_response: raw
  }).select("id, amount_cents, status, copy_paste, pay_url, qr_code, expires_at").single();
  if (txErr) throw new Error(txErr.message);
  const {
    error: ppErr
  } = await supabaseAdmin.from("product_purchases").insert({
    account_id: userId,
    product_id: product.id,
    transaction_id: tx.id,
    status: "pending",
    amount_cents: product.price_cents
  });
  if (ppErr) throw new Error(ppErr.message);
  return tx;
});
export {
  createProductPixPayment_createServerFn_handler,
  getProductBySlug_createServerFn_handler,
  listMyPurchases_createServerFn_handler,
  listProducts_createServerFn_handler
};
