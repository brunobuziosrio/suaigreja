import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getIsAdmin,
  listManagedDomainRequests,
  adminUpdateManagedDomainStatus,
} from "@/lib/admin.functions";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Globe, ArrowLeft, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/domains")({
  component: AdminDomainsPage,
});

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "outline";

const MANAGED_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  not_requested: { label: "Não solicitado", variant: "neutral" },
  requested: { label: "Solicitado", variant: "warning" },
  in_progress: { label: "Em andamento", variant: "default" },
  registered: { label: "Registrado", variant: "primary" },
  configured: { label: "Configurado", variant: "success" },
  blocked: { label: "Bloqueado", variant: "error" },
};

const MANAGED_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "requested", label: "Solicitado" },
  { value: "in_progress", label: "Em andamento" },
  { value: "registered", label: "Registrado" },
  { value: "configured", label: "Configurado" },
  { value: "blocked", label: "Bloqueado" },
  { value: "not_requested", label: "Cancelar pedido" },
];

type DomainRequest = {
  id: string;
  site_id: string | null;
  brand_title: string | null;
  email: string | null;
  plan_tier: string | null;
  subscription_status: string | null;
  custom_domain: string | null;
  custom_domain_status: string | null;
  managed_domain_requested_name: string | null;
  managed_domain_status: string | null;
  managed_domain_holder_name: string | null;
  managed_domain_holder_document: string | null;
  managed_domain_holder_email: string | null;
  managed_domain_holder_phone: string | null;
  managed_domain_holder_address: string | null;
  managed_domain_notes: string | null;
  managed_domain_requested_at: string | null;
  managed_domain_updated_at: string | null;
};

function AdminDomainsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const listRequests = useServerFn(listManagedDomainRequests);
  const updateStatus = useServerFn(adminUpdateManagedDomainStatus);
  const qc = useQueryClient();

  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = !!adminCheck?.isAdmin;

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["admin-managed-domains"],
    queryFn: () => listRequests() as Promise<DomainRequest[]>,
    enabled: isAdmin,
  });

  const saveMut = useMutation({
    mutationFn: (vars: {
      account_id: string;
      managed_domain_status: string;
      managed_domain_notes: string | null;
    }) =>
      updateStatus({
        data: {
          account_id: vars.account_id,
          managed_domain_status:
            vars.managed_domain_status as DomainRequest["managed_domain_status"] as never,
          managed_domain_notes: vars.managed_domain_notes,
        },
      }),
    onSuccess: () => {
      toast.success("Pedido de domínio atualizado");
      qc.invalidateQueries({ queryKey: ["admin-managed-domains"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = useMemo(() => {
    const base = {
      total: requests?.length ?? 0,
      requested: 0,
      in_progress: 0,
      configured: 0,
      blocked: 0,
    };
    for (const r of requests ?? []) {
      const s = r.managed_domain_status ?? "";
      if (s === "requested") base.requested += 1;
      else if (s === "in_progress") base.in_progress += 1;
      else if (s === "configured" || s === "registered") base.configured += 1;
      else if (s === "blocked") base.blocked += 1;
    }
    return base;
  }, [requests]);

  if (checking) {
    return (
      <AppShell>
        <div className="w-full text-sm text-muted-foreground">Verificando permissões…</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-xl font-semibold">Área restrita</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Esta página é só para administradores da plataforma.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Globe className="h-6 w-6" /> Domínios gerenciados
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pedidos de domínio incluso no plano para atendimento assistido.
            </p>
          </div>
          <Link to="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Pedidos" value={stats.total} />
          <StatCard label="Solicitados" value={stats.requested} tone="text-amber-600" />
          <StatCard label="Em andamento" value={stats.in_progress} tone="text-sky-600" />
          <StatCard label="Concluídos" value={stats.configured} tone="text-emerald-600" />
        </div>

        {isLoading && (
          <Card className="p-8 text-center text-sm text-muted-foreground">Carregando pedidos…</Card>
        )}

        {isError && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Erro ao carregar os pedidos de domínio.</p>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ["admin-managed-domains"] })}
              className="mt-2 text-sm underline text-primary hover:opacity-80 transition-opacity"
            >
              Tentar novamente
            </button>
          </Card>
        )}

        {!isLoading && !isError && (requests?.length ?? 0) === 0 && (
          <Card className="p-10 text-center">
            <Globe className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum pedido de domínio gerenciado no momento.
            </p>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {(requests ?? []).map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              saving={saveMut.isPending}
              onSave={(status, notes) =>
                saveMut.mutate({
                  account_id: r.id,
                  managed_domain_status: status,
                  managed_domain_notes: notes,
                })
              }
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function RequestCard({
  request,
  saving,
  onSave,
}: {
  request: DomainRequest;
  saving: boolean;
  onSave: (status: string, notes: string | null) => void;
}) {
  const current = request.managed_domain_status ?? "requested";
  const [status, setStatus] = useState(current);
  const [notes, setNotes] = useState(request.managed_domain_notes ?? "");

  const statusInfo = MANAGED_STATUS[current] ?? { label: current, variant: "outline" as const };
  const dirty = status !== current || notes !== (request.managed_domain_notes ?? "");

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{request.brand_title ?? "Sem nome"}</div>
          <div className="text-xs text-muted-foreground font-mono truncate">
            {request.email ?? request.site_id ?? request.id}
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <div className="rounded-md border bg-muted/20 p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Domínio desejado
        </div>
        <div className="font-medium break-all">
          {request.managed_domain_requested_name ?? "—"}
        </div>
        {request.custom_domain && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="break-all">
              Domínio próprio: {request.custom_domain} ({request.custom_domain_status ?? "—"})
            </span>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Field label="Titular" value={request.managed_domain_holder_name} />
        <Field label="Documento" value={request.managed_domain_holder_document} />
        <Field label="E-mail" value={request.managed_domain_holder_email} />
        <Field label="Telefone" value={request.managed_domain_holder_phone} />
        <div className="sm:col-span-2">
          <Field label="Endereço" value={request.managed_domain_holder_address} />
        </div>
      </dl>

      <div className="space-y-2">
        <Label htmlFor={`notes-${request.id}`}>Observações internas</Label>
        <Textarea
          id={`notes-${request.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações do atendimento (registrador, protocolo, pendências)…"
          rows={2}
          maxLength={1000}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`status-${request.id}`}>Status do atendimento</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id={`status-${request.id}`} aria-label="Status do pedido de domínio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANAGED_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => onSave(status, notes.trim() ? notes.trim() : null)}
          disabled={!dirty || saving}
          className="sm:w-auto"
        >
          Salvar
        </Button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {request.managed_domain_requested_at && (
          <span>
            Solicitado em {new Date(request.managed_domain_requested_at).toLocaleString("pt-BR")}
          </span>
        )}
        {request.managed_domain_updated_at && (
          <span>
            Atualizado em {new Date(request.managed_domain_updated_at).toLocaleString("pt-BR")}
          </span>
        )}
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="break-words">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}
