import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
      POST: async () => {
        const now = new Date();
        // BRT = UTC-3 (Brasil não tem mais DST desde 2019)
        const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        const month = brt.getUTCMonth() + 1;
        const day = brt.getUTCDate();
        const brtDate = brt.toISOString().slice(0, 10);

        const { data: settingsRows, error: settingsErr } = await supabaseAdmin
          .from("whatsapp_settings")
          .select("account_id, birthday_enabled, birthday_template, credits_balance, sender_name")
          .eq("enabled", true)
          .eq("birthday_enabled", true);

        if (settingsErr) {
          return Response.json({ ok: false, error: settingsErr.message }, { status: 500 });
        }

        let enqueued = 0;
        let skippedNoPhone = 0;
        let skippedNoCredit = 0;
        const processedAccounts = settingsRows?.length ?? 0;

        for (const s of settingsRows ?? []) {
          // Busca o nome da igreja (template usa {igreja})
          const { data: accRow } = await supabaseAdmin
            .from("accounts")
            .select("brand_title")
            .eq("id", s.account_id)
            .maybeSingle();
          const churchName = accRow?.brand_title ?? "nossa igreja";

          // Aniversariantes do dia (compara mês/dia ignorando ano)
          const { data: members } = await supabaseAdmin
            .from("members")
            .select("id, full_name, phone, birth_date")
            .eq("account_id", s.account_id)
            .eq("status", "ativo")
            .not("birth_date", "is", null);

          const birthdayMembers = (members ?? []).filter((m: any) => {
            if (!m.birth_date) return false;
            const d = new Date(m.birth_date + "T00:00:00Z");
            return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
          });

          let availableCredits = s.credits_balance ?? 0;

          for (const m of birthdayMembers) {
            if (!m.phone || m.phone.trim().length < 8) {
              skippedNoPhone++;
              continue;
            }
            if (availableCredits <= 0) {
              skippedNoCredit++;
              continue;
            }

            const firstName = (m.full_name ?? "").split(" ")[0] || "amigo(a)";
            const content = (s.birthday_template ?? "")
              .replaceAll("{nome}", firstName)
              .replaceAll("{nome_completo}", m.full_name ?? firstName)
              .replaceAll("{igreja}", churchName);

            // ON CONFLICT no índice único — silencia duplicatas no mesmo dia
            const { error: insErr } = await supabaseAdmin.from("whatsapp_messages").insert({
              account_id: s.account_id,
              member_id: m.id,
              kind: "birthday",
              phone: m.phone,
              recipient_name: m.full_name,
              content,
              status: "queued",
              scheduled_for: now.toISOString(),
              scheduled_date: brtDate,
              cost_credits: 1,
            });

            if (!insErr) {
              enqueued++;
              availableCredits--;
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
        });
      },
    },
  },
});