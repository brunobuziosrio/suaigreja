/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit2, Trash2, CheckCircle2, Clock, Users, CalendarOff, Loader2 } from "lucide-react";
import {
  listVolunteerSchedules,
  upsertVolunteerSchedule,
  deleteVolunteerSchedule,
  listVolunteerShifts,
  upsertVolunteerShift,
  deleteVolunteerShift,
  confirmVolunteerShift,
  listVolunteerUnavailability,
  addVolunteerUnavailability,
  deleteVolunteerUnavailability,
} from "@/lib/volunteer-shifts.functions";
import { listMembers } from "@/lib/members.functions";

export const Route = createFileRoute("/_authenticated/escalas")({
  component: VolunteerSchedulesPage,
});

type Schedule = {
  id: string;
  name: string;
  description: string | null;
  volunteer_type: string;
  is_active: boolean;
  notes: string | null;
  volunteer_shifts?: Shift[];
};

type Shift = {
  id: string;
  member_id: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string | null;
  confirmed: boolean;
  confirmed_at: string | null;
  notes: string | null;
  members?: { full_name: string; phone: string; email: string };
};

const VOLUNTEER_TYPES = [
  "louvor",
  "intercessão",
  "recepção",
  "liturgia",
  "ministros",
  "catequese",
  "limpeza",
  "transmissão",
];

