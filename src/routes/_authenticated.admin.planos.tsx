import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MODULE_CATALOG } from "@/lib/plan-access";
import { listAccountFeatureOverrides, listAllAccounts, listModuleRollouts, listPlanFeatureFlags, updateAccountFeatureOverride, updateModuleRollout, updatePlanFeatureFlag } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/planos")({ component: PlanFeaturesPage });

const tiers = [
  { id: "essential", label: "Essencial", tone: "bg-stone-100" },
  { id: "pro", label: "Pro", tone: "bg-sky-50" },
  { id: "premium", label: "Premium", tone: "bg-amber-50" },
] as const;

const rolloutOptions = [
  { id: "hidden", label: "Desligado" },
  { id: "internal", label: "Interno" },
  { id: "beta", label: "Beta" },
  { id: "live", label: "À venda" },
] as const;

function PlanFeaturesPage() {
  const [pilotAccountId, setPilotAccountId] = useState("");
  const list = useServerFn(listPlanFeatureFlags);
  const save = useServerFn(updatePlanFeatureFlag);
  const listRollouts = useServerFn(listModuleRollouts);
  const saveRollout = useServerFn(updateModuleRollout);
  const listAccounts = useServerFn(listAllAccounts);
  const listOverrides = useServerFn(listAccountFeatureOverrides);
  const saveOverride = useServerFn(updateAccountFeatureOverride);
  const qc = useQueryClient();
  const { data: flags = [], isLoading } = useQuery({ queryKey: ["admin-plan-features"], queryFn: () => list() });
  const { data: rollouts = [], isLoading: rolloutsLoading } = useQuery({ queryKey: ["admin-module-rollouts"], queryFn: () => listRollouts() });
  const { data: accounts = [] } = useQuery({ queryKey: ["admin-accounts"], queryFn: () => listAccounts() });
  const { data: overrides = [], isLoading: overridesLoading } = useQuery({ queryKey: ["admin-account-feature-overrides"], queryFn: () => listOverrides() });
  const mutation = useMutation({
    mutationFn: (data: { feature_id: string; plan_tier: "essential" | "pro" | "premium"; enabled: boolean }) => save({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plan-features"] }),
    onError: (error: Error) => toast.error(error.message),
  });
  const rolloutMutation = useMutation({
    mutationFn: (data: { feature_id: string; status: "hidden" | "internal" | "beta" | "live" }) => saveRollout({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-module-rollouts"] }),
    onError: (error: Error) => toast.error(error.message),
  });
  const overrideMutation = useMutation({
    mutationFn: (data: { account_id: string; feature_id: string; enabled: boolean }) => saveOverride({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-account-feature-overrides"] }),
    onError: (error: Error) => toast.error(error.message),
  });
  const enabled = (featureId: string, tier: "essential" | "pro" | "premium") =>
    flags.find((flag) => flag.feature_id === featureId && flag.plan_tier === tier)?.enabled ?? false;
  const rollout = (featureId: string) => rollouts.find((item) => item.feature_id === featureId)?.status ?? (MODULE_CATALOG.find((item) => item.id === featureId)?.status === "lab" ? "internal" : "live");
  const pilotEnabled = (featureId: string) => overrides.find((item) => item.account_id === pilotAccountId && item.feature_id === featureId)?.enabled === true;

  return <AppShell><div className="mx-auto w-full max-w-6xl space-y-6">
    <header className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-lg">
      <div className="flex items-start gap-4"><span className="rounded-xl bg-white/10 p-3"><LockKeyhole className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Central de rollout</p><h1 className="mt-1 text-2xl font-semibold">Liberação e planos</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Primeiro escolha o estágio do módulo; depois defina em quais planos ele entra. Recursos internos e desligados não ficam disponíveis aos clientes.</p></div></div>
    </header>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[880px] text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-4 text-left">Recurso</th><th className="p-4 text-left">Estágio</th>{tiers.map((tier) => <th key={tier.id} className="p-4 text-center">{tier.label}</th>)}</tr></thead><tbody>{MODULE_CATALOG.map((feature) => <tr key={feature.id} className="border-b last:border-0"><td className="p-4"><div className="font-medium">{feature.label}</div><div className="mt-1 flex gap-2"><Badge variant="outline">{feature.status}</Badge><span className="text-xs text-muted-foreground">{feature.path}</span></div></td><td className="p-4"><select className="h-9 rounded-md border bg-background px-2 text-sm" value={rollout(feature.id)} disabled={rolloutsLoading || rolloutMutation.isPending} onChange={(event) => rolloutMutation.mutate({ feature_id: feature.id, status: event.target.value as "hidden" | "internal" | "beta" | "live" })} aria-label={`Estágio de ${feature.label}`}>{rolloutOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></td>{tiers.map((tier) => <td key={tier.id} className={`p-4 text-center ${tier.tone}`}><Switch checked={enabled(feature.id, tier.id)} disabled={isLoading || mutation.isPending} onCheckedChange={(value) => mutation.mutate({ feature_id: feature.id, plan_tier: tier.id, enabled: value })} aria-label={`${feature.label} no plano ${tier.label}`} /></td>)}</tr>)}</tbody></table></div></Card>
    <Card className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-semibold">Conta-piloto</h2><p className="mt-1 text-sm text-muted-foreground">Libere um recurso para uma instituição antes de incluí-lo em qualquer plano.</p></div><select className="h-10 min-w-72 rounded-md border bg-background px-3 text-sm" value={pilotAccountId} onChange={(event) => setPilotAccountId(event.target.value)}><option value="">Selecione uma instituição</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.brand_title || account.site_id}</option>)}</select></div>{pilotAccountId && <div className="mt-5 flex flex-wrap gap-2">{MODULE_CATALOG.map((feature) => <button key={feature.id} type="button" className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${pilotEnabled(feature.id) ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "bg-background hover:bg-muted"}`} disabled={overridesLoading || overrideMutation.isPending} onClick={() => overrideMutation.mutate({ account_id: pilotAccountId, feature_id: feature.id, enabled: !pilotEnabled(feature.id) })}>{pilotEnabled(feature.id) ? "Piloto ativo: " : "Liberar piloto: "}{feature.label}</button>)}</div>}</Card>
    {mutation.isSuccess && <p className="flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> Alteração salva.</p>}
  </div></AppShell>;
}
