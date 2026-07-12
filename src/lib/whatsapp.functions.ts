/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @modified 2026-06-15
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildMercadoPagoPlatformNotificationUrl,
  resolveMercadoPagoAccessToken,
} from "@/lib/admin-payment-settings.functions";
import { createMercadoPagoPixPayment } from "@/lib/mercadopago-payments.server";
import {
  createWhatsappMessageId,
  refundWhatsappMessageCredits,
  reserveWhatsappCredits,
} from "@/lib/whatsapp-credits.server";
import {
  appendWhatsappOptOutNotice,
  hasWhatsappOptedOut,
  normalizeWhatsappPhone,
} from "@/lib/whatsapp-consent.server";

const MSG_KINDS = [
  "birthday",
  "event_reminder",
  "welcome",
  "manual",
  "culto_reminder",
  "celula_reminder",
  "prayer_request",
  "tithe_reminder",
  "newsletter",
] as const;

const SettingsInput = z.object({
  enabled: z.boolean(),
  send_hour_brt: z.number().int().min(0).max(23),
  sender_name: z.string().max(80).nullable(),
  birthday_enabled: z.boolean(),
  birthday_template: z.string().min(10).max(800),
  welcome_enabled: z.boolean(),
  welcome_template: z.string().min(10).max(800),
  culto_reminder_enabled: z.boolean(),
  culto_reminder_template: z.string().min(10).max(800),
  celula_reminder_enabled: z.boolean(),
  celula_reminder_template: z.string().min(10).max(800),
  prayer_request_enabled: z.boolean(),
  prayer_request_template: z.string().min(10).max(800),
  tithe_reminder_enabled: z.boolean(),
  tithe_reminder_template: z.string().min(10).max(800),
  newsletter_enabled: z.boolean(),
  newsletter_template: z.string().min(10).max(800),
});

const CreditPackageInput = z.object({ package_id: z.string().uuid() });
const DeleteQueuedMessageInput = z.object({ id: z.string().uuid() });
const EnqueueMessageInput = z.object({
  phone: z.string().min(10).max(20),
  recipient_name: z.string().max(200).nullable().optional(),
  content: z.string().min(1).max(800),
  kind: z.enum(MSG_KINDS),
  member_id: z.string().uuid().nullable().optional(),
});

type WhatsappCountRow = {
  status: string;
  kind: string;
};

type WhatsappPeriodMessage = WhatsappCountRow & {
  cost_credits: number | null;
  credit_refunded_at: string | null;
  provider_delivery_status: string | null;
};

type WhatsappAnalytics = {
  total: number;
  reservedCredits: number;
  netCredits: number;
  byStatus: Record<string, number>;
  byKind: Record<string, number>;
  byDelivery: Record<string, number>;
};

async function getMercadoPagoAccessToken() {
  const key = await resolveMercadoPagoAccessToken();
  if (!key) throw new Error("O access token do Mercado Pago ainda não foi configurado.");
  return key;
}

function normalizeStatus(status: unknown) {
  return String(status ?? "pending").toLowerCase();
}

export const getWhatsappData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "whatsapp", "view");
    const { supabase } = context;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [
      { data: settings },
      { data: packages },
      { data: purchases },
      { data: recent },
      { data: counts },
      { data: periodMessages },
    ] = await Promise.all([
      supabase.from("whatsapp_settings").select("*").eq("account_id", accountId).maybeSingle(),
      supabase.from("whatsapp_packages").select("*").eq("active", true).order("sort_order"),
      supabase
        .from("whatsapp_credit_purchases")
        .select("id, package_id, message_count, amount_cents, status, paid_at, created_at")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("whatsapp_messages")
        .select(
          "id, kind, phone, recipient_name, content, status, scheduled_for, sent_at, delivered_at, read_at, provider_delivery_status, provider_status_at, error_message, cost_credits, credit_reserved_at, credit_refunded_at, created_at",
        )
        .eq("account_id", accountId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("whatsapp_messages").select("status, kind").eq("account_id", accountId),
      supabase
        .from("whatsapp_messages")
        .select(
          "status, kind, cost_credits, credit_refunded_at, provider_delivery_status, created_at",
        )
        .eq("account_id", accountId)
        .gte("created_at", thirtyDaysAgo),
    ]);

    const totals = ((counts ?? []) as WhatsappCountRow[]).reduce(
      (acc: Record<string, number>, m) => {
        acc[m.status] = (acc[m.status] ?? 0) + 1;
        acc[`kind_${m.kind}`] = (acc[`kind_${m.kind}`] ?? 0) + 1;
        acc.total = (acc.total ?? 0) + 1;
        return acc;
      },
      { total: 0 },
    );

    const analytics = ((periodMessages ?? []) as WhatsappPeriodMessage[]).reduce(
      (acc: WhatsappAnalytics, message) => {
        acc.total += 1;
        acc.reservedCredits += Number(message.cost_credits ?? 0);
        if (!message.credit_refunded_at) acc.netCredits += Number(message.cost_credits ?? 0);
        acc.byStatus[message.status] = (acc.byStatus[message.status] ?? 0) + 1;
        acc.byKind[message.kind] = (acc.byKind[message.kind] ?? 0) + 1;
        if (message.provider_delivery_status) {
          acc.byDelivery[message.provider_delivery_status] =
            (acc.byDelivery[message.provider_delivery_status] ?? 0) + 1;
        }
        return acc;
      },
      {
        total: 0,
        reservedCredits: 0,
        netCredits: 0,
        byStatus: {},
        byKind: {},
        byDelivery: {},
      },
    );

    return {
      settings: settings ?? null,
      packages: packages ?? [],
      purchases: purchases ?? [],
      recent: recent ?? [],
      totals,
      analytics,
    };
  });

export const createWhatsappCreditPixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => CreditPackageInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "whatsapp", "manage");
    const { claims } = context;

    const { data: pack, error: packageError } = await supabaseAdmin
      .from("whatsapp_packages")
      .select("id, name, message_count, price_cents, active")
      .eq("id", data.package_id)
      .eq("active", true)
      .maybeSingle();
    if (packageError) throw new Error(packageError.message);
    if (!pack) throw new Error("Pacote de créditos não encontrado.");

    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("whatsapp_credit_purchases")
      .insert({
        account_id: accountId,
        package_id: pack.id,
        message_count: pack.message_count,
        amount_cents: pack.price_cents,
        status: "pending",
      })
      .select("id")
      .single();
    if (purchaseError) throw new Error(purchaseError.message);

    const customerEmail = typeof claims.email === "string" ? claims.email : "cliente@email.com";
    const customerName =
      typeof claims.user_metadata === "object" &&
      claims.user_metadata &&
      "name" in claims.user_metadata
        ? String(claims.user_metadata.name)
        : "Cliente";

    let payment: Awaited<ReturnType<typeof createMercadoPagoPixPayment>>;
    try {
      payment = await createMercadoPagoPixPayment({
        accessToken: await getMercadoPagoAccessToken(),
        amountCents: pack.price_cents,
        description: `Créditos WhatsApp - ${pack.name}`,
        payerEmail: customerEmail,
        payerName: customerName,
        notificationUrl: buildMercadoPagoPlatformNotificationUrl(getRequestHost()),
        externalReference: `${accountId}:whatsapp:${purchase.id}`,
        idempotencyKey: `whatsapp:${accountId}:${purchase.id}`,
        metadata: {
          account_id: accountId,
          kind: "whatsapp_credits",
          purchase_id: purchase.id,
        },
      });
    } catch (error) {
      await supabaseAdmin
        .from("whatsapp_credit_purchases")
        .update({ status: "failed" })
        .eq("id", purchase.id)
        .eq("account_id", accountId);
      throw error;
    }

    const { data: tx, error: txError } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        account_id: accountId,
        plan: null,
        kind: "whatsapp_credits",
        amount_cents: pack.price_cents,
        status: normalizeStatus(payment.status),
        mercadopago_payment_id: payment.id || null,
        copy_paste: payment.copyPaste,
        qr_code: payment.qrCode,
        pay_url: payment.payUrl,
        expires_at: payment.expiresAt,
        raw_response: payment.raw as never,
      })
      .select("id, amount_cents, status, copy_paste, pay_url, qr_code, expires_at, created_at")
      .single();
    if (txError) throw new Error(txError.message);

    const { error: linkError } = await supabaseAdmin
      .from("whatsapp_credit_purchases")
      .update({ transaction_id: tx.id })
      .eq("id", purchase.id)
      .eq("account_id", accountId);
    if (linkError) throw new Error(linkError.message);

    return {
      ...tx,
      purchase_id: purchase.id,
      package_name: pack.name,
      message_count: pack.message_count,
    };
  });

export const upsertWhatsappSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => SettingsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "whatsapp", "manage");
    const { supabase } = context;
    const { error } = await supabase
      .from("whatsapp_settings")
      .upsert({ account_id: accountId, ...data }, { onConflict: "account_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteQueuedWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => DeleteQueuedMessageInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "whatsapp", "delete");
    const { supabase } = context;
    const { data: message } = await supabase
      .from("whatsapp_messages")
      .select("id, account_id, status, credit_refunded_at")
      .eq("id", data.id)
      .eq("account_id", accountId)
      .eq("status", "queued")
      .maybeSingle();

    if (!message) throw new Error("Mensagem não encontrada na fila.");

    if (!message.credit_refunded_at) {
      const refund = await refundWhatsappMessageCredits({
        supabase,
        accountId,
        messageId: data.id,
        idempotencyKey: `refund:delete:${data.id}`,
        metadata: { reason: "queued_message_deleted" },
      });
      if (!refund.ok) throw new Error("Não foi possível estornar os créditos desta mensagem.");
    }

    const { error } = await supabase
      .from("whatsapp_messages")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId)
      .eq("status", "queued");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const enqueueWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => EnqueueMessageInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "whatsapp", "create");
    const { supabase } = context;

    const { data: settings } = await supabase
      .from("whatsapp_settings")
      .select("enabled")
      .eq("account_id", accountId)
      .maybeSingle();

    if (!settings?.enabled) throw new Error("WhatsApp não está ativado nas configurações gerais.");

    const phone = normalizeWhatsappPhone(data.phone);
    if (phone.length < 10)
      throw new Error("Número de telefone inválido (mínimo 10 dígitos com DDD).");
    if (await hasWhatsappOptedOut({ supabase, accountId, phone })) {
      throw new Error("Este número retirou o consentimento para receber WhatsApp.");
    }

    const messageId = createWhatsappMessageId();
    const reservation = await reserveWhatsappCredits({
      supabase,
      accountId,
      messageId,
      costCredits: 1,
      idempotencyKey: `reserve:manual:${messageId}`,
      metadata: { kind: data.kind, source: "manual_enqueue" },
    });

    if (!reservation.ok) {
      if (reservation.reason === "insufficient_credits") {
        throw new Error("Créditos insuficientes. Adquira mais créditos para continuar.");
      }
      throw new Error("Não foi possível reservar créditos para esta mensagem.");
    }

    const { error } = await supabase.from("whatsapp_messages").insert({
      id: messageId,
      account_id: accountId,
      member_id: data.member_id ?? null,
      kind: data.kind,
      phone,
      recipient_name: data.recipient_name ?? null,
      content: appendWhatsappOptOutNotice(data.content),
      status: "queued",
      scheduled_for: new Date().toISOString(),
      cost_credits: 1,
      credit_reserved_at: new Date().toISOString(),
    });

    if (error) {
      await refundWhatsappMessageCredits({
        supabase,
        accountId,
        messageId,
        idempotencyKey: `refund:insert_failed:${messageId}`,
        metadata: { error: error.message, source: "manual_enqueue" },
      });
      throw new Error(error.message);
    }
    return { ok: true };
  });