function VolunteerSchedulesPage() {
  const qc = useQueryClient();
  const fetchSchedules = useServerFn(listVolunteerSchedules);
  const fetchMembers = useServerFn(listMembers);
  const fetchShifts = useServerFn(listVolunteerShifts);
  const saveSchedule = useServerFn(upsertVolunteerSchedule);
  const removeSchedule = useServerFn(deleteVolunteerSchedule);
  const saveShift = useServerFn(upsertVolunteerShift);
  const removeShift = useServerFn(deleteVolunteerShift);
  const confirmShift = useServerFn(confirmVolunteerShift);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [openUnavailabilityDialog, setOpenUnavailabilityDialog] = useState(false);

  const {
    data: schedules = [],
    isLoading: loadingSchedules,
    isError: schedulesError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["volunteer-schedules"],
    queryFn: () => fetchSchedules(),
    staleTime: 60000,
    gcTime: Infinity,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers(),
    enabled: openShiftDialog,
    staleTime: 3600000,
    gcTime: Infinity,
  });
  const [scheduleForm, setScheduleForm] = useState({
    id: "",
    name: "",
    description: "",
    volunteer_type: "",
    is_active: true,
    notes: "",
  });
  const [shiftForm, setShiftForm] = useState({
    id: "",
    member_id: "",
    shift_date: "",
    shift_start_time: "",
    shift_end_time: "",
    notes: "",
  });

  const activeScheduleId = selectedScheduleId ?? schedules[0]?.id ?? null;

  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ["volunteer-shifts", activeScheduleId],
    queryFn: () =>
      activeScheduleId ? fetchShifts({ data: { scheduleId: activeScheduleId } }) : [],
    enabled: !!activeScheduleId,
    staleTime: 30000,
  });

  const schedulesMut = useMutation({
    mutationFn: (form: typeof scheduleForm) =>
      saveSchedule({ data: form as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-schedules"] });
      toast.success("Escala salva");
      setOpenScheduleDialog(false);
      setScheduleForm({ id: "", name: "", description: "", volunteer_type: "", is_active: true, notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteScheduleMut = useMutation({
    mutationFn: (id: string) => removeSchedule({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-schedules"] });
      toast.success("Escala removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shiftsMut = useMutation({
    mutationFn: (form: typeof shiftForm) =>
      saveShift({
        data: {
          ...form,
          schedule_id: selectedScheduleId || "",
        } as any,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-shifts", selectedScheduleId] });
      toast.success("Turno salvo");
      setOpenShiftDialog(false);
      setShiftForm({ id: "", member_id: "", shift_date: "", shift_start_time: "", shift_end_time: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteShiftMut = useMutation({
    mutationFn: (id: string) => removeShift({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-shifts", selectedScheduleId] });
      toast.success("Turno removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirmShiftMut = useMutation({
    mutationFn: (id: string) => confirmShift({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-shifts", selectedScheduleId] });
      toast.success("Turno confirmado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editSchedule = (schedule: Schedule) => {
    setScheduleForm({
      id: schedule.id,
      name: schedule.name,
      description: schedule.description || "",
      volunteer_type: schedule.volunteer_type,
      is_active: schedule.is_active,
      notes: schedule.notes || "",
    });
    setOpenScheduleDialog(true);
  };

  const editShift = (shift: Shift) => {
    setShiftForm({
      id: shift.id,
      member_id: shift.member_id,
      shift_date: shift.shift_date,
      shift_start_time: shift.shift_start_time,
      shift_end_time: shift.shift_end_time || "",
      notes: shift.notes || "",
    });
    setOpenShiftDialog(true);
  };

  if (loadingSchedules)
    return (
      <AppShell>
        <div className="space-y-6 p-6" aria-busy="true" aria-label="Carregando escalas">
          <div className="h-10 w-72 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
        </div>
      </AppShell>
    );

  if (schedulesError)
    return (
      <AppShell>
        <Card className="m-6 p-6 text-center">
          <p className="font-medium">Não foi possível carregar as escalas.</p>
          <Button className="mt-4" variant="outline" onClick={() => refetchSchedules()}>
            Tentar novamente
          </Button>
        </Card>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">⛪ Escalas de Voluntários</h1>
            <p className="text-gray-600">Gerencie os turnos de louvor, intercessão, recepção e mais</p>
          </div>
          <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenUnavailabilityDialog(true)}>
            <CalendarOff className="mr-2 h-4 w-4" /> Bloqueios de agenda
          </Button>
          <Dialog open={openScheduleDialog} onOpenChange={setOpenScheduleDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setScheduleForm({ id: "", name: "", description: "", volunteer_type: "", is_active: true, notes: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Nova Escala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{scheduleForm.id ? "Editar" : "Nova"} Escala</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                    placeholder="Escala de Louvor - Junho"
                  />
                </div>
                <div>
                  <Label>Tipo de Voluntário</Label>
                  <Select value={scheduleForm.volunteer_type} onValueChange={(v) => setScheduleForm({ ...scheduleForm, volunteer_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOLUNTEER_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    placeholder="Descrição da escala"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => schedulesMut.mutate(scheduleForm)} disabled={schedulesMut.isPending || !scheduleForm.name || !scheduleForm.volunteer_type}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <UnavailabilityDialog open={openUnavailabilityDialog} onOpenChange={setOpenUnavailabilityDialog} />

        {schedules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              Nenhuma escala criada. Clique em "Nova Escala" para começar.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeScheduleId ?? undefined} onValueChange={setSelectedScheduleId}>
            <TabsList>
              {schedules.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>
                  {s.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {schedules.map((schedule) => (
              <TabsContent key={schedule.id} value={schedule.id}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{schedule.name}</CardTitle>
                      <CardDescription>{schedule.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editSchedule(schedule)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteScheduleMut.mutate(schedule.id)}
                        disabled={deleteScheduleMut.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Turnos</h3>
                        <Dialog open={openShiftDialog && selectedScheduleId === schedule.id} onOpenChange={(open) => {
                          setOpenShiftDialog(open);
                          if (!open) setShiftForm({ id: "", member_id: "", shift_date: "", shift_start_time: "", shift_end_time: "", notes: "" });
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => {
                              setSelectedScheduleId(schedule.id);
                              setShiftForm({ id: "", member_id: "", shift_date: "", shift_start_time: "", shift_end_time: "", notes: "" });
                            }}>
                              <Plus className="mr-2 h-4 w-4" /> Adicionar Turno
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{shiftForm.id ? "Editar" : "Novo"} Turno</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Voluntário</Label>
                                <Select value={shiftForm.member_id} onValueChange={(v) => setShiftForm({ ...shiftForm, member_id: v })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {members.map((m) => (
                                      <SelectItem key={m.id} value={m.id}>
                                        {m.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Data</Label>
                                <Input
                                  type="date"
                                  value={shiftForm.shift_date}
                                  onChange={(e) => setShiftForm({ ...shiftForm, shift_date: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Início</Label>
                                  <Input
                                    type="time"
                                    value={shiftForm.shift_start_time}
                                    onChange={(e) => setShiftForm({ ...shiftForm, shift_start_time: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Fim</Label>
                                  <Input
                                    type="time"
                                    value={shiftForm.shift_end_time}
                                    onChange={(e) => setShiftForm({ ...shiftForm, shift_end_time: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => shiftsMut.mutate(shiftForm)} disabled={shiftsMut.isPending || !shiftForm.member_id || !shiftForm.shift_date}>
                                Salvar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {loadingShifts ? (
                        <div className="h-24 animate-pulse rounded-lg bg-muted" aria-label="Carregando turnos" />
                      ) : shifts.length === 0 ? (
                        <p className="text-gray-600 text-sm">Nenhum turno atribuído.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Voluntário</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Horário</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {shifts.map((shift) => (
                                <TableRow key={shift.id}>
                                  <TableCell className="font-medium">
                                    {shift.members?.full_name || "N/A"}
                                  </TableCell>
                                  <TableCell>{shift.shift_date}</TableCell>
                                  <TableCell>
                                    {shift.shift_start_time}
                                    {shift.shift_end_time && ` - ${shift.shift_end_time}`}
                                  </TableCell>
                                  <TableCell>
                                    {shift.confirmed ? (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmado
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-yellow-100 text-yellow-800">
                                        <Clock className="mr-1 h-3 w-3" /> Pendente
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right space-x-2">
                                    {!shift.confirmed && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => confirmShiftMut.mutate(shift.id)}
                                        disabled={confirmShiftMut.isPending}
                                      >
                                        Confirmar
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editShift(shift)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteShiftMut.mutate(shift.id)}
                                      disabled={deleteShiftMut.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}

function UnavailabilityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const fetchUnavailability = useServerFn(listVolunteerUnavailability);
  const fetchMembers = useServerFn(listMembers);
  const add = useServerFn(addVolunteerUnavailability);
  const remove = useServerFn(deleteVolunteerUnavailability);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["volunteer-unavailability"],
    queryFn: () => fetchUnavailability(),
    enabled: open,
  });
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers(),
    enabled: open,
    staleTime: 3600000,
  });

  const [form, setForm] = useState({ member_id: "", start_date: "", end_date: "", reason: "" });

  const addMut = useMutation({
    mutationFn: () => add({
      data: {
        member_id: form.member_id,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        reason: form.reason.trim() || null,
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-unavailability"] });
      toast.success("Bloqueio registrado");
      setForm({ member_id: "", start_date: "", end_date: "", reason: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-unavailability"] });
      toast.success("Bloqueio removido");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarOff className="h-5 w-5" />Bloqueios de agenda</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Marque os períodos em que um voluntário não pode ser escalado. Ao tentar
          adicionar um turno nesse período, o sistema avisa e impede.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={form.member_id} onValueChange={(v) => setForm({ ...form, member_id: v })}>
              <SelectTrigger className="col-span-2"><SelectValue placeholder="Selecione o voluntário…" /></SelectTrigger>
              <SelectContent>
                {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <Label className="text-xs">De</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Até</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <Input placeholder="Motivo (opcional)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Button
            size="sm"
            disabled={!form.member_id || !form.start_date || addMut.isPending}
            onClick={() => addMut.mutate()}
          >
            {addMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Adicionar bloqueio
          </Button>

          <div className="space-y-2 max-h-64 overflow-y-auto pt-2 border-t">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum bloqueio cadastrado.</p>
            ) : (
              records.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-2 text-sm border-b pb-2">
                  <div>
                    <p className="font-medium">{r.members?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${r.start_date}T00:00:00`).toLocaleDateString("pt-BR")}
                      {r.end_date !== r.start_date ? ` a ${new Date(`${r.end_date}T00:00:00`).toLocaleDateString("pt-BR")}` : ""}
                      {r.reason ? ` · ${r.reason}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(r.id)}>
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
