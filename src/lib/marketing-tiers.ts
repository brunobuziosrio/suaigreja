import { BILLING_PLANS, PLAN_FEATURES, type PlanTier } from "@/lib/billing-plans";

export type MarketingTier = {
  id: PlanTier;
  name: string;
  tagline: string;
  priceLabel: string;
  amountCents: number;
  features: string[];
  highlight?: boolean;
};

const TIER_TAGLINES: Record<PlanTier, string> = {
  essential: "Comece sua presença digital",
  pro: "Organize pessoas, eventos e comunicação",
  premium: "Opere sua igreja com mais profundidade",
};

export const MARKETING_TIERS: MarketingTier[] = (["essential", "pro", "premium"] as const).map((tier) => {
  const monthly = BILLING_PLANS[`${tier}_monthly`];
  return {
    id: tier,
    name: monthly.tierLabel,
    tagline: TIER_TAGLINES[tier],
    priceLabel: monthly.priceLabel,
    amountCents: monthly.amountCents,
    features: [...PLAN_FEATURES[tier]],
    highlight: tier === "pro",
  };
});
