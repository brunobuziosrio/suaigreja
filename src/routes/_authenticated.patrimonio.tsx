import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listAssets,
  upsertAsset,
  deleteAsset,
  loanAsset,
  returnAsset,
  setAssetMaintenance,
  ASSET_CATEGORIES,
  type AssetRow,
} from "@/lib/assets.functions";
import { listLocations } from "@/lib/locations.functions";
import { listMembers } from "@/lib/members.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Trash2, Loader2, Wrench, MapPin, UserCheck, Undo2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/patrimonio")({
  component: AssetsPage,
});

type Form = {
  id?: string;
  name: string;
  category: AssetCategory;
  serial_or_invoice: string;
  location_id: string;
  acquired_at: string;
  value_cents: string;
  notes: string;
};

type AssetCategory = (typeof ASSET_CATEGORIES)[number];
type AssetStatusFilter = "todos" | AssetRow["status"];

type LocationOption = {
  id: string;
  name: string;
};

const empty: Form = { name: "", category: "outro", serial_or_invoice: "", location_id: "", acquired_at: "", value_cents: "", notes: "" };

const CATEGORY_LABELS: Record<string, string> = {
  instrumento: "Instrumento musical",
  som: "Som e áudio",
  projecao: "Projeção e vídeo",
  moveis: "Móveis",
  informatica: "Informática",
  outro: "Outro",
};

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "error" | "neutral" }> = {
  available: { label: "Disponível", variant: "success" },
  loaned: { label: "Emprestado", variant: "warning" },
  maintenance: { label: "Manutenção", variant: "error" },
  retired: { label: "Baixado", variant: "neutral" },
};

