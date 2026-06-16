import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEvents, upsertEvent, deleteEvent } from "@/lib/events.functions";
import { listLocations } from "@/lib/locations.functions";
import { listTypes } from "@/lib/types.functions";
import { getMyAccount } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Radio,
  Loader2,
  MapPin,
  Wrench,
  ChevronDown,
  GripVertical,
  Copy,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buildDayMessage, buildRangeMessage, openWhatsAppShare } from "@/lib/whatsapp-share";

export const Route = createFileRoute("/_authenticated/agenda")({
  component: AgendaPage,
});

type Form = {
  id?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_id: string;
  type_id: string;
  description: string;
  show_type: boolean;
  is_live: boolean;
  live_url: string;
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TIME_PRESETS = ["06:00", "07:00", "08:00", "09:00", "10:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const EMPTY_LIST: never[] = [];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function buildEmpty(date: string): Form {
  return {
    event_date: date,
    start_time: "09:00",
    end_time: "",
    location_id: "",
    type_id: "",
    description: "",
    show_type: true,
    is_live: false,
    live_url: "",
  };
}

function AgendaPage() {
  const qc = useQueryClient();
  const fetchEvents = useServerFn(listEvents);
  const fetchLocations = useServerFn(listLocations);
  const fetchTypes = useServerFn(listTypes);
  const fetchAccount = useServerFn(getMyAccount);
  const save = useServerFn(upsertEvent);
  const remove = useServerFn(deleteEvent);

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // 0-indexed
  });

  const range = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const last = new Date(cursor.year, cursor.month + 1, 0);
    return { from: toIso(first), to: toIso(last), first, last };
  }, [cursor]);

  const { data: events = EMPTY_LIST, isLoading } = useQuery({
    queryKey: ["events", range.from, range.to],
    queryFn: () => fetchEvents({ data: { from: range.from, to: range.to } }),
  });
  const { data: locations = EMPTY_LIST } = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetchLocations(),
  });
  const { data: types = EMPTY_LIST } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchTypes(),
  });
  const { data: account } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => fetchAccount(),
  });
  const showEndTime = account?.show_end_time ?? false;
  const showLiveFields = account?.show_live_fields ?? true;

  const activeLocations = useMemo(() => locations.filter((l) => l.active), [locations]);
  const activeTypes = useMemo(() => types.filter((t) => t.active), [types]);

  // Palette: persistent "montagem" the user drags onto days
  const [palette, setPalette] = useState<Form>(buildEmpty(toIso(new Date())));
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pointerDraftRef = useRef<Form | null>(null);
  const [pointerDrag, setPointerDrag] = useState<{ x: number; y: number } | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(buildEmpty(toIso(new Date())));

  // Copy day events to another date
  const [copyState, setCopyState] = useState<{ sourceDate: string; targetDate: string } | null>(null);

  const upsertMut = useMutation({
    mutationFn: (input: Form) =>
      save({
        data: {
          id: input.id,
          event_date: input.event_date,
          start_time: input.start_time,
          end_time: input.end_time || null,
          location_id: input.location_id,
          type_id: input.type_id,
          description: input.description.trim() || null,
          show_type: input.show_type,
          is_live: input.is_live,
          live_url: input.live_url.trim() || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento salvo");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyMut = useMutation({
    mutationFn: async ({ sourceDate, targetDate }: { sourceDate: string; targetDate: string }) => {
      const items = byDate.get(sourceDate) ?? [];
      if (items.length === 0) throw new Error("Nenhum evento neste dia");
      for (const e of items) {
        await save({
          data: {
            event_date: targetDate,
            start_time: (e.start_time ?? "09:00").slice(0, 5),
            end_time: e.end_time ? e.end_time.slice(0, 5) : null,
            location_id: e.location_id,
            type_id: e.type_id,
            description: e.description || null,
            show_type: e.show_type,
            is_live: e.is_live,
            live_url: e.live_url || null,
          },
        });
      }
      return items.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success(`${count} evento(s) copiado(s)`);
      setCopyState(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Group events by date
  const byDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      const arr = map.get(e.event_date) ?? [];
      arr.push(e);
      map.set(e.event_date, arr);
    }
    return map;
  }, [events]);

  // Build a traditional 7-column month grid with leading/trailing days
  // from the previous/next month so weekdays line up Sun→Sat.
  const days = useMemo(() => {
    const out: {
      date: string;
      day: number;
      weekday: number;
      inMonth: boolean;
    }[] = [];
    const firstWeekday = range.first.getDay(); // 0=Sun
    // leading: previous month tail
    for (let i = firstWeekday; i > 0; i--) {
      const dt = new Date(cursor.year, cursor.month, 1 - i);
      out.push({
        date: toIso(dt),
        day: dt.getDate(),
        weekday: dt.getDay(),
        inMonth: false,
      });
    }
    // current month
    const total = range.last.getDate();
    for (let d = 1; d <= total; d++) {
      const dt = new Date(cursor.year, cursor.month, d);
      out.push({
        date: toIso(dt),
        day: d,
        weekday: dt.getDay(),
        inMonth: true,
      });
    }
    // trailing: next month head to complete 6 rows (42 cells)
    while (out.length % 7 !== 0 || out.length < 42) {
      const last = out[out.length - 1];
      const lastDt = parseIso(last.date);
      const dt = new Date(lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate() + 1);
      out.push({
        date: toIso(dt),
        day: dt.getDate(),
        weekday: dt.getDay(),
        inMonth: false,
      });
    }
    return out;
  }, [cursor, range.last]);

  const todayIso = useMemo(() => toIso(new Date()), []);

  const noBase = activeLocations.length === 0 || activeTypes.length === 0;
  const currentPalette = {
    ...palette,
    location_id: palette.location_id || activeLocations[0]?.id || "",
    type_id: palette.type_id || activeTypes[0]?.id || "",
  };
  const paletteReady =
    !!currentPalette.location_id &&
    !!currentPalette.type_id &&
    /^\d{2}:\d{2}$/.test(currentPalette.start_time);

  const canSave =
    !!form.location_id &&
    !!form.type_id &&
    /^\d{2}:\d{2}$/.test(form.start_time) &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.event_date);

  function canDropDraft(draft: Form) {
    return !!draft.location_id && !!draft.type_id && /^\d{2}:\d{2}$/.test(draft.start_time);
  }

  function beginNativeDrag(e: DragEvent<HTMLElement>, draft: Form) {
    if (!canDropDraft(draft)) {
      e.preventDefault();
      toast.error("Selecione igreja, tipo e horário antes de arrastar.");
      return;
    }
    const payload = JSON.stringify({ kind: "agenda-montagem", draft });
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.setData("text/plain", payload);
    setIsDragging(true);
  }

  function readDropDraft(e: DragEvent<HTMLElement>) {
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { kind?: string; draft?: Form };
      return parsed.kind === "agenda-montagem" && parsed.draft ? parsed.draft : null;
    } catch {
      return null;
    }
  }

  function dateFromPoint(x: number, y: number) {
    const element = document.elementFromPoint(x, y) as HTMLElement | null;
    return element?.closest<HTMLElement>("[data-agenda-date]")?.dataset.agendaDate ?? null;
  }

  function startPointerDrag(e: ReactPointerEvent<HTMLElement>, draft: Form) {
    if (!canDropDraft(draft)) return;
    e.preventDefault();
    pointerDraftRef.current = draft;
    setPointerDrag({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  }

  function handleDrop(date: string, draft: Form = currentPalette) {
    setDragOverDate(null);
    setIsDragging(false);
    if (!canDropDraft(draft)) {
      toast.error("Selecione igreja, tipo e horário antes de soltar.");
      return;
    }
    upsertMut.mutate({ ...draft, event_date: date });
  }

  const pointerActive = pointerDrag !== null;

  useEffect(() => {
    if (!pointerActive) return;
    const onMove = (event: globalThis.PointerEvent) => {
      setPointerDrag({ x: event.clientX, y: event.clientY });
      setDragOverDate(dateFromPoint(event.clientX, event.clientY));
    };
    const finish = (event: globalThis.PointerEvent) => {
      const date = dateFromPoint(event.clientX, event.clientY);
      const draft = pointerDraftRef.current;
      pointerDraftRef.current = null;
      setPointerDrag(null);
      setDragOverDate(null);
      setIsDragging(false);
      if (date && draft) handleDrop(date, draft);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [pointerActive]);

  const selectedLocation = activeLocations.find((l) => l.id === currentPalette.location_id);
  const selectedType = activeTypes.find((t) => t.id === currentPalette.type_id);

  return (
    <AppShell>
      <div className="flex gap-6 items-start">
        {/* Palette */}
        <aside className="w-[280px] shrink-0 sticky top-6">
          <Card
            onDragEnd={() => {
              setIsDragging(false);
              setDragOverDate(null);
            }}
            className={cn(
              "p-4 space-y-4 border-2 transition-all",
              paletteReady ? "border-primary/40 cursor-grab active:cursor-grabbing" : "border-dashed",
              isDragging && "opacity-50",
            )}
          >
            <div
              draggable={paletteReady}
              onDragStart={(e) => beginNativeDrag(e, currentPalette)}
              onPointerDown={(e) => startPointerDrag(e, currentPalette)}
              className={cn(
                "flex items-center gap-2 font-semibold rounded-md select-none touch-none",
                paletteReady && "cursor-grab active:cursor-grabbing",
              )}
            >
              <Wrench className="h-4 w-4 text-primary" />
              Montagem
              {paletteReady && (
                <GripVertical className="h-4 w-4 ml-auto text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="palette-start" className="text-xs uppercase tracking-wide text-muted-foreground">
                Hora de início
              </Label>
              <Input
                id="palette-start"
                type="time"
                value={palette.start_time}
                onChange={(e) => setPalette({ ...palette, start_time: e.target.value })}
              />
              <div className="flex flex-wrap gap-1.5">
                {TIME_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPalette({ ...palette, start_time: t })}
                    className={cn(
                      "text-xs px-2 py-1 rounded border transition-colors tabular-nums",
                      palette.start_time === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:border-primary/50",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Igrejas/Capelas
              </Label>
              {activeLocations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Cadastre um local primeiro.
                </p>
              ) : (
                <div className="space-y-1">
                  {activeLocations.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      draggable={!!currentPalette.type_id && /^\d{2}:\d{2}$/.test(currentPalette.start_time)}
                      onDragStart={(e) => beginNativeDrag(e, { ...currentPalette, location_id: l.id })}
                      onClick={() => setPalette({ ...palette, location_id: l.id })}
                      className={cn(
                        "w-full text-left text-sm px-2.5 py-1.5 rounded border flex items-center gap-2 transition-colors",
                        palette.location_id === l.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:border-primary/50",
                      )}
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Tipo de celebração
              </Label>
              {activeTypes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Cadastre um tipo primeiro.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {activeTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      draggable={!!currentPalette.location_id && /^\d{2}:\d{2}$/.test(currentPalette.start_time)}
                      onDragStart={(e) => beginNativeDrag(e, { ...currentPalette, type_id: t.id })}
                      onClick={() => setPalette({ ...palette, type_id: t.id })}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded border transition-colors",
                        palette.type_id === t.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:border-primary/50",
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 border-t pt-3">
                Descrição
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Textarea
                  rows={2}
                  placeholder="Observação (opcional)"
                  value={palette.description}
                  onChange={(e) => setPalette({ ...palette, description: e.target.value })}
                />
                <div className="flex items-center justify-between mt-2">
                  <Label htmlFor="palette-show" className="text-xs">Mostrar tipo na agenda pública</Label>
                  <Switch
                    id="palette-show"
                    checked={palette.show_type}
                    onCheckedChange={(v) => setPalette({ ...palette, show_type: v })}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {showLiveFields && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 border-t pt-3">
                  Transmissão ao vivo
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="palette-live" className="text-xs">Ativar</Label>
                    <Switch
                      id="palette-live"
                      checked={palette.is_live}
                      onCheckedChange={(v) => setPalette({ ...palette, is_live: v })}
                    />
                  </div>
                  {palette.is_live && (
                    <Input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={palette.live_url}
                      onChange={(e) => setPalette({ ...palette, live_url: e.target.value })}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            <p className="text-xs text-muted-foreground border-t pt-3">
              {paletteReady
                ? "Arraste este cartão para um dia. Cada drop cria um item na agenda daquele dia."
                : "Selecione local e tipo para começar a arrastar."}
            </p>
          </Card>
        </aside>

        {pointerDrag && pointerDraftRef.current && (
          <div
            className="pointer-events-none fixed z-50 w-52 rounded-md border bg-card p-2 text-xs shadow-lg"
            style={{ left: pointerDrag.x + 14, top: pointerDrag.y + 14 }}
          >
            <div className="font-medium tabular-nums">{pointerDraftRef.current.start_time}</div>
            <div className="truncate">
              {selectedLocation?.name ?? "Igreja selecionada"}
            </div>
            {selectedType && <div className="text-muted-foreground truncate">{selectedType.name}</div>}
          </div>
        )}

        {/* Calendar */}
        <div className="flex-1 min-w-0">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agenda mensal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Arraste a montagem para o dia desejado.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const m = cursor.month - 1;
                if (m < 0) setCursor({ year: cursor.year - 1, month: 11 });
                else setCursor({ ...cursor, month: m });
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium w-40 text-center">
              {MONTHS[cursor.month]} {cursor.year}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const m = cursor.month + 1;
                if (m > 11) setCursor({ year: cursor.year + 1, month: 0 });
                else setCursor({ ...cursor, month: m });
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const d = new Date();
                setCursor({ year: d.getFullYear(), month: d.getMonth() });
              }}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const today = new Date();
                const dow = today.getDay();
                // Week = Sunday..Saturday
                const start = new Date(today);
                start.setDate(today.getDate() - dow);
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                const startIso = toIso(start);
                const endIso = toIso(end);
                const weekEvents = events.filter(
                  (e) => e.event_date >= startIso && e.event_date <= endIso,
                );
                const label = `Semana de ${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")} a ${end.getDate().toString().padStart(2, "0")}/${(end.getMonth() + 1).toString().padStart(2, "0")}`;
                openWhatsAppShare(buildRangeMessage(weekEvents, account?.brand_title, label));
              }}
              title="Compartilhar agenda da semana no WhatsApp"
            >
              <Share2 className="h-4 w-4 text-emerald-600" />
              Compartilhar semana
            </Button>
          </div>
        </div>

        {noBase && (
          <Card className="p-4 mb-4 bg-muted/30 border-dashed text-sm">
            Cadastre ao menos um <a href="/locations" className="underline">local</a> e um{" "}
            <a href="/types" className="underline">tipo</a> ativo para começar a programar
            eventos.
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div>
            {paletteReady && (
              <p className="text-xs text-muted-foreground mb-2">
                Dica: arraste a montagem para o dia desejado.
              </p>
            )}
            {/* Weekday header */}
            <div
              className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground notranslate"
              translate="no"
            >
              {WEEK_DAYS.map((w) => (
                <div key={w} className="py-1">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const items = byDate.get(d.date) ?? [];
              const isOver = dragOverDate === d.date;
              const isToday = d.date === todayIso;
              return (
                <Card
                  key={d.date}
                  data-agenda-date={d.date}
                  onDragOver={(e) => {
                    if (!paletteReady || !d.inMonth) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    if (dragOverDate !== d.date) setDragOverDate(d.date);
                  }}
                  onDragLeave={(e) => {
                    // only clear if leaving card, not entering a child
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverDate((cur) => (cur === d.date ? null : cur));
                    }
                  }}
                  onDrop={(e) => {
                    if (!d.inMonth) return;
                    e.preventDefault();
                    handleDrop(d.date, readDropDraft(e) ?? currentPalette);
                  }}
                  className={cn(
                    "p-2 flex flex-col min-h-[110px] transition-all",
                    !d.inMonth && "bg-muted/30 opacity-50",
                    isToday && "ring-2 ring-primary/40",
                    isDragging && paletteReady && "border-dashed",
                    isOver && "border-primary border-2 bg-primary/5 scale-[1.02]",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={cn(
                        "text-sm font-bold leading-none tabular-nums",
                        d.inMonth ? "text-primary" : "text-muted-foreground",
                        isToday && "text-primary",
                      )}
                    >
                      {d.day}
                    </div>
                    {d.inMonth && items.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 text-emerald-600"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openWhatsAppShare(
                              buildDayMessage(d.date, items, account?.brand_title),
                            );
                          }}
                          title="Compartilhar este dia no WhatsApp"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 text-primary"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            const next = new Date(parseIso(d.date));
                            next.setDate(next.getDate() + 7);
                            setCopyState({ sourceDate: d.date, targetDate: toIso(next) });
                          }}
                          title="Copiar eventos deste dia para outra data"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    {items.length === 0 && !isOver ? (
                      d.inMonth && paletteReady && isDragging ? (
                        <p className="text-[10px] text-muted-foreground italic">Solte aqui</p>
                      ) : null
                    ) : (
                      items.map((e) => (
                        <div
                          key={e.id}
                          data-event-item
                          className="group rounded border bg-card hover:border-primary transition-colors p-1.5 text-[11px] leading-tight"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="font-semibold tabular-nums">
                              {e.start_time?.slice(0, 5)}
                            </div>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                onClick={() => {
                                  setForm({
                                    id: e.id,
                                    event_date: e.event_date,
                                    start_time: (e.start_time ?? "09:00").slice(0, 5),
                                    end_time: e.end_time ? e.end_time.slice(0, 5) : "",
                                    location_id: e.location_id ?? "",
                                    type_id: e.type_id ?? "",
                                    description: e.description ?? "",
                                    show_type: e.show_type,
                                    is_live: e.is_live,
                                    live_url: e.live_url ?? "",
                                  });
                                  setOpen(true);
                                }}
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                title="Duplicar"
                                onClick={() => {
                                  setForm({
                                    event_date: e.event_date,
                                    start_time: (e.start_time ?? "09:00").slice(0, 5),
                                    end_time: e.end_time ? e.end_time.slice(0, 5) : "",
                                    location_id: e.location_id ?? "",
                                    type_id: e.type_id ?? "",
                                    description: e.description ?? "",
                                    show_type: e.show_type,
                                    is_live: false,
                                    live_url: "",
                                  });
                                  setOpen(true);
                                }}
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                onClick={() => {
                                  if (confirm("Remover este evento?")) deleteMut.mutate(e.id);
                                }}
                              >
                                <Trash2 className="h-2.5 w-2.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="truncate">{e.location_name}</div>
                          {e.is_live && (
                            <div className="mt-0.5 inline-flex items-center gap-0.5 text-[9px] text-red-600 font-semibold uppercase">
                              <Radio className="h-2.5 w-2.5" />
                              Live
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isOver && paletteReady && (
                      <div className="rounded border-2 border-dashed border-primary bg-primary/5 p-1.5 text-[11px]">
                        <div className="font-semibold tabular-nums">{currentPalette.start_time}</div>
                        <div className="truncate">
                          {activeLocations.find((l) => l.id === currentPalette.location_id)?.name}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            </div>
          </div>
        )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-3">
                  <Label htmlFor="event_date">Data</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start">Início</Label>
                  <Input
                    id="start"
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                {showEndTime && (
                  <div className="space-y-1.5">
                    <Label htmlFor="end">Fim (opcional)</Label>
                    <Input
                      id="end"
                      type="time"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Local</Label>
                <div className="space-y-1">
                  {activeLocations.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setForm({ ...form, location_id: l.id })}
                      className={cn(
                        "w-full text-left text-sm px-2.5 py-1.5 rounded border",
                        form.location_id === l.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:border-primary/50",
                      )}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-1.5">
                  {activeTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, type_id: t.id })}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded border",
                        form.type_id === t.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:border-primary/50",
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Observação (opcional)</Label>
                <Textarea
                  id="desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show_type">Mostrar tipo na agenda pública</Label>
                <Switch
                  id="show_type"
                  checked={form.show_type}
                  onCheckedChange={(v) => setForm({ ...form, show_type: v })}
                />
              </div>

              {showLiveFields && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_live">Transmissão ao vivo</Label>
                    <Switch
                      id="is_live"
                      checked={form.is_live}
                      onCheckedChange={(v) => setForm({ ...form, is_live: v })}
                    />
                  </div>
                  {form.is_live && (
                    <div className="space-y-1.5">
                      <Label htmlFor="live_url">URL da transmissão</Label>
                      <Input
                        id="live_url"
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={form.live_url}
                        onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                disabled={!canSave || upsertMut.isPending}
                onClick={() => upsertMut.mutate(form)}
              >
                {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={copyState !== null} onOpenChange={(v) => !v && setCopyState(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Copiar eventos do dia</DialogTitle>
            </DialogHeader>
            {copyState && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Copiar todos os {(byDate.get(copyState.sourceDate) ?? []).length} evento(s) de{" "}
                  <strong>{copyState.sourceDate.split("-").reverse().join("/")}</strong> para:
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="copy-target">Data de destino</Label>
                  <Input
                    id="copy-target"
                    type="date"
                    value={copyState.targetDate}
                    onChange={(e) => setCopyState({ ...copyState, targetDate: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCopyState(null)}>
                Cancelar
              </Button>
              <Button
                disabled={
                  !copyState ||
                  copyMut.isPending ||
                  !/^\d{4}-\d{2}-\d{2}$/.test(copyState.targetDate) ||
                  copyState.targetDate === copyState.sourceDate
                }
                onClick={() => copyState && copyMut.mutate(copyState)}
              >
                {copyMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Copiar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}