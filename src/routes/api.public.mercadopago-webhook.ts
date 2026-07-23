import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing-plans";
import { resolveMercadoPagoAccessToken } from "@/lib/admin-payment-settings.functions";
import { validateMercadoPagoWebhookSignature } from "@/lib/mercadopago-webhook-signature.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function readPaymentId(payload: Record<string, unknown> | null, url: URL) {
  return (
    (payload?.data as Record<string, unknown> | undefined)?.id ??
    payload?.id ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id")
  );
}

function mapMercadoPagoStatus(status: string) {
  if (status === "approved") return "paid";
  if (["rejected", "cancelled", "canceled"].includes(status)) return "failed";
  return "pending";
}

async function verifyPayment(paymentId: string, accessToken: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const verified = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !verified) throw new Error("could not verify payment");
  return verified;
}

async function activateSubscription(accountId: string, plan: BillingPlanId, paidAt: string | null) {
  const paidDate = paidAt ? new Date(paidAt) : new Date();
  const { data: account, error: accountError } = await supabaseAdmin
    .from("accounts")
    .select("subscription_ends_at")
    .eq("id", accountId)
    .maybeSingle();
  if (accountError) throw new Error(accountError.message);

  const currentEnd = account?.subscription_ends_at ? new Date(account.subscription_ends_at) : null;
  const base = currentEnd && currentEnd.getTime() > paidDate.getTime() ? currentEnd : paidDate;
  const endsAt = new Date(base);
  endsAt.setDate(endsAt.getDate() + BILLING_PLANS[plan].durationDays);

  const { error } = await supabaseAdmin
    .from("accounts")
    .update({
      current_plan: plan,
      plan_tier: BILLING_PLANS[plan].tier,
      subscription_status: "active",
      subscription_ends_at: endsAt.toISOString(),
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
}

async function markProductPurchasePaid(transactionDbId: string, paidAt: string | null) {
  const { error } = await supabaseAdmin
    .from("product_purchases")
    .update({ status: "paid", purchased_at: paidAt ?? new Date().toISOString() })
    .eq("transaction_id", transactionDbId);
  if (error) throw new Error(error.message);
}

async function markEventRegistrationPaid(transactionDbId: string, paidAt: string | null) {
  const { error } = await supabaseAdmin
    .from("event_registrations")
    .update({ status: "paid", paid_at: paidAt ?? new Date().toISOString() })
    .eq("transaction_id", transactionDbId);
  if (error) throw new Error(error.message);
}

async function markWhatsappCreditPurchasePaid(transactionDbId: string, paidAt: string | null) {
  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("whatsapp_credit_purchases")
    .update({ status: "paid", paid_at: paidAt ?? new Date().toISOString() })
    .eq("transaction_id", transactionDbId)
    .select("id")
    .maybeSingle();
  if (purchaseError) throw new Error(purchaseError.message);
  if (!purchase?.id) throw new Error("Compra de créditos WhatsApp não encontrada.");

  const { error } = await supabaseAdmin.rpc("complete_whatsapp_credit_purchase", {
    p_purchase_id: purchase.id,
    p_metadata: { source: "mercadopago_webhook", transaction_id: transactionDbId },
  });
  if (error) throw new Error(error.message);
}

async function handleDonationWebhook(
  accountId: string,
  paymentId: string,
  payload: Record<string, unknown> | null,
) {
  const { data: connection, error: connError } = await supabaseAdmin
    .from("mercadopago_connections")
    .select("access_token")
    .eq("account_id", accountId)
    .maybeSingle();
  if (connError) throw new Error(connError.message);
  if (!connection) return json({ error: "unknown account" }, 404);

  const verified = await verifyPayment(paymentId, connection.access_token);
  const status = String(verified.status ?? "pending");
  const newStatus = mapMercadoPagoStatus(status);
  const dateApproved = typeof verified.date_approved === "string" ? verified.date_approved : null;

  const { data: donation, error: donationError } = await supabaseAdmin
    .from("donations")
    .select("id, status")
    .eq("mercadopago_payment_id", paymentId)
    .eq("account_id", accountId)
    .maybeSingle();
  if (donationError) throw new Error(donationError.message);
  if (!donation) return json({ ok: true, ignored: true });

  const { error: updateError } = await supabaseAdmin
    .from("donations")
    .update({
      status: newStatus,
      paid_at: newStatus === "paid" ? dateApproved ?? new Date().toISOString() : null,
      webhook_payload: (payload ?? {}) as never,
    })
    .eq("id", donation.id);
  if (updateError) throw new Error(updateError.message);

  return json({ ok: true });
}

async function handlePlatformWebhook(paymentId: string, payload: Record<string, unknown> | null) {
  const accessToken = await resolveMercadoPagoAccessToken();
  if (!accessToken) return json({ error: "platform Mercado Pago not configured" }, 500);

  const verified = await verifyPayment(paymentId, accessToken);
  const status = String(verified.status ?? "pending");
  const newStatus = mapMercadoPagoStatus(status);
  const paidAt = typeof verified.date_approved === "string" ? verified.date_approved : null;

  const { data: tx, error: txError } = await supabaseAdmin
    .from("payment_transactions")
    .select("id, account_id, plan, kind, amount_cents, status")
    .eq("mercadopago_payment_id", paymentId)
    .maybeSingle();
  if (txError) throw new Error(txError.message);
  if (!tx) return json({ error: "unknown transaction" }, 404);

  let paymentUpdate = supabaseAdmin
    .from("payment_transactions")
    .update({
      status: newStatus,
      paid_at: newStatus === "paid" ? paidAt ?? new Date().toISOString() : null,
      webhook_payload: (payload ?? {}) as never,
    })
    .eq("id", tx.id);
  if (newStatus === "paid") paymentUpdate = paymentUpdate.neq("status", "paid");

  const { data: updatedTransactions, error: updateError } = await paymentUpdate.select("id");
  if (updateError) throw new Error(updateError.message);

  if (newStatus !== "paid" || updatedTransactions.length === 0) return json({ ok: true });

  const kind = tx.kind ?? "subscription";
  if (kind === "product") {
    await markProductPurchasePaid(tx.id, paidAt);
  } else if (kind === "event_registration") {
    await markEventRegistrationPaid(tx.id, paidAt);
  } else if (kind === "whatsapp_credits") {
    await markWhatsappCreditPurchasePaid(tx.id, paidAt);
  } else {
    const plan = tx.plan as BillingPlanId | null;
    if (plan && plan in BILLING_PLANS) {
      const expected = BILLING_PLANS[plan].amountCents;
      if (tx.amount_cents !== expected) return json({ error: "transaction amount does not match plan" }, 409);
      await activateSubscription(tx.account_id, plan, paidAt);
    }
  }

  return json({ ok: true });
}

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        const rawPaymentId = readPaymentId(payload, url);
        if (!rawPaymentId) return json({ error: "missing payment id" }, 400);
        const paymentId = String(rawPaymentId);

        const signature = validateMercadoPagoWebhookSignature({
          xSignature: request.headers.get("x-signature"),
          xRequestId: request.headers.get("x-request-id"),
          dataId: paymentId,
          secret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
        });
        if (!signature.ok) {
          const status = signature.reason === "not_configured" ? 503 : 401;
          return json({ error: "invalid webhook signature" }, status);
        }

        const accountId = url.searchParams.get("account_id");
        if (accountId) return handleDonationWebhook(accountId, paymentId, payload);

        return handlePlatformWebhook(paymentId, payload);
      },
    },
  },
});
