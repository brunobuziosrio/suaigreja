import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyCronRequest } from "@/lib/cron-auth.server";
import { recordWhatsappOptOut } from "@/lib/whatsapp-consent.server";

const OptOutInput = z.object({
  account_id: z.string().uuid(),
  phone: z.string().min(8).max(40),
  member_id: z.string().uuid().nullable().optional(),
  message_id: z.string().uuid().nullable().optional(),
  source: z.string().max(80).optional().default("provider_webhook"),
  reason: z.string().max(300).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const Route = createFileRoute("/api/public/whatsapp-opt-out")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const raw = await request.json().catch(() => null);
        const parsed = OptOutInput.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Payload inválido." }, { status: 400 });
        }

        const result = await recordWhatsappOptOut({
          supabase: supabaseAdmin as any,
          accountId: parsed.data.account_id,
          phone: parsed.data.phone,
          memberId: parsed.data.member_id ?? null,
          messageId: parsed.data.message_id ?? null,
          source: parsed.data.source,
          reason: parsed.data.reason ?? "opt_out",
          metadata: parsed.data.metadata ?? {},
        });

        return Response.json({ ok: true, optOut: result });
      },
    },
  },
});
