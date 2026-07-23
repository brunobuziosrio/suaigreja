/** Ambiente de integração exclusivamente para testes: não importa código de produção nem faz I/O. */
export type LocalPixState = "pending" | "approved" | "rejected" | "cancelled" | "expired";

type Charge = {
  id: string;
  accountId: string;
  plan: "essential_monthly" | "pro_monthly" | "premium_monthly";
  amountCents: number;
  status: LocalPixState;
  subscriptionActivations: number;
};

type Webhook = { eventId: string; paymentId: string; state: LocalPixState; signature: string };

const LOCAL_SIGNATURE_SECRET = "local-pix-webhook-test-secret";

function signatureFor(eventId: string, paymentId: string, state: LocalPixState) {
  return `local-v1:${eventId}:${paymentId}:${state}:${LOCAL_SIGNATURE_SECRET}`;
}

export class LocalPixWebhookEnvironment {
  private readonly charges = new Map<string, Charge>();
  private readonly processedEvents = new Set<string>();
  private readonly auditLog: Array<{ eventId: string; paymentId: string; state: LocalPixState }> = [];
  private sequence = 0;
  failNextActivation = false;

  createCharge(accountId: string, plan: Charge["plan"], amountCents: number) {
    const id = `local-pix-${++this.sequence}`;
    const charge: Charge = { id, accountId, plan, amountCents, status: "pending", subscriptionActivations: 0 };
    this.charges.set(id, charge);
    return { ...charge, copyPaste: `LOCAL-PIX-${id}`, qrCode: `data:text/plain,LOCAL-PIX-${id}` };
  }

  webhookFor(eventId: string, paymentId: string, state: LocalPixState): Webhook {
    return { eventId, paymentId, state, signature: signatureFor(eventId, paymentId, state) };
  }

  dispatch(accountId: string, webhook: Webhook) {
    if (webhook.signature !== signatureFor(webhook.eventId, webhook.paymentId, webhook.state)) {
      throw new Error("Assinatura de webhook local inválida.");
    }
    const charge = this.charges.get(webhook.paymentId);
    if (!charge) throw new Error("Pagamento local inexistente.");
    if (charge.accountId !== accountId) throw new Error("Pagamento não pertence à organização ativa.");
    if (this.processedEvents.has(webhook.eventId)) return { duplicate: true, charge: { ...charge } };
    if (charge.status === "approved") {
      this.processedEvents.add(webhook.eventId);
      this.auditLog.push({ eventId: webhook.eventId, paymentId: webhook.paymentId, state: webhook.state });
      return { ignoredOutOfOrder: true, charge: { ...charge } };
    }
    if (webhook.state === "approved" && this.failNextActivation) {
      this.failNextActivation = false;
      throw new Error("Falha parcial local antes da ativação; evento pode ser reprocessado.");
    }

    charge.status = webhook.state;
    if (webhook.state === "approved") charge.subscriptionActivations++;
    this.processedEvents.add(webhook.eventId);
    this.auditLog.push({ eventId: webhook.eventId, paymentId: webhook.paymentId, state: webhook.state });
    return { duplicate: false, charge: { ...charge } };
  }

  getCharge(accountId: string, paymentId: string) {
    const charge = this.charges.get(paymentId);
    if (!charge || charge.accountId !== accountId) return null;
    return { ...charge };
  }

  logs() {
    return this.auditLog.map((entry) => ({ ...entry }));
  }
}
