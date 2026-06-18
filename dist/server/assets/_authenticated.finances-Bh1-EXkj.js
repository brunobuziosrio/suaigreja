import { jsx, jsxs } from "react/jsx-runtime";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BkzzJ5J4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { useQuery } from "@tanstack/react-query";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { useState, useMemo } from "react";
import { DollarSign, Calendar, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { I as Input } from "./input-DAQqOwjK.js";
import "./client.server-D5ro3rAQ.js";
import "@supabase/supabase-js";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./button-Bt6uLOVU.js";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./useServerFn-DL2oePlL.js";
import "./router-DXfKo2Q8.js";
import "sonner";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-select";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fbb6aec214bfb13393d699e05a4618af3adb13eaf54267bc2306cad764023ec6"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("bdf06463391e0f38ffb2f7cbe5a89e8154db435190f58dbc561b9d635966daad"));
function FinancesPage() {
  const getDonationsData = createServerFn({
    method: "GET"
  }).middleware([requireSupabaseAuth]).handler(async ({
    context
  }) => {
    const {
      data,
      error
    } = await supabase.from("donations").select("*").eq("account_id", context.userId).order("created_at", {
      ascending: false
    });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
  const {
    data: donations,
    isLoading
  } = useQuery({
    queryKey: ["donations"],
    queryFn: () => getDonationsData()
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchDonor, setSearchDonor] = useState("");
  const filtered = useMemo(() => {
    if (!donations) return [];
    return donations.filter((d) => {
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const matchSearch = !searchDonor || (d.donor_name ?? "").toLowerCase().includes(searchDonor.toLowerCase()) || (d.donor_email ?? "").toLowerCase().includes(searchDonor.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [donations, statusFilter, searchDonor]);
  const stats = useMemo(() => {
    if (!donations) return {
      total: 0,
      paid: 0,
      pending: 0,
      failed: 0,
      totalValue: 0,
      paidValue: 0
    };
    const stats2 = {
      total: donations.length,
      paid: donations.filter((d) => d.status === "paid").length,
      pending: donations.filter((d) => d.status === "pending").length,
      failed: donations.filter((d) => d.status === "failed").length,
      totalValue: donations.reduce((acc, d) => acc + d.amount_cents, 0) / 100,
      paidValue: donations.filter((d) => d.status === "paid").reduce((acc, d) => acc + d.amount_cents, 0) / 100
    };
    return stats2;
  }, [donations]);
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-800", children: "Pago" });
      case "pending":
        return /* @__PURE__ */ jsx(Badge, { className: "bg-amber-100 text-amber-800", children: "Pendente" });
      case "failed":
        return /* @__PURE__ */ jsx(Badge, { className: "bg-red-100 text-red-800", children: "Falhou" });
      default:
        return /* @__PURE__ */ jsx(Badge, { children: status });
    }
  };
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(cents);
  };
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(DollarSign, { className: "h-6 w-6" }),
        " Finanças e Doações"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Acompanhe todas as doações e contribuições da sua congregação." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Total de Doações" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1", children: stats.total })
        ] }),
        /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-stone-light" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Doações Pagas" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1 text-green-600", children: stats.paid })
        ] }),
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-500" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Valor Total Pago" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1 text-green-600", children: formatCurrency(stats.paidValue) })
        ] }),
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-green-500" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Pendentes" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1 text-amber-600", children: stats.pending })
        ] }),
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-amber-500" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsx(Input, { placeholder: "Buscar por nome ou e-mail do doador…", value: searchDonor, onChange: (e) => setSearchDonor(e.target.value), className: "flex-1" }),
      /* @__PURE__ */ jsxs(Select, { value: statusFilter, onValueChange: (v) => setStatusFilter(v), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full sm:w-48", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Todos os Status" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "paid", children: "Pago" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: "Pendente" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "failed", children: "Falhou" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Doador" }),
        /* @__PURE__ */ jsx(TableHead, { children: "E-mail" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Telefone" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Valor" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Data" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        isLoading && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-sm text-muted-foreground py-8", children: "Carregando…" }) }),
        !isLoading && filtered.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-sm text-muted-foreground py-8", children: "Nenhuma doação encontrada." }) }),
        filtered.map((donation) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: donation.donor_name || "Anônimo" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: donation.donor_email || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: donation.donor_phone || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(donation.amount_cents) }),
          /* @__PURE__ */ jsx(TableCell, { children: getStatusBadge(donation.status) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm text-muted-foreground", children: new Date(donation.created_at).toLocaleDateString("pt-BR") })
        ] }, donation.id))
      ] })
    ] }) }),
    filtered.length > 0 && /* @__PURE__ */ jsx(Card, { className: "p-4 bg-surface-sunken", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mostrando" }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
          filtered.length,
          " de ",
          stats.total
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Exibido" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatCurrency(filtered.reduce((acc, d) => acc + d.amount_cents, 0)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Valor Médio" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: filtered.length > 0 ? formatCurrency(filtered.reduce((acc, d) => acc + d.amount_cents, 0) / filtered.length) : formatCurrency(0) })
      ] })
    ] }) })
  ] }) });
}
export {
  FinancesPage as component
};
