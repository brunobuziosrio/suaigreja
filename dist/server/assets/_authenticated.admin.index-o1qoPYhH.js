import { jsx, jsxs } from "react/jsx-runtime";
import { g as getIsAdmin, l as listAllAccounts, u as updateAccountSubscription, c as adminUpdateAccountName, A as AppShell } from "./app-shell-CIsAgqhg.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BkzzJ5J4.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ShieldCheck, Users, BarChart3, Check, X, Pencil } from "lucide-react";
import { B as Button } from "./button-Bt6uLOVU.js";
import { Link } from "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
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
import "@radix-ui/react-select";
const STATUS_LABELS = {
  trial: {
    label: "Trial",
    variant: "secondary"
  },
  active: {
    label: "Ativo",
    variant: "default"
  },
  past_due: {
    label: "Em atraso",
    variant: "destructive"
  },
  canceled: {
    label: "Cancelado",
    variant: "outline"
  }
};
function AdminPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const listAccounts = useServerFn(listAllAccounts);
  const updateStatus = useServerFn(updateAccountSubscription);
  const updateName = useServerFn(adminUpdateAccountName);
  const qc = useQueryClient();
  const {
    data: adminCheck,
    isLoading: checking
  } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin()
  });
  const isAdmin = !!adminCheck?.isAdmin;
  const {
    data: accounts,
    isLoading
  } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAccounts(),
    enabled: isAdmin
  });
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!accounts) return [];
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => (a.email ?? "").toLowerCase().includes(q) || (a.brand_title ?? "").toLowerCase().includes(q) || (a.site_id ?? "").toLowerCase().includes(q));
  }, [accounts, search]);
  const mut = useMutation({
    mutationFn: (vars) => updateStatus({
      data: vars
    }),
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({
        queryKey: ["admin-accounts"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const nameMut = useMutation({
    mutationFn: (vars) => updateName({
      data: vars
    }),
    onSuccess: () => {
      toast.success("Nome atualizado");
      setEditingId(null);
      qc.invalidateQueries({
        queryKey: ["admin-accounts"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  if (checking) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "w-full text-sm text-muted-foreground", children: "Verificando permissões…" }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Área restrita" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Esta página é só para administradores da plataforma." })
    ] }) });
  }
  const stats = {
    total: accounts?.length ?? 0,
    active: accounts?.filter((a) => a.subscription_status === "active").length ?? 0,
    trial: accounts?.filter((a) => a.subscription_status === "trial").length ?? 0,
    canceled: accounts?.filter((a) => ["canceled", "past_due"].includes(a.subscription_status)).length ?? 0
  };
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-6 w-6" }),
          " Painel Admin"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Gerencie todas as contas do SaaS." })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/admin/test-data", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }),
        "Dados de Teste"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Contas", value: stats.total }),
      /* @__PURE__ */ jsx(StatCard, { label: "Ativas", value: stats.active, tone: "text-emerald-600" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Em trial", value: stats.trial, tone: "text-amber-600" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Inativas", value: stats.canceled, tone: "text-rose-600" })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsx(Input, { placeholder: "Buscar por e-mail, título da agenda ou site_id…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-md" }) }),
    /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "E-mail" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Agenda" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Perfil" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Eventos" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Trial até" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-[170px]", children: "Alterar status" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        isLoading && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center text-sm text-muted-foreground py-8", children: "Carregando…" }) }),
        !isLoading && filtered.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center text-sm text-muted-foreground py-8", children: "Nenhuma conta encontrada." }) }),
        filtered.map((a) => {
          const st = STATUS_LABELS[a.subscription_status] ?? {
            label: a.subscription_status,
            variant: "outline"
          };
          return /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs", children: a.email ?? "—" }),
            /* @__PURE__ */ jsx(TableCell, { children: editingId === a.id ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Input, { autoFocus: true, value: editingName, onChange: (e) => setEditingName(e.target.value), onKeyDown: (e) => {
                if (e.key === "Enter" && editingName.trim()) {
                  nameMut.mutate({
                    account_id: a.id,
                    brand_title: editingName.trim()
                  });
                } else if (e.key === "Escape") {
                  setEditingId(null);
                }
              }, className: "h-7 text-sm" }),
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", disabled: !editingName.trim() || nameMut.isPending, onClick: () => nameMut.mutate({
                account_id: a.id,
                brand_title: editingName.trim()
              }), children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => setEditingId(null), children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 group", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: a.brand_title }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground font-mono", children: a.site_id })
              ] }),
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6 opacity-0 group-hover:opacity-100", onClick: () => {
                setEditingId(a.id);
                setEditingName(a.brand_title ?? "");
              }, title: "Editar nome", children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" }) })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "capitalize text-sm", children: a.religion_profile }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right tabular-nums", children: a.event_count }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-muted-foreground", children: a.trial_ends_at ? new Date(a.trial_ends_at).toLocaleDateString("pt-BR") : "—" }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, { value: a.subscription_status, onValueChange: (v) => mut.mutate({
              account_id: a.id,
              subscription_status: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "trial", children: "Trial" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "active", children: "Ativo" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "past_due", children: "Em atraso" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "canceled", children: "Cancelado" })
              ] })
            ] }) })
          ] }, a.id);
        })
      ] })
    ] }) })
  ] }) });
}
function StatCard({
  label,
  value,
  tone
}) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-semibold mt-1 ${tone ?? ""}`, children: value })
  ] });
}
export {
  AdminPage as component
};
