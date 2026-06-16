import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing-plans";
import QRCode from "qrcode";
import { z } from "zod";

const ATIVOPAY_BASE_URL = "https://api-gateway.ativopay.com";

function getAtivoPayKey() {
  const key = process.env.ATIVOPAY_API_KEY;
  if (!key) {
    throw new Error("A chave da AtivoPay ainda não foi configurada. Adicione ATIVOPAY_API_KEY para gerar cobranças reais.");
  }
  return key;
}

function readPaymentData(raw: unknown) {
  const payload = raw as { data?: Record<string, unknown> } & Record<string, unknown>;
  return (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
}

function pickText(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeStatus(status: unknown) {
  return String(status ?? "pending").toLowerCase();
}

function isPaidStatus(status: string) {
  return ["paid", "authorized"].includes(status.toLowerCase());
}

async function activateSubscription(accountId: string, plan: BillingPlanId, paidAt?: string | null) {
  const planInfo = BILLING_PLANS[plan];
  const base = paidAt ? new Date(paidAt) : new Date();
  const endsAt = new Date(base);
  endsAt.setDate(endsAt.getDate() + planInfo.durationDays);

  const { error } = await supabaseAdmin
    .from("accounts")
    .update({
      current_plan: plan,
      subscription_status: "active",
      subscription_ends_at: endsAt.toISOString(),
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
}

export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at")
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBillingSetup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("accounts")
      .select("current_plan, subscription_status, subscription_ends_at, trial_ends_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { account: data, hasAtivoPayKey: !!process.env.ATIVOPAY_API_KEY };
  });

export const createPixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ plan: z.enum(["monthly", "annual"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const plan = data.plan as BillingPlanId;
    const planInfo = BILLING_PLANS[plan];
    const host = getRequestHost();
    const protocol = host?.includes("localhost") ? "http" : "https";
    const postbackUrl = `${protocol}://${host}/api/public/ativopay-webhook`;
    const customerEmail = typeof claims.email === "string" ? claims.email : "cliente@email.com";
    const customerName = typeof claims.user_metadata === "object" && claims.user_metadata && "name" in claims.user_metadata
      ? String(claims.user_metadata.name)
      : "Cliente";

    const response = await fetch(`${ATIVOPAY_BASE_URL}/api/user/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AtivoB2B/1.0",
        "x-api-key": getAtivoPayKey(),
      },
      body: JSON.stringify({
        pix: { expiresInDays: 1 },
        items: [
          {
            title: `Agenda Religiosa - Plano ${planInfo.label}`,
            quantity: 1,
            tangible: false,
            unitPrice: planInfo.amountCents,
            externalRef: `agenda-${plan}`,
          },
        ],
        amount: planInfo.amountCents,
        currency: "BRL",
        customer: {
          name: customerName,
          email: customerEmail,
          phone: "11999999999",
          document: { type: "CPF", number: "00000000000" },
        },
        metadata: JSON.stringify({ accountId: userId, plan }),
        traceable: false,
        externalRef: `${userId}:${plan}:${Date.now()}`,
        postbackUrl,
        paymentMethod: "PIX",
      }),
    });

    const raw = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error((raw as { message?: string } | null)?.message ?? "Não foi possível gerar o PIX na AtivoPay.");
    }

    const payment = readPaymentData(raw);
    const pix = (payment.pix && typeof payment.pix === "object" ? payment.pix : {}) as Record<string, unknown>;
    const copyPaste = pickText(pix.qrcode) ?? pickText(payment.qrCode) ?? pickText(payment.copyPaste);
    const qrCode = copyPaste ? await QRCode.toDataURL(copyPaste, { margin: 1, width: 280 }) : pickText(payment.qrCode);

    const { data: inserted, error } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        account_id: userId,
        plan,
        amount_cents: planInfo.amountCents,
        status: normalizeStatus(payment.status),
        ativopay_transaction_id: pickText(payment.id),
        copy_paste: copyPaste,
        qr_code: qrCode,
        pay_url: pickText(payment.payUrl) ?? pickText(payment.webUrl) ?? pickText(payment.appUrl),
        expires_at: pickText(pix.expirationDate) ?? null,
        raw_response: raw as never,
      })
      .select("id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });