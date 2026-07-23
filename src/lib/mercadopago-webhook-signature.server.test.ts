import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  mercadoPagoWebhookManifest,
  validateMercadoPagoWebhookSignature,
} from "./mercadopago-webhook-signature.server";

const secret = "local-webhook-signature-secret";
const dataId = "payment-123";
const requestId = "request-456";
const timestamp = "1704908010";

function signedHeader() {
  const digest = createHmac("sha256", secret)
    .update(mercadoPagoWebhookManifest(dataId, requestId, timestamp))
    .digest("hex");
  return `ts=${timestamp},v1=${digest}`;
}

describe("Mercado Pago webhook signature", () => {
  it("aceita assinatura HMAC válida sem registrar o segredo", () => {
    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: signedHeader(),
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toEqual({ ok: true });
  });

  it("rejeita assinatura alterada, campos ausentes e segredo não configurado", () => {
    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: "ts=1704908010,v1=invalid",
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toEqual({ ok: false, reason: "invalid_signature" });
    expect(
      validateMercadoPagoWebhookSignature({ xSignature: signedHeader(), xRequestId: null, dataId, secret }),
    ).toEqual({ ok: false, reason: "missing_request_id" });
    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: "ts=not-a-timestamp,v1=abc",
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toEqual({ ok: false, reason: "invalid_signature" });
    expect(
      validateMercadoPagoWebhookSignature({ xSignature: signedHeader(), xRequestId: requestId, dataId, secret: undefined }),
    ).toEqual({ ok: false, reason: "not_configured" });
  });

  it("liga a assinatura ao pagamento e à requisição exatos", () => {
    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: signedHeader(),
        xRequestId: requestId,
        dataId: "payment-from-another-tenant",
        secret,
      }),
    ).toEqual({ ok: false, reason: "invalid_signature" });
  });
});
