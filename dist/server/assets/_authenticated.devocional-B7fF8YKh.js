import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CIsAgqhg.js";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { c as createSsrRpc } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
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
import "./router-BudgN2VI.js";
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
const listDevotionals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b95adc4d43bc4011e33e97fb5fad6d2eb5d67a42768242e85e5c57544393eeb0"));
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  devotional_date: z.string(),
  verse_ref: z.string().min(1).max(120),
  verse_text: z.string().min(1).max(2e3),
  message: z.string().max(4e3).optional().nullable(),
  published: z.boolean().default(true)
});
const upsertDevotional = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("7379c03d4faec14278dfe53579562ed3fdfa1ad081c2241db06888ccb7c9df3d"));
const deleteDevotional = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("1e81932655f857b6e4134c3df07a6a26a64b9fc7f0b1134afe51bc4c00ca04a5"));
createServerFn({
  method: "GET"
}).inputValidator((i) => z.object({
  account_id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("0f8095683ab6925e7aebf2affb0583658496cfec94ccb32446e0eaf236c56a33"));
function DevocionalPage() {
  const list = useServerFn(listDevotionals);
  const upsert = useServerFn(upsertDevotional);
  const del = useServerFn(deleteDevotional);
  const qc = useQueryClient();
  const {
    data: items = []
  } = useQuery({
    queryKey: ["devotionals"],
    queryFn: () => list()
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const save = useMutation({
    mutationFn: (p) => upsert({
      data: p
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["devotionals"]
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
        queryKey: ["devotionals"]
      });
      toast.success("Removido");
    }
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-6 w-6" }),
          " Devocional Diário"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Programe versículos e reflexões diárias. O mais recente publicado aparece no Hub." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        " Novo devocional"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      items.map((d) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            (/* @__PURE__ */ new Date(d.devotional_date + "T00:00:00")).toLocaleDateString("pt-BR"),
            !d.published && " · Rascunho"
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: d.verse_ref }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm italic mt-1", children: [
            '"',
            d.verse_text,
            '"'
          ] }),
          d.message && /* @__PURE__ */ jsx("p", { className: "text-sm mt-2 whitespace-pre-wrap", children: d.message })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            setEditing(d);
            setOpen(true);
          }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => confirm("Remover?") && remove.mutate(d.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }) }, d.id)),
      items.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum devocional ainda." })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Editar devocional" : "Novo devocional" }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        save.mutate({
          id: editing?.id,
          devotional_date: f.get("devotional_date"),
          verse_ref: f.get("verse_ref"),
          verse_text: f.get("verse_text"),
          message: f.get("message") || null,
          published: f.get("published") === "on"
        });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Data*" }),
          /* @__PURE__ */ jsx(Input, { name: "devotional_date", type: "date", required: true, defaultValue: editing?.devotional_date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Referência*" }),
          /* @__PURE__ */ jsx(Input, { name: "verse_ref", required: true, defaultValue: editing?.verse_ref, placeholder: "João 3:16" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Versículo*" }),
          /* @__PURE__ */ jsx(Textarea, { name: "verse_text", required: true, rows: 3, defaultValue: editing?.verse_text })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Reflexão" }),
          /* @__PURE__ */ jsx(Textarea, { name: "message", rows: 5, defaultValue: editing?.message ?? "" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Switch, { name: "published", defaultChecked: editing ? editing.published : true }),
          " ",
          /* @__PURE__ */ jsx(Label, { children: "Publicado" })
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
  DevocionalPage as component
};
