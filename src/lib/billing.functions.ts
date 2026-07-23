import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  BILLING_PLANS,
  getPurchasablePlan,
  type BillingPlanId,
} from "@/lib/billing-plans";
import {
  buildMercadoPagoPlatformNotificationUrl,
  resolveMercadoPagoAccessToken,
} from "@/lib/admin-payment-settings.functions";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";
import { createMercadoPagoPixPayment } from "@/lib/mercadopago-payments.server";
import { getPlatformPaymentLabel } from "@/lib/platform-payment-label.server";
import { createPixPaymentInputSchema } from "@/lib/billing-purchase-schema.server";

async function getMercadoPagoAccessToken() {
  const key = await resolveMercadoPagoAccessToken();
  if (!key) {
    throw new Error(
      "O access token do Mercado Pago ainda não foi configurado. Configure em Configurações > Plataforma.",
    );
  }
  return key;
}

async function activateSubscription(
  accountId: string,
  plan: BillingPlanId,
  paidAt?: string | null,
) {
  const planInfo = BILLING_PLANS[plan];
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
  endsAt.setDate(endsAt.getDate() + planInfo.durationDays);

  const { error } = await supabaseAdmin
    .from("accounts")
    .update({
      current_plan: plan,
      plan_tier: planInfo.tier,
      subscription_status: "active",
      subscription_ends_at: endsAt.toISOString(),
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
}

export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "view");
    const { data, error } = await supabase
      .from("payment_transactions")
      .select(
        "id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at",
      )
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBillingSetup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "view");
    const { data, error } = await supabase
      .from("accounts")
      .select("current_plan, plan_tier, subscription_status, subscription_ends_at, trial_ends_at")
      .eq("id", accountId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { account: data, hasMercadoPagoAccessToken: !!(await resolveMercadoPagoAccessToken()) };
  });

export const createPixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => createPixPaymentInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { claims } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    const plan = data.plan;
    const planInfo = getPurchasablePlan(plan);

    const { data: existingPending, error: pendingError } = await supabaseAdmin
      .from("payment_transactions")
      .select(
        "id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at",
      )
      .eq("account_id", accountId)
      .eq("plan", plan)
      .in("status", ["pending", "waiting_payment"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pendingError) throw new Error(pendingError.message);
    if (
      existingPending &&
      (!existingPending.expires_at || new Date(existingPending.expires_at).getTime() > Date.now())
    ) {
      return existingPending;
    }

    const customerEmail = typeof claims.email === "string" ? claims.email : "cliente@email.com";
    const customerName =
      typeof claims.user_metadata === "object" &&
      claims.user_metadata &&
      "name" in claims.user_metadata
        ? String(claims.user_metadata.name)
        : "Cliente";

    const payment = await createMercadoPagoPixPayment({
      accessToken: await getMercadoPagoAccessToken(),
      amountCents: planInfo.amountCents,
    description: getPlatformPaymentLabel(),
      payerEmail: customerEmail,
      payerName: customerName,
      notificationUrl: buildMercadoPagoPlatformNotificationUrl(getRequestHost()),
      externalReference: `${accountId}:${plan}:${Date.now()}`,
      idempotencyKey: `subscription:${accountId}:${plan}:${Date.now()}`,
      metadata: { account_id: accountId, kind: "subscription", plan },
    });

    const { data: inserted, error } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        account_id: accountId,
        plan,
        amount_cents: planInfo.amountCents,
        status: payment.status,
        mercadopago_payment_id: payment.id || null,
        copy_paste: payment.copyPaste,
        qr_code: payment.qrCode,
        pay_url: payment.payUrl,
        expires_at: payment.expiresAt,
        raw_response: payment.raw as never,
      })
      .select(
        "id, plan, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, paid_at, created_at",
      )
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });
