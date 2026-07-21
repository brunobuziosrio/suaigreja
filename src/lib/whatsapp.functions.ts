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
import { requireModuleAccess } from "@/lib/plan-access";
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
  type WhatsappConsentClient,
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
const ConversationIdInput = z.object({ conversation_id: z.string().uuid() });
const ReplyToConversationInput = ConversationIdInput.extend({
  content: z.string().min(1).max(800),
});
const CampaignPreviewInput = z.object({
  statuses: z.array(z.enum(["ativo", "inativo", "visitante"])).min(1).max(3).default(["ativo"]),
  group_id: z.string().uuid().nullable().optional(),
  spiritual_stage: z.enum(["novo_convertido", "em_acompanhamento", "batizado", "serve", "lider"]).nullable().optional(),
  limit: z.number().int().min(1).max(2000).default(1000),
});
const CampaignEnqueueInput = CampaignPreviewInput.extend({
  content: z.string().min(10).max(800),
  confirmed: z.literal(true),
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
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
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
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
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
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
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
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
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
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
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
    if (await hasWhatsappOptedOut({ supabase: supabase as unknown as WhatsappConsentClient, accountId, phone })) {
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

// Prévia sem criar mensagens: permite à equipe revisar alcance e custo antes
// de qualquer campanha. Só inclui contatos com consentimento registrado.
export const previewWhatsappCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => CampaignPreviewInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "create");
    const { supabase } = context;
    const group = data.group_id
      ? await supabase.from("small_groups" as never).select("id").eq("id", data.group_id).eq("account_id", accountId).maybeSingle()
      : null;
    if (group?.error) throw new Error(group.error.message);
    if (data.group_id && !group?.data) throw new Error("Grupo não encontrado nesta comunidade.");
    const groupMemberIds = data.group_id
      ? (await supabase.from("small_group_members" as never).select("member_id").eq("group_id", data.group_id)).data?.map((row: { member_id: string }) => row.member_id) ?? []
      : null;
    if (groupMemberIds && groupMemberIds.length === 0) return { enabled: false, eligibleCount: 0, estimatedCredits: 0, availableCredits: 0, hasEnoughCredits: false, sample: [] };
    let memberQuery = supabase.from("members").select("id, full_name, phone").eq("account_id", accountId).eq("whatsapp_consent", true).in("status", data.statuses).not("phone", "is", null).limit(data.limit);
    if (groupMemberIds) memberQuery = memberQuery.in("id", groupMemberIds);
    if (data.spiritual_stage) memberQuery = memberQuery.eq("spiritual_stage", data.spiritual_stage);
    const [{ data: members, error: membersError }, { data: settings, error: settingsError }] = await Promise.all([memberQuery, supabase.from("whatsapp_settings").select("enabled, credits_balance").eq("account_id", accountId).maybeSingle()]);
    if (membersError) throw new Error(membersError.message);
    if (settingsError) throw new Error(settingsError.message);
    const candidates = (members ?? [])
      .map((member) => ({ member, phone: normalizeWhatsappPhone(member.phone ?? "") }))
      .filter(({ phone }) => phone.length >= 12);
    const optedOutPhones = new Set<string>();
    for (let start = 0; start < candidates.length; start += 200) {
      const phones = candidates.slice(start, start + 200).map(({ phone }) => phone);
      const { data: optOuts, error: optOutsError } = await supabase
        .from("whatsapp_opt_outs")
        .select("phone_normalized")
        .eq("account_id", accountId)
        .in("phone_normalized", phones);
      if (optOutsError) throw new Error(optOutsError.message);
      for (const optOut of optOuts ?? []) optedOutPhones.add(optOut.phone_normalized);
    }
    const eligible = candidates
      .filter(({ phone }) => !optedOutPhones.has(phone))
      .map(({ member }) => member);
    return {
      enabled: !!settings?.enabled,
      eligibleCount: eligible.length,
      estimatedCredits: eligible.length,
      availableCredits: settings?.credits_balance ?? 0,
      hasEnoughCredits: (settings?.credits_balance ?? 0) >= eligible.length,
      sample: eligible.slice(0, 8).map((member) => ({ id: member.id, name: member.full_name, phone: member.phone })),
    };
  });

