import type { PlanTier } from "@/lib/billing-plans";
import { resolveAccountContext } from "@/lib/account-context.server";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ModuleStatus = "core" | "beta" | "lab" | "ready";
export type ModuleRolloutStatus = "hidden" | "internal" | "beta" | "live";

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

type AccountPlanRow = NonNullable<AccountAccess>;

type SupabaseResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type SupabaseSingleQuery<T> = {
  eq(column: string, value: string): SupabaseSingleQuery<T>;
  maybeSingle(): PromiseLike<SupabaseResult<T>>;
};

type SupabasePlanClient = {
  from(table: "accounts"): {
    select(columns: string): SupabaseSingleQuery<AccountPlanRow>;
  };
};

type SupabaseModuleClient = SupabasePlanClient & {
  from(table: "plan_feature_flags"): {
    select(columns: string): SupabaseSingleQuery<{ enabled: boolean }>;
  };
  from(table: "module_rollouts"): {
    select(columns: string): SupabaseSingleQuery<{ status: ModuleRolloutStatus }>;
  };
  from(table: "user_roles"): {
    select(columns: string): SupabaseSingleQuery<{ role: string }>;
  };
  from(table: "account_feature_overrides"): {
    select(columns: string): SupabaseSingleQuery<{ enabled: boolean }>;
  };
};

const TIER_RANK: Record<PlanTier, number> = {
  essential: 0,
  pro: 1,
  premium: 2,
};

export const MODULE_CATALOG: ModuleAccess[] = [
  { id: "reports", label: "Relatórios", path: "/relatorios", minimumTier: "pro", status: "ready", sellable: true },
  { id: "whatsapp", label: "WhatsApp", path: "/whatsapp", minimumTier: "pro", status: "beta", sellable: true },
  { id: "members", label: "Membros e pessoas", path: "/membros", minimumTier: "pro", status: "core", sellable: true },
  { id: "congregations", label: "Multiunidade e congregações", path: "/congregacoes", minimumTier: "pro", status: "ready", sellable: true },
  { id: "visitors", label: "Visitantes", path: "/visitantes", minimumTier: "pro", status: "ready", sellable: true },
  { id: "events", label: "Eventos", path: "/eventos", minimumTier: "pro", status: "core", sellable: true },
  { id: "festinhas", label: "Festinhas e barracas", path: "/festinhas", minimumTier: "pro", status: "beta", sellable: true },
  { id: "checkin", label: "Check-in", path: "/checkin", minimumTier: "pro", status: "ready", sellable: true },
  { id: "child_checkin", label: "Check-in Infantil Seguro", path: "/checkin-infantil", minimumTier: "pro", status: "ready", sellable: true },
  { id: "campaigns", label: "Campanhas e contribuições", path: "/campanhas", minimumTier: "pro", status: "core", sellable: true },
  { id: "small_groups", label: "Células, grupos e pastorais", path: "/celulas", minimumTier: "pro", status: "ready", sellable: true },
  { id: "education", label: "Ensino e turmas", path: "/ebd", minimumTier: "premium", status: "ready", sellable: true },
  { id: "documents", label: "Documentos", path: "/documentos", minimumTier: "premium", status: "beta", sellable: true },
  { id: "finances", label: "Financeiro", path: "/finances", minimumTier: "pro", status: "ready", sellable: true },
  { id: "bank_accounts", label: "Contas Bancárias e Pix", path: "/contas-bancarias", minimumTier: "pro", status: "ready", sellable: true },
  { id: "cash_book", label: "Livro Caixa", path: "/livro-caixa", minimumTier: "pro", status: "ready", sellable: true },
  { id: "volunteer_shifts", label: "Escalas", path: "/escalas", minimumTier: "pro", status: "ready", sellable: true },
  { id: "secretaria", label: "Secretaria Digital", path: "/secretaria", minimumTier: "pro", status: "beta", sellable: true },
];

// Módulos mantidos no código, mas fora da navegação comercial da versão 1.0.
// Eles só voltam ao menu quando a fase correspondente for autorizada e validada.
const COMMERCIAL_NAVIGATION_HIDDEN_PATHS = new Set([
  "/campanhas-whatsapp",
  "/jornada-espiritual",
  "/ausencias",
  "/decisoes",
  "/acompanhamento",
  "/talentos",
  "/acao-social",
  "/assistente-eventos",
  "/festinhas",
  "/reservas",
  "/patrimonio",
  "/ebd",
  "/devocional",
  "/documentos",
  "/embed",
  "/marketplace",
]);

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

export function isNavigationPathVisible(
  account: AccountAccess,
  pathname: string,
  visibleModulePaths: readonly string[] | undefined,
) {
  if (!canAccessAccountPath(account, pathname)) return false;
  if (COMMERCIAL_NAVIGATION_HIDDEN_PATHS.has(pathname)) return false;

  const module = getModuleForPath(pathname);
  return !module || !!visibleModulePaths?.includes(module.path);
}

