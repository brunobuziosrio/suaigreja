import { describe, expect, it } from "vitest";
import { LocalInviteEnvironment } from "@/lib/testing/local-smtp-invites";

describe("MISSION-003: SMTP local e convite de equipe", () => {
  it("entrega convite na caixa local com remetente, organização e token", () => {
    const env = new LocalInviteEnvironment();
    const invite = env.invite("org-a", "Organização E2E A", "Admin A", "member@example.test", "recepcao");
    expect(env.mailbox.messages).toHaveLength(1);
    expect(env.mailbox.messages[0]).toMatchObject({ to: "member@example.test" });
    expect(env.mailbox.messages[0].html).toContain("Organização E2E A");
    expect(env.mailbox.messages[0].html).toContain(invite.token);
  });

  it("aceita uma vez e cria um único vínculo com o papel concedido", () => {
    const env = new LocalInviteEnvironment();
    const invite = env.invite("org-a", "Organização E2E A", "Admin A", "member@example.test", "recepcao");
    expect(env.accept("org-a", "member@example.test", invite.token)).toMatchObject({ accountId: "org-a", role: "recepcao" });
    expect(() => env.accept("org-a", "member@example.test", invite.token)).toThrow(/utilizado/);
    expect(env.memberCount("org-a", "member@example.test")).toBe(1);
  });

  it("rejeita expiração, cancelamento, token anterior, e manipulação de outra organização", () => {
    const env = new LocalInviteEnvironment();
    const expired = env.invite("org-a", "Organização E2E A", "Admin A", "member@example.test", "recepcao");
    env.advance(3_600_000);
    expect(() => env.accept("org-a", "member@example.test", expired.token)).toThrow(/expirado/);
    const original = env.invite("org-a", "Organização E2E A", "Admin A", "member@example.test", "recepcao");
    const resent = env.resend("org-a", original.id, "Admin A");
    expect(() => env.accept("org-a", "member@example.test", original.token)).toThrow(/utilizado|cancelado/);
    expect(() => env.accept("org-b", "member@example.test", resent.token)).toThrow(/organização/);
    env.cancel("org-a", resent.id);
    expect(() => env.accept("org-a", "member@example.test", resent.token)).toThrow(/utilizado|cancelado/);
  });

  it("não persiste convite quando o SMTP local falha", () => {
    const env = new LocalInviteEnvironment();
    env.mailbox.failNextDelivery = true;
    expect(() => env.invite("org-a", "Organização E2E A", "Admin A", "member@example.test", "recepcao")).toThrow(/SMTP/);
    expect(env.mailbox.messages).toHaveLength(0);
  });
});