export const listWhatsappCampaignGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "view");
    const { data, error } = await context.supabase
      .from("small_groups" as never)
      .select("id,name")
      .eq("account_id", accountId)
      .eq("active", true)
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ id: string; name: string }>;
  });

export const listWhatsappCampaignMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "view");
    const { data: campaigns, error } = await context.supabase
      .from("whatsapp_campaigns")
      .select("id,title,requested_count,queued_count,created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    const rows = (campaigns ?? []) as Array<{ id: string; title: string; requested_count: number; queued_count: number; created_at: string }>;
    if (!rows.length) return [];
    const { data: messages, error: messagesError } = await context.supabase
      .from("whatsapp_messages")
      .select("campaign_id,status,provider_delivery_status,delivered_at,read_at")
      .eq("account_id", accountId)
      .in("campaign_id", rows.map((row) => row.id));
    if (messagesError) throw new Error(messagesError.message);
    return rows.map((campaign) => {
      const campaignMessages = ((messages ?? []) as Array<{ campaign_id: string | null; status: string; provider_delivery_status: string | null; delivered_at: string | null; read_at: string | null }>).filter((message) => message.campaign_id === campaign.id);
      return {
        ...campaign,
        sent: campaignMessages.filter((message) => message.status === "sent").length,
        failed: campaignMessages.filter((message) => message.status === "failed").length,
        delivered: campaignMessages.filter((message) => message.delivered_at || message.provider_delivery_status === "delivered").length,
        read: campaignMessages.filter((message) => message.read_at || message.provider_delivery_status === "read").length,
      };
    });
  });

