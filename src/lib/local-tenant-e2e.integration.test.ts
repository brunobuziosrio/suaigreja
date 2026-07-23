import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  LOCAL_TENANT_E2E_PASSWORD,
  createLocalTenantE2EEnvironment,
} from "@/lib/testing/local-tenant-e2e";

const protectedServices = [
  "members.functions.ts",
  "events.functions.ts",
  "financial-entries.functions.ts",
  "campaigns.functions.ts",
  "team.functions.ts",
] as const;

describe("MISSION-001: integração local descartável de isolamento", () => {
  it("cria as duas organizações e identidades fictícias sem .env ou serviços externos", () => {
    const env = createLocalTenantE2EEnvironment();
    expect(env.organizationA.name).toBe("Organização E2E A");
    expect(env.organizationB.name).toBe("Organização E2E B");
    expect(env.users.a.email).toBe("e2e-org-a@example.test");
    expect(env.users.b.email).toBe("e2e-org-b@example.test");
    expect(LOCAL_TENANT_E2E_PASSWORD).toMatch(/^local-e2e-only/);
    expect(env.users.a.accountId).not.toBe(env.users.b.accountId);
  });

  it("bloqueia leitura, edição, exclusão e manipulação direta de ID cruzadas", () => {
    const env = createLocalTenantE2EEnvironment();
    const foreignId = env.controller.export(env.users.b).body[0].id;

    expect(env.controller.get(env.users.a, foreignId)).toEqual({ status: 404 });
    expect(env.controller.update(env.users.a, foreignId, "ataque")).toEqual({ status: 404 });
    expect(env.controller.delete(env.users.a, foreignId)).toEqual({ status: 404 });
    expect(env.controller.get(env.users.b, foreignId)).toMatchObject({ status: 200, body: { label: "registro B" } });
  });

  it("mantém a exportação no escopo da conta e falha fechada sem escopo", () => {
    const env = createLocalTenantE2EEnvironment();
    expect(env.controller.export(env.users.a).body).toEqual([
      expect.objectContaining({ accountId: env.organizationA.id }),
    ]);
    expect(() => env.controller.unscopedQuery()).toThrow(/account_id/);
  });

  it("preserva menor privilégio administrativo sem afetar o proprietário da organização B", () => {
    const env = createLocalTenantE2EEnvironment();
    const recordA = env.controller.export(env.users.a).body[0];
    const recordB = env.controller.export(env.users.b).body[0];
    expect(env.controller.update(env.users.aReception, recordA.id, "indevido")).toEqual({ status: 403 });
    expect(env.controller.delete(env.users.aReception, recordA.id)).toEqual({ status: 403 });
    expect(env.controller.update(env.users.b, recordB.id, "B atualizado")).toMatchObject({ status: 200 });
  });

  it("mantém guardas e filtros por account_id nos serviços críticos reais", () => {
    for (const file of protectedServices) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source, file).toMatch(/requirePermission|myRole !== "owner"/);
      expect(source, file).toMatch(/\.eq\("account_id", accountId\)/);
    }
  });
});
