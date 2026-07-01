import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyCronRequest } from "@/lib/cron-auth.server";
import { appendWhatsappOptOutNotice, hasWhatsappOptedOut } from "@/lib/whatsapp-consent.server";
import {
  createWhatsappMessageId,
  refundWhatsappMessageCredits,
  reserveWhatsappCredits,
} from "@/lib/whatsapp-credits.server";

const REMINDER_DAY_OF_MONTH = 5;

/**
 * Cron mensal — enfileira lembrete de contribuição pros membros marcados como dizimista.
 * Roda todo dia (acionado externamente), mas só age no dia 5 do mês (BRT).
 *
 * O envio em si será feito por um worker separado quando o provider de WhatsApp for plugado.
 */
export const Route = createFileRoute("/api/public/cron/tithe-reminder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const db = supabaseAdmin as any;
        const now = new Date();
        const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        const brtDate = brt.toISOString().slice(0, 10);

        if (brt.getUTCDate() !== REMINDER_DAY_OF_MONTH) {
          return Response.json({ ok: true, skipped: true, reason: "not_reminder_day", date: brtDate });
        }

        const { data: settingsRows, error: settingsErr } = await db
          .from("whatsapp_settings")
          .select("account_id, tithe_reminder_enabled, tithe_reminder_template")
          .eq("enabled", true)
          .eq("tithe_reminder_enabled", true);

        if (settingsErr) {
          return Response.json({ ok: false, error: settingsErr.message }, { status: 500 });
        }

        let enqueued = 0;
        let skippedNoPhone = 0;
        let skippedNoCredit = 0;
        let skippedOptOut = 0;
        const processedAccounts = settingsRows?.length ?? 0;

        for (const s of settingsRows ?? []) {
          const { data: accRow } = await db
            .from("accounts")
            .select("brand_title")
            .eq("id", s.account_id)
            .maybeSingle();
          const churchName = accRow?.brand_title ?? "nossa igreja";

          const { data: members } = await db
            .from("members")
            .select("id, full_name, phone")
            .eq("account_id", s.account_id)
            .eq("status", "ativo")
            .eq("is_tither", true)
            .eq("whatsapp_consent", true);

          for (const m of members ?? []) {
            if (!m.phone || m.phone.trim().length < 8) {
              skippedNoPhone++;
              continue;
            }
            if (await hasWhatsappOptedOut({ supabase: db, accountId: s.account_id, phone: m.phone })) {
              skippedOptOut++;
              continue;
            }

            const firstName = (m.full_name ?? "").split(" ")[0] || "amigo(a)";
            const content = (s.tithe_reminder_template ?? "")
              .replaceAll("{nome}", firstName)
              .replaceAll("{nome_completo}", m.full_name ?? firstName)
              .replaceAll("{igreja}", churchName);

            const messageId = createWhatsappMessageId();
            const reservation = await reserveWhatsappCredits({
              supabase: db,
              accountId: s.account_id,
              messageId,
              costCredits: 1,
              idempotencyKey: `reserve:tithe_reminder:${s.account_id}:${m.id}:${brtDate}`,
              metadata: { kind: "tithe_reminder", source: "tithe_reminder_cron", scheduled_date: brtDate },
            });

            if (!reservation.ok) {
              if (reservation.reason === "insufficient_credits") skippedNoCredit++;
              continue;
            }

            const { error: insErr } = await db.from("whatsapp_messages").insert({
              id: messageId,
              account_id: s.account_id,
              member_id: m.id,
              kind: "tithe_reminder",
              phone: m.phone,
              recipient_name: m.full_name,
              content: appendWhatsappOptOutNotice(content),
              status: "queued",
              scheduled_for: now.toISOString(),
              scheduled_date: brtDate,
              cost_credits: 1,
              credit_reserved_at: now.toISOString(),
            });

            if (!insErr) {
              enqueued++;
            } else if (reservation.reason !== "idempotent") {
              await refundWhatsappMessageCredits({
                supabase: db,
                accountId: s.account_id,
                messageId,
                idempotencyKey: `refund:tithe_reminder_insert_failed:${messageId}`,
                metadata: { error: insErr.message, source: "tithe_reminder_cron" },
              });
            }
          }
        }

        return Response.json({
          ok: true,
          date: brtDate,
          processedAccounts,
          enqueued,
          skippedNoPhone,
          skippedNoCredit,
          skippedOptOut,
        });
      },
    },
  },
});
