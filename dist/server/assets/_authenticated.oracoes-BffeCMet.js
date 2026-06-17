import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CIsAgqhg.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { w as listPrayerRequests, x as updatePrayerStatus, y as deletePrayerRequest } from "./router-BudgN2VI.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { HandHeart, Check, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./input-DAQqOwjK.js";
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
import "./client-DVtn2Z4s.js";
import "@radix-ui/react-collapsible";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-tabs";
function PrayersPage() {
  const list = useServerFn(listPrayerRequests);
  const upd = useServerFn(updatePrayerStatus);
  const del = useServerFn(deletePrayerRequest);
  const qc = useQueryClient();
  const {
    data: all = [],
    isLoading
  } = useQuery({
    queryKey: ["prayers"],
    queryFn: () => list()
  });
  const [tab, setTab] = useState("pending");
  const updMut = useMutation({
    mutationFn: (v) => upd({
      data: v
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["prayers"]
    }),
    onError: (e) => toast.error(e.message)
  });
  const delMut = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({
        queryKey: ["prayers"]
      });
    }
  });
  const filtered = all.filter((p) => p.status === tab);
  const counts = {
    pending: all.filter((p) => p.status === "pending").length,
    approved: all.filter((p) => p.status === "approved").length,
    archived: all.filter((p) => p.status === "archived").length
  };
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(HandHeart, { className: "h-6 w-6" }),
        " Pedidos de Oração"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Receba pedidos da sua comunidade. Aprove para exibir no mural público da sua igreja." })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "pending", children: [
          "Pendentes (",
          counts.pending,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "approved", children: [
          "Aprovados (",
          counts.approved,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "archived", children: [
          "Arquivados (",
          counts.archived,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: tab, className: "mt-4 space-y-3", children: [
        isLoading && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }),
        !isLoading && filtered.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-8 text-center text-sm text-muted-foreground", children: "Nenhum pedido nesta caixa." }),
        filtered.map((p) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: p.is_anonymous ? "Anônimo" : p.name }),
              p.is_anonymous && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "anônimo" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(p.created_at).toLocaleString("pt-BR") }),
              p.status === "approved" && /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
                "🙏 ",
                p.prayer_count
              ] })
            ] }),
            !p.is_anonymous && (p.email || p.phone) && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
              p.email,
              " ",
              p.phone && `· ${p.phone}`
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm whitespace-pre-wrap", children: p.message })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 shrink-0", children: [
            p.status !== "approved" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => updMut.mutate({
              id: p.id,
              status: "approved"
            }), children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mr-1" }),
              " Aprovar"
            ] }),
            p.status !== "archived" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => updMut.mutate({
              id: p.id,
              status: "archived"
            }), children: [
              /* @__PURE__ */ jsx(Archive, { className: "h-3.5 w-3.5 mr-1" }),
              " Arquivar"
            ] }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => confirm("Excluir definitivamente?") && delMut.mutate(p.id), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
              " Excluir"
            ] })
          ] })
        ] }) }, p.id))
      ] })
    ] })
  ] }) });
}
export {
  PrayersPage as component
};
