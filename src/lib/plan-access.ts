import type { PlanTier } from "@/lib/billing-plans";

export type ModuleStatus = "core" | "beta" | "lab" | "ready";

export type ModuleAccess = {
  id: string;
  label: string;
  path: string;
  minimumTier: PlanTier;
  status: ModuleStatus;
  sellable: boolean;
};

type AccountAccess = {
  plan_tier?: string | null;
  subscription_status?: string | null;
  subscription_ends_at?: string | null;
  trial_ends_at?: string | null;
} | null | undefined;

const TIER_RANK: Record<PlanTier, number> = {
  essential: 0,
  pro: 1,
  premium: 2,
};

export const MODULE_CATALOG: ModuleAccess[] = [
  { id: "reports", label: "Relatórios", path: "/relatorios", minimumTier: "pro", status: "ready", sellable: true },
  { id: "whatsapp", label: "WhatsApp", path: "/whatsapp", minimumTier: "pro", status: "beta", sellable: true },
  { id: "members", label: "Membros e pessoas", path: "/membros", minimumTier: "pro", status: "core", sellable: true },
  { id: "visitors", label: "Visitantes", path: "/visitantes", minimumTier: "pro", status: "ready", sellable: true },
  { id: "events", label: "Eventos", path: "/eventos", minimumTier: "pro", status: "core", sellable: true },
  { id: "checkin", label: "Check-in", path: "/checkin", minimumTier: "pro", status: "ready", sellable: true },
  { id: "campaigns", label: "Campanhas e contribuições", path: "/campanhas", minimumTier: "pro", status: "core", sellable: true },
  { id: "small_groups", label: "Células, grupos e pastorais", path: "/celulas", minimumTier: "premium", status: "ready", sellable: true },
  { id: "education", label: "Ensino e turmas", path: "/ebd", minimumTier: "premium", status: "ready", sellable: true },
  { id: "documents", label: "Documentos", path: "/documentos", minimumTier: "premium", status: "beta", sellable: false },
  { id: "finances", label: "Financeiro", path: "/finances", minimumTier: "premium", status: "ready", sellable: true },
  { id: "volunteer_shifts", label: "Escalas", path: "/escalas", minimumTier: "premium", status: "ready", sellable: true },
  { id: "secretaria", label: "Secretaria Digital", path: "/secretaria", minimumTier: "pro", status: "beta", sellable: true },
];

function getModuleForPath(pathname: string) {
  return MODULE_CATALOG.find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`));
}

export function isModuleEnabled(module: ModuleAccess) {
  return module.sellable && module.status !== "lab";
}

export function resolvePlanTier(account?: { plan_tier?: string | null } | null): PlanTier {
  if (account?.plan_tier === "essential" || account?.plan_tier === "pro" || account?.plan_tier === "premium") {
    return account.plan_tier;
  }

  // Antes da migration, todas as contas tinham acesso ao produto completo.
  return "premium";
}

function isFutureDate(value?: string | null) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time > Date.now();
}

export function resolveAccountAccess(account?: AccountAccess) {
  const tier = resolvePlanTier(account);
  const status = account?.subscription_status ?? "trial";
  const trialActive = status === "trial" && isFutureDate(account?.trial_ends_at);
  const subscriptionActive =
    status === "active" && (!account?.subscription_ends_at || isFutureDate(account.subscription_ends_at));
  const billingActive = trialActive || subscriptionActive;

  return {
    tier,
    status,
    billingActive,
    reason: billingActive
      ? null
      : status === "trial"
        ? "trial_expired"
        : status === "active"
          ? "subscription_expired"
          : "subscription_inactive",
  };
}

export function canAccessPath(tier: PlanTier, pathname: string) {
  const module = getModuleForPath(pathname);
  if (!module) return true;
  if (!isModuleEnabled(module)) return false;
  return hasPlanTier(tier, module.minimumTier);
}

export function canAccessAccountPath(account: AccountAccess, pathname: string) {
  if (
    pathname === "/billing" ||
    pathname.startsWith("/billing/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/")
  ) {
    return true;
  }

  const access = resolveAccountAccess(account);
  if (!access.billingActive) return false;
  return canAccessPath(access.tier, pathname);
}

export function getMinimumTier(pathname: string) {
  return getModuleForPath(pathname)?.minimumTier ?? null;
}

export function getModuleAccess(pathname: string) {
  return getModuleForPath(pathname) ?? null;
}

export function hasPlanTier(currentTier: PlanTier, minimumTier: PlanTier) {
  return TIER_RANK[currentTier] >= TIER_RANK[minimumTier];
}

export async function requirePlanTier(
  context: {
    supabase: any;
    userId: string;
  },
  minimumTier: PlanTier,
) {
  const { data, error } = await context.supabase
    .from("accounts")
    .select("plan_tier, subscription_status, subscription_ends_at, trial_ends_at")
    .eq("id", context.userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const access = resolveAccountAccess(data);
  if (!access.billingActive) {
    throw new Error("Sua assinatura está inativa ou vencida. Regularize o plano para usar este recurso.");
  }

  const currentTier = access.tier;
  if (!hasPlanTier(currentTier, minimumTier)) {
    throw new Error("Seu plano atual não permite usar este recurso.");
  }

  return currentTier;
}

export async function requireModuleAccess(
  context: {
    supabase: any;
    userId: string;
  },
  pathname: string,
) {
  const module = getModuleForPath(pathname);
  if (!module) return requirePlanTier(context, "essential");
  if (!isModuleEnabled(module)) {
    throw new Error("Este módulo ainda não está disponível para venda.");
  }
  return requirePlanTier(context, module.minimumTier);
}
