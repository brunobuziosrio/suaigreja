import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyCronRequest } from "@/lib/cron-auth.server";
import { refundWhatsappMessageCredits } from "@/lib/whatsapp-credits.server";
import { hasWhatsappOptedOut } from "@/lib/whatsapp-consent.server";
import {
  getWhatsappProviderConnection,
  sendWhatsappMessage,
  type WhatsappOutboundMessage,
} from "@/lib/whatsapp-providers.server";

type ClaimedMessage = WhatsappOutboundMessage & {
  member_id: string | null;
  delivery_attempts: number;
  cost_credits: number;
};

function normalizeClaimed(data: unknown): ClaimedMessage[] {
  return Array.isArray(data) ? (data as ClaimedMessage[]) : [];
}

function retryDate(attempts: number) {
  const seconds = Math.min(60 * 2 ** Math.max(attempts - 1, 0), 3600);
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export const Route = createFileRoute("/api/public/cron/whatsapp-dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const db = supabaseAdmin as any;
        const { data, error } = await db.rpc("claim_whatsapp_messages", {
          p_limit: 25,
          p_lock_seconds: 300,
        });

        if (error) {
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        const messages = normalizeClaimed(data);
        let sent = 0;
        let retried = 0;
        let failed = 0;
        let missingProvider = 0;
        let skippedOptOut = 0;

        for (const message of messages) {
          try {
            if (await hasWhatsappOptedOut({ supabase: db, accountId: message.account_id, phone: message.phone })) {
              await refundWhatsappMessageCredits({
                supabase: db,
                accountId: message.account_id,
                messageId: message.id,
                idempotencyKey: `refund:opt_out:${message.id}`,
                metadata: { reason: "recipient_opted_out", source: "dispatch" },
              });
              const { error: updateError } = await db
                .from("whatsapp_messages")
                .update({
                  status: "skipped",
                  locked_until: null,
                  error_message: "Destinatário retirou o consentimento para WhatsApp.",
                } as never)
                .eq("id", message.id)
                .eq("account_id", message.account_id);
              if (updateError) {
                return Response.json({ ok: false, error: updateError.message }, { status: 500 });
              }
              skippedOptOut++;
              continue;
            }

            const connection = await getWhatsappProviderConnection(message.account_id);
            if (!connection) {
              missingProvider++;
              const { error: updateError } = await db
                .from("whatsapp_messages")
                .update({
                  status: "queued",
                  delivery_attempts: Math.max((message.delivery_attempts ?? 1) - 1, 0),
                  locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                  error_message: "Nenhum provedor WhatsApp ativo configurado para esta conta.",
              } as never)
                .eq("id", message.id)
                .eq("account_id", message.account_id);
              if (updateError) {
                return Response.json({ ok: false, error: updateError.message }, { status: 500 });
              }
              continue;
            }

            const result = await sendWhatsappMessage(connection, message);
            const { error: updateError } = await db
              .from("whatsapp_messages")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                provider: result.provider,
                provider_message_id: result.providerMessageId,
                provider_payload: result.raw,
                locked_until: null,
                error_message: null,
              } as never)
              .eq("id", message.id)
              .eq("account_id", message.account_id);
            if (updateError) {
              return Response.json({ ok: false, error: updateError.message }, { status: 500 });
            }
            sent++;
          } catch (err) {
            const messageText = err instanceof Error ? err.message : "Falha desconhecida no envio.";
            const definitive = (message.delivery_attempts ?? 1) >= 3;

            if (definitive) {
              await refundWhatsappMessageCredits({
                supabase: db,
                accountId: message.account_id,
                messageId: message.id,
                idempotencyKey: `refund:delivery_failed:${message.id}`,
                metadata: { error: messageText, attempts: message.delivery_attempts },
              });
              const { error: updateError } = await db
                .from("whatsapp_messages")
                .update({
                  status: "failed",
                  locked_until: null,
                  error_message: messageText,
                } as never)
                .eq("id", message.id)
                .eq("account_id", message.account_id);
              if (updateError) {
                return Response.json({ ok: false, error: updateError.message }, { status: 500 });
              }
              failed++;
              continue;
            }

            const { error: updateError } = await db
              .from("whatsapp_messages")
              .update({
                status: "queued",
                locked_until: retryDate(message.delivery_attempts ?? 1),
                error_message: messageText,
              } as never)
              .eq("id", message.id)
              .eq("account_id", message.account_id);
            if (updateError) {
              return Response.json({ ok: false, error: updateError.message }, { status: 500 });
            }
            retried++;
          }
        }

        return Response.json({
          ok: true,
          claimed: messages.length,
          sent,
          retried,
          failed,
          missingProvider,
          skippedOptOut,
        });
      },
    },
  },
});
