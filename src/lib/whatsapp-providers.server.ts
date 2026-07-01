import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeWhatsappPhone } from "@/lib/whatsapp-consent.server";

export type WhatsappProviderId = "meta_cloud" | "uazapi";

export type WhatsappOutboundMessage = {
  id: string;
  account_id: string;
  phone: string;
  content: string;
};

export type WhatsappProviderConnection = {
  account_id: string;
  provider: WhatsappProviderId;
  active: boolean;
  sender_phone: string | null;
  phone_number_id: string | null;
  business_account_id: string | null;
  instance_id: string | null;
  api_base_url: string | null;
  access_token_secret_name: string;
};

export type WhatsappSendResult = {
  provider: WhatsappProviderId;
  providerMessageId: string | null;
  raw: unknown;
};

function getRequiredSecret(secretName: string) {
  const value = process.env[secretName];
  if (!value) {
    throw new Error(`Segredo de WhatsApp ausente: ${secretName}`);
  }
  return value;
}

async function sendViaMetaCloud(
  connection: WhatsappProviderConnection,
  message: WhatsappOutboundMessage,
): Promise<WhatsappSendResult> {
  if (!connection.phone_number_id) {
    throw new Error("Conexão Meta Cloud sem phone_number_id.");
  }
  const token = getRequiredSecret(connection.access_token_secret_name);
  const graphVersion = process.env.WHATSAPP_META_GRAPH_VERSION || "v20.0";
  const url = `https://graph.facebook.com/${graphVersion}/${connection.phone_number_id}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizeWhatsappPhone(message.phone),
      type: "text",
      text: {
        preview_url: false,
        body: message.content,
      },
    }),
  });
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (raw as { error?: { message?: string } } | null)?.error?.message ||
        "Falha ao enviar mensagem pela Meta Cloud API.",
    );
  }
  const providerMessageId =
    (raw as { messages?: Array<{ id?: string }> } | null)?.messages?.[0]?.id ?? null;
  return { provider: "meta_cloud", providerMessageId, raw };
}

async function sendViaUazapi(
  connection: WhatsappProviderConnection,
  message: WhatsappOutboundMessage,
): Promise<WhatsappSendResult> {
  if (!connection.api_base_url || !connection.instance_id) {
    throw new Error("Conexão UAZAPI sem api_base_url ou instance_id.");
  }
  const token = getRequiredSecret(connection.access_token_secret_name);
  const baseUrl = connection.api_base_url.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/send/text`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instanceId: connection.instance_id,
      phone: normalizeWhatsappPhone(message.phone),
      message: message.content,
    }),
  });
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((raw as { message?: string } | null)?.message || "Falha ao enviar mensagem pela UAZAPI.");
  }
  const providerMessageId =
    (raw as { id?: string; messageId?: string; data?: { id?: string; messageId?: string } } | null)?.messageId ??
    (raw as { id?: string } | null)?.id ??
    (raw as { data?: { messageId?: string; id?: string } } | null)?.data?.messageId ??
    (raw as { data?: { id?: string } } | null)?.data?.id ??
    null;
  return { provider: "uazapi", providerMessageId, raw };
}

export async function getWhatsappProviderConnection(accountId: string) {
  const { data, error } = await supabaseAdmin
    .from("whatsapp_provider_connections")
    .select(
      "account_id, provider, active, sender_phone, phone_number_id, business_account_id, instance_id, api_base_url, access_token_secret_name",
    )
    .eq("account_id", accountId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as WhatsappProviderConnection | null;
}

export async function sendWhatsappMessage(
  connection: WhatsappProviderConnection,
  message: WhatsappOutboundMessage,
) {
  if (!connection.active) throw new Error("Conexão WhatsApp inativa.");
  if (connection.provider === "meta_cloud") return sendViaMetaCloud(connection, message);
  if (connection.provider === "uazapi") return sendViaUazapi(connection, message);
  throw new Error("Provedor WhatsApp não suportado.");
}
