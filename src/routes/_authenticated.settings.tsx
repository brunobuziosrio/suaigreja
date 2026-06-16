import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Página em desenvolvimento. Volte em breve.</p>
        </Card>
      </div>
    </AppShell>
  );
}
