import { describe, expect, it } from "vitest";
import { LocalPixWebhookEnvironment } from "@/lib/testing/local-pix-webhook";

describe("MISSION-002: PIX e webhook locais", () => {
  it("cria PIX fictício e processa pendente, recusado, cancelado, expirado e aprovado", () => {
    for (const state of ["pending", "rejected", "cancelled", "expired", "approved"] as const) {
      const env = new LocalPixWebhookEnvironment();
      const charge = env.createCharge("org-a", "pro_monthly", 12900);
      expect(charge.copyPaste).toContain("LOCAL-PIX");
      expect(env.dispatch("org-a", env.webhookFor(`evt-${state}`, charge.id, state)).charge.status).toBe(state);
    }
  });

  it("rejeita assinatura inválida, pagamento inexistente e alteração cruzada entre tenants", () => {
    const env = new LocalPixWebhookEnvironment();
    const charge = env.createCharge("org-a", "essential_monthly", 5900);
    expect(() => env.dispatch("org-a", { ...env.webhookFor("bad", charge.id, "approved"), signature: "invalid" })).toThrow(/Assinatura/);
    expect(() => env.dispatch("org-a", env.webhookFor("missing", "nope", "approved"))).toThrow(/inexistente/);
    expect(() => env.dispatch("org-b", env.webhookFor("cross", charge.id, "approved"))).toThrow(/organização/);
    expect(env.getCharge("org-b", charge.id)).toBeNull();
  });

  it("é idempotente, ignora eventos fora de ordem e permite reprocessar falha parcial", () => {
    const env = new LocalPixWebhookEnvironment();
    const charge = env.createCharge("org-a", "premium_monthly", 24900);
    const approved = env.webhookFor("approved-1", charge.id, "approved");
    env.failNextActivation = true;
    expect(() => env.dispatch("org-a", approved)).toThrow(/reprocessado/);
    expect(env.dispatch("org-a", approved).charge.subscriptionActivations).toBe(1);
    expect(env.dispatch("org-a", approved).duplicate).toBe(true);
    expect(env.dispatch("org-a", env.webhookFor("late-rejected", charge.id, "rejected")).ignoredOutOfOrder).toBe(true);
    expect(env.getCharge("org-a", charge.id)).toMatchObject({ status: "approved", subscriptionActivations: 1 });
    expect(JSON.stringify(env.logs())).not.toContain("secret");
  });
});
