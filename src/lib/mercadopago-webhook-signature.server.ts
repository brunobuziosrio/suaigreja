import { createHmac, timingSafeEqual } from "node:crypto";

type SignatureInput = {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  secret: string | undefined;
};

function parseSignature(value: string | null) {
  if (!value) return null;
  const fields = new Map(
    value.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  const ts = fields.get("ts");
  const v1 = fields.get("v1");
  return ts && v1 ? { ts, v1 } : null;
}

export function mercadoPagoWebhookManifest(dataId: string, requestId: string, timestamp: string) {
  return `id:${dataId};request-id:${requestId};ts:${timestamp};`;
}

export function validateMercadoPagoWebhookSignature(input: SignatureInput) {
  if (!input.secret) return { ok: false as const, reason: "not_configured" as const };
  if (!input.xRequestId) return { ok: false as const, reason: "missing_request_id" as const };
  const signature = parseSignature(input.xSignature);
  if (!signature) return { ok: false as const, reason: "invalid_signature" as const };
  if (!/^\d+$/.test(signature.ts)) return { ok: false as const, reason: "invalid_signature" as const };

  const manifest = mercadoPagoWebhookManifest(input.dataId, input.xRequestId, signature.ts);
  const expected = createHmac("sha256", input.secret).update(manifest).digest("hex");
  const received = signature.v1.toLowerCase();
  if (received.length !== expected.length) return { ok: false as const, reason: "invalid_signature" as const };

  const valid = timingSafeEqual(Buffer.from(received, "utf8"), Buffer.from(expected, "utf8"));
  return valid
    ? { ok: true as const }
    : { ok: false as const, reason: "invalid_signature" as const };
}
