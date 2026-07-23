import { describe, expect, it } from "vitest";
import { resolveAccountContextFromMemberships } from "@/lib/account-context.server";

describe("resolveAccountContextFromMemberships", () => {
  it("mantém compatibilidade para o proprietário sem vínculo de equipe", () => {
    expect(resolveAccountContextFromMemberships("owner-user", [])).toEqual({
      accountId: "owner-user",
      role: "owner",
    });
  });

  it("prioriza a conta em que o usuário é proprietário", () => {
    expect(
      resolveAccountContextFromMemberships("user", [
        { account_id: "account-b", role: "editor", created_at: "2026-07-02T00:00:00Z" },
        { account_id: "account-a", role: "owner", created_at: "2026-07-03T00:00:00Z" },
      ]),
    ).toEqual({ accountId: "account-a", role: "owner" });
  });

  it("escolhe de modo determinístico o vínculo mais antigo quando não há propriedade", () => {
    expect(
      resolveAccountContextFromMemberships("user", [
        { account_id: "account-b", role: "editor", created_at: "2026-07-02T00:00:00Z" },
        { account_id: "account-a", role: "viewer", created_at: "2026-07-01T00:00:00Z" },
      ]),
    ).toEqual({ accountId: "account-a", role: "viewer" });
  });

});
