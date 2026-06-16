import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccount } from "@/lib/account.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fetchAccount = useServerFn(getMyAccount);

  const { data: account, isLoading: accountLoading, isError: accountError } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: !!user,
    retry: 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (accountLoading) return;
    if (account === null && pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
      return;
    }
    if (account && !account.onboarded && pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
    if (account?.onboarded && pathname === "/onboarding") {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, account, accountLoading, pathname, navigate]);

  if (loading || !user || accountLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (accountError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm text-muted-foreground">Erro ao carregar os dados da conta.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline text-primary hover:opacity-80 transition-opacity"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Outlet />;
}