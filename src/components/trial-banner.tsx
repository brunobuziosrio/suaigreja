import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { getMyAccount } from "@/lib/account.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function TrialBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchAccount = useServerFn(getMyAccount);

  const { data: account } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: !!user,
    staleTime: 60_000,
  });

  if (!account || account.subscription_status !== "trial" || !account.trial_ends_at) return null;

  const endsAt = new Date(account.trial_ends_at);
  const daysRemaining = Math.ceil((endsAt.getTime() - Date.now()) / 86_400_000);
  if (daysRemaining < 0) return null;

  const urgent = daysRemaining <= 3;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-sm sm:px-6 ${
        urgent ? "bg-amber-soft/60 text-amber border-amber/20" : "bg-gold-soft/20 text-ink border-outline"
      }`}
    >
      <span className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0" />
        {daysRemaining === 0
          ? "Seu teste grátis termina hoje."
          : `Seu teste grátis termina em ${daysRemaining} dia${daysRemaining === 1 ? "" : "s"}.`}
      </span>
      <Button size="sm" variant={urgent ? "default" : "outline"} onClick={() => navigate({ to: "/billing" })}>
        Ver planos
      </Button>
    </div>
  );
}
