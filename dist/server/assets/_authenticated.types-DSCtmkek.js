import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CIsAgqhg.js";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { l as listTypes, u as upsertType, d as deleteType } from "./types.functions-D5fSaaTD.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { Plus, Loader2, ListChecks, Pencil, Trash2 } from "lucide-react";
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
import "./admin-payment-settings.functions-Buvk9CeQ.js";
import "./server-Bu1wP-pG.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-_63E0ssP.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./router-BudgN2VI.js";
import "./client-DVtn2Z4s.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
const empty = {
  name: "",
  active: true,
  color: "#467da5",
  icon: ""
};
const EMOJI_PRESETS = ["⛪", "🙏", "🕊️", "🎉", "💒", "👶", "✝️", "📖", "🎵", "🤝", "🌿", "🕯️"];
function TypesPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listTypes);
  const save = useServerFn(upsertType);
  const remove = useServerFn(deleteType);
  const {
    data: items = [],
    isLoading
  } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchList()
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const upsertMut = useMutation({
    mutationFn: (input) => save({
      data: {
        id: input.id,
        name: input.name.trim(),
        active: input.active,
        color: input.color,
        icon: input.icon.trim()
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["types"]
      });
      toast.success("Tipo salvo");
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
        queryKey: ["types"]
      });
      toast.success("Tipo removido");
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Tipos de celebração" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Defina os tipos que aparecem ao criar um evento." })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (!o) setForm(empty);
      }, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Novo tipo"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar tipo" : "Novo tipo" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Nome" }),
              /* @__PURE__ */ jsx(Input, { id: "name", value: form.name, onChange: (e) => setForm({
                ...form,
                name: e.target.value
              }), placeholder: "Ex: Missa, Culto, Vigília..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Ícone (emoji)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Input, { value: form.icon, onChange: (e) => setForm({
                  ...form,
                  icon: e.target.value.slice(0, 4)
                }), placeholder: "Ex: ⛪", className: "w-20 text-center text-lg", maxLength: 4 }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: EMOJI_PRESETS.map((emj) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setForm({
                  ...form,
                  icon: emj
                }), className: "text-lg w-8 h-8 rounded border hover:border-primary", children: emj }, emj)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "color", children: "Cor" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("input", { id: "color", type: "color", value: form.color, onChange: (e) => setForm({
                  ...form,
                  color: e.target.value
                }), className: "h-9 w-12 rounded border cursor-pointer" }),
                /* @__PURE__ */ jsx(Input, { value: form.color, onChange: (e) => setForm({
                  ...form,
                  color: e.target.value
                }), className: "w-28 font-mono text-sm" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "active", children: "Ativo" }),
              /* @__PURE__ */ jsx(Switch, { id: "active", checked: form.active, onCheckedChange: (v) => setForm({
                ...form,
                active: v
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxs(Button, { disabled: !form.name.trim() || upsertMut.isPending, onClick: () => upsertMut.mutate(form), children: [
              upsertMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
              "Salvar"
            ] })
          ] })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : items.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(ListChecks, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Nenhum tipo cadastrado" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: items.map((t) => /* @__PURE__ */ jsxs(Card, { className: "p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center w-8 h-8 rounded-md text-base shrink-0", style: {
          backgroundColor: `${t.color}22`,
          color: t.color
        }, children: t.icon || "•" }),
        /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: t.name }),
        !t.active && /* @__PURE__ */ jsx("span", { className: "text-xs bg-muted px-2 py-0.5 rounded", children: "Inativo" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          setForm({
            id: t.id,
            name: t.name,
            active: t.active,
            color: t.color ?? "#467da5",
            icon: t.icon ?? ""
          });
          setOpen(true);
        }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          if (confirm(`Remover "${t.name}"?`)) deleteMut.mutate(t.id);
        }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] })
    ] }, t.id)) })
  ] }) });
}
export {
  TypesPage as component
};
