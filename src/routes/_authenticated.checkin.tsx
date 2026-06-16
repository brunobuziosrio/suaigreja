import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listCheckinSessions, upsertCheckinSession, deleteCheckinSession, listCheckinEntries } from "@/lib/checkin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, QrCode, Pencil, Trash2, Users, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

export const Route = createFileRoute("/_authenticated/checkin")({
  component: CheckinPage,
  head: () => ({ meta: [{ title: "Check-in de Cultos" }] }),
});

function CheckinPage() {
  const list = useServerFn(listCheckinSessions);
  const upsert = useServerFn(upsertCheckinSession);
  const del = useServerFn(deleteCheckinSession);
  const listEntries = useServerFn(listCheckinEntries);
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery({ queryKey: ["checkin_sessions"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [qrFor, setQrFor] = useState<any>(null);
  const [qrData, setQrData] = useState<string>("");
  const [entriesFor, setEntriesFor] = useState<any>(null);

  const { data: entries = [] } = useQuery({
    queryKey: ["checkin_entries", entriesFor?.id],
    queryFn: () => listEntries({ data: { session_id: entriesFor.id } }),
    enabled: !!entriesFor,
  });

  const save = useMutation({
    mutationFn: (p: any) => upsert({ data: p }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checkin_sessions"] }); setOpen(false); toast.success("Salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checkin_sessions"] }); toast.success("Removido"); },
  });

  async function showQr(s: any) {
    const url = `${window.location.origin}/checkin/${s.id}`;
    const data = await QRCode.toDataURL(url, { width: 400, margin: 2 });
    setQrData(data);
    setQrFor({ ...s, url });
  }

  return (
    <AppShell>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><QrCode className="h-6 w-6" /> Check-in de Cultos</h1>
          <p className="text-sm text-muted-foreground">Crie uma sessão por culto e mostre o QR Code na entrada para registrar presenças.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova sessão</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sessions.map((s: any) => (
          <Card key={s.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{new Date(s.session_date + "T00:00:00").toLocaleDateString("pt-BR")} {s.start_time?.slice(0,5)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => showQr(s)}><QrCode className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEntriesFor(s)}><Users className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && remove.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            {!s.active && <span className="text-xs text-muted-foreground">Encerrada</span>}
          </Card>
        ))}
        {sessions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma sessão criada.</p>}
      </div>

      {/* Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar sessão" : "Nova sessão de check-in"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            save.mutate({
              id: editing?.id,
              title: f.get("title"),
              session_date: f.get("session_date"),
              start_time: f.get("start_time") || null,
              notes: f.get("notes") || null,
              active: f.get("active") === "on",
            });
          }} className="space-y-3">
            <div><Label>Título*</Label><Input name="title" required defaultValue={editing?.title} placeholder="Culto de Domingo" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Data*</Label><Input name="session_date" type="date" required defaultValue={editing?.session_date ?? new Date().toISOString().slice(0,10)} /></div>
              <div><Label>Horário</Label><Input name="start_time" type="time" defaultValue={editing?.start_time?.slice(0,5) ?? ""} /></div>
            </div>
            <div><Label>Observações</Label><Input name="notes" defaultValue={editing?.notes ?? ""} /></div>
            <div className="flex items-center gap-2"><Switch name="active" defaultChecked={editing ? editing.active : true} /> <Label>Ativa (aceita check-ins)</Label></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR */}
      <Dialog open={!!qrFor} onOpenChange={(o) => !o && setQrFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{qrFor?.title} — QR Code</DialogTitle></DialogHeader>
          {qrData && <img src={qrData} alt="QR" className="mx-auto" />}
          <div className="flex items-center gap-2">
            <Input readOnly value={qrFor?.url ?? ""} />
            <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(qrFor?.url ?? ""); toast.success("Copiado"); }}><Copy className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" asChild><a href={qrFor?.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
          </div>
          <Button variant="outline" onClick={() => window.print()}>Imprimir</Button>
        </DialogContent>
      </Dialog>

      {/* Entries */}
      <Dialog open={!!entriesFor} onOpenChange={(o) => !o && setEntriesFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{entriesFor?.title} — Presenças ({entries.length})</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {entries.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 p-2 border rounded">
                {e.members?.photo_url && <img src={e.members.photo_url} className="h-8 w-8 rounded-full object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.members?.full_name ?? e.visitor_name ?? "Visitante"}</p>
                  {e.visitor_phone && <p className="text-xs text-muted-foreground">{e.visitor_phone}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(e.checked_in_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
            {entries.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma presença ainda.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}