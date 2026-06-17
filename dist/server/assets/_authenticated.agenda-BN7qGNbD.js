import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { A as AppShell, C as Collapsible, a as CollapsibleTrigger, b as CollapsibleContent } from "./app-shell-CrQ0iXNE.js";
import { useState, useMemo, useRef, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { l as listEvents, u as upsertEvent, d as deleteEvent } from "./events.functions-DvfwT8xH.js";
import { l as listLocations } from "./locations.functions-BuQu5la6.js";
import { l as listTypes } from "./types.functions-2SAYy8Gp.js";
import { g as getMyAccount } from "./account.functions-DK5H0Kdx.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { Wrench, GripVertical, MapPin, ChevronDown, ChevronLeft, ChevronRight, Share2, Loader2, Copy, Pencil, Trash2, Radio } from "lucide-react";
import { toast } from "sonner";
import { c as cn } from "./utils-H80jjgLf.js";
import { o as openWhatsAppShare, b as buildRangeMessage, a as buildDayMessage } from "./whatsapp-share-BG6O2nOK.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./admin-payment-settings.functions-DPCtUTO2.js";
import "./server-aNfUBU9s.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CuIHMyp3.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./router-BAWvi9U-.js";
import "./client-DVtn2Z4s.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "clsx";
import "tailwind-merge";
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TIME_PRESETS = ["06:00", "07:00", "08:00", "09:00", "10:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const EMPTY_LIST = [];
function pad(n) {
  return String(n).padStart(2, "0");
}
function toIso(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function buildEmpty(date) {
  return {
    event_date: date,
    start_time: "09:00",
    end_time: "",
    location_id: "",
    type_id: "",
    description: "",
    show_type: true,
    is_live: false,
    live_url: ""
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
    const d = /* @__PURE__ */ new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth()
    };
  });
  const range = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const last = new Date(cursor.year, cursor.month + 1, 0);
    return {
      from: toIso(first),
      to: toIso(last),
      first,
      last
    };
  }, [cursor]);
  const {
    data: events = EMPTY_LIST,
    isLoading
  } = useQuery({
    queryKey: ["events", range.from, range.to],
    queryFn: () => fetchEvents({
      data: {
        from: range.from,
        to: range.to
      }
    })
  });
  const {
    data: locations = EMPTY_LIST
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetchLocations()
  });
  const {
    data: types = EMPTY_LIST
  } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchTypes()
  });
  const {
    data: account
  } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => fetchAccount()
  });
  const showEndTime = account?.show_end_time ?? false;
  const showLiveFields = account?.show_live_fields ?? true;
  const activeLocations = useMemo(() => locations.filter((l) => l.active), [locations]);
  const activeTypes = useMemo(() => types.filter((t) => t.active), [types]);
  const [palette, setPalette] = useState(buildEmpty(toIso(/* @__PURE__ */ new Date())));
  const [dragOverDate, setDragOverDate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const pointerDraftRef = useRef(null);
  const [pointerDrag, setPointerDrag] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(buildEmpty(toIso(/* @__PURE__ */ new Date())));
  const [copyState, setCopyState] = useState(null);
  const upsertMut = useMutation({
    mutationFn: (input) => save({
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
        live_url: input.live_url.trim() || null
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["events"]
      });
      toast.success("Evento salvo");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["events"]
      });
      toast.success("Evento removido");
    },
    onError: (e) => toast.error(e.message)
  });
  const copyMut = useMutation({
    mutationFn: async ({
      sourceDate,
      targetDate
    }) => {
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
            live_url: e.live_url || null
          }
        });
      }
      return items.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({
        queryKey: ["events"]
      });
      toast.success(`${count} evento(s) copiado(s)`);
      setCopyState(null);
    },
    onError: (e) => toast.error(e.message)
  });
  const byDate = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const e of events) {
      const arr = map.get(e.event_date) ?? [];
      arr.push(e);
      map.set(e.event_date, arr);
    }
    return map;
  }, [events]);
  const days = useMemo(() => {
    const out = [];
    const firstWeekday = range.first.getDay();
    for (let i = firstWeekday; i > 0; i--) {
      const dt = new Date(cursor.year, cursor.month, 1 - i);
      out.push({
        date: toIso(dt),
        day: dt.getDate(),
        weekday: dt.getDay(),
        inMonth: false
      });
    }
    const total = range.last.getDate();
    for (let d = 1; d <= total; d++) {
      const dt = new Date(cursor.year, cursor.month, d);
      out.push({
        date: toIso(dt),
        day: d,
        weekday: dt.getDay(),
        inMonth: true
      });
    }
    while (out.length % 7 !== 0 || out.length < 42) {
      const last = out[out.length - 1];
      const lastDt = parseIso(last.date);
      const dt = new Date(lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate() + 1);
      out.push({
        date: toIso(dt),
        day: dt.getDate(),
        weekday: dt.getDay(),
        inMonth: false
      });
    }
    return out;
  }, [cursor, range.last]);
  const todayIso = useMemo(() => toIso(/* @__PURE__ */ new Date()), []);
  const noBase = activeLocations.length === 0 || activeTypes.length === 0;
  const currentPalette = {
    ...palette,
    location_id: palette.location_id || activeLocations[0]?.id || "",
    type_id: palette.type_id || activeTypes[0]?.id || ""
  };
  const paletteReady = !!currentPalette.location_id && !!currentPalette.type_id && /^\d{2}:\d{2}$/.test(currentPalette.start_time);
  const canSave = !!form.location_id && !!form.type_id && /^\d{2}:\d{2}$/.test(form.start_time) && /^\d{4}-\d{2}-\d{2}$/.test(form.event_date);
  function canDropDraft(draft) {
    return !!draft.location_id && !!draft.type_id && /^\d{2}:\d{2}$/.test(draft.start_time);
  }
  function beginNativeDrag(e, draft) {
    if (!canDropDraft(draft)) {
      e.preventDefault();
      toast.error("Selecione igreja, tipo e horário antes de arrastar.");
      return;
    }
    const payload = JSON.stringify({
      kind: "agenda-montagem",
      draft
    });
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.setData("text/plain", payload);
    setIsDragging(true);
  }
  function readDropDraft(e) {
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.kind === "agenda-montagem" && parsed.draft ? parsed.draft : null;
    } catch {
      return null;
    }
  }
  function dateFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    return element?.closest("[data-agenda-date]")?.dataset.agendaDate ?? null;
  }
  function startPointerDrag(e, draft) {
    if (!canDropDraft(draft)) return;
    e.preventDefault();
    pointerDraftRef.current = draft;
    setPointerDrag({
      x: e.clientX,
      y: e.clientY
    });
    setIsDragging(true);
  }
  function handleDrop(date, draft = currentPalette) {
    setDragOverDate(null);
    setIsDragging(false);
    if (!canDropDraft(draft)) {
      toast.error("Selecione igreja, tipo e horário antes de soltar.");
      return;
    }
    upsertMut.mutate({
      ...draft,
      event_date: date
    });
  }
  const pointerActive = pointerDrag !== null;
  useEffect(() => {
    if (!pointerActive) return;
    const onMove = (event) => {
      setPointerDrag({
        x: event.clientX,
        y: event.clientY
      });
      setDragOverDate(dateFromPoint(event.clientX, event.clientY));
    };
    const finish = (event) => {
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
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full flex gap-6 items-start", children: [
    /* @__PURE__ */ jsx("aside", { className: "w-[280px] shrink-0 sticky top-6", children: /* @__PURE__ */ jsxs(Card, { onDragEnd: () => {
      setIsDragging(false);
      setDragOverDate(null);
    }, className: cn("p-4 space-y-4 border-2 transition-all", paletteReady ? "border-primary/40 cursor-grab active:cursor-grabbing" : "border-dashed", isDragging && "opacity-50"), children: [
      /* @__PURE__ */ jsxs("div", { draggable: paletteReady, onDragStart: (e) => beginNativeDrag(e, currentPalette), onPointerDown: (e) => startPointerDrag(e, currentPalette), className: cn("flex items-center gap-2 font-semibold rounded-md select-none touch-none", paletteReady && "cursor-grab active:cursor-grabbing"), children: [
        /* @__PURE__ */ jsx(Wrench, { className: "h-4 w-4 text-primary" }),
        "Montagem",
        paletteReady && /* @__PURE__ */ jsx(GripVertical, { className: "h-4 w-4 ml-auto text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "palette-start", className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Hora de início" }),
        /* @__PURE__ */ jsx(Input, { id: "palette-start", type: "time", value: palette.start_time, onChange: (e) => setPalette({
          ...palette,
          start_time: e.target.value
        }) }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: TIME_PRESETS.map((t) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setPalette({
          ...palette,
          start_time: t
        }), className: cn("text-xs px-2 py-1 rounded border transition-colors tabular-nums", palette.start_time === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/50"), children: t }, t)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Igrejas/Capelas" }),
        activeLocations.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground italic", children: "Cadastre um local primeiro." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: activeLocations.map((l) => /* @__PURE__ */ jsxs("button", { type: "button", draggable: !!currentPalette.type_id && /^\d{2}:\d{2}$/.test(currentPalette.start_time), onDragStart: (e) => beginNativeDrag(e, {
          ...currentPalette,
          location_id: l.id
        }), onClick: () => setPalette({
          ...palette,
          location_id: l.id
        }), className: cn("w-full text-left text-sm px-2.5 py-1.5 rounded border flex items-center gap-2 transition-colors", palette.location_id === l.id ? "bg-primary/10 border-primary" : "bg-background hover:border-primary/50"), children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: l.name })
        ] }, l.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Tipo de celebração" }),
        activeTypes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground italic", children: "Cadastre um tipo primeiro." }) : /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: activeTypes.map((t) => /* @__PURE__ */ jsx("button", { type: "button", draggable: !!currentPalette.location_id && /^\d{2}:\d{2}$/.test(currentPalette.start_time), onDragStart: (e) => beginNativeDrag(e, {
          ...currentPalette,
          type_id: t.id
        }), onClick: () => setPalette({
          ...palette,
          type_id: t.id
        }), className: cn("text-xs px-2.5 py-1.5 rounded border transition-colors", palette.type_id === t.id ? "bg-primary/10 border-primary" : "bg-background hover:border-primary/50"), children: t.name }, t.id)) })
      ] }),
      /* @__PURE__ */ jsxs(Collapsible, { children: [
        /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full text-sm font-medium py-1 border-t pt-3", children: [
          "Descrição",
          /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
        ] }),
        /* @__PURE__ */ jsxs(CollapsibleContent, { className: "pt-2", children: [
          /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Observação (opcional)", value: palette.description, onChange: (e) => setPalette({
            ...palette,
            description: e.target.value
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "palette-show", className: "text-xs", children: "Mostrar tipo na agenda pública" }),
            /* @__PURE__ */ jsx(Switch, { id: "palette-show", checked: palette.show_type, onCheckedChange: (v) => setPalette({
              ...palette,
              show_type: v
            }) })
          ] })
        ] })
      ] }),
      showLiveFields && /* @__PURE__ */ jsxs(Collapsible, { children: [
        /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full text-sm font-medium py-1 border-t pt-3", children: [
          "Transmissão ao vivo",
          /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
        ] }),
        /* @__PURE__ */ jsxs(CollapsibleContent, { className: "pt-2 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "palette-live", className: "text-xs", children: "Ativar" }),
            /* @__PURE__ */ jsx(Switch, { id: "palette-live", checked: palette.is_live, onCheckedChange: (v) => setPalette({
              ...palette,
              is_live: v
            }) })
          ] }),
          palette.is_live && /* @__PURE__ */ jsx(Input, { type: "url", placeholder: "https://youtube.com/...", value: palette.live_url, onChange: (e) => setPalette({
            ...palette,
            live_url: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground border-t pt-3", children: paletteReady ? "Arraste este cartão para um dia. Cada drop cria um item na agenda daquele dia." : "Selecione local e tipo para começar a arrastar." })
    ] }) }),
    pointerDrag && pointerDraftRef.current && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none fixed z-50 w-52 rounded-md border bg-card p-2 text-xs shadow-lg", style: {
      left: pointerDrag.x + 14,
      top: pointerDrag.y + 14
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium tabular-nums", children: pointerDraftRef.current.start_time }),
      /* @__PURE__ */ jsx("div", { className: "truncate", children: selectedLocation?.name ?? "Igreja selecionada" }),
      selectedType && /* @__PURE__ */ jsx("div", { className: "text-muted-foreground truncate", children: selectedType.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Agenda mensal" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Arraste a montagem para o dia desejado." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: () => {
            const m = cursor.month - 1;
            if (m < 0) setCursor({
              year: cursor.year - 1,
              month: 11
            });
            else setCursor({
              ...cursor,
              month: m
            });
          }, children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium w-40 text-center", children: [
            MONTHS[cursor.month],
            " ",
            cursor.year
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: () => {
            const m = cursor.month + 1;
            if (m > 11) setCursor({
              year: cursor.year + 1,
              month: 0
            });
            else setCursor({
              ...cursor,
              month: m
            });
          }, children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
            const d = /* @__PURE__ */ new Date();
            setCursor({
              year: d.getFullYear(),
              month: d.getMonth()
            });
          }, children: "Hoje" }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2", onClick: () => {
            const today = /* @__PURE__ */ new Date();
            const dow = today.getDay();
            const start = new Date(today);
            start.setDate(today.getDate() - dow);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            const startIso = toIso(start);
            const endIso = toIso(end);
            const weekEvents = events.filter((e) => e.event_date >= startIso && e.event_date <= endIso);
            const label = `Semana de ${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")} a ${end.getDate().toString().padStart(2, "0")}/${(end.getMonth() + 1).toString().padStart(2, "0")}`;
            openWhatsAppShare(buildRangeMessage(weekEvents, account?.brand_title, label));
          }, title: "Compartilhar agenda da semana no WhatsApp", children: [
            /* @__PURE__ */ jsx(Share2, { className: "h-4 w-4 text-emerald-600" }),
            "Compartilhar semana"
          ] })
        ] })
      ] }),
      noBase && /* @__PURE__ */ jsxs(Card, { className: "p-4 mb-4 bg-muted/30 border-dashed text-sm", children: [
        "Cadastre ao menos um ",
        /* @__PURE__ */ jsx("a", { href: "/locations", className: "underline", children: "local" }),
        " e um",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/types", className: "underline", children: "tipo" }),
        " ativo para começar a programar eventos."
      ] }),
      isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs("div", { children: [
        paletteReady && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Dica: arraste a montagem para o dia desejado." }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground notranslate", translate: "no", children: WEEK_DAYS.map((w) => /* @__PURE__ */ jsx("div", { className: "py-1", children: w }, w)) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2", children: days.map((d) => {
          const items = byDate.get(d.date) ?? [];
          const isOver = dragOverDate === d.date;
          const isToday = d.date === todayIso;
          return /* @__PURE__ */ jsxs(Card, { "data-agenda-date": d.date, onDragOver: (e) => {
            if (!paletteReady || !d.inMonth) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            if (dragOverDate !== d.date) setDragOverDate(d.date);
          }, onDragLeave: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragOverDate((cur) => cur === d.date ? null : cur);
            }
          }, onDrop: (e) => {
            if (!d.inMonth) return;
            e.preventDefault();
            handleDrop(d.date, readDropDraft(e) ?? currentPalette);
          }, className: cn("p-2 flex flex-col min-h-[110px] transition-all", !d.inMonth && "bg-muted/30 opacity-50", isToday && "ring-2 ring-primary/40", isDragging && paletteReady && "border-dashed", isOver && "border-primary border-2 bg-primary/5 scale-[1.02]"), children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsx("div", { className: cn("text-sm font-bold leading-none tabular-nums", d.inMonth ? "text-primary" : "text-muted-foreground", isToday && "text-primary"), children: d.day }),
              d.inMonth && items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5 text-emerald-600", onClick: (ev) => {
                  ev.stopPropagation();
                  openWhatsAppShare(buildDayMessage(d.date, items, account?.brand_title));
                }, title: "Compartilhar este dia no WhatsApp", children: /* @__PURE__ */ jsx(Share2, { className: "h-3 w-3" }) }),
                /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5 text-primary", onClick: (ev) => {
                  ev.stopPropagation();
                  const next = new Date(parseIso(d.date));
                  next.setDate(next.getDate() + 7);
                  setCopyState({
                    sourceDate: d.date,
                    targetDate: toIso(next)
                  });
                }, title: "Copiar eventos deste dia para outra data", children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1 flex-1", children: [
              items.length === 0 && !isOver ? d.inMonth && paletteReady && isDragging ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground italic", children: "Solte aqui" }) : null : items.map((e) => /* @__PURE__ */ jsxs("div", { "data-event-item": true, className: "group rounded border bg-card hover:border-primary transition-colors p-1.5 text-[11px] leading-tight", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold tabular-nums", children: e.start_time?.slice(0, 5) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                    /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5", onClick: () => {
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
                        live_url: e.live_url ?? ""
                      });
                      setOpen(true);
                    }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-2.5 w-2.5" }) }),
                    /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5", title: "Duplicar", onClick: () => {
                      setForm({
                        event_date: e.event_date,
                        start_time: (e.start_time ?? "09:00").slice(0, 5),
                        end_time: e.end_time ? e.end_time.slice(0, 5) : "",
                        location_id: e.location_id ?? "",
                        type_id: e.type_id ?? "",
                        description: e.description ?? "",
                        show_type: e.show_type,
                        is_live: false,
                        live_url: ""
                      });
                      setOpen(true);
                    }, children: /* @__PURE__ */ jsx(Copy, { className: "h-2.5 w-2.5" }) }),
                    /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5", onClick: () => {
                      if (confirm("Remover este evento?")) deleteMut.mutate(e.id);
                    }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-2.5 w-2.5 text-destructive" }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "truncate", children: e.location_name }),
                e.is_live && /* @__PURE__ */ jsxs("div", { className: "mt-0.5 inline-flex items-center gap-0.5 text-[9px] text-red-600 font-semibold uppercase", children: [
                  /* @__PURE__ */ jsx(Radio, { className: "h-2.5 w-2.5" }),
                  "Live"
                ] })
              ] }, e.id)),
              isOver && paletteReady && /* @__PURE__ */ jsxs("div", { className: "rounded border-2 border-dashed border-primary bg-primary/5 p-1.5 text-[11px]", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold tabular-nums", children: currentPalette.start_time }),
                /* @__PURE__ */ jsx("div", { className: "truncate", children: activeLocations.find((l) => l.id === currentPalette.location_id)?.name })
              ] })
            ] })
          ] }, d.date);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Editar evento" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 col-span-3", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "event_date", children: "Data" }),
            /* @__PURE__ */ jsx(Input, { id: "event_date", type: "date", value: form.event_date, onChange: (e) => setForm({
              ...form,
              event_date: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "start", children: "Início" }),
            /* @__PURE__ */ jsx(Input, { id: "start", type: "time", value: form.start_time, onChange: (e) => setForm({
              ...form,
              start_time: e.target.value
            }) })
          ] }),
          showEndTime && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "end", children: "Fim (opcional)" }),
            /* @__PURE__ */ jsx(Input, { id: "end", type: "time", value: form.end_time, onChange: (e) => setForm({
              ...form,
              end_time: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Local" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-1", children: activeLocations.map((l) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setForm({
            ...form,
            location_id: l.id
          }), className: cn("w-full text-left text-sm px-2.5 py-1.5 rounded border", form.location_id === l.id ? "bg-primary/10 border-primary" : "bg-background hover:border-primary/50"), children: l.name }, l.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Tipo" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: activeTypes.map((t) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setForm({
            ...form,
            type_id: t.id
          }), className: cn("text-xs px-2.5 py-1.5 rounded border", form.type_id === t.id ? "bg-primary/10 border-primary" : "bg-background hover:border-primary/50"), children: t.name }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "desc", children: "Observação (opcional)" }),
          /* @__PURE__ */ jsx(Textarea, { id: "desc", rows: 2, value: form.description, onChange: (e) => setForm({
            ...form,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "show_type", children: "Mostrar tipo na agenda pública" }),
          /* @__PURE__ */ jsx(Switch, { id: "show_type", checked: form.show_type, onCheckedChange: (v) => setForm({
            ...form,
            show_type: v
          }) })
        ] }),
        showLiveFields && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "is_live", children: "Transmissão ao vivo" }),
            /* @__PURE__ */ jsx(Switch, { id: "is_live", checked: form.is_live, onCheckedChange: (v) => setForm({
              ...form,
              is_live: v
            }) })
          ] }),
          form.is_live && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "live_url", children: "URL da transmissão" }),
            /* @__PURE__ */ jsx(Input, { id: "live_url", type: "url", placeholder: "https://youtube.com/...", value: form.live_url, onChange: (e) => setForm({
              ...form,
              live_url: e.target.value
            }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxs(Button, { disabled: !canSave || upsertMut.isPending, onClick: () => upsertMut.mutate(form), children: [
          upsertMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
          "Salvar"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: copyState !== null, onOpenChange: (v) => !v && setCopyState(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Copiar eventos do dia" }) }),
      copyState && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Copiar todos os ",
          (byDate.get(copyState.sourceDate) ?? []).length,
          " evento(s) de",
          " ",
          /* @__PURE__ */ jsx("strong", { children: copyState.sourceDate.split("-").reverse().join("/") }),
          " para:"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "copy-target", children: "Data de destino" }),
          /* @__PURE__ */ jsx(Input, { id: "copy-target", type: "date", value: copyState.targetDate, onChange: (e) => setCopyState({
            ...copyState,
            targetDate: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setCopyState(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxs(Button, { disabled: !copyState || copyMut.isPending || !/^\d{4}-\d{2}-\d{2}$/.test(copyState.targetDate) || copyState.targetDate === copyState.sourceDate, onClick: () => copyState && copyMut.mutate(copyState), children: [
          copyMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
          "Copiar"
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  AgendaPage as component
};
