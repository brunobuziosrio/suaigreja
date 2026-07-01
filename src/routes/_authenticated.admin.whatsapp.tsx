import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  MessageCircle,
  PlugZap,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  adminGrantWhatsappCredits,
  adminUpsertWhatsappProviderConnection,
  getIsAdmin,
  listWhatsappAdminOverview,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({
  component: AdminWhatsappPage,
});

type AccountRow = {
  id: string;
  site_id: string | null;
  brand_title: string | null;
  plan_tier: string | null;
  subscription_status: string | null;
  whatsapp: {
    enabled: boolean;
    credits_balance: number;
  };
  provider: null | {
    provider: "meta_cloud" | "uazapi";
    active: boolean;
    sender_phone: string | null;
    phone_number_id: string | null;
    instance_id: string | null;
    api_base_url: string | null;
    last_error: string | null;
    last_checked_at: string | null;
  };
  message_counts: Record<string, number>;
};

const emptyProviderForm = {
  account_id: "",
  provider: "meta_cloud" as "meta_cloud" | "uazapi",
  active: true,
  sender_phone: "",
  phone_number_id: "",
  business_account_id: "",
  instance_id: "",
  api_base_url: "",
  access_token_secret_name: "WHATSAPP_META_ACCESS_TOKEN",
};

const emptyCreditForm = {
  account_id: "",
  credits: 100,
  amount_cents: 0,
  note: "",
};

function AdminWhatsappPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchOverview = useServerFn(listWhatsappAdminOverview);
  const saveProvider = useServerFn(adminUpsertWhatsappProviderConnection);
  const grantCredits = useServerFn(adminGrantWhatsappCredits);
  const qc = useQueryClient();

  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = !!adminCheck?.isAdmin;

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["admin-whatsapp-overview"],
    queryFn: () => fetchOverview(),
    enabled: isAdmin,
  });

  const [search, setSearch] = useState("");
  const [providerForm, setProviderForm] = useState(emptyProviderForm);
  const [creditForm, setCreditForm] = useState(emptyCreditForm);
  const [providerOpen, setProviderOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);

  const rows = accounts as AccountRow[];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.brand_title, row.site_id, row.provider?.provider]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const totals = rows.reduce(
    (acc, row) => {
      acc.credits += row.whatsapp?.credits_balance ?? 0;
      acc.queued += row.message_counts?.queued ?? 0;
      acc.sent += row.message_counts?.sent ?? 0;
      acc.failed += row.message_counts?.failed ?? 0;
      if (row.provider?.active) acc.providers += 1;
      return acc;
    },
    { credits: 0, queued: 0, sent: 0, failed: 0, providers: 0 },
  );

  const providerMut = useMutation({
    mutationFn: () => saveProvider({ data: providerForm }),
    onSuccess: () => {
      toast.success("Conexão WhatsApp atualizada");
      setProviderOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-whatsapp-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const creditMut = useMutation({
    mutationFn: () => grantCredits({ data: creditForm }),
    onSuccess: () => {
      toast.success("Créditos adicionados com lançamento no ledger");
      setCreditOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-whatsapp-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openProvider(row: AccountRow) {
    setProviderForm({
      account_id: row.id,
      provider: row.provider?.provider ?? "meta_cloud",
      active: row.provider?.active ?? true,
      sender_phone: row.provider?.sender_phone ?? "",
      phone_number_id: row.provider?.phone_number_id ?? "",
      business_account_id: "",
      instance_id: row.provider?.instance_id ?? "",
      api_base_url: row.provider?.api_base_url ?? "",
      access_token_secret_name:
        row.provider?.provider === "uazapi"
          ? "WHATSAPP_UAZAPI_ACCESS_TOKEN"
          : "WHATSAPP_META_ACCESS_TOKEN",
    });
    setProviderOpen(true);
  }

  function openCredits(row: AccountRow) {
    setCreditForm({ ...emptyCreditForm, account_id: row.id });
    setCreditOpen(true);
  }

  if (checking) {
    return (
      <AppShell>
        <div className="text-sm text-muted-foreground">Verificando permissões...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Área restrita</h1>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <MessageCircle className="h-6 w-6" /> Operação WhatsApp
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Controle de provedores, créditos e fila de mensagens por igreja.
            </p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar igreja, slug ou provedor..."
            className="md:max-w-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={Wallet} label="Créditos ativos" value={totals.credits} />
          <MetricCard icon={PlugZap} label="Provedores ativos" value={totals.providers} />
          <MetricCard icon={Activity} label="Na fila" value={totals.queued} />
          <MetricCard icon={CheckCircle2} label="Enviadas" value={totals.sent} />
          <MetricCard icon={ShieldCheck} label="Falhas" value={totals.failed} tone="text-rose-600" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contas e conexões</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Igreja</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Provedor</TableHead>
                  <TableHead className="text-right">Créditos</TableHead>
                  <TableHead className="text-right">Fila</TableHead>
                  <TableHead className="text-right">Enviadas</TableHead>
                  <TableHead className="text-right">Falhas</TableHead>
                  <TableHead className="w-[230px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      Carregando operação...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      Nenhuma conta encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.brand_title ?? "Sem nome"}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{row.site_id ?? row.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.plan_tier ?? "premium"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.whatsapp?.enabled ? "default" : "secondary"}>
                        {row.whatsapp?.enabled ? "Ativo" : "Desativado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.provider ? (
                        <div className="space-y-1">
                          <Badge variant={row.provider.active ? "default" : "outline"}>
                            {row.provider.provider === "meta_cloud" ? "Meta Cloud" : "UAZAPI"}
                          </Badge>
                          {row.provider.last_error && (
                            <div className="max-w-[220px] truncate text-xs text-rose-600">
                              {row.provider.last_error}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem conexão</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.whatsapp?.credits_balance ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.message_counts?.queued ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.message_counts?.sent ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.message_counts?.failed ?? 0}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => openProvider(row)}>
                        Provedor
                      </Button>
                      <Button size="sm" onClick={() => openCredits(row)}>
                        Créditos
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ProviderDialog
          open={providerOpen}
          onOpenChange={setProviderOpen}
          form={providerForm}
          setForm={setProviderForm}
          saving={providerMut.isPending}
          onSave={() => providerMut.mutate()}
        />

        <CreditDialog
          open={creditOpen}
          onOpenChange={setCreditOpen}
          form={creditForm}
          setForm={setCreditForm}
          saving={creditMut.isPending}
          onSave={() => creditMut.mutate()}
        />
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</p>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function ProviderDialog({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof emptyProviderForm;
  setForm: (form: typeof emptyProviderForm) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conexão do provedor WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Provedor</Label>
            <Select
              value={form.provider}
              onValueChange={(provider: "meta_cloud" | "uazapi") =>
                setForm({
                  ...form,
                  provider,
                  access_token_secret_name:
                    provider === "uazapi"
                      ? "WHATSAPP_UAZAPI_ACCESS_TOKEN"
                      : "WHATSAPP_META_ACCESS_TOKEN",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta_cloud">Meta Cloud API</SelectItem>
                <SelectItem value="uazapi">UAZAPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label>Conexão ativa</Label>
              <p className="text-xs text-muted-foreground">Desativar pausa novos envios.</p>
            </div>
            <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
          </div>
          <div className="space-y-1">
            <Label>Telefone remetente</Label>
            <Input
              value={form.sender_phone}
              onChange={(event) => setForm({ ...form, sender_phone: event.target.value })}
              placeholder="5511999999999"
            />
          </div>
          <div className="space-y-1">
            <Label>Nome do segredo do token</Label>
            <Input
              value={form.access_token_secret_name}
              onChange={(event) =>
                setForm({ ...form, access_token_secret_name: event.target.value.toUpperCase() })
              }
              placeholder="WHATSAPP_META_ACCESS_TOKEN"
            />
          </div>
          {form.provider === "meta_cloud" ? (
            <>
              <div className="space-y-1">
                <Label>Phone Number ID</Label>
                <Input
                  value={form.phone_number_id}
                  onChange={(event) => setForm({ ...form, phone_number_id: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Business Account ID</Label>
                <Input
                  value={form.business_account_id}
                  onChange={(event) => setForm({ ...form, business_account_id: event.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label>Instance ID</Label>
                <Input
                  value={form.instance_id}
                  onChange={(event) => setForm({ ...form, instance_id: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>URL base da API</Label>
                <Input
                  value={form.api_base_url}
                  onChange={(event) => setForm({ ...form, api_base_url: event.target.value })}
                  placeholder="https://api.exemplo.com"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={saving || !form.access_token_secret_name.trim()}>
            {saving ? "Salvando..." : "Salvar conexão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreditDialog({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof emptyCreditForm;
  setForm: (form: typeof emptyCreditForm) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar créditos WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Créditos</Label>
              <Input
                type="number"
                min={1}
                value={form.credits}
                onChange={(event) =>
                  setForm({ ...form, credits: Number(event.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Valor recebido em centavos</Label>
              <Input
                type="number"
                min={0}
                value={form.amount_cents}
                onChange={(event) =>
                  setForm({ ...form, amount_cents: Number(event.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Observação interna</Label>
            <Textarea
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Ex: crédito cortesia, compra manual, ajuste comercial..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={saving || form.credits <= 0}>
            {saving ? "Creditando..." : "Adicionar créditos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
