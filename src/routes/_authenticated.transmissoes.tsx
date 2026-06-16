import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listLiveStreams,
  upsertLiveStream,
  deleteLiveStream,
  upsertLiveStreamOverride,
} from "@/lib/live-streams.functions";
import {
  nextOccurrences,
  nowInBRT,
  type LiveStreamRow,
  type LiveOverrideRow,
} from "@/lib/live-streams.shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Radio, Loader2, Link as LinkIcon, Ban } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/transmissoes")({
  component: LiveStreamsPage,
});

type FormState = {
  id?: string;
  title: string;
  recurrence: "weekly" | "once";
  weekday: number | null;
  event_date: string | null;
  start_time: string;
  duration_minutes: number;
  minutes_before: number;
  default_live_url: string;
  active: boolean;
};

const empty: FormState = {
  title: "",
  recurrence: "weekly",
  weekday: 0,
  event_date: null,
  start_time: "10:00",
  duration_minutes: 90,
  minutes_before: 10,
  default_live_url: "",
  active: true,
};

const WEEKDAYS = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" });
}

function LiveStreamsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listLiveStreams);
  const save = useServerFn(upsertLiveStream);
  const remove = useServerFn(deleteLiveStream);
  const saveOverride = useServerFn(upsertLiveStreamOverride);

  const { data, isLoading } = useQuery({
    queryKey: ["live-streams"],
    queryFn: () => fetchList(),
  });
  const streams = (data?.streams ?? []) as LiveStreamRow[];
  const overrides = (data?.overrides ?? []) as LiveOverrideRow[];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const upsertMut = useMutation({
    mutationFn: (input: FormState) =>
      save({
        data: {
          id: input.id,
          title: input.title.trim(),
          recurrence: input.recurrence,
          weekday: input.recurrence === "weekly" ? (input.weekday ?? 0) : null,
          event_date: input.recurrence === "once" ? input.event_date : null,
          start_time: input.start_time,
          duration_minutes: Number(input.duration_minutes),
          minutes_before: Number(input.minutes_before),
          default_live_url: input.default_live_url.trim() || null,
          active: input.active,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live-streams"] });
      toast.success("Transmissão salva");
      setOpen(false);
      setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live-streams"] });
      toast.success("Transmissão removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const overrideMut = useMutation({
    mutationFn: (vars: {
      live_stream_id: string;
      event_date: string;
      live_url: string | null;
      cancelled: boolean;
    }) => saveOverride({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live-streams"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="p-6 max-w-5xl">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transmissões ao vivo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre os horários das suas transmissões. O site mostra "AO VIVO AGORA" no
              horário e "Próxima transmissão" no restante do tempo.
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setForm(empty);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova transmissão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar transmissão" : "Nova transmissão"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Culto de Domingo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.recurrence}
                      onValueChange={(v) =>
                        setForm({ ...form, recurrence: v as "weekly" | "once" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Toda semana</SelectItem>
                        <SelectItem value="once">Data única</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.recurrence === "weekly" ? (
                    <div className="space-y-2">
                      <Label>Dia da semana</Label>
                      <Select
                        value={String(form.weekday ?? 0)}
                        onValueChange={(v) => setForm({ ...form, weekday: Number(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEEKDAYS.map((w, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={form.event_date ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, event_date: e.target.value || null })
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={720}
                      value={form.duration_minutes}
                      onChange={(e) =>
                        setForm({ ...form, duration_minutes: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avançar (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={180}
                      value={form.minutes_before}
                      onChange={(e) =>
                        setForm({ ...form, minutes_before: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  "Avançar" é quantos minutos antes do horário o card "AO VIVO" começa a
                  aparecer no site.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="url">Link da transmissão</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://youtube.com/live/..."
                    value={form.default_live_url}
                    onChange={(e) => setForm({ ...form, default_live_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Link padrão (ex: seu canal do YouTube). Você pode sobrescrever por data
                    abaixo, depois de salvar.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativa</Label>
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={!form.title.trim() || upsertMut.isPending}
                  onClick={() => upsertMut.mutate(form)}
                >
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : streams.length === 0 ? (
          <Card className="p-12 text-center">
            <Radio className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma transmissão cadastrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione os horários dos seus cultos para o card aparecer no site.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {streams.map((s) => (
              <StreamCard
                key={s.id}
                stream={s}
                overrides={overrides.filter((o) => o.live_stream_id === s.id)}
                onEdit={() => {
                  setForm({
                    id: s.id,
                    title: s.title,
                    recurrence: s.recurrence,
                    weekday: s.weekday,
                    event_date: s.event_date,
                    start_time: s.start_time.slice(0, 5),
                    duration_minutes: s.duration_minutes,
                    minutes_before: s.minutes_before,
                    default_live_url: s.default_live_url ?? "",
                    active: s.active,
                  });
                  setOpen(true);
                }}
                onDelete={() => {
                  if (confirm(`Remover "${s.title}"?`)) deleteMut.mutate(s.id);
                }}
                onOverride={(vars) => overrideMut.mutate(vars)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StreamCard({
  stream,
  overrides,
  onEdit,
  onDelete,
  onOverride,
}: {
  stream: LiveStreamRow;
  overrides: LiveOverrideRow[];
  onEdit: () => void;
  onDelete: () => void;
  onOverride: (vars: {
    live_stream_id: string;
    event_date: string;
    live_url: string | null;
    cancelled: boolean;
  }) => void;
}) {
  const occurrences = useMemo(
    () => nextOccurrences(stream, overrides, nowInBRT(), 4),
    [stream, overrides],
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 text-red-600 shrink-0">
              <Radio className="h-4 w-4" />
            </span>
            <h3 className="font-semibold truncate">{stream.title}</h3>
            {!stream.active && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativa</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stream.recurrence === "weekly"
              ? `Toda ${WEEKDAYS[stream.weekday ?? 0]} às ${stream.start_time.slice(0, 5)}`
              : `${stream.event_date ? formatDateBR(stream.event_date) : "—"} às ${stream.start_time.slice(0, 5)}`}
            {" · "}
            {stream.duration_minutes} min
          </p>
          {stream.default_live_url && (
            <a
              href={stream.default_live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              <LinkIcon className="h-3 w-3" />
              <span className="truncate max-w-[260px]">{stream.default_live_url}</span>
            </a>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {occurrences.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Próximas ocorrências
          </p>
          <div className="grid gap-2">
            {occurrences.map((o) => (
              <OverrideRow
                key={o.date}
                streamId={stream.id}
                date={o.date}
                cancelled={o.cancelled}
                liveUrl={o.live_url}
                onSave={onOverride}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function OverrideRow({
  streamId,
  date,
  cancelled,
  liveUrl,
  onSave,
}: {
  streamId: string;
  date: string;
  cancelled: boolean;
  liveUrl: string | null;
  onSave: (v: {
    live_stream_id: string;
    event_date: string;
    live_url: string | null;
    cancelled: boolean;
  }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(liveUrl ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium min-w-[160px] capitalize">{formatDateBR(date)}</span>
      {cancelled ? (
        <>
          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
            Cancelado
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onSave({
                live_stream_id: streamId,
                event_date: date,
                live_url: null,
                cancelled: false,
              })
            }
          >
            Reativar
          </Button>
        </>
      ) : editing ? (
        <>
          <Input
            type="url"
            placeholder="https://youtube.com/live/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 min-w-[200px] h-8"
          />
          <Button
            size="sm"
            onClick={() => {
              onSave({
                live_stream_id: streamId,
                event_date: date,
                live_url: url.trim() || null,
                cancelled: false,
              });
              setEditing(false);
            }}
          >
            Salvar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </>
      ) : (
        <>
          {liveUrl ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[260px]">
              <LinkIcon className="h-3 w-3" />
              {liveUrl}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">link padrão</span>
          )}
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              {liveUrl ? "Editar link" : "Link específico"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onSave({
                  live_stream_id: streamId,
                  event_date: date,
                  live_url: null,
                  cancelled: true,
                })
              }
            >
              <Ban className="h-3 w-3 mr-1" /> Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}