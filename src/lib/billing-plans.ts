export const BILLING_PLANS = {
  monthly: {
    id: "monthly",
    label: "Mensal",
    priceLabel: "R$ 29/mês",
    amountCents: 2900,
    durationDays: 30,
  },
  annual: {
    id: "annual",
    label: "Anual",
    priceLabel: "R$ 290/ano",
    amountCents: 29000,
    durationDays: 365,
  },
} as const;

export type BillingPlanId = keyof typeof BILLING_PLANS;

export function formatCentsBRL(amountCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}