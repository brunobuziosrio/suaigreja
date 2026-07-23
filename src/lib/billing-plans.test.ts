import { describe, expect, it } from "vitest";
import {
  getPurchasablePlan,
  isPurchasablePlanId,
  PURCHASABLE_PLAN_IDS,
} from "@/lib/billing-plans";
import { createPixPaymentInputSchema } from "@/lib/billing-purchase-schema.server";

describe("billing plan purchase contract", () => {
  it("mantém somente os três planos mensais oficiais disponíveis para novas cobranças", () => {
    expect(PURCHASABLE_PLAN_IDS).toEqual([
      "essential_monthly",
      "pro_monthly",
      "premium_monthly",
    ]);
  });

  it("deriva no servidor o nível e o valor da fonte comercial única", () => {
    expect(getPurchasablePlan("essential_monthly")).toMatchObject({ tier: "essential", amountCents: 5900 });
    expect(getPurchasablePlan("pro_monthly")).toMatchObject({ tier: "pro", amountCents: 12900 });
    expect(getPurchasablePlan("premium_monthly")).toMatchObject({ tier: "premium", amountCents: 24900 });
  });

  it("recusa planos anuais e legados para impedir cobranças iniciadas fora da regra vigente", () => {
    expect(isPurchasablePlanId("pro_annual")).toBe(false);
    expect(isPurchasablePlanId("monthly")).toBe(false);
    expect(() => getPurchasablePlan("annual")).toThrow("não está disponível");
  });

  it("aplica a mesma regra no payload server-side do checkout", () => {
    expect(createPixPaymentInputSchema.parse({ plan: "pro_monthly" })).toEqual({ plan: "pro_monthly" });
    expect(() => createPixPaymentInputSchema.parse({ plan: "pro_annual" })).toThrow();
    expect(() => createPixPaymentInputSchema.parse({ plan: "monthly" })).toThrow();
  });
});
