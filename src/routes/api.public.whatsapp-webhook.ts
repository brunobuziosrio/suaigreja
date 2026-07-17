import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyCronRequest } from "@/lib/cron-auth.server";
import {
  parseWhatsappInboundWebhook,
  parseWhatsappDeliveryWebhook,
  recordWhatsappInboundEvent,
  recordWhatsappDeliveryEvent,
} from "@/lib/whatsapp-webhooks.server";

const ProviderInput = z.enum(["meta_cloud", "uazapi"]);

async function verifyMetaSignature(request: Request, rawBody: string): Promise<boolean> {
  const secret = process.env.WHATSAPP_WEBHOOK_APP_SECRET;
  const received = request.headers.get("x-hub-signature-256");
  if (!secret || !received) return false;

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  const expected = `sha256=${Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  const expectedBytes = new TextEncoder().encode(expected);
  const receivedBytes = new TextEncoder().encode(received);
  if (expectedBytes.length !== receivedBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < expectedBytes.length; index++) {
    difference |= expectedBytes[index] ^ receivedBytes[index];
  }
  return difference === 0;
}

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
        const url = new URL(request.url);
        const provider = ProviderInput.safeParse(url.searchParams.get("provider") ?? "meta_cloud");
        if (!provider.success) {
          return Response.json({ ok: false, error: "Provedor inválido." }, { status: 400 });
        }

        // A assinatura da Meta protege o corpo bruto. Quando o segredo ainda
        // não foi configurado, mantém-se o segredo interno para não interromper
        // integrações existentes durante a migração.
        const rawBody = await request.text();
        const hasMetaSecret = Boolean(process.env.WHATSAPP_WEBHOOK_APP_SECRET);
        const signedByMeta = provider.data === "meta_cloud" && hasMetaSecret
          ? await verifyMetaSignature(request, rawBody)
          : false;
        if (!signedByMeta) {
          const unauthorized = verifyCronRequest(request);
          if (unauthorized) return unauthorized;
        }

        const raw = (() => {
          try {
            return JSON.parse(rawBody) as unknown;
          } catch {
            return null;
          }
        })();
        if (!raw) return Response.json({ ok: false, error: "Payload inválido." }, { status: 400 });

        const events = parseWhatsappDeliveryWebhook(provider.data, raw);
        const inboundEvents = parseWhatsappInboundWebhook(provider.data, raw);
        const recorded = [];
        for (const event of events) {
          recorded.push(await recordWhatsappDeliveryEvent(event));
        }
        const inbound = [];
        for (const event of inboundEvents) {
          inbound.push(await recordWhatsappInboundEvent(event));
        }

        return Response.json({ ok: true, provider: provider.data, events: recorded.length, inbound: inbound.length, recorded, inboundRecorded: inbound });
      },
    },
  },
});
