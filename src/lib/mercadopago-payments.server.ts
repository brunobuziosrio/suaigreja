import QRCode from "qrcode";

const MERCADOPAGO_BASE_URL = "https://api.mercadopago.com";

export type MercadoPagoPixPaymentInput = {
  accessToken: string;
  amountCents: number;
  description: string;
  payerEmail: string;
  payerName: string;
  notificationUrl: string;
  externalReference: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
};

function pickText(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function createMercadoPagoPixPayment(input: MercadoPagoPixPaymentInput) {
  const response = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
      "X-Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      transaction_amount: Math.round(input.amountCents) / 100,
      description: input.description,
      payment_method_id: "pix",
      payer: {
        email: input.payerEmail,
        first_name: input.payerName,
      },
      notification_url: input.notificationUrl,
      external_reference: input.externalReference,
      metadata: input.metadata,
    }),
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (raw as { message?: string } | null)?.message ??
        "Não foi possível gerar o Pix no Mercado Pago.",
    );
  }

  const payment = raw as Record<string, unknown>;
  const pointOfInteraction = payment.point_of_interaction as
    | { transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string } }
    | undefined;
  const transactionData = pointOfInteraction?.transaction_data;
  const copyPaste = transactionData?.qr_code ?? null;
  const qrBase64 = transactionData?.qr_code_base64 ?? null;
  const qrCode = qrBase64
    ? `data:image/png;base64,${qrBase64}`
    : copyPaste
      ? await QRCode.toDataURL(copyPaste, { margin: 1, width: 280 })
      : null;

  return {
    raw,
    id: String(payment.id ?? ""),
    status: String(payment.status ?? "pending").toLowerCase(),
    copyPaste,
    qrCode,
    payUrl: transactionData?.ticket_url ?? pickText(payment.init_point),
    expiresAt: pickText(payment.date_of_expiration),
  };
}
