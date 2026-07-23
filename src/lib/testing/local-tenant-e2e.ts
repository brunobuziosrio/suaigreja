/**
 * Ambiente local e descartável para os testes de isolamento multi-tenant.
 *
 * Não faz I/O, não lê variáveis de ambiente e não conhece serviços externos.
 * Cada chamada cria organizações, usuários e dados novos em memória.
 */
export type LocalTenantUser = {
  id: string;
  email: string;
  accountId: string;
  role: "owner" | "recepcao";
};

type TenantRow = { id: string; accountId: string; label: string };

export const LOCAL_TENANT_E2E_PASSWORD = "local-e2e-only-not-a-secret";

class TenantRepository {
  constructor(private readonly rows: TenantRow[]) {}

  list(accountId: string) {
    if (!accountId) throw new Error("Consulta sem account_id é proibida.");
    return this.rows.filter((row) => row.accountId === accountId);
  }

  find(accountId: string, id: string) {
    return this.list(accountId).find((row) => row.id === id) ?? null;
  }

  update(accountId: string, id: string, label: string) {
    const row = this.find(accountId, id);
    if (!row) return null;
    row.label = label;
    return row;
  }

  delete(accountId: string, id: string) {
    const index = this.rows.findIndex((row) => row.accountId === accountId && row.id === id);
    if (index < 0) return false;
    this.rows.splice(index, 1);
    return true;
  }
}

/** Representa as respostas HTTP que serviços protegidos devem expor. */
export class LocalTenantController {
  constructor(private readonly repository: TenantRepository) {}

  get(user: LocalTenantUser, id: string) {
    const row = this.repository.find(user.accountId, id);
    return row ? { status: 200 as const, body: row } : { status: 404 as const };
  }

  update(user: LocalTenantUser, id: string, label: string) {
    if (user.role !== "owner") return { status: 403 as const };
    const row = this.repository.update(user.accountId, id, label);
    return row ? { status: 200 as const, body: row } : { status: 404 as const };
  }

  delete(user: LocalTenantUser, id: string) {
    if (user.role !== "owner") return { status: 403 as const };
    return this.repository.delete(user.accountId, id) ? { status: 204 as const } : { status: 404 as const };
  }

  export(user: LocalTenantUser) {
    return { status: 200 as const, body: this.repository.list(user.accountId) };
  }

  unscopedQuery() {
    return this.repository.list("");
  }
}

export function createLocalTenantE2EEnvironment() {
  const organizationA = { id: "00000000-0000-4000-8000-0000000000a1", name: "Organização E2E A" };
  const organizationB = { id: "00000000-0000-4000-8000-0000000000b1", name: "Organização E2E B" };
  const users = {
    a: { id: "00000000-0000-4000-8000-0000000000a2", email: "e2e-org-a@example.test", accountId: organizationA.id, role: "owner" },
    b: { id: "00000000-0000-4000-8000-0000000000b2", email: "e2e-org-b@example.test", accountId: organizationB.id, role: "owner" },
    aReception: { id: "00000000-0000-4000-8000-0000000000a3", email: "e2e-org-a-recepcao@example.test", accountId: organizationA.id, role: "recepcao" },
  } satisfies Record<string, LocalTenantUser>;
  const repository = new TenantRepository([
    { id: "00000000-0000-4000-8000-0000000000a4", accountId: organizationA.id, label: "registro A" },
    { id: "00000000-0000-4000-8000-0000000000b4", accountId: organizationB.id, label: "registro B" },
  ]);

  return { organizationA, organizationB, users, controller: new LocalTenantController(repository) };
}
