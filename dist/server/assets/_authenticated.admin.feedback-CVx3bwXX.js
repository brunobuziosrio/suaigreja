import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { g as getIsAdmin, A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { l as listSystemUpdates, a as listAllSuggestions, b as createSystemUpdate, d as deleteSystemUpdate, e as deleteSuggestion } from "./feedback.functions-CBDL2JzI.js";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, ShieldCheck, Megaphone, Trash2, Lightbulb } from "lucide-react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
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
function AdminFeedbackPage() {
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const {
    data: adminCheck,
    isLoading: checking
  } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin()
  });
  const isAdmin = !!adminCheck?.isAdmin;
  const fetchUpdates = useServerFn(listSystemUpdates);
  const fetchSuggestions = useServerFn(listAllSuggestions);
  const addUpdate = useServerFn(createSystemUpdate);
  const removeUpdate = useServerFn(deleteSystemUpdate);
  const removeSuggestion = useServerFn(deleteSuggestion);
  const {
    data: updates = []
  } = useQuery({
    queryKey: ["system-updates"],
    queryFn: () => fetchUpdates(),
    enabled: isAdmin
  });
  const {
    data: suggestions = []
  } = useQuery({
    queryKey: ["all-suggestions"],
    queryFn: () => fetchSuggestions(),
    enabled: isAdmin
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const addMut = useMutation({
    mutationFn: () => addUpdate({
      data: {
        title: title.trim(),
        content: content.trim(),
        version: version.trim() || null
      }
    }),
    onSuccess: () => {
      toast.success("Atualização publicada");
      setTitle("");
      setContent("");
      setVersion("");
      qc.invalidateQueries({
        queryKey: ["system-updates"]
      });
    },
    onError: (e) => toast.error(e?.message || "Erro")
  });
  const delUpdateMut = useMutation({
    mutationFn: (id) => removeUpdate({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["system-updates"]
    })
  });
  const delSugMut = useMutation({
    mutationFn: (id) => removeSuggestion({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["all-suggestions"]
    })
  });
  if (checking) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(Card, { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "h-10 w-10 mx-auto text-muted-foreground mb-2" }),
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Acesso restrito a administradores." })
    ] }) });
  }
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Atualizações & Sugestões" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Publique novidades para todos os assinantes e veja as sugestões recebidas." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(Megaphone, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Publicar atualização" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsx(Input, { className: "col-span-2", placeholder: "Título da atualização", value: title, onChange: (e) => setTitle(e.target.value), maxLength: 160 }),
            /* @__PURE__ */ jsx(Input, { placeholder: "Versão (opcional)", value: version, onChange: (e) => setVersion(e.target.value), maxLength: 40 })
          ] }),
          /* @__PURE__ */ jsx(Textarea, { placeholder: "O que mudou nesta atualização?", rows: 4, value: content, onChange: (e) => setContent(e.target.value), maxLength: 4e3 }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => addMut.mutate(), disabled: addMut.isPending || !title.trim() || !content.trim(), children: [
            addMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1.5" }),
            "Publicar"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 border-t pt-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-2", children: "Publicadas" }),
          updates.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma atualização publicada ainda." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2 max-h-96 overflow-auto pr-1", children: updates.map((u) => /* @__PURE__ */ jsxs("li", { className: "border rounded p-2 flex items-start gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: u.title }),
                u.version && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono uppercase rounded bg-primary/10 text-primary px-1.5 py-0.5", children: [
                  "v",
                  u.version
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground whitespace-pre-line mt-0.5", children: u.content }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: new Date(u.created_at).toLocaleString("pt-BR") })
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              if (confirm("Remover esta atualização?")) delUpdateMut.mutate(u.id);
            }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }, u.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5 text-amber-500" }),
          /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Sugestões dos clientes" })
        ] }),
        suggestions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma sugestão recebida ainda." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2 max-h-[600px] overflow-auto pr-1", children: suggestions.map((s) => /* @__PURE__ */ jsxs("li", { className: "border rounded p-3 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: s.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground whitespace-pre-line mt-1", children: s.message }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground mt-2", children: [
              s.account_name || s.email || "—",
              " ·",
              " ",
              new Date(s.created_at).toLocaleString("pt-BR")
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            if (confirm("Remover sugestão?")) delSugMut.mutate(s.id);
          }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] }, s.id)) })
      ] })
    ] })
  ] }) });
}
export {
  AdminFeedbackPage as component
};
