import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listSmallGroups, upsertSmallGroup, deleteSmallGroup } from "@/lib/small-groups.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users2, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/celulas")({
  component: CelulasPage,
  head: () => ({ meta: [{ title: "Pequenos Grupos / Células" }] }),
});

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function CelulasPage() {
  const list = useServerFn(listSmallGroups);
  const upsert = useServerFn(upsertSmallGroup);
  const del = useServerFn(deleteSmallGroup);
  const qc = useQueryClient();
  const { data: groups = [], isLoading } = useQuery({ queryKey: ["small_groups"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (payload: any) => upsert({ data: payload }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["small_groups"] }); setOpen(false); toast.success("Salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["small_groups"] }); toast.success("Removido"); },
  });

  return (
    <AppShell>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Users2 className="h-6 w-6" /> Pequenos Grupos / Células</h1>
          <p className="text-sm text-muted-foreground">Cadastre células com líder, dia, horário e endereço.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova célula</Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g: any) => (
            <Card key={g.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  {g.leader_name && <p className="text-xs text-muted-foreground">Líder: {g.leader_name}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(g); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && remove.mutate(g.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {g.weekday != null && (
                <p className="text-sm flex items-center gap-1"><Clock className="h-3 w-3" /> {WEEKDAYS[g.weekday]} {g.start_time?.slice(0,5)}</p>
              )}
              {g.address && <p className="text-xs text-muted-foreground flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5" /> {g.address}{g.neighborhood ? ` — ${g.neighborhood}` : ""}</p>}
              {!g.active && <span className="text-xs text-muted-foreground">Inativa</span>}
            </Card>
          ))}
          {groups.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Nenhuma célula cadastrada ainda.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar célula" : "Nova célula"}</DialogTitle></DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const wd = f.get("weekday") as string;
              save.mutate({
                id: editing?.id,
                name: f.get("name"),
                leader_name: f.get("leader_name") || null,
                leader_phone: f.get("leader_phone") || null,
                weekday: wd ? Number(wd) : null,
                start_time: f.get("start_time") || null,
                address: f.get("address") || null,
                neighborhood: f.get("neighborhood") || null,
                description: f.get("description") || null,
                capacity: f.get("capacity") ? Number(f.get("capacity")) : null,
                active: f.get("active") === "on",
              });
            }}
            className="space-y-3"
          >
            <div><Label>Nome*</Label><Input name="name" required defaultValue={editing?.name} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Líder</Label><Input name="leader_name" defaultValue={editing?.leader_name ?? ""} /></div>
              <div><Label>WhatsApp do líder</Label><Input name="leader_phone" defaultValue={editing?.leader_phone ?? ""} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dia da semana</Label>
                <select name="weekday" defaultValue={editing?.weekday ?? ""} className="w-full h-10 px-3 rounded-md border bg-background">
                  <option value="">—</option>
                  {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div><Label>Horário</Label><Input name="start_time" type="time" defaultValue={editing?.start_time?.slice(0,5) ?? ""} /></div>
            </div>
            <div><Label>Endereço</Label><Input name="address" defaultValue={editing?.address ?? ""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bairro</Label><Input name="neighborhood" defaultValue={editing?.neighborhood ?? ""} /></div>
              <div><Label>Capacidade</Label><Input name="capacity" type="number" min="0" defaultValue={editing?.capacity ?? ""} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea name="description" rows={3} defaultValue={editing?.description ?? ""} /></div>
            <div className="flex items-center gap-2"><Switch name="active" defaultChecked={editing ? editing.active : true} /> <Label>Ativa</Label></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}