function fmtCurrency(cents: number | null) {
  if (cents == null) return null;
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AssetsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listAssets);
  const fetchLocations = useServerFn(listLocations);
  const fetchMembers = useServerFn(listMembers);
  const save = useServerFn(upsertAsset);
  const remove = useServerFn(deleteAsset);
  const loan = useServerFn(loanAsset);
  const giveBack = useServerFn(returnAsset);
  const setMaint = useServerFn(setAssetMaintenance);

  const { data: assets = [], isLoading } = useQuery({ queryKey: ["assets"], queryFn: () => fetchList() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => fetchLocations() });
  const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [statusFilter, setStatusFilter] = useState<AssetStatusFilter>("todos");
  const [loanTarget, setLoanTarget] = useState<AssetRow | null>(null);
  const [loanMemberId, setLoanMemberId] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["assets"] });

  const upsertMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        name: form.name.trim(),
        category: form.category,
        serial_or_invoice: form.serial_or_invoice.trim() || null,
        location_id: form.location_id || null,
        acquired_at: form.acquired_at || null,
        value_cents: form.value_cents ? Math.round(Number(form.value_cents) * 100) : null,
        notes: form.notes.trim() || null,
      },
    }),
    onSuccess: () => { invalidate(); toast.success("Item salvo"); setOpen(false); setForm(empty); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Removido"); },
  });

  const loanMut = useMutation({
    mutationFn: () => loan({ data: { id: loanTarget!.id, holder_member_id: loanMemberId } }),
    onSuccess: () => { invalidate(); toast.success("Empréstimo registrado"); setLoanTarget(null); setLoanMemberId(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  const returnMut = useMutation({
    mutationFn: (id: string) => giveBack({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Devolução registrada"); },
  });

  const maintMut = useMutation({
    mutationFn: (v: { id: string; status: "maintenance" | "available" | "retired" }) => setMaint({ data: v }),
    onSuccess: () => { invalidate(); toast.success("Status atualizado"); },
  });

  const filtered = useMemo(() => {
    return statusFilter === "todos" ? assets : assets.filter((a) => a.status === statusFilter);
  }, [assets, statusFilter]);

  const counts = {
    available: assets.filter((a) => a.status === "available").length,
    loaned: assets.filter((a) => a.status === "loaned").length,
    maintenance: assets.filter((a) => a.status === "maintenance").length,
  };

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" /> Patrimônio e Manutenção
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {counts.available} disponível(is) · {counts.loaned} emprestado(s) · {counts.maintenance} em manutenção
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo item</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{form.id ? "Editar item" : "Novo item"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Violão Yamaha, Projetor Epson…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as AssetCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ASSET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Local de guarda</Label>
                    <Select value={form.location_id || "_"} onValueChange={(v) => setForm({ ...form, location_id: v === "_" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_">—</SelectItem>
                        {(locations as LocationOption[]).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nº de série / nota fiscal</Label>
                    <Input value={form.serial_or_invoice} onChange={(e) => setForm({ ...form, serial_or_invoice: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de aquisição</Label>
                    <Input type="date" value={form.acquired_at} onChange={(e) => setForm({ ...form, acquired_at: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" min="0" step="0.01" value={form.value_cents} onChange={(e) => setForm({ ...form, value_cents: e.target.value })} className="w-40" />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!form.name.trim() || upsertMut.isPending} onClick={() => upsertMut.mutate()}>
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="available">Disponíveis</SelectItem>
              <SelectItem value="loaned">Emprestados</SelectItem>
              <SelectItem value="maintenance">Em manutenção</SelectItem>
              <SelectItem value="retired">Baixados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum item cadastrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre instrumentos, som, projeção e outros bens da igreja.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((a) => {
              const meta = STATUS_META[a.status] ?? STATUS_META.available;
              return (
                <Card key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[a.category] ?? a.category}</p>
                    </div>
                    <Badge variant={meta.variant} className="shrink-0">{meta.label}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                    {a.locations?.name && <p className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{a.locations.name}</p>}
                    {a.status === "loaned" && a.members?.full_name && (
                      <p className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" />Com {a.members.full_name}{a.loaned_at ? ` desde ${new Date(`${a.loaned_at}T00:00:00`).toLocaleDateString("pt-BR")}` : ""}</p>
                    )}
                    {fmtCurrency(a.value_cents) && <p>{fmtCurrency(a.value_cents)}</p>}
                  </div>
                  {a.notes && <p className="text-xs mt-2 bg-muted/40 rounded p-2">{a.notes}</p>}
                  <div className="flex gap-1 mt-3 pt-3 border-t flex-wrap">
                    {a.status === "available" && (
                      <Button size="sm" variant="outline" onClick={() => setLoanTarget(a)}>
                        <UserCheck className="h-3.5 w-3.5 mr-1" />Emprestar
                      </Button>
                    )}
                    {a.status === "loaned" && (
                      <Button size="sm" variant="outline" onClick={() => returnMut.mutate(a.id)}>
                        <Undo2 className="h-3.5 w-3.5 mr-1" />Devolver
                      </Button>
                    )}
                    {a.status !== "maintenance" && a.status !== "retired" && (
                      <Button size="sm" variant="ghost" onClick={() => maintMut.mutate({ id: a.id, status: "maintenance" })}>
                        <Wrench className="h-3.5 w-3.5 mr-1" />Manutenção
                      </Button>
                    )}
                    {a.status === "maintenance" && (
                      <Button size="sm" variant="ghost" onClick={() => maintMut.mutate({ id: a.id, status: "available" })}>
                        Voltou ao uso
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => {
                      setForm({
                        id: a.id, name: a.name, category: a.category,
                        serial_or_invoice: a.serial_or_invoice ?? "", location_id: a.location_id ?? "",
                        acquired_at: a.acquired_at ?? "", value_cents: a.value_cents ? String(a.value_cents / 100) : "",
                        notes: a.notes ?? "",
                      });
                      setOpen(true);
                    }}>Editar</Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm(`Remover "${a.name}"?`)) deleteMut.mutate(a.id);
                    }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!loanTarget} onOpenChange={(o) => { if (!o) { setLoanTarget(null); setLoanMemberId(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Emprestar "{loanTarget?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select value={loanMemberId} onValueChange={setLoanMemberId}>
              <SelectTrigger><SelectValue placeholder="Selecione um membro…" /></SelectTrigger>
              <SelectContent>
                {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanTarget(null)}>Cancelar</Button>
            <Button disabled={!loanMemberId || loanMut.isPending} onClick={() => loanMut.mutate()}>
              {loanMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
