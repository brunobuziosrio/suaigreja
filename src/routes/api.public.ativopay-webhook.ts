import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing-plans";
import { resolveAtivoPayWebhookSecret } from "@/lib/admin-payment-settings.functions";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function readData(payload: Record<string, unknown>) {
  return payload.data && typeof payload.data === "object"
    ? (payload.data as Record<string, unknown>)
    : payload;
}

function normalizeStatus(status: unknown) {
  return String(status ?? "pending").toLowerCase();
}

function isPaidStatus(status: string) {
  return ["paid", "authorized"].includes(status.toLowerCase());
}

function readMetadata(value: unknown) {
  if (!value) return null;
  if (typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

async function activateSubscription(accountId: string, plan: BillingPlanId, paidAt?: string | null) {
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
    p_metadata: { source: "ativopay_webhook", transaction_id: transactionDbId },
  });
  if (error) throw new Error(error.message);
}

export const Route = createFileRoute("/api/public/ativopay-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const expectedSecret = await resolveAtivoPayWebhookSecret();
        if (!expectedSecret) return json({ error: "webhook not configured" }, 500);
        const received = request.headers.get("x-webhook-secret");
        if (received !== expectedSecret) return json({ error: "unauthorized" }, 401);

        const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!payload || typeof payload !== "object") return json({ error: "invalid payload" }, 400);

        const data = readData(payload);
        const transactionId = typeof data.id === "string" ? data.id : typeof payload.objectId === "string" ? payload.objectId : null;
        if (!transactionId) return json({ error: "missing transaction id" }, 400);

        const status = normalizeStatus(data.status);
        const paidAt = typeof data.paidAt === "string" ? data.paidAt : null;
        const metadata = readMetadata(data.metadata);
        const metadataAccountId = typeof metadata?.accountId === "string" ? metadata.accountId : null;
        const metadataPlan =
          typeof metadata?.plan === "string" && metadata.plan in BILLING_PLANS
            ? (metadata.plan as BillingPlanId)
            : null;
        const metadataKind =
          metadata?.kind === "product"
            ? "product"
            : metadata?.kind === "event_registration"
            ? "event_registration"
            : metadata?.kind === "whatsapp_credits"
            ? "whatsapp_credits"
            : "subscription";

        const { data: tx, error: txError } = await supabaseAdmin
          .from("payment_transactions")
          .select("id, account_id, plan, kind, product_id, amount_cents, status")
          .eq("ativopay_transaction_id", transactionId)
          .maybeSingle();
        if (txError) throw new Error(txError.message);

        // Require a matching transaction row — never trust account info from request metadata alone
        if (!tx) return json({ error: "unknown transaction" }, 404);
        const accountId = tx.account_id;
        const kind = tx.kind ?? metadataKind;
        if (!accountId) return json({ ok: true, ignored: true });
        void metadataAccountId;

        const { error: updateError } = await supabaseAdmin
          .from("payment_transactions")
          .update({ status, paid_at: paidAt, webhook_payload: payload as never })
          .eq("ativopay_transaction_id", transactionId);
        if (updateError) throw new Error(updateError.message);

        if (isPaidStatus(status)) {
          if (kind === "product" && tx?.id) {
            await markProductPurchasePaid(tx.id, paidAt);
          } else if (kind === "event_registration" && tx?.id) {
            await markEventRegistrationPaid(tx.id, paidAt);
          } else if (kind === "whatsapp_credits" && tx?.id) {
            await markWhatsappCreditPurchasePaid(tx.id, paidAt);
          } else {
            const plan = (tx?.plan ?? metadataPlan) as BillingPlanId | null;
            if (plan) {
              const expected = BILLING_PLANS[plan]?.amountCents;
              if (!expected || tx.amount_cents !== expected) {
                return json({ error: "transaction amount does not match plan" }, 409);
              }
              if (!isPaidStatus(tx.status ?? "")) {
                await activateSubscription(accountId, plan, paidAt);
              }
            }
          }
        }

        return json({ ok: true });
      },
    },
  },
});
