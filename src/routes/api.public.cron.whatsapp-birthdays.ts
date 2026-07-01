import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyCronRequest } from "@/lib/cron-auth.server";
import { appendWhatsappOptOutNotice, hasWhatsappOptedOut } from "@/lib/whatsapp-consent.server";
import {
  createWhatsappMessageId,
  refundWhatsappMessageCredits,
  reserveWhatsappCredits,
} from "@/lib/whatsapp-credits.server";

/**
 * Cron diário — enfileira mensagens de aniversário do dia (BRT).
 *
 * Para cada conta com whatsapp_settings.birthday_enabled = true:
 *   1. Busca membros cujo (mês, dia) bate com hoje em BRT.
 *   2. Pula quem não tem telefone.
 *   3. Pula quem a conta não tem crédito suficiente (saldo < #aniversariantes).
 *      Ainda assim, enfileira até o saldo disponível.
 *   4. Insere em whatsapp_messages (status='queued'). O índice único impede duplicar
 *      a mesma mensagem para o mesmo membro no mesmo dia.
 *
 * O envio em si será feito por um worker separado quando o provider for plugado.
 */
export const Route = createFileRoute("/api/public/cron/whatsapp-birthdays")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const db = supabaseAdmin as any;
        const now = new Date();
        // BRT = UTC-3 (Brasil não tem mais DST desde 2019)
        const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        const month = brt.getUTCMonth() + 1;
        const day = brt.getUTCDate();
        const brtDate = brt.toISOString().slice(0, 10);

        const { data: settingsRows, error: settingsErr } = await db
          .from("whatsapp_settings")
          .select("account_id, birthday_enabled, birthday_template, sender_name")
          .eq("enabled", true)
          .eq("birthday_enabled", true);

        if (settingsErr) {
          return Response.json({ ok: false, error: settingsErr.message }, { status: 500 });
        }

        let enqueued = 0;
        let skippedNoPhone = 0;
        let skippedNoCredit = 0;
        let skippedOptOut = 0;
        const processedAccounts = settingsRows?.length ?? 0;

        for (const s of settingsRows ?? []) {
          // Busca o nome da igreja (template usa {igreja})
          const { data: accRow } = await db
            .from("accounts")
            .select("brand_title")
            .eq("id", s.account_id)
            .maybeSingle();
          const churchName = accRow?.brand_title ?? "nossa igreja";

          // Aniversariantes do dia (compara mês/dia ignorando ano)
          const { data: members } = await db
            .from("members")
            .select("id, full_name, phone, birth_date")
            .eq("account_id", s.account_id)
            .eq("status", "ativo")
            .eq("whatsapp_consent", true)
            .not("birth_date", "is", null);

          const birthdayMembers = (members ?? []).filter((m: any) => {
            if (!m.birth_date) return false;
            const d = new Date(m.birth_date + "T00:00:00Z");
            return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
          });

          for (const m of birthdayMembers) {
            if (!m.phone || m.phone.trim().length < 8) {
              skippedNoPhone++;
              continue;
            }
            if (await hasWhatsappOptedOut({ supabase: db, accountId: s.account_id, phone: m.phone })) {
              skippedOptOut++;
              continue;
            }

            const firstName = (m.full_name ?? "").split(" ")[0] || "amigo(a)";
            const content = (s.birthday_template ?? "")
              .replaceAll("{nome}", firstName)
              .replaceAll("{nome_completo}", m.full_name ?? firstName)
              .replaceAll("{igreja}", churchName);

            const messageId = createWhatsappMessageId();
            const reservation = await reserveWhatsappCredits({
              supabase: db,
              accountId: s.account_id,
              messageId,
              costCredits: 1,
              idempotencyKey: `reserve:birthday:${s.account_id}:${m.id}:${brtDate}`,
              metadata: { kind: "birthday", source: "birthday_cron", scheduled_date: brtDate },
            });

            if (!reservation.ok) {
              if (reservation.reason === "insufficient_credits") skippedNoCredit++;
              continue;
            }

            // ON CONFLICT no índice único — silencia duplicatas no mesmo dia
            const { error: insErr } = await db.from("whatsapp_messages").insert({
              id: messageId,
              account_id: s.account_id,
              member_id: m.id,
              kind: "birthday",
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
                idempotencyKey: `refund:birthday_insert_failed:${messageId}`,
                metadata: { error: insErr.message, source: "birthday_cron" },
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
