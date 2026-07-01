import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeWhatsappPhone } from "@/lib/whatsapp-consent.server";
import type { WhatsappProviderId } from "@/lib/whatsapp-providers.server";

type DeliveryStatus = "sent" | "delivered" | "read" | "failed" | "unknown";

export type WhatsappDeliveryEventInput = {
  provider: WhatsappProviderId;
  providerMessageId: string | null;
  status: DeliveryStatus;
  recipientPhone: string | null;
  occurredAt: string;
  rawPayload: unknown;
  providerAccountHint?: {
    phoneNumberId?: string | null;
    businessAccountId?: string | null;
    instanceId?: string | null;
  };
};

type MessageLookup = {
  id: string;
  account_id: string;
  status: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function normalizeProviderStatus(status: unknown): DeliveryStatus {
  const value = String(status ?? "").toLowerCase();
  if (["sent", "enviado"].includes(value)) return "sent";
  if (["delivered", "entregue", "delivery"].includes(value)) return "delivered";
  if (["read", "lido"].includes(value)) return "read";
  if (["failed", "error", "erro", "undelivered"].includes(value)) return "failed";
  return "unknown";
}

function dateFromTimestamp(value: unknown) {
  if (typeof value === "number") return new Date(value < 10_000_000_000 ? value * 1000 : value).toISOString();
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const timestamp = Number(value);
    return new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp).toISOString();
  }
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  return new Date().toISOString();
}

function parseMetaCloudPayload(raw: unknown): WhatsappDeliveryEventInput[] {
  const payload = asRecord(raw);
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const events: WhatsappDeliveryEventInput[] = [];

  for (const entry of entries) {
    const entryRecord = asRecord(entry);
    const businessAccountId = pickString(entryRecord.id);
    const changes = Array.isArray(entryRecord.changes) ? entryRecord.changes : [];

    for (const change of changes) {
      const value = asRecord(asRecord(change).value);
      const metadata = asRecord(value.metadata);
      const phoneNumberId = pickString(metadata.phone_number_id);
      const statuses = Array.isArray(value.statuses) ? value.statuses : [];

      for (const statusItem of statuses) {
        const statusRecord = asRecord(statusItem);
        events.push({
          provider: "meta_cloud",
          providerMessageId: pickString(statusRecord.id),
          status: normalizeProviderStatus(statusRecord.status),
          recipientPhone: normalizeWhatsappPhone(pickString(statusRecord.recipient_id) ?? ""),
          occurredAt: dateFromTimestamp(statusRecord.timestamp),
          rawPayload: statusRecord,
          providerAccountHint: { phoneNumberId, businessAccountId },
        });
      }
    }
  }

  return events;
}

function parseUazapiPayload(raw: unknown): WhatsappDeliveryEventInput[] {
  const payload = asRecord(raw);
  const data = asRecord(payload.data);
  const key = asRecord(data.key);
  const providerMessageId = pickString(
    payload.messageId,
    payload.message_id,
    payload.id,
    data.messageId,
    data.message_id,
    data.id,
    key.id,
  );
  const status = normalizeProviderStatus(
    payload.status ?? payload.event ?? payload.type ?? data.status ?? data.event ?? data.type,
  );

  if (!providerMessageId && status === "unknown") return [];

  return [
    {
      provider: "uazapi",
      providerMessageId,
      status,
      recipientPhone: normalizeWhatsappPhone(
        pickString(payload.phone, payload.to, data.phone, data.to, key.remoteJid)?.replace(/\D/g, "") ?? "",
      ),
      occurredAt: dateFromTimestamp(payload.timestamp ?? data.timestamp ?? payload.date ?? data.date),
      rawPayload: raw,
      providerAccountHint: { instanceId: pickString(payload.instanceId, payload.instance_id, data.instanceId) },
    },
  ];
}

export function parseWhatsappDeliveryWebhook(provider: WhatsappProviderId, raw: unknown) {
  if (provider === "meta_cloud") return parseMetaCloudPayload(raw);
  if (provider === "uazapi") return parseUazapiPayload(raw);
  return [];
}

async function findMessage(event: WhatsappDeliveryEventInput): Promise<MessageLookup | null> {
  if (!event.providerMessageId) return null;

  const { data, error } = await supabaseAdmin
    .from("whatsapp_messages")
    .select("id, account_id, status")
    .eq("provider", event.provider)
    .eq("provider_message_id", event.providerMessageId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as MessageLookup | null;
}

async function findAccountId(event: WhatsappDeliveryEventInput, message: MessageLookup | null) {
  if (message) return message.account_id;
  const hint = event.providerAccountHint;
  if (!hint) return null;

  let query = supabaseAdmin.from("whatsapp_provider_connections").select("account_id").eq("provider", event.provider);
  if (event.provider === "meta_cloud" && hint.phoneNumberId) {
    query = query.eq("phone_number_id", hint.phoneNumberId);
  } else if (event.provider === "uazapi" && hint.instanceId) {
    query = query.eq("instance_id", hint.instanceId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { account_id?: string } | null)?.account_id ?? null;
}

export async function recordWhatsappDeliveryEvent(event: WhatsappDeliveryEventInput) {
  const message = await findMessage(event);
  const accountId = await findAccountId(event, message);

  const { error: insertError } = await supabaseAdmin.from("whatsapp_delivery_events").insert({
    account_id: accountId,
    message_id: message?.id ?? null,
    provider: event.provider,
    provider_message_id: event.providerMessageId,
    provider_status: event.status,
    recipient_phone: event.recipientPhone || null,
    occurred_at: event.occurredAt,
    raw_payload: event.rawPayload as never,
  });
  if (insertError) throw new Error(insertError.message);

  if (message) {
    const patch: Record<string, unknown> = {
      provider_delivery_status: event.status,
      provider_status_at: event.occurredAt,
      locked_until: null,
    };
    if (event.status === "failed") {
      patch.status = "failed";
      patch.error_message = "Provedor informou falha na entrega.";
    }
    if (event.status === "delivered") patch.delivered_at = event.occurredAt;
    if (event.status === "read") patch.read_at = event.occurredAt;

    const { error: updateError } = await supabaseAdmin
      .from("whatsapp_messages")
      .update(patch as never)
      .eq("id", message.id)
      .eq("account_id", message.account_id);
    if (updateError) throw new Error(updateError.message);
  }

  return { accountId, messageId: message?.id ?? null, status: event.status };
}
