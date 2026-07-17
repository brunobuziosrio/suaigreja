import { describe, expect, it } from "vitest";
import { parseWhatsappInboundWebhook } from "./whatsapp-webhooks.server";
import { isWhatsappOptOutCommand } from "./whatsapp-consent.server";

describe("parseWhatsappInboundWebhook", () => {
  it("registra texto recebido da Meta com remetente e contexto do número conectado", () => {
    const events = parseWhatsappInboundWebhook("meta_cloud", {
      entry: [{ id: "business-1", changes: [{ value: {
        metadata: { phone_number_id: "phone-number-1" },
        contacts: [{ profile: { name: "Ana Silva" } }],
        messages: [{ id: "wamid.123", from: "5511999999999", timestamp: "1784290000", type: "text", text: { body: "Olá, preciso de ajuda" } }],
      } }] }],
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      providerMessageId: "wamid.123",
      senderPhone: "5511999999999",
      senderName: "Ana Silva",
      content: "Olá, preciso de ajuda",
      providerAccountHint: { phoneNumberId: "phone-number-1", businessAccountId: "business-1" },
    });
  });

  it("ignora eventos enviados pela própria conta no provedor alternativo", () => {
    expect(parseWhatsappInboundWebhook("uazapi", { data: { id: "msg-1", phone: "5511999999999", fromMe: true } })).toEqual([]);
  });

  it("reconhece apenas comandos explícitos de descadastro", () => {
    expect(isWhatsappOptOutCommand(" SAIR ")).toBe(true);
    expect(isWhatsappOptOutCommand("Por favor, não vou sair agora")).toBe(false);
  });
});
