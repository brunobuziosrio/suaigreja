import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createPixPayment, getBillingSetup, listMyPayments } from "@/lib/billing.functions";
import { BILLING_PLANS, formatCentsBRL, type BillingPlanId } from "@/lib/billing-plans";
import { Check, Copy, Loader2, QrCode, WalletCards } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
});

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando pagamento",
  waiting_payment: "Aguardando pagamento",
  paid: "Pago",
  authorized: "Pago",
  expired: "Expirado",
  canceled: "Cancelado",
  refused: "Recusado",
};

function BillingPage() {
  const getSetup = useServerFn(getBillingSetup);
  const getPayments = useServerFn(listMyPayments);
  const createPayment = useServerFn(createPixPayment);
  const qc = useQueryClient();

  const { data: setup, isLoading: setupLoading } = useQuery({
    queryKey: ["billing-setup"],
    queryFn: () => getSetup(),
  });
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["billing-payments"],
    queryFn: () => getPayments(),
  });

  const activePayment = payments.find((p) => ["pending", "waiting_payment"].includes(p.status));

  const mut = useMutation({
    mutationFn: (plan: BillingPlanId) => createPayment({ data: { plan } }),
    onSuccess: () => {
      toast.success("PIX gerado");
      qc.invalidateQueries({ queryKey: ["billing-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = (text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Código PIX copiado");
  };

  const account = setup?.account;

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <WalletCards className="h-6 w-6" /> Assinatura
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            O pagamento é por PIX manual. A cada ciclo você gera uma nova cobrança.
          </p>
        </div>

        <Card className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {setupLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando status…
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <Badge>{account?.subscription_status === "active" ? "Ativo" : "Trial"}</Badge>
                {account?.current_plan && <span className="text-sm text-muted-foreground">Plano {BILLING_PLANS[account.current_plan as BillingPlanId]?.label}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {account?.subscription_ends_at
                  ? `Assinatura válida até ${new Date(account.subscription_ends_at).toLocaleDateString("pt-BR")}`
                  : `Trial válido até ${account?.trial_ends_at ? new Date(account.trial_ends_at).toLocaleDateString("pt-BR") : "—"}`}
              </p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Webhook: <code>/api/public/ativopay-webhook</code>
          </div>
        </Card>

        {!setup?.hasAtivoPayKey && (
          <Card className="p-5 border-destructive/40">
            <h2 className="font-semibold">Falta só a chave da AtivoPay</h2>
            <p className="text-sm text-muted-foreground mt-1">
              No painel da AtivoPay, entre em <b>Suas Chaves → Chave de API</b>. Depois me envie a chave ou peça para salvar como <b>ATIVOPAY_API_KEY</b>.
            </p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {(Object.keys(BILLING_PLANS) as BillingPlanId[]).map((planId) => {
            const plan = BILLING_PLANS[planId];
            return (
              <Card key={plan.id} className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Plano {plan.label}</h2>
                    {planId === "annual" && <Badge variant="secondary">2 meses grátis</Badge>}
                  </div>
                  <div className="text-3xl font-semibold mt-3">{plan.priceLabel}</div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Agenda e embed ilimitados</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Pagamento por PIX via AtivoPay</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Ativação automática pelo webhook</li>
                </ul>
                <Button className="w-full" disabled={!setup?.hasAtivoPayKey || mut.isPending} onClick={() => mut.mutate(planId)}>
                  {mut.isPending ? "Gerando…" : "Gerar PIX"}
                </Button>
              </Card>
            );
          })}
        </div>

        {activePayment && (
          <Card className="p-6 grid md:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="rounded-md border p-4 flex items-center justify-center bg-background">
              {activePayment.qr_code ? <img src={activePayment.qr_code} alt="QR Code PIX" className="w-64 h-64" /> : <QrCode className="h-24 w-24 text-muted-foreground" />}
            </div>
            <div className="space-y-4 min-w-0">
              <div>
                <h2 className="text-lg font-semibold">PIX aguardando pagamento</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {BILLING_PLANS[activePayment.plan as BillingPlanId]?.label} • {formatCentsBRL(activePayment.amount_cents)}
                </p>
              </div>
              <div className="flex gap-2">
                <Input readOnly value={activePayment.copy_paste ?? ""} className="font-mono text-xs" />
                <Button variant="outline" onClick={() => copy(activePayment.copy_paste)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Depois do pagamento, a AtivoPay envia o webhook e a assinatura fica ativa automaticamente.
              </p>
            </div>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="font-semibold">Histórico de cobranças</h2>
          <div className="mt-4 space-y-2">
            {paymentsLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
            {!paymentsLoading && payments.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cobrança gerada ainda.</p>}
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 border rounded-md p-3 text-sm">
                <div>
                  <div className="font-medium">Plano {BILLING_PLANS[p.plan as BillingPlanId]?.label} — {formatCentsBRL(p.amount_cents)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <Badge variant={p.status === "paid" || p.status === "authorized" ? "default" : "secondary"}>{STATUS_LABELS[p.status] ?? p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}