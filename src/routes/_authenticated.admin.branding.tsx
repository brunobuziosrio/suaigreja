import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Palette, ShieldCheck } from "lucide-react";
import { getIsAdmin } from "@/lib/admin.functions";
import { PlatformBrandingSection } from "@/routes/_authenticated.admin.payments";

export const Route = createFileRoute("/_authenticated/admin/branding")({
  component: AdminBrandingPage,
});

function AdminBrandingPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });

  if (checking) {
    return <AppShell><div className="w-full text-sm text-muted-foreground">Verificando permissões…</div></AppShell>;
  }
  if (!adminCheck?.isAdmin) {
    return <AppShell><Card className="p-8 text-center"><ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><h1 className="text-xl font-semibold">Área restrita</h1></Card></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Palette className="h-6 w-6" /> Identidade da plataforma</h1>
          <p className="mt-1 text-sm text-muted-foreground">Defina a marca exibida no painel de todos os clientes.</p>
        </div>
        <PlatformBrandingSection />
      </div>
    </AppShell>
  );
}
