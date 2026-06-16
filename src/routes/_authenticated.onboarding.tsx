import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "@/lib/account.functions";
import { RELIGION_PROFILES, type ReligionProfile } from "@/lib/religion-profiles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const [selected, setSelected] = useState<ReligionProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(completeOnboarding);

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await submit({ data: { religion_profile: selected } });
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Tudo pronto! Vamos comecar.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Bem-vindo!</h1>
          <p className="text-muted-foreground mt-2">
            Escolha o perfil que mais combina com a sua comunidade. Isso ajuda a configurar tudo automaticamente.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {RELIGION_PROFILES.map((p) => (
            <Card
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "p-5 cursor-pointer transition-all hover:border-primary",
                selected === p.id && "border-primary ring-2 ring-primary/20",
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </div>
                {selected === p.id && <Check className="h-5 w-5 text-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Tipos padrao: {p.defaultTypes.slice(0, 3).join(", ")}...
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleConfirm} disabled={!selected || submitting} size="lg">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}