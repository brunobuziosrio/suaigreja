import { describe, expect, it } from "vitest";
import { isNavigationPathVisible } from "@/lib/plan-access";

const activeProAccount = {
  plan_tier: "pro",
  subscription_status: "active",
  subscription_ends_at: "2099-01-01T00:00:00.000Z",
};

describe("isNavigationPathVisible", () => {
  it("exibe módulo liberado pelo servidor para o plano ativo", () => {
    expect(isNavigationPathVisible(activeProAccount, "/finances", ["/finances"])).toBe(true);
  });

  it("oculta módulo do catálogo quando a flag/rollout não o liberou", () => {
    expect(isNavigationPathVisible(activeProAccount, "/finances", [])).toBe(false);
  });

  it("oculta recursos futuros da navegação comercial", () => {
    expect(isNavigationPathVisible(activeProAccount, "/marketplace", [])).toBe(false);
  });

  it("não mostra módulo acima do plano contratado", () => {
    const activeEssentialAccount = { ...activeProAccount, plan_tier: "essential" };
    expect(isNavigationPathVisible(activeEssentialAccount, "/finances", ["/finances"])).toBe(false);
  });
});
