export type PlanTier = "essential" | "pro" | "premium";
export type BillingCycle = "monthly" | "annual";

const TIER_LABELS: Record<PlanTier, string> = {
  essential: "Essencial",
  pro: "Pro",
  premium: "Premium",
};

function plan(
  id: string,
  tier: PlanTier,
  cycle: BillingCycle,
  amountCents: number,
) {
  const durationDays = cycle === "annual" ? 365 : 30;
  return {
    id,
    tier,
    cycle,
    label: `${TIER_LABELS[tier]} ${cycle === "annual" ? "Anual" : "Mensal"}`,
    tierLabel: TIER_LABELS[tier],
    cycleLabel: cycle === "annual" ? "Anual" : "Mensal",
    priceLabel: cycle === "annual"
      ? `${formatCentsBRL(amountCents)}/ano`
      : `${formatCentsBRL(amountCents)}/mês`,
    amountCents,
    durationDays,
  } as const;
}

export const BILLING_PLANS = {
  essential_monthly: plan("essential_monthly", "essential", "monthly", 2900),
  essential_annual: plan("essential_annual", "essential", "annual", 29000),
  pro_monthly: plan("pro_monthly", "pro", "monthly", 5900),
  pro_annual: plan("pro_annual", "pro", "annual", 59000),
  premium_monthly: plan("premium_monthly", "premium", "monthly", 9900),
  premium_annual: plan("premium_annual", "premium", "annual", 99000),

  // Compatibilidade com cobranças criadas antes da separação entre nível e ciclo.
  monthly: plan("monthly", "essential", "monthly", 2900),
  annual: plan("annual", "essential", "annual", 29000),
} as const;

export type BillingPlanId = keyof typeof BILLING_PLANS;

export const PURCHASABLE_PLAN_IDS = [
  "essential_monthly",
  "essential_annual",
  "pro_monthly",
  "pro_annual",
  "premium_monthly",
  "premium_annual",
] as const satisfies readonly BillingPlanId[];

export const PLAN_FEATURES: Record<PlanTier, readonly string[]> = {
  essential: ["Site público", "Agenda e notícias", "Transmissões", "Pix, oração e galeria"],
  pro: ["Tudo do Essencial", "CRM de membros e visitantes", "Eventos e check-in", "Campanhas, relatórios e WhatsApp"],
  premium: ["Tudo do Pro", "Células e pastorais", "Escalas de voluntários", "Secretaria digital e automações"],
};

export function formatCentsBRL(amountCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