export const getMyNavigationAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    const [{ data: account, error: accountError }, { data: flags, error: flagsError }, { data: rollouts, error: rolloutsError }, { data: overrides, error: overridesError }] = await Promise.all([
      supabaseAdmin
        .from("accounts")
        .select("plan_tier, subscription_status, subscription_ends_at, trial_ends_at")
        .eq("id", accountId)
        .maybeSingle(),
      supabaseAdmin.from("plan_feature_flags").select("feature_id, plan_tier, enabled"),
      supabaseAdmin.from("module_rollouts").select("feature_id, status"),
      supabaseAdmin
        .from("account_feature_overrides")
        .select("feature_id, enabled")
        .eq("account_id", accountId),
    ]);
    if (accountError) throw new Error(accountError.message);
    if (flagsError) throw new Error(flagsError.message);
    if (rolloutsError) throw new Error(rolloutsError.message);
    if (overridesError) throw new Error(overridesError.message);

    const tier = resolveAccountAccess(account).tier;
    const flagsByModule = new Map((flags ?? []).filter((flag) => flag.plan_tier === tier).map((flag) => [flag.feature_id, flag.enabled]));
    const rolloutByModule = new Map((rollouts ?? []).map((rollout) => [rollout.feature_id, rollout.status]));
    const overridesByModule = new Map((overrides ?? []).map((override) => [override.feature_id, override.enabled]));

    const visibleModulePaths = MODULE_CATALOG.filter((module) => {
      if (!canAccessAccountPath(account, module.path)) return false;
      const override = overridesByModule.get(module.id);
      if (override === false) return false;
      if (override === true) return true;
      const rollout = rolloutByModule.get(module.id) ?? (module.status === "lab" ? "internal" : "live");
      if (rollout !== "live" || module.status === "beta") return false;
      return flagsByModule.get(module.id) ?? true;
    }).map((module) => module.path);

    return { visibleModulePaths };
  });

export function getMinimumTier(pathname: string) {
  return getModuleForPath(pathname)?.minimumTier ?? null;
}

export function getModuleAccess(pathname: string) {
  return getModuleForPath(pathname) ?? null;
}

export function hasPlanTier(currentTier: PlanTier, minimumTier: PlanTier) {
  return TIER_RANK[currentTier] >= TIER_RANK[minimumTier];
}

export type PlanTierCheck = {
  tier: PlanTier;
  accountId: string;
  role: string;
};

export async function requirePlanTier(
  context: {
    supabase: SupabasePlanClient;
    userId: string;
  },
  minimumTier: PlanTier,
): Promise<PlanTierCheck> {
  // Resolve a conta real: para o dono, accountId = userId; para um membro da
  // equipe convidado (Fase 2), accountId vem do vinculo em account_members.
  const { accountId, role } = await resolveAccountContext(context.userId);

  const { data, error } = await context.supabase
    .from("accounts")
    .select("plan_tier, subscription_status, subscription_ends_at, trial_ends_at")
    .eq("id", accountId)
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

  return { tier: currentTier, accountId, role };
}

export async function requireModuleAccess(
  context: {
    supabase: SupabaseModuleClient;
    userId: string;
  },
  pathname: string,
): Promise<PlanTierCheck> {
  const module = getModuleForPath(pathname);
  if (!module) return requirePlanTier(context as never, "essential");
  const access = await requirePlanTier(context as never, module.minimumTier);

  const [{ data: rollout, error: rolloutError }, { data: planFlag, error: flagError }, { data: override, error: overrideError }] = await Promise.all([
    context.supabase.from("module_rollouts").select("status").eq("feature_id", module.id).maybeSingle(),
    context.supabase
      .from("plan_feature_flags")
      .select("enabled")
      .eq("feature_id", module.id)
      .eq("plan_tier", access.tier)
      .maybeSingle(),
    context.supabase.from("account_feature_overrides").select("enabled").eq("account_id", access.accountId).eq("feature_id", module.id).maybeSingle(),
  ]);
  if (rolloutError) throw new Error(rolloutError.message);
  if (flagError) throw new Error(flagError.message);
  if (overrideError) throw new Error(overrideError.message);

  const rolloutStatus = rollout?.status ?? (module.status === "lab" ? "internal" : "live");
  if (rolloutStatus === "hidden") {
    throw new Error("Este módulo está temporariamente desativado.");
  }

  if (rolloutStatus === "internal") {
    const { data: adminRole, error: adminError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (adminError) throw new Error(adminError.message);
    if (!adminRole) throw new Error("Este módulo está reservado para testes internos.");
  }

  // Ausência de linha mantém compatibilidade enquanto uma migration ainda não foi aplicada.
  if (override?.enabled === false) {
    throw new Error("Este recurso foi desativado para esta instituição.");
  }
  if (!override?.enabled && planFlag && !planFlag.enabled) {
    throw new Error("Este recurso não está incluído no seu plano atual.");
  }
  return access;
}
