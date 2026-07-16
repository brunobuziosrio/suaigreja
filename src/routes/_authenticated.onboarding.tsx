import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "@/lib/account.functions";
import { RELIGION_PROFILES, type ReligionProfile } from "@/lib/religion-profiles";
import { BILLING_PLANS, PLAN_FEATURES, TRIAL_DAYS, type PlanTier } from "@/lib/billing-plans";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

const STEPS = ["Sua igreja", "Responsável", "Plano"] as const;

const PLAN_TIER_ORDER: PlanTier[] = ["essential", "pro", "premium"];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [brandTitle, setBrandTitle] = useState("");
  const [religionProfile, setReligionProfile] = useState<ReligionProfile | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [selectedTier, setSelectedTier] = useState<PlanTier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(completeOnboarding);

  const canAdvanceStep1 = brandTitle.trim().length >= 2 && !!religionProfile;

  const finish = async () => {
    if (!religionProfile) return;
    setSubmitting(true);
    try {
      await submit({
        data: {
          religion_profile: religionProfile,
          brand_title: brandTitle.trim() || undefined,
          owner_name: ownerName.trim() || undefined,
          owner_phone: ownerPhone.trim() || undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      if (selectedTier) {
        sessionStorage.setItem("onboarding_plan", `${selectedTier}_monthly`);
      }
      toast.success("Tudo pronto! Vamos começar.");
      navigate({ to: selectedTier ? "/billing" : "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Bem-vindo!</h1>
          <p className="text-muted-foreground mt-2">
            Três passos rápidos para configurar tudo automaticamente.
          </p>
        </div>

        {/* Indicador de etapas */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold border-2 shrink-0",
                  i < step && "bg-primary border-primary text-primary-foreground",
                  i === step && "border-primary text-primary",
                  i > step && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:inline", i === step ? "font-medium" : "text-muted-foreground")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 sm:w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Etapa 1: dados da igreja */}
        {step === 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-1">Dados da sua igreja</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Isso aparece no site público e nos documentos gerados pelo sistema.
            </p>
            <div className="space-y-2 mb-6">
              <Label>Nome da igreja ou comunidade</Label>
              <Input
                value={brandTitle}
                onChange={(e) => setBrandTitle(e.target.value)}
                placeholder="Ex: Igreja Batista Central"
                autoFocus
              />
            </div>
            <Label className="mb-2 block">Perfil da comunidade</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {RELIGION_PROFILES.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => setReligionProfile(p.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary",
                    religionProfile === p.id && "border-primary ring-2 ring-primary/20",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{p.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                    </div>
                    {religionProfile === p.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!canAdvanceStep1} size="lg">
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Etapa 2: responsável */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-1">Quem é o responsável?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Usamos isso para contato sobre a conta e a assinatura. Pode preencher depois, se preferir.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do responsável</Label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Seu nome" autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={() => setStep(2)} size="lg">
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Etapa 3: plano */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-1">Escolha um plano</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Você começa com {TRIAL_DAYS} dias de teste grátis em qualquer plano. A escolha abaixo será levada para a assinatura.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PLAN_TIER_ORDER.map((tier) => {
                const monthly = BILLING_PLANS[`${tier}_monthly` as keyof typeof BILLING_PLANS];
                return (
                  <Card
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary",
                      selectedTier === tier && "border-primary ring-2 ring-primary/20",
                      tier === "pro" && selectedTier !== tier && "border-primary/30",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{monthly.tierLabel}</h3>
                      {selectedTier === tier && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xl font-semibold mt-1">{monthly.priceLabel}</p>
                    <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      {PLAN_FEATURES[tier].map((f) => (
                        <li key={f} className="flex gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={finish} disabled={submitting} size="lg">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {selectedTier ? "Concluir e ir para assinatura" : "Concluir e começar teste grátis"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
