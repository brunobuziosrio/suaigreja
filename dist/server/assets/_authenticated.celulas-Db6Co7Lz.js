import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { Users2, Plus, Pencil, Trash2, Clock, MapPin } from "lucide-react";
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
const listSmallGroups = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8109db9f4bd82d3b6c7de381f60de5439c66721eabc0e77d9e6069e2fda9a150"));
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  leader_name: z.string().max(120).optional().nullable(),
  leader_phone: z.string().max(40).optional().nullable(),
  weekday: z.number().int().min(0).max(6).optional().nullable(),
  start_time: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  neighborhood: z.string().max(120).optional().nullable(),
  description: z.string().max(2e3).optional().nullable(),
  capacity: z.number().int().min(0).max(9999).optional().nullable(),
  active: z.boolean().default(true)
});
const upsertSmallGroup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("8f918e9fafc40762cd9ceb133e59d2f827199bcd9170396a299a3081c6582126"));
const deleteSmallGroup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("f854b6e02559ffb903cab6dfb7f8a578b3a56dfb53eb0495e3d4c06d0afd0a63"));
const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
function CelulasPage() {
  const list = useServerFn(listSmallGroups);
  const upsert = useServerFn(upsertSmallGroup);
  const del = useServerFn(deleteSmallGroup);
  const qc = useQueryClient();
  const {
    data: groups = [],
    isLoading
  } = useQuery({
    queryKey: ["small_groups"],
    queryFn: () => list()
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const save = useMutation({
    mutationFn: (payload) => upsert({
      data: payload
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["small_groups"]
      });
      setOpen(false);
      toast.success("Salvo");
    },
    onError: (e) => toast.error(e.message)
  });
  const remove = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["small_groups"]
      });
      toast.success("Removido");
    }
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users2, { className: "h-6 w-6" }),
          " Pequenos Grupos / Células"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre células com líder, dia, horário e endereço." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        " Nova célula"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" }) : /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
      groups.map((g) => /* @__PURE__ */ jsxs(Card, { className: "p-4 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: g.name }),
            g.leader_name && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Líder: ",
              g.leader_name
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              setEditing(g);
              setOpen(true);
            }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => confirm("Remover?") && remove.mutate(g.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }),
        g.weekday != null && /* @__PURE__ */ jsxs("p", { className: "text-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
          " ",
          WEEKDAYS[g.weekday],
          " ",
          g.start_time?.slice(0, 5)
        ] }),
        g.address && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground flex items-start gap-1", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 mt-0.5" }),
          " ",
          g.address,
          g.neighborhood ? ` — ${g.neighborhood}` : ""
        ] }),
        !g.active && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Inativa" })
      ] }, g.id)),
      groups.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground col-span-full", children: "Nenhuma célula cadastrada ainda." })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Editar célula" : "Nova célula" }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const wd = f.get("weekday");
        save.mutate({
          id: editing?.id,
          name: f.get("name"),
          leader_name: f.get("leader_name") || null,
          leader_phone: f.get("leader_phone") || null,
          weekday: wd ? Number(wd) : null,
          start_time: f.get("start_time") || null,
          address: f.get("address") || null,
          neighborhood: f.get("neighborhood") || null,
          description: f.get("description") || null,
          capacity: f.get("capacity") ? Number(f.get("capacity")) : null,
          active: f.get("active") === "on"
        });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Nome*" }),
          /* @__PURE__ */ jsx(Input, { name: "name", required: true, defaultValue: editing?.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Líder" }),
            /* @__PURE__ */ jsx(Input, { name: "leader_name", defaultValue: editing?.leader_name ?? "" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "WhatsApp do líder" }),
            /* @__PURE__ */ jsx(Input, { name: "leader_phone", defaultValue: editing?.leader_phone ?? "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Dia da semana" }),
            /* @__PURE__ */ jsxs("select", { name: "weekday", defaultValue: editing?.weekday ?? "", className: "w-full h-10 px-3 rounded-md border bg-background", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "—" }),
              WEEKDAYS.map((d, i) => /* @__PURE__ */ jsx("option", { value: i, children: d }, i))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Horário" }),
            /* @__PURE__ */ jsx(Input, { name: "start_time", type: "time", defaultValue: editing?.start_time?.slice(0, 5) ?? "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Endereço" }),
          /* @__PURE__ */ jsx(Input, { name: "address", defaultValue: editing?.address ?? "" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Bairro" }),
            /* @__PURE__ */ jsx(Input, { name: "neighborhood", defaultValue: editing?.neighborhood ?? "" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Capacidade" }),
            /* @__PURE__ */ jsx(Input, { name: "capacity", type: "number", min: "0", defaultValue: editing?.capacity ?? "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Descrição" }),
          /* @__PURE__ */ jsx(Textarea, { name: "description", rows: 3, defaultValue: editing?.description ?? "" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Switch, { name: "active", defaultChecked: editing ? editing.active : true }),
          " ",
          /* @__PURE__ */ jsx(Label, { children: "Ativa" })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: save.isPending, children: "Salvar" })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  CelulasPage as component
};
