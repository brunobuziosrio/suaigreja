export type PlanTier = "essential" | "pro" | "premium";
export type BillingCycle = "monthly" | "annual";

// Fonte única da promessa comercial. A migration cria trials com esta duração.
export const TRIAL_DAYS = 14;

const TIER_LABELS: Record<PlanTier, string> = {
  essential: "Presença",
  pro: "Gestão",
  premium: "Rede",
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
  essential_monthly: plan("essential_monthly", "essential", "monthly", 5900),
  essential_annual: plan("essential_annual", "essential", "annual", 29000),
  pro_monthly: plan("pro_monthly", "pro", "monthly", 12900),
  pro_annual: plan("pro_annual", "pro", "annual", 59000),
  premium_monthly: plan("premium_monthly", "premium", "monthly", 24900),
  premium_annual: plan("premium_annual", "premium", "annual", 99000),

  // Compatibilidade com cobranças criadas antes da separação entre nível e ciclo.
  monthly: plan("monthly", "essential", "monthly", 2900),
  annual: plan("annual", "essential", "annual", 29000),
} as const;

export type BillingPlanId = keyof typeof BILLING_PLANS;

export const PURCHASABLE_PLAN_IDS = [
  "essential_monthly",
  "pro_monthly",
  "premium_monthly",
] as const satisfies readonly BillingPlanId[];

export const PLAN_FEATURES: Record<PlanTier, readonly string[]> = {
  essential: ["Site público em subdomínio", "Agenda, notícias e transmissões", "Pedidos de oração, Pix e campanhas", "Galeria e comunicação essencial"],
  pro: ["Tudo do Presença", "Pessoas, famílias, visitantes e grupos", "Eventos, inscrições e check-in infantil", "Financeiro, escalas, secretaria e relatórios", "WhatsApp e campanhas de contribuição"],
  premium: ["Tudo do Gestão", "Ensino, turmas e documentos", "Recursos avançados para redes", "Atendimento prioritário"],
};

export function formatCentsBRL(amountCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
