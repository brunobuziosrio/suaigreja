import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, WalletCards } from "lucide-react";
import { getIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = !!adminCheck?.isAdmin;

  if (checking) {
    return (
      <AppShell>
        <div className="text-sm text-muted-foreground">Verificando permissões…</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-xl font-semibold">Área restrita</h1>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <WalletCards className="h-6 w-6" /> Pagamentos da plataforma
        </h1>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Página em desenvolvimento.</p>
        </Card>
      </div>
    </AppShell>
  );
}
