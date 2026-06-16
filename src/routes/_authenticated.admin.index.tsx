import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getIsAdmin,
  listAllAccounts,
  updateAccountSubscription,
  adminUpdateAccountName,
} from "@/lib/admin.functions";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Users, Pencil, Check as CheckIcon, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPage,
});

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Trial", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  past_due: { label: "Em atraso", variant: "destructive" },
  canceled: { label: "Cancelado", variant: "outline" },
};

function AdminPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const listAccounts = useServerFn(listAllAccounts);
  const updateStatus = useServerFn(updateAccountSubscription);
  const updateName = useServerFn(adminUpdateAccountName);
  const qc = useQueryClient();

  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });

  const isAdmin = !!adminCheck?.isAdmin;

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAccounts(),
    enabled: isAdmin,
  });

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!accounts) return [];
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.brand_title ?? "").toLowerCase().includes(q) ||
        (a.site_id ?? "").toLowerCase().includes(q)
    );
  }, [accounts, search]);

  const mut = useMutation({
    mutationFn: (vars: { account_id: string; subscription_status: "trial" | "active" | "past_due" | "canceled" }) =>
      updateStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const nameMut = useMutation({
    mutationFn: (vars: { account_id: string; brand_title: string }) =>
      updateName({ data: vars }),
    onSuccess: () => {
      toast.success("Nome atualizado");
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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

  const stats = {
    total: accounts?.length ?? 0,
    active: accounts?.filter((a) => a.subscription_status === "active").length ?? 0,
    trial: accounts?.filter((a) => a.subscription_status === "trial").length ?? 0,
    canceled: accounts?.filter((a) => ["canceled", "past_due"].includes(a.subscription_status)).length ?? 0,
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6" /> Painel Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie todas as contas do SaaS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Contas" value={stats.total} />
          <StatCard label="Ativas" value={stats.active} tone="text-emerald-600" />
          <StatCard label="Em trial" value={stats.trial} tone="text-amber-600" />
          <StatCard label="Inativas" value={stats.canceled} tone="text-rose-600" />
        </div>

        <Card className="p-4">
          <Input
            placeholder="Buscar por e-mail, título da agenda ou site_id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </Card>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Agenda</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Eventos</TableHead>
                <TableHead>Trial até</TableHead>
                <TableHead className="w-[170px]">Alterar status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    Carregando…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma conta encontrada.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((a) => {
                const st = STATUS_LABELS[a.subscription_status] ?? { label: a.subscription_status, variant: "outline" as const };
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.email ?? "—"}</TableCell>
                    <TableCell>
                      {editingId === a.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editingName.trim()) {
                                nameMut.mutate({ account_id: a.id, brand_title: editingName.trim() });
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                            className="h-7 text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            disabled={!editingName.trim() || nameMut.isPending}
                            onClick={() =>
                              nameMut.mutate({ account_id: a.id, brand_title: editingName.trim() })
                            }
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingId(null)}
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group">
                          <div>
                            <div className="font-medium text-sm">{a.brand_title}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{a.site_id}</div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setEditingId(a.id);
                              setEditingName(a.brand_title ?? "");
                            }}
                            title="Editar nome"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="capitalize text-sm">{a.religion_profile}</TableCell>
                    <TableCell>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{a.event_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.trial_ends_at ? new Date(a.trial_ends_at).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.subscription_status}
                        onValueChange={(v) =>
                          mut.mutate({
                            account_id: a.id,
                            subscription_status: v as "trial" | "active" | "past_due" | "canceled",
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="past_due">Em atraso</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
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