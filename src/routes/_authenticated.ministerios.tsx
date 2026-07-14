import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listMinistryAssignments,
  upsertMinistryAssignment,
  endMinistryAssignment,
  deleteMinistryAssignment,
  type MinistryAssignmentRow,
} from "@/lib/ministry-assignments.functions";
import { listMembers } from "@/lib/members.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users2, Plus, Trash2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ministerios")({
  component: MinistriesPage,
});

const COMMON_MINISTRIES = [
  "Louvor", "Recepção", "Intercessão", "Liturgia", "Diaconia", "Catequese",
  "Escola Bíblica", "Mídia e transmissão", "Limpeza e organização", "Ação social",
];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

type Form = {
  id?: string;
  member_id: string;
  ministry: string;
  role: string;
  start_date: string;
};

type MemberOption = {
  id: string;
  full_name: string;
};

const empty: Form = { member_id: "", ministry: "", role: "", start_date: new Date().toISOString().slice(0, 10) };

function MinistriesPage() {
  const qc = useQueryClient();
  const fetchAssignments = useServerFn(listMinistryAssignments);
  const fetchMembers = useServerFn(listMembers);
  const save = useServerFn(upsertMinistryAssignment);
  const endAssignment = useServerFn(endMinistryAssignment);
  const remove = useServerFn(deleteMinistryAssignment);

  const { data: assignments = [], isLoading } = useQuery({ queryKey: ["ministry-assignments"], queryFn: () => fetchAssignments() });
  const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [filter, setFilter] = useState<"active" | "ended" | "all">("active");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["ministry-assignments"] });

  const saveMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        member_id: form.member_id,
        ministry: form.ministry.trim(),
        role: form.role.trim() || null,
        start_date: form.start_date,
      },
    }),
    onSuccess: () => { invalidate(); toast.success("Salvo"); setOpen(false); setForm(empty); },
    onError: (e: Error) => toast.error(e.message),
  });

  const endMut = useMutation({
    mutationFn: (id: string) => endAssignment({ data: { id, end_date: new Date().toISOString().slice(0, 10) } }),
    onSuccess: () => { invalidate(); toast.success("Encerrado"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Removido"); },
  });

  const filtered = useMemo(() => {
    if (filter === "active") return assignments.filter((a) => a.active);
    if (filter === "ended") return assignments.filter((a) => !a.active);
    return assignments;
  }, [assignments, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, MinistryAssignmentRow[]>();
    for (const a of filtered) {
      const list = map.get(a.ministry) ?? [];
      list.push(a);
      map.set(a.ministry, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const activeCount = assignments.filter((a) => a.active).length;
  const ministryCount = new Set(assignments.filter((a) => a.active).map((a) => a.ministry)).size;

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users2 className="h-6 w-6" /> Ministérios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCount} pessoa(s) servindo agora · {ministryCount} ministério(s) ativo(s)
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova atribuição</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{form.id ? "Editar atribuição" : "Nova atribuição"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Membro</Label>
                  <Select value={form.member_id} onValueChange={(v) => setForm({ ...form, member_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o membro…" /></SelectTrigger>
                    <SelectContent>
                      {(members as MemberOption[]).map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Ministério</Label>
                    <Input
                      list="ministry-suggestions"
                      value={form.ministry}
                      onChange={(e) => setForm({ ...form, ministry: e.target.value })}
                      placeholder="Ex: Louvor"
                    />
                    <datalist id="ministry-suggestions">
                      {COMMON_MINISTRIES.map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Vocalista, Líder…" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-40" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button
                  disabled={!form.member_id || !form.ministry.trim() || saveMut.isPending}
                  onClick={() => saveMut.mutate()}
                >
                  {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Servindo agora</SelectItem>
              <SelectItem value="ended">Encerradas</SelectItem>
              <SelectItem value="all">Todas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : grouped.length === 0 ? (
          <Card className="p-12 text-center">
            <Users2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma atribuição nesta lista</h3>
            <p className="text-sm text-muted-foreground mt-1">Registre quem serve em cada ministério da igreja.</p>
          </Card>
        ) : (
          <div className="space-y-5">
            {grouped.map(([ministry, list]) => (
              <div key={ministry}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">{ministry} ({list.length})</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {list.map((a) => (
                    <Card key={a.id} className="p-3">
                      <div className="flex items-center gap-2">
                        {a.members?.photo_url ? (
                          <img src={a.members.photo_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {initials(a.members?.full_name ?? "?")}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{a.members?.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{a.role || "—"}</p>
                        </div>
                        <Badge variant={a.active ? "success" : "neutral"} className="shrink-0">
                          {a.active ? "Ativo" : "Encerrado"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        desde {new Date(`${a.start_date}T00:00:00`).toLocaleDateString("pt-BR")}
                        {a.end_date ? ` até ${new Date(`${a.end_date}T00:00:00`).toLocaleDateString("pt-BR")}` : ""}
                      </p>
                      <div className="flex gap-1 mt-2 pt-2 border-t">
                        {a.active && (
                          <Button size="sm" variant="ghost" onClick={() => endMut.mutate(a.id)}>
                            <LogOut className="h-3.5 w-3.5 mr-1" />Encerrar
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => {
                          if (confirm("Remover este registro?")) deleteMut.mutate(a.id);
                        }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
