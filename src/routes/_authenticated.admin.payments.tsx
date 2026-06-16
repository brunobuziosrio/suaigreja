import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, WalletCards, Loader2 } from "lucide-react";
import { getIsAdmin } from "@/lib/admin.functions";
import { getPlatformPaymentSettings, updatePlatformPaymentSettings } from "@/lib/admin-payment-settings.functions";
import { useBranding } from "@/hooks/use-branding";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchSettings = useServerFn(getPlatformPaymentSettings);
  const saveSettings = useServerFn(updatePlatformPaymentSettings);
  const qc = useQueryClient();

  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });

  const { data: branding } = useBranding();

  const { data: paymentSettings } = useQuery({
    queryKey: ["platform-payment-settings"],
    queryFn: () => fetchSettings(),
    enabled: !!adminCheck?.isAdmin,
  });

  const [form, setForm] = useState({
    ativopayApiKey: "",
    ativopayWebhookSecret: "",
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

  const saveMut = useMutation({
    mutationFn: () => saveSettings({ data: form }),
    onSuccess: () => {
      toast.success("Configurações de pagamento atualizadas");
      qc.invalidateQueries({ queryKey: ["platform-payment-settings"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <WalletCards className="h-6 w-6" /> Pagamentos da plataforma
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Identidade visual e gateways de pagamento da plataforma SaaS.
          </p>
        </div>

        {/* Identidade da Plataforma */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identidade da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded text-sm">
              <p className="font-medium mb-2">Branding atual:</p>
              <p>Nome: <span className="font-semibold">{branding?.brand_text || "Não configurado"}</span></p>
              <p>Subtítulo: <span className="font-semibold">{branding?.subtitle || "Não configurado"}</span></p>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure a identidade visual no painel principal de branding.
            </p>
          </CardContent>
        </Card>

        {/* AtivoPay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AtivoPay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={form.ativopayApiKey}
                onChange={(e) => setForm({ ...form, ativopayApiKey: e.target.value })}
                placeholder="sk_live_..."
              />
              <p className="text-xs text-muted-foreground mt-1">Sua chave privada de API do AtivoPay</p>
            </div>
            <div>
              <Label>Webhook Secret</Label>
              <Input
                type="password"
                value={form.ativopayWebhookSecret}
                onChange={(e) => setForm({ ...form, ativopayWebhookSecret: e.target.value })}
                placeholder="whsec_..."
              />
              <p className="text-xs text-muted-foreground mt-1">Secret para validar webhooks do AtivoPay</p>
            </div>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              {saveMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar configurações AtivoPay
            </Button>
          </CardContent>
        </Card>

        {/* Mercado Pago Reservado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mercado Pago da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Token de Mercado Pago para transações da plataforma (reservado para implementação futura).
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
