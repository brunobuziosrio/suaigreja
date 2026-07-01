import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyCronRequest } from "@/lib/cron-auth.server";
import {
  parseWhatsappDeliveryWebhook,
  recordWhatsappDeliveryEvent,
} from "@/lib/whatsapp-webhooks.server";

const ProviderInput = z.enum(["meta_cloud", "uazapi"]);

function verifyMetaChallenge(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_CRON_SECRET || process.env.CRON_SECRET;

  if (mode === "subscribe" && token && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

export const Route = createFileRoute("/api/public/whatsapp-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => verifyMetaChallenge(request),
      POST: async ({ request }) => {
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const url = new URL(request.url);
        const provider = ProviderInput.safeParse(url.searchParams.get("provider") ?? "meta_cloud");
        if (!provider.success) {
          return Response.json({ ok: false, error: "Provedor inválido." }, { status: 400 });
        }

        const raw = await request.json().catch(() => null);
        if (!raw) return Response.json({ ok: false, error: "Payload inválido." }, { status: 400 });

        const events = parseWhatsappDeliveryWebhook(provider.data, raw);
        const recorded = [];
        for (const event of events) {
          recorded.push(await recordWhatsappDeliveryEvent(event));
        }

        return Response.json({ ok: true, provider: provider.data, events: recorded.length, recorded });
      },
    },
  },
});
