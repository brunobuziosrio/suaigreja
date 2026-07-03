import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listRoomReservations,
  upsertRoomReservation,
  updateRoomReservationStatus,
  deleteRoomReservation,
  type RoomReservationRow,
} from "@/lib/room-reservations.functions";
import { listLocations } from "@/lib/locations.functions";
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
import { CalendarClock, Plus, Trash2, Check, X, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reservas")({
  component: ReservationsPage,
});

type Form = {
  id?: string;
  location_id: string;
  title: string;
  requester_name: string;
  requester_phone: string;
  start_at: string;
  end_at: string;
  notes: string;
};

const empty: Form = { location_id: "", title: "", requester_name: "", requester_phone: "", start_at: "", end_at: "", notes: "" };

const STATUS_META: Record<string, { label: string; variant: "warning" | "success" | "error" | "neutral" }> = {
  pending: { label: "Pendente", variant: "warning" },
  approved: { label: "Aprovada", variant: "success" },
  rejected: { label: "Recusada", variant: "error" },
  cancelled: { label: "Cancelada", variant: "neutral" },
};

function ReservationsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listRoomReservations);
  const fetchLocations = useServerFn(listLocations);
  const save = useServerFn(upsertRoomReservation);
  const setStatus = useServerFn(updateRoomReservationStatus);
  const remove = useServerFn(deleteRoomReservation);

  const { data: reservations = [], isLoading } = useQuery({ queryKey: ["room-reservations"], queryFn: () => fetchList() });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: () => fetchLocations() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const upsertMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        location_id: form.location_id || null,
        title: form.title.trim(),
        requester_name: form.requester_name.trim(),
        requester_phone: form.requester_phone.trim() || null,
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
        notes: form.notes.trim() || null,
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room-reservations"] });
      toast.success("Reserva salva");
      setOpen(false); setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" | "cancelled" }) => setStatus({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["room-reservations"] }); toast.success("Atualizado"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["room-reservations"] }); toast.success("Removida"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const list = statusFilter === "todos" ? reservations : reservations.filter((r) => r.status === statusFilter);
    return [...list].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [reservations, statusFilter]);

  const counts = {
    pending: reservations.filter((r) => r.status === "pending").length,
    approved: reservations.filter((r) => r.status === "approved").length,
  };

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <CalendarClock className="h-6 w-6" /> Reserva de Ambientes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {counts.pending} pendente(s) de aprovação · {counts.approved} confirmada(s)
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova reserva</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{form.id ? "Editar reserva" : "Nova reserva"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o ambiente…" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Finalidade</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Reunião de líderes, Ensaio do louvor…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <Input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Término</Label>
                    <Input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Solicitante</Label>
                    <Input value={form.requester_name} onChange={(e) => setForm({ ...form, requester_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.requester_phone} onChange={(e) => setForm({ ...form, requester_phone: e.target.value })} placeholder="(00) 90000-0000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Equipamentos necessários, limpeza, etc." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button
                  disabled={!form.title.trim() || !form.requester_name.trim() || !form.start_at || !form.end_at || upsertMut.isPending}
                  onClick={() => upsertMut.mutate()}
                >
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
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovadas</SelectItem>
              <SelectItem value="rejected">Recusadas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma reserva</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre a primeira reserva de ambiente.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.pending;
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.title}</span>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.locations?.name ?? "Local não definido"}</span>
                        <span>
                          {new Date(r.start_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          {" – "}
                          {new Date(r.end_at).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Solicitado por {r.requester_name}{r.requester_phone ? ` · ${r.requester_phone}` : ""}
                      </p>
                      {r.notes && <p className="text-sm mt-2 bg-muted/40 rounded p-2">{r.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => statusMut.mutate({ id: r.id, status: "approved" })}>
                            <Check className="h-3.5 w-3.5 mr-1" />Aprovar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => statusMut.mutate({ id: r.id, status: "rejected" })}>
                            <X className="h-3.5 w-3.5 mr-1" />Recusar
                          </Button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" variant="ghost" onClick={() => statusMut.mutate({ id: r.id, status: "cancelled" })}>
                          Cancelar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (confirm("Excluir esta reserva?")) deleteMut.mutate(r.id);
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
