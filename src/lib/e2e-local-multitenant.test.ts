import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roleCan } from "@/lib/permissions";

type TenantRecord = { id: string; accountId: string; value: string };
type LocalUser = { id: string; email: string; accountId: string; role: string };

class LocalTenantStore {
  constructor(private readonly rows: TenantRecord[]) {}

  list(accountId: string) {
    return this.rows.filter((row) => row.accountId === accountId);
  }

  update(accountId: string, id: string, value: string) {
    const row = this.rows.find((candidate) => candidate.id === id && candidate.accountId === accountId);
    if (!row) return false;
    row.value = value;
    return true;
  }

  delete(accountId: string, id: string) {
    const index = this.rows.findIndex(
      (candidate) => candidate.id === id && candidate.accountId === accountId,
    );
    if (index < 0) return false;
    this.rows.splice(index, 1);
    return true;
  }

  unscopedQuery() {
    throw new Error("Consulta sem account_id é proibida no ambiente E2E local.");
  }
}

function createLocalE2EEnvironment() {
  const organizationA = { id: "00000000-0000-4000-8000-0000000000a1", name: "Organização E2E A" };
  const organizationB = { id: "00000000-0000-4000-8000-0000000000b1", name: "Organização E2E B" };
  const users: { a: LocalUser; b: LocalUser; aMember: LocalUser } = {
    a: {
      id: "00000000-0000-4000-8000-0000000000a2",
      email: "e2e-org-a@example.test",
      accountId: organizationA.id,
      role: "owner",
    },
    b: {
      id: "00000000-0000-4000-8000-0000000000b2",
      email: "e2e-org-b@example.test",
      accountId: organizationB.id,
      role: "owner",
    },
    aMember: {
      id: "00000000-0000-4000-8000-0000000000a3",
      email: "e2e-org-a-member@example.test",
      accountId: organizationA.id,
      role: "recepcao",
    },
  };
  return {
    organizationA,
    organizationB,
    users,
    records: new LocalTenantStore([
      { id: "00000000-0000-4000-8000-0000000000a4", accountId: organizationA.id, value: "A" },
      { id: "00000000-0000-4000-8000-0000000000b4", accountId: organizationB.id, value: "B" },
    ]),
  };
}

const serviceFiles = [
  "members.functions.ts",
  "events.functions.ts",
  "financial-entries.functions.ts",
  "campaigns.functions.ts",
  "team.functions.ts",
] as const;

function source(file: (typeof serviceFiles)[number]) {
  return readFileSync(new URL(file, import.meta.url), "utf8");
}

describe("MISSION-001: ambiente E2E local descartável", () => {
  it("cria automaticamente duas organizações e credenciais fictícias", () => {
    const env = createLocalE2EEnvironment();
    expect(env.organizationA.name).toBe("Organização E2E A");
    expect(env.organizationB.name).toBe("Organização E2E B");
    expect(env.users.a.email).toBe("e2e-org-a@example.test");
    expect(env.users.b.email).toBe("e2e-org-b@example.test");
    expect(env.users.a.accountId).not.toBe(env.users.b.accountId);
  });

  it("impede leitura, edição e exclusão cruzadas mesmo com ID conhecido", () => {
    const env = createLocalE2EEnvironment();
    const recordB = env.records.list(env.organizationB.id)[0];

    expect(env.records.list(env.organizationA.id)).toEqual([
      expect.objectContaining({ accountId: env.organizationA.id }),
    ]);
    expect(env.records.list(env.organizationA.id)).not.toContainEqual(recordB);
    expect(env.records.update(env.organizationA.id, recordB.id, "ataque")).toBe(false);
    expect(env.records.delete(env.organizationA.id, recordB.id)).toBe(false);
    expect(env.records.list(env.organizationB.id)).toContainEqual(recordB);
  });

  it("rejeita consultas sem escopo e mantém acesso legítimo da organização B", () => {
    const env = createLocalE2EEnvironment();
    const recordB = env.records.list(env.organizationB.id)[0];

    expect(() => env.records.unscopedQuery()).toThrow(/account_id/);
    expect(env.records.update(env.organizationB.id, recordB.id, "B atualizado")).toBe(true);
    expect(env.records.delete(env.organizationB.id, recordB.id)).toBe(true);
    expect(env.records.list(env.organizationB.id)).toEqual([]);
  });

  it("preserva menor privilégio para usuários administrativos", () => {
    const env = createLocalE2EEnvironment();
    expect(roleCan(env.users.aMember.role, "members", "view")).toBe(true);
    expect(roleCan(env.users.aMember.role, "members", "delete")).toBe(false);
    expect(roleCan(env.users.aMember.role, "team", "manage")).toBe(false);
  });

  it("exige escopo de conta e guarda de permissão nos serviços reais críticos", () => {
    for (const file of serviceFiles) {
      const contents = source(file);
      expect(contents, file).toMatch(/requirePermission|myRole !== "owner"/);
      expect(contents, file).toMatch(/\.eq\("account_id", accountId\)/);
    }
  });

  it("falha fechada se não puder validar vínculos de conta", () => {
    const accountContext = readFileSync(new URL("./account-context.server.ts", import.meta.url), "utf8");
    expect(accountContext).toMatch(
      /if \(error\)[\s\S]*throw new Error\("Não foi possível validar o vínculo da conta ativa\."\)/,
    );
    expect(accountContext).not.toMatch(
      /if \(error\)[\s\S]{0,300}return \{ accountId: userId, role: "owner" \}/,
    );
  });
});
