import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn, a as getRequestHost } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { B as BILLING_PLANS } from "./billing-plans-Ce8xzhRW.js";
import { r as resolveAtivoPayApiKey } from "./admin-payment-settings.functions-DESQQOGp.js";
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
  if (!key) {
    throw new Error("A chave da AtivoPay ainda não foi configurada. Configure em Configurações > Plataforma.");
  }
  return key;
}
function readPaymentData(raw) {
  const payload = raw;
  return payload.data && typeof payload.data === "object" ? payload.data : payload;
}
function pickText(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
function normalizeStatus(status) {
  return String(status ?? "pending").toLowerCase();
}
const listMyPayments_createServerFn_handler = createServerRpc({
  id: "6eb89a05f6dfdb2f8c66b594f0bc454393b14a13f25b944d3756770af6bca129",
  name: "listMyPayments",
  filename: "src/lib/billing.functions.ts"
}, (opts) => listMyPayments.__executeServer(opts));
const listMyPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyPayments_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("payment_transactions").select("id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at").eq("account_id", userId).order("created_at", {
    ascending: false
  }).limit(10);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const getBillingSetup_createServerFn_handler = createServerRpc({
  id: "a5483ba61a40e70deefe5cd39c28f5e1619a298c48ae355e7f277f4873f56aa6",
  name: "getBillingSetup",
  filename: "src/lib/billing.functions.ts"
}, (opts) => getBillingSetup.__executeServer(opts));
const getBillingSetup = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getBillingSetup_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("accounts").select("current_plan, subscription_status, subscription_ends_at, trial_ends_at").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    account: data,
    hasAtivoPayKey: !!await resolveAtivoPayApiKey()
  };
});
const createPixPayment_createServerFn_handler = createServerRpc({
  id: "f8dd72aee13ccb48d3bbce5334d4dc0e89d734ab33bb399313af66107be91370",
  name: "createPixPayment",
  filename: "src/lib/billing.functions.ts"
}, (opts) => createPixPayment.__executeServer(opts));
const createPixPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  plan: z.enum(["monthly", "annual"])
}).parse(input)).handler(createPixPayment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId,
    claims
  } = context;
  const plan = data.plan;
  const planInfo = BILLING_PLANS[plan];
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
        title: `Agenda Religiosa - Plano ${planInfo.label}`,
        quantity: 1,
        tangible: false,
        unitPrice: planInfo.amountCents,
        externalRef: `agenda-${plan}`
      }],
      amount: planInfo.amountCents,
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
        plan
      }),
      traceable: false,
      externalRef: `${userId}:${plan}:${Date.now()}`,
      postbackUrl,
      paymentMethod: "PIX"
    })
  });
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(raw?.message ?? "Não foi possível gerar o PIX na AtivoPay.");
  }
  const payment = readPaymentData(raw);
  const pix = payment.pix && typeof payment.pix === "object" ? payment.pix : {};
  const copyPaste = pickText(pix.qrcode) ?? pickText(payment.qrCode) ?? pickText(payment.copyPaste);
  const qrCode = copyPaste ? await QRCode.toDataURL(copyPaste, {
    margin: 1,
    width: 280
  }) : pickText(payment.qrCode);
  const {
    data: inserted,
    error
  } = await supabaseAdmin.from("payment_transactions").insert({
    account_id: userId,
    plan,
    amount_cents: planInfo.amountCents,
    status: normalizeStatus(payment.status),
    ativopay_transaction_id: pickText(payment.id),
    copy_paste: copyPaste,
    qr_code: qrCode,
    pay_url: pickText(payment.payUrl) ?? pickText(payment.webUrl) ?? pickText(payment.appUrl),
    expires_at: pickText(pix.expirationDate) ?? null,
    raw_response: raw
  }).select("id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at").single();
  if (error) throw new Error(error.message);
  return inserted;
});
export {
  createPixPayment_createServerFn_handler,
  getBillingSetup_createServerFn_handler,
  listMyPayments_createServerFn_handler
};
