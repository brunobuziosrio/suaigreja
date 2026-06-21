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
import { Plus, Edit2, Trash2, CheckCircle2, Clock, Users } from "lucide-react";
import {
  listVolunteerSchedules,
  upsertVolunteerSchedule,
  deleteVolunteerSchedule,
  listVolunteerShifts,
  upsertVolunteerShift,
  deleteVolunteerShift,
  confirmVolunteerShift,
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

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["volunteer-schedules"],
    queryFn: () => fetchSchedules(),
    staleTime: 60000,
    gcTime: Infinity,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers(),
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

  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ["volunteer-shifts", selectedScheduleId],
    queryFn: () =>
      selectedScheduleId ? fetchShifts({ data: { scheduleId: selectedScheduleId } }) : [],
    enabled: !!selectedScheduleId,
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

  if (loadingSchedules) return <AppShell><div className="p-6">Carregando...</div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">⛪ Escalas de Voluntários</h1>
            <p className="text-gray-600">Gerencie os turnos de louvor, intercessão, recepção e mais</p>
          </div>
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

        {schedules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              Nenhuma escala criada. Clique em "Nova Escala" para começar.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedScheduleId || schedules[0].id} onValueChange={setSelectedScheduleId}>
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

                      {shifts.length === 0 ? (
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
