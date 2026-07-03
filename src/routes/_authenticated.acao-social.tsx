import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listSocialFamilies,
  upsertSocialFamily,
  setSocialFamilyStatus,
  deleteSocialFamily,
  listSocialDeliveries,
  listSocialDeliveriesThisMonth,
  addSocialDelivery,
  deleteSocialDelivery,
  type SocialFamilyRow,
} from "@/lib/social-assistance.functions";
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
import { HeartHandshake, Plus, Trash2, Loader2, Package, Phone, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/acao-social")({
  component: SocialAssistancePage,
});

type Form = {
  id?: string;
  family_name: string;
  responsible_name: string;
  phone: string;
  address: string;
  family_size: string;
  needs: string;
  notes: string;
};

const empty: Form = { family_name: "", responsible_name: "", phone: "", address: "", family_size: "", needs: "", notes: "" };

function SocialAssistancePage() {
  const qc = useQueryClient();
  const fetchFamilies = useServerFn(listSocialFamilies);
  const fetchMonthCount = useServerFn(listSocialDeliveriesThisMonth);
  const save = useServerFn(upsertSocialFamily);
  const setStatus = useServerFn(setSocialFamilyStatus);
  const remove = useServerFn(deleteSocialFamily);

  const { data: families = [], isLoading } = useQuery({ queryKey: ["social-families"], queryFn: () => fetchFamilies() });
  const { data: monthCount = 0 } = useQuery({ queryKey: ["social-deliveries-month"], queryFn: () => fetchMonthCount() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [statusFilter, setStatusFilter] = useState("active");
  const [deliveryFamily, setDeliveryFamily] = useState<SocialFamilyRow | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["social-families"] });

  const saveMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        family_name: form.family_name.trim(),
        responsible_name: form.responsible_name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        family_size: form.family_size ? Number(form.family_size) : null,
        needs: form.needs.trim() || null,
        notes: form.notes.trim() || null,
      },
    }),
    onSuccess: () => { invalidate(); toast.success("Família salva"); setOpen(false); setForm(empty); },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "active" | "inactive" }) => setStatus({ data: v }),
    onSuccess: () => { invalidate(); toast.success("Status atualizado"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Removida"); },
  });

  const filtered = useMemo(() => families.filter((f) => f.status === statusFilter), [families, statusFilter]);

  const counts = {
    active: families.filter((f) => f.status === "active").length,
    people: families.filter((f) => f.status === "active").reduce((s, f) => s + (f.family_size ?? 0), 0),
  };

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <HeartHandshake className="h-6 w-6" /> Ação Social
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {counts.active} família(s) ativa(s) · {counts.people} pessoa(s) assistida(s) · {monthCount} entrega(s) este mês
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova família</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{form.id ? "Editar família" : "Nova família"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome da família</Label>
                    <Input value={form.family_name} onChange={(e) => setForm({ ...form, family_name: e.target.value })} placeholder="Ex: Família Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Input value={form.responsible_name} onChange={(e) => setForm({ ...form, responsible_name: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 90000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nº de pessoas</Label>
                    <Input type="number" min="0" value={form.family_size} onChange={(e) => setForm({ ...form, family_size: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Necessidades</Label>
                  <Textarea rows={2} value={form.needs} onChange={(e) => setForm({ ...form, needs: e.target.value })} placeholder="Ex: cesta básica mensal, roupas infantis…" />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!form.family_name.trim() || !form.responsible_name.trim() || saveMut.isPending} onClick={() => saveMut.mutate()}>
                  {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <HeartHandshake className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma família cadastrada</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre as famílias em acompanhamento assistencial.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((f) => (
              <Card key={f.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{f.family_name}</p>
                    <p className="text-xs text-muted-foreground">Resp: {f.responsible_name}</p>
                  </div>
                  <Badge variant={f.status === "active" ? "success" : "neutral"} className="shrink-0">
                    {f.status === "active" ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  {f.phone && <p className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{f.phone}</p>}
                  {f.family_size != null && <p className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{f.family_size} pessoa(s)</p>}
                </div>
                {f.needs && <p className="text-xs mt-2 bg-muted/40 rounded p-2">{f.needs}</p>}
                <div className="flex gap-1 mt-3 pt-3 border-t flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setDeliveryFamily(f)}>
                    <Package className="h-3.5 w-3.5 mr-1" />Entregas
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => statusMut.mutate({ id: f.id, status: f.status === "active" ? "inactive" : "active" })}>
                    {f.status === "active" ? "Marcar inativa" : "Reativar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setForm({
                      id: f.id, family_name: f.family_name, responsible_name: f.responsible_name,
                      phone: f.phone ?? "", address: f.address ?? "", family_size: f.family_size != null ? String(f.family_size) : "",
                      needs: f.needs ?? "", notes: f.notes ?? "",
                    });
                    setOpen(true);
                  }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (confirm(`Remover "${f.family_name}"? O histórico de entregas também será apagado.`)) deleteMut.mutate(f.id);
                  }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DeliveriesDialog family={deliveryFamily} onClose={() => setDeliveryFamily(null)} onChanged={() => qc.invalidateQueries({ queryKey: ["social-deliveries-month"] })} />
    </AppShell>
  );
}

function DeliveriesDialog({ family, onClose, onChanged }: { family: SocialFamilyRow | null; onClose: () => void; onChanged: () => void }) {
  const qc = useQueryClient();
  const fetchDeliveries = useServerFn(listSocialDeliveries);
  const add = useServerFn(addSocialDelivery);
  const remove = useServerFn(deleteSocialDelivery);

  const { data: deliveries = [] } = useQuery({
    queryKey: ["social-deliveries", family?.id],
    queryFn: () => fetchDeliveries({ data: { family_id: family!.id } }),
    enabled: !!family,
  });

  const [items, setItems] = useState("");
  const [deliveredBy, setDeliveredBy] = useState("");

  const addMut = useMutation({
    mutationFn: () => add({
      data: {
        family_id: family!.id,
        delivered_at: new Date().toISOString().slice(0, 10),
        items: items.trim(),
        delivered_by: deliveredBy.trim() || null,
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-deliveries", family?.id] });
      onChanged();
      toast.success("Entrega registrada");
      setItems(""); setDeliveredBy("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-deliveries", family?.id] });
      onChanged();
    },
  });

  return (
    <Dialog open={!!family} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Entregas — {family?.family_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="O que foi entregue" value={items} onChange={(e) => setItems(e.target.value)} />
            <Input placeholder="Entregue por (opcional)" value={deliveredBy} onChange={(e) => setDeliveredBy(e.target.value)} />
          </div>
          <Button size="sm" disabled={!items.trim() || addMut.isPending} onClick={() => addMut.mutate()}>
            {addMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Registrar entrega de hoje
          </Button>
          <div className="space-y-2 max-h-64 overflow-y-auto pt-2 border-t">
            {deliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entrega registrada ainda.</p>
            ) : (
              deliveries.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-2 text-sm border-b pb-2">
                  <div>
                    <p>{d.items}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${d.delivered_at}T00:00:00`).toLocaleDateString("pt-BR")}
                      {d.delivered_by ? ` · ${d.delivered_by}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(d.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