export const enqueueWhatsappCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => CampaignEnqueueInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "create");
    const { supabase } = context;
    const { data: settings, error: settingsError } = await supabase
      .from("whatsapp_settings").select("enabled, credits_balance").eq("account_id", accountId).maybeSingle();
    if (settingsError) throw new Error(settingsError.message);
    if (!settings?.enabled) throw new Error("WhatsApp não está ativado nas configurações gerais.");
    const group = data.group_id
      ? await supabase.from("small_groups" as never).select("id").eq("id", data.group_id).eq("account_id", accountId).maybeSingle()
      : null;
    if (group?.error) throw new Error(group.error.message);
    if (data.group_id && !group?.data) throw new Error("Grupo não encontrado nesta comunidade.");
    const groupMemberIds = data.group_id
      ? (await supabase.from("small_group_members" as never).select("member_id").eq("group_id", data.group_id)).data?.map((row: { member_id: string }) => row.member_id) ?? []
      : null;
    if (groupMemberIds && groupMemberIds.length === 0) throw new Error("Este grupo não possui membros elegíveis.");
    let memberQuery = supabase.from("members").select("id,full_name,phone").eq("account_id", accountId).eq("whatsapp_consent", true).in("status", data.statuses).not("phone", "is", null).limit(data.limit);
    if (groupMemberIds) memberQuery = memberQuery.in("id", groupMemberIds);
    if (data.spiritual_stage) memberQuery = memberQuery.eq("spiritual_stage", data.spiritual_stage);
    const { data: members, error: membersError } = await memberQuery;
    if (membersError) throw new Error(membersError.message);
    const candidates = ((members ?? []) as Array<{ id: string; full_name: string; phone: string | null }>)
      .flatMap((member) => {
        const phone = normalizeWhatsappPhone(member.phone ?? "");
        return phone.length >= 12 ? [{ ...member, phone }] : [];
      });
    const optedOutPhones = new Set<string>();
    for (let start = 0; start < candidates.length; start += 200) {
      const phones = candidates.slice(start, start + 200).map(({ phone }) => phone);
      const { data: optOuts, error: optOutsError } = await supabase
        .from("whatsapp_opt_outs")
        .select("phone_normalized")
        .eq("account_id", accountId)
        .in("phone_normalized", phones);
      if (optOutsError) throw new Error(optOutsError.message);
      for (const optOut of optOuts ?? []) optedOutPhones.add(optOut.phone_normalized);
    }
    const eligible = candidates.filter(({ phone }) => !optedOutPhones.has(phone));
    if (eligible.length === 0) throw new Error("Nenhum contato elegível com consentimento.");
    if ((settings.credits_balance ?? 0) < eligible.length) throw new Error("Créditos insuficientes para esta campanha.");
    const { data: campaign, error: campaignError } = await supabase
      .from("whatsapp_campaigns")
      .insert({ account_id: accountId, title: data.content.slice(0, 80), content: data.content, filters: { statuses: data.statuses, group_id: data.group_id ?? null, spiritual_stage: data.spiritual_stage ?? null }, requested_count: eligible.length })
      .select("id")
      .single();
    if (campaignError || !campaign) throw new Error(campaignError?.message ?? "Não foi possível registrar a campanha.");
    const campaignId = (campaign as { id: string }).id;
    let queued = 0;
    for (const member of eligible) {
      const messageId = createWhatsappMessageId();
      const reservation = await reserveWhatsappCredits({ supabase, accountId, messageId, costCredits: 1, idempotencyKey: `reserve:campaign:${messageId}`, metadata: { source: "campaign" } });
      if (!reservation.ok) break;
      const content = appendWhatsappOptOutNotice(data.content.replaceAll("{nome}", member.full_name.split(" ")[0] ?? member.full_name));
      const { error } = await supabase.from("whatsapp_messages").insert({ id: messageId, campaign_id: campaignId, account_id: accountId, member_id: member.id, kind: "newsletter", phone: member.phone, recipient_name: member.full_name, content, status: "queued", scheduled_for: new Date().toISOString(), cost_credits: 1, credit_reserved_at: new Date().toISOString() });
      if (error) { await refundWhatsappMessageCredits({ supabase, accountId, messageId, idempotencyKey: `refund:campaign:${messageId}`, metadata: { reason: "insert_failed" } }); continue; }
      queued++;
    }
    await supabase.from("whatsapp_campaigns").update({ queued_count: queued }).eq("id", campaignId).eq("account_id", accountId);
    return { queued, requested: eligible.length, campaignId };
  });

type InboxConversationRow = {
  id: string;
  provider: string;
  contact_phone: string;
  contact_name: string | null;
  status: "bot" | "human" | "closed";
  assigned_user_id: string | null;
  last_message_at: string;
  last_inbound_preview: string | null;
  closed_at: string | null;
};

