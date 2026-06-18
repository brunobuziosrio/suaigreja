import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { a as nextOccurrences, n as nowInBRT } from "./live-streams.shared-CQmWsiqd.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { Plus, Loader2, Radio, Link, Pencil, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./router-DXfKo2Q8.js";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-select";
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  recurrence: z.enum(["weekly", "once"]),
  weekday: z.number().int().min(0).max(6).nullable(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_minutes: z.number().int().min(5).max(720),
  minutes_before: z.number().int().min(0).max(180),
  default_live_url: z.string().url().max(500).nullable(),
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999).optional()
});
const listLiveStreams = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("faed6e5154c6e5bacbd9d2e2a831bd865c0ad0284b73f7c9755999360169ae01"));
const upsertLiveStream = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("bbb28bdec19643272ad0a0b859eb49f7ccaee5933c708270c05eb63cc34ef226"));
const deleteLiveStream = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("c17234f15eaf7f37f21c54a5e2e20dc44d866d83cf613833da65d41de5999e2b"));
const overrideSchema = z.object({
  live_stream_id: z.string().uuid(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  live_url: z.string().url().max(500).nullable(),
  cancelled: z.boolean()
});
const upsertLiveStreamOverride = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => overrideSchema.parse(i)).handler(createSsrRpc("860702f08f127cbd5a89b9b6303462c1b38236fb5653282423d0d5920666cea6"));
const empty = {
  title: "",
  recurrence: "weekly",
  weekday: 0,
  event_date: null,
  start_time: "10:00",
  duration_minutes: 90,
  minutes_before: 10,
  default_live_url: "",
  active: true
};
const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
function formatDateBR(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short"
  });
}
function LiveStreamsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listLiveStreams);
  const save = useServerFn(upsertLiveStream);
  const remove = useServerFn(deleteLiveStream);
  const saveOverride = useServerFn(upsertLiveStreamOverride);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["live-streams"],
    queryFn: () => fetchList()
  });
  const streams = data?.streams ?? [];
  const overrides = data?.overrides ?? [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const upsertMut = useMutation({
    mutationFn: (input) => save({
      data: {
        id: input.id,
        title: input.title.trim(),
        recurrence: input.recurrence,
        weekday: input.recurrence === "weekly" ? input.weekday ?? 0 : null,
        event_date: input.recurrence === "once" ? input.event_date : null,
        start_time: input.start_time,
        duration_minutes: Number(input.duration_minutes),
        minutes_before: Number(input.minutes_before),
        default_live_url: input.default_live_url.trim() || null,
        active: input.active
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["live-streams"]
      });
      toast.success("Transmissão salva");
      setOpen(false);
      setForm(empty);
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
        queryKey: ["live-streams"]
      });
      toast.success("Transmissão removida");
    },
    onError: (e) => toast.error(e.message)
  });
  const overrideMut = useMutation({
    mutationFn: (vars) => saveOverride({
      data: vars
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["live-streams"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Transmissões ao vivo" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: 'Cadastre os horários das suas transmissões. O site mostra "AO VIVO AGORA" no horário e "Próxima transmissão" no restante do tempo.' })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (!o) setForm(empty);
      }, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Nova transmissão"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar transmissão" : "Nova transmissão" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Título" }),
              /* @__PURE__ */ jsx(Input, { id: "title", value: form.title, onChange: (e) => setForm({
                ...form,
                title: e.target.value
              }), placeholder: "Ex: Culto de Domingo" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Tipo" }),
                /* @__PURE__ */ jsxs(Select, { value: form.recurrence, onValueChange: (v) => setForm({
                  ...form,
                  recurrence: v
                }), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "weekly", children: "Toda semana" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "once", children: "Data única" })
                  ] })
                ] })
              ] }),
              form.recurrence === "weekly" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Dia da semana" }),
                /* @__PURE__ */ jsxs(Select, { value: String(form.weekday ?? 0), onValueChange: (v) => setForm({
                  ...form,
                  weekday: Number(v)
                }), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: WEEKDAYS.map((w, i) => /* @__PURE__ */ jsx(SelectItem, { value: String(i), children: w }, i)) })
                ] })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Data" }),
                /* @__PURE__ */ jsx(Input, { type: "date", value: form.event_date ?? "", onChange: (e) => setForm({
                  ...form,
                  event_date: e.target.value || null
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Horário" }),
                /* @__PURE__ */ jsx(Input, { type: "time", value: form.start_time, onChange: (e) => setForm({
                  ...form,
                  start_time: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Duração (min)" }),
                /* @__PURE__ */ jsx(Input, { type: "number", min: 5, max: 720, value: form.duration_minutes, onChange: (e) => setForm({
                  ...form,
                  duration_minutes: Number(e.target.value) || 0
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Avançar (min)" }),
                /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 180, value: form.minutes_before, onChange: (e) => setForm({
                  ...form,
                  minutes_before: Number(e.target.value) || 0
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground -mt-2", children: '"Avançar" é quantos minutos antes do horário o card "AO VIVO" começa a aparecer no site.' }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "url", children: "Link da transmissão" }),
              /* @__PURE__ */ jsx(Input, { id: "url", type: "url", placeholder: "https://youtube.com/live/...", value: form.default_live_url, onChange: (e) => setForm({
                ...form,
                default_live_url: e.target.value
              }) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Link padrão (ex: seu canal do YouTube). Você pode sobrescrever por data abaixo, depois de salvar." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "active", children: "Ativa" }),
              /* @__PURE__ */ jsx(Switch, { id: "active", checked: form.active, onCheckedChange: (v) => setForm({
                ...form,
                active: v
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxs(Button, { disabled: !form.title.trim() || upsertMut.isPending, onClick: () => upsertMut.mutate(form), children: [
              upsertMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
              "Salvar"
            ] })
          ] })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : streams.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(Radio, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Nenhuma transmissão cadastrada" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Adicione os horários dos seus cultos para o card aparecer no site." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: streams.map((s) => /* @__PURE__ */ jsx(StreamCard, { stream: s, overrides: overrides.filter((o) => o.live_stream_id === s.id), onEdit: () => {
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
        active: s.active
      });
      setOpen(true);
    }, onDelete: () => {
      if (confirm(`Remover "${s.title}"?`)) deleteMut.mutate(s.id);
    }, onOverride: (vars) => overrideMut.mutate(vars) }, s.id)) })
  ] }) });
}
function StreamCard({
  stream,
  overrides,
  onEdit,
  onDelete,
  onOverride
}) {
  const occurrences = useMemo(() => nextOccurrences(stream, overrides, nowInBRT(), 4), [stream, overrides]);
  return /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 text-red-600 shrink-0", children: /* @__PURE__ */ jsx(Radio, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold truncate", children: stream.title }),
          !stream.active && /* @__PURE__ */ jsx("span", { className: "text-xs bg-muted px-2 py-0.5 rounded", children: "Inativa" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          stream.recurrence === "weekly" ? `Toda ${WEEKDAYS[stream.weekday ?? 0]} às ${stream.start_time.slice(0, 5)}` : `${stream.event_date ? formatDateBR(stream.event_date) : "—"} às ${stream.start_time.slice(0, 5)}`,
          " · ",
          stream.duration_minutes,
          " min"
        ] }),
        stream.default_live_url && /* @__PURE__ */ jsxs("a", { href: stream.default_live_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1", children: [
          /* @__PURE__ */ jsx(Link, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { className: "truncate max-w-[260px]", children: stream.default_live_url })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: onEdit, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: onDelete, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] })
    ] }),
    occurrences.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t pt-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2", children: "Próximas ocorrências" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: occurrences.map((o) => /* @__PURE__ */ jsx(OverrideRow, { streamId: stream.id, date: o.date, cancelled: o.cancelled, liveUrl: o.live_url, onSave: onOverride }, o.date)) })
    ] })
  ] });
}
function OverrideRow({
  streamId,
  date,
  cancelled,
  liveUrl,
  onSave
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(liveUrl ?? "");
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "font-medium min-w-[160px] capitalize", children: formatDateBR(date) }),
    cancelled ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded", children: "Cancelado" }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => onSave({
        live_stream_id: streamId,
        event_date: date,
        live_url: null,
        cancelled: false
      }), children: "Reativar" })
    ] }) : editing ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Input, { type: "url", placeholder: "https://youtube.com/live/...", value: url, onChange: (e) => setUrl(e.target.value), className: "flex-1 min-w-[200px] h-8" }),
      /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => {
        onSave({
          live_stream_id: streamId,
          event_date: date,
          live_url: url.trim() || null,
          cancelled: false
        });
        setEditing(false);
      }, children: "Salvar" }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditing(false), children: "Cancelar" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      liveUrl ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[260px]", children: [
        /* @__PURE__ */ jsx(Link, { className: "h-3 w-3" }),
        liveUrl
      ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "link padrão" }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex gap-1", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditing(true), children: liveUrl ? "Editar link" : "Link específico" }),
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onSave({
          live_stream_id: streamId,
          event_date: date,
          live_url: null,
          cancelled: true
        }), children: [
          /* @__PURE__ */ jsx(Ban, { className: "h-3 w-3 mr-1" }),
          " Cancelar"
        ] })
      ] })
    ] })
  ] });
}
export {
  LiveStreamsPage as component
};
