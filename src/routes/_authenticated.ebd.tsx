import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listEbdClasses, upsertEbdClass, deleteEbdClass,
  listEnrollments, setEnrollment, recordAttendance, getAttendanceStats, getAttendanceForDate,
} from "@/lib/ebd.functions";
import { listMembers } from "@/lib/members.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Pencil, Trash2, Loader2, Users, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ebd")({
  component: EbdPage,
});

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function EbdPage() {
  const qc = useQueryClient();
  const fetchClasses = useServerFn(listEbdClasses);
  const fetchMembers = useServerFn(listMembers);
  const fetchStats = useServerFn(getAttendanceStats);
  const saveClass = useServerFn(upsertEbdClass);
  const removeClass = useServerFn(deleteEbdClass);

  const { data: classes = [], isLoading } = useQuery({ queryKey: ["ebd-classes"], queryFn: () => fetchClasses() });
  const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const { data: stats } = useQuery({ queryKey: ["ebd-stats"], queryFn: () => fetchStats() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", teacher_name: "", weekday: 0, start_time: "09:00", age_range: "adultos", active: true });
  const [rosterClass, setRosterClass] = useState<any | null>(null);

  const saveMut = useMutation({
    mutationFn: () => saveClass({ data: form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ebd-classes"] }); toast.success("Turma salva"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="p-6 max-w-6xl">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />Escola Bíblica
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Turmas, matrículas e chamada semanal.</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm({ name: "", teacher_name: "", weekday: 0, start_time: "09:00", age_range: "adultos", active: true }); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova turma</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Editar turma" : "Nova turma"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Nome da turma</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Jovens, Adultos, Infantil" /></div>
                <div className="space-y-2"><Label>Professor(a)</Label>
                  <Input value={form.teacher_name ?? ""} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Dia</Label>
                    <Select value={String(form.weekday)} onValueChange={(v) => setForm({ ...form, weekday: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{WEEKDAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>Horário</Label>
                    <Input type="time" value={form.start_time ?? ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Faixa etária</Label>
                  <Select value={form.age_range ?? "adultos"} onValueChange={(v) => setForm({ ...form, age_range: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criancas">Crianças</SelectItem>
                      <SelectItem value="adolescentes">Adolescentes</SelectItem>
                      <SelectItem value="jovens">Jovens</SelectItem>
                      <SelectItem value="adultos">Adultos</SelectItem>
                      <SelectItem value="terceira_idade">Terceira idade</SelectItem>
                    </SelectContent>
                  </Select></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!form.name?.trim() || saveMut.isPending} onClick={() => saveMut.mutate()}>
                  {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {stats && (
          <Card className="p-5 mb-6 flex items-center gap-6">
            <div className="p-3 rounded-md bg-primary/10 text-primary"><CheckSquare className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Frequência (últimos 60 dias)</p>
              <p className="text-3xl font-semibold">{stats.rate}%</p>
              <p className="text-xs text-muted-foreground">{stats.present} presenças de {stats.total} chamadas</p>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : classes.length === 0 ? (
          <Card className="p-12 text-center">
            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma turma ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre a primeira turma da EBD.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {classes.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.teacher_name && `Prof. ${c.teacher_name} · `}
                      {c.weekday != null && WEEKDAYS[c.weekday]} {c.start_time?.slice(0, 5)}
                    </p>
                    {c.age_range && <p className="text-xs text-muted-foreground capitalize mt-0.5">{c.age_range.replace("_", " ")}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => { setForm(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm(`Remover "${c.name}"?`)) removeClass({ data: { id: c.id } }).then(() => qc.invalidateQueries({ queryKey: ["ebd-classes"] }));
                    }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setRosterClass(c)}>
                  <Users className="h-3.5 w-3.5 mr-1" />Chamada & Matrícula
                </Button>
              </Card>
            ))}
          </div>
        )}

        {rosterClass && (
          <RosterDialog classRow={rosterClass} members={members} onClose={() => { setRosterClass(null); qc.invalidateQueries({ queryKey: ["ebd-stats"] }); }} />
        )}
      </div>
    </AppShell>
  );
}

function RosterDialog({ classRow, members, onClose }: { classRow: any; members: any[]; onClose: () => void }) {
  const fetchEnroll = useServerFn(listEnrollments);
  const toggleEnroll = useServerFn(setEnrollment);
  const fetchAtt = useServerFn(getAttendanceForDate);
  const saveAtt = useServerFn(recordAttendance);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const enrolledQ = useQuery({ queryKey: ["ebd-enrollments", classRow.id], queryFn: () => fetchEnroll({ data: { class_id: classRow.id } }) });
  const attQ = useQuery({ queryKey: ["ebd-att", classRow.id, date], queryFn: () => fetchAtt({ data: { class_id: classRow.id, attendance_date: date } }) });

  const enrolled = enrolledQ.data ?? [];
  const attendance = new Map((attQ.data ?? []).map((r: any) => [r.member_id, r.present]));

  async function toggle(memberId: string, enroll: boolean) {
    await toggleEnroll({ data: { class_id: classRow.id, member_id: memberId, enroll } });
    enrolledQ.refetch();
  }

  async function setPresent(memberId: string, present: boolean) {
    attendance.set(memberId, present);
    await saveAtt({ data: { class_id: classRow.id, attendance_date: date, entries: [{ member_id: memberId, present }] } });
    attQ.refetch();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{classRow.name}</DialogTitle></DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Data da chamada:</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          </div>
          <div className="border rounded-md divide-y">
            <div className="px-3 py-2 bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground grid grid-cols-[1fr_80px_80px] gap-2">
              <span>Membro</span><span className="text-center">Matriculado</span><span className="text-center">Presente</span>
            </div>
            {members.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Cadastre membros primeiro.</div>}
            {members.map((m) => {
              const isEnrolled = enrolled.some((e: any) => e.member_id === m.id);
              const isPresent = attendance.get(m.id) === true;
              return (
                <div key={m.id} className="px-3 py-2 grid grid-cols-[1fr_80px_80px] gap-2 items-center text-sm">
                  <span className="truncate">{m.full_name}</span>
                  <div className="flex justify-center">
                    <Checkbox checked={isEnrolled} onCheckedChange={(v) => toggle(m.id, !!v)} />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox checked={isPresent} disabled={!isEnrolled} onCheckedChange={(v) => setPresent(m.id, !!v)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter><Button onClick={onClose}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}