export const getWhatsappInboxData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "view");
    const { supabase } = context;
    const { data: conversations, error } = await supabase
      .from("whatsapp_conversations" as never)
      .select("id, provider, contact_phone, contact_name, status, assigned_user_id, last_message_at, last_inbound_preview, closed_at")
      .eq("account_id", accountId)
      .order("last_message_at", { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);

    const rows = (conversations ?? []) as InboxConversationRow[];
    if (!rows.length) return { conversations: [], messages: [] };
    const ids = rows.map((row) => row.id);
    const phones = [...new Set(rows.map((row) => row.contact_phone))];
    const [inboundRes, outboundRes] = await Promise.all([
      supabase
        .from("whatsapp_inbound_messages" as never)
        .select("id, conversation_id, sender_phone, message_type, content, received_at")
        .eq("account_id", accountId)
        .in("conversation_id", ids)
        .order("received_at", { ascending: true })
        .limit(500),
      supabase
        .from("whatsapp_messages")
        .select("id, phone, content, status, created_at, sent_at")
        .eq("account_id", accountId)
        .in("phone", phones)
        .order("created_at", { ascending: true })
        .limit(500),
    ]);
    if (inboundRes.error) throw new Error(inboundRes.error.message);
    if (outboundRes.error) throw new Error(outboundRes.error.message);

    const byPhone = new Map(rows.map((row) => [row.contact_phone, row.id]));
    const inbound = ((inboundRes.data ?? []) as Array<Record<string, unknown>>).map((message) => ({
      id: String(message.id), conversation_id: String(message.conversation_id), direction: "inbound" as const,
      content: String(message.content ?? "[mensagem sem texto]"), type: String(message.message_type ?? "text"),
      at: String(message.received_at), status: "received",
    }));
    const outbound = ((outboundRes.data ?? []) as Array<Record<string, unknown>>)
      .map((message) => ({
        id: String(message.id), conversation_id: byPhone.get(String(message.phone)), direction: "outbound" as const,
        content: String(message.content ?? ""), type: "text", at: String(message.sent_at ?? message.created_at), status: String(message.status ?? "queued"),
      }))
      .filter((message) => Boolean(message.conversation_id));
    return { conversations: rows, messages: [...inbound, ...outbound] };
  });

export const takeWhatsappConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => ConversationIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "edit");
    const { error } = await supabaseAdmin
      .from("whatsapp_conversations" as never)
      .update({ status: "human", assigned_user_id: context.userId, closed_at: null, updated_at: new Date().toISOString() } as never)
      .eq("id", data.conversation_id).eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const closeWhatsappConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => ConversationIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "edit");
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("whatsapp_conversations" as never)
      .update({ status: "closed", closed_at: now, updated_at: now } as never)
      .eq("id", data.conversation_id).eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const replyToWhatsappConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => ReplyToConversationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/whatsapp");
    await requirePermission(context, "whatsapp", "create");
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("whatsapp_conversations" as never)
      .select("id, contact_phone, contact_name")
      .eq("id", data.conversation_id).eq("account_id", accountId).maybeSingle();
    if (conversationError) throw new Error(conversationError.message);
    if (!conversation) throw new Error("Conversa não encontrada.");
    const phone = normalizeWhatsappPhone(String((conversation as { contact_phone: string }).contact_phone));
    if (await hasWhatsappOptedOut({ supabase: supabaseAdmin as unknown as WhatsappConsentClient, accountId, phone })) throw new Error("Este contato retirou o consentimento para receber WhatsApp.");
    const messageId = createWhatsappMessageId();
    const reservation = await reserveWhatsappCredits({ supabase: supabaseAdmin, accountId, messageId, costCredits: 1, idempotencyKey: `reserve:inbox:${messageId}`, metadata: { kind: "manual", source: "inbox_reply", conversation_id: data.conversation_id } });
    if (!reservation.ok) throw new Error(reservation.reason === "insufficient_credits" ? "Créditos insuficientes para responder." : "Não foi possível reservar créditos.");
    const now = new Date().toISOString();
    const { error: messageError } = await supabaseAdmin.from("whatsapp_messages").insert({
      id: messageId, account_id: accountId, kind: "manual", phone,
      recipient_name: (conversation as { contact_name: string | null }).contact_name,
      content: appendWhatsappOptOutNotice(data.content), status: "queued", scheduled_for: now,
      cost_credits: 1, credit_reserved_at: now,
    });
    if (messageError) {
      await refundWhatsappMessageCredits({ supabase: supabaseAdmin, accountId, messageId, idempotencyKey: `refund:inbox_failed:${messageId}`, metadata: { source: "inbox_reply" } });
      throw new Error(messageError.message);
    }
    await supabaseAdmin.from("whatsapp_conversations" as never).update({ status: "human", assigned_user_id: context.userId, closed_at: null, updated_at: now } as never).eq("id", data.conversation_id).eq("account_id", accountId);
    return { ok: true };
  });
