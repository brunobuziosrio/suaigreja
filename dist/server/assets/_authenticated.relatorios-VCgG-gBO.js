import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-Bh1G_xJT.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BkzzJ5J4.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { GraduationCap, Calendar, Users2, HandCoins, TrendingUp, Download } from "lucide-react";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { N as getDonationsMonthlyReport } from "./router-DXfKo2Q8.js";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-tabs";
import "@radix-ui/react-label";
import "./client.server-D5ro3rAQ.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "sonner";
import "./billing-plans-Ce8xzhRW.js";
const monthSchema = z.object({
  year: z.number().int().min(2e3).max(2100),
  month: z.number().int().min(1).max(12)
});
const getEbdMonthly = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => monthSchema.parse(i)).handler(createSsrRpc("d772e93ca7d8f9707bd37334870d8ee30e8998d906edb62529e2ef277e9b16e5"));
const getCheckinMonthly = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => monthSchema.parse(i)).handler(createSsrRpc("5ce55c471ba0a4d7322b30677fa19e82a84bf896ad51956914006552444644c1"));
const getSmallGroupsReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("60f7e8c23d47adace97bc8dcd3759ef7054d057d8b8088d100438fe8e78143c8"));
function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((v) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function ReportsPage() {
  const now = /* @__PURE__ */ new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Relatórios" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Presença, frequência e ranking de células — com exportação CSV." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Mês" }),
          /* @__PURE__ */ jsx("select", { className: "block h-9 rounded-md border bg-background px-2 text-sm", value: month, onChange: (e) => setMonth(Number(e.target.value)), children: Array.from({
            length: 12
          }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsx("option", { value: m, children: new Date(2e3, m - 1, 1).toLocaleDateString("pt-BR", {
            month: "long"
          }) }, m)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Ano" }),
          /* @__PURE__ */ jsx(Input, { type: "number", className: "h-9 w-24", value: year, onChange: (e) => setYear(Number(e.target.value) || now.getFullYear()) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "ebd", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "ebd", children: [
          /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4 mr-1" }),
          "EBD"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "cultos", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 mr-1" }),
          "Cultos"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "celulas", children: [
          /* @__PURE__ */ jsx(Users2, { className: "h-4 w-4 mr-1" }),
          "Células"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "doacoes", children: [
          /* @__PURE__ */ jsx(HandCoins, { className: "h-4 w-4 mr-1" }),
          "Doações"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "ebd", className: "mt-4", children: /* @__PURE__ */ jsx(EbdReport, { year, month }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "cultos", className: "mt-4", children: /* @__PURE__ */ jsx(CheckinReport, { year, month }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "celulas", className: "mt-4", children: /* @__PURE__ */ jsx(SmallGroupsReport, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "doacoes", className: "mt-4", children: /* @__PURE__ */ jsx(DonationsReport, { year }) })
    ] })
  ] }) });
}
function EbdReport({
  year,
  month
}) {
  const fn = useServerFn(getEbdMonthly);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["ebd-monthly", year, month],
    queryFn: () => fn({
      data: {
        year,
        month
      }
    })
  });
  if (isLoading) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" });
  if (!data || data.classes.length === 0) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sem registros de frequência neste mês." });
  const totalPresent = data.classes.reduce((s, c) => s + c.present, 0);
  const totalRecs = data.classes.reduce((s, c) => s + c.total, 0);
  const overallRate = totalRecs ? Math.round(totalPresent / totalRecs * 100) : 0;
  const exportCsv = () => {
    const rows = [["Turma", "Aluno", "Presenças", "Total chamadas", "Frequência %"]];
    for (const c of data.classes) {
      for (const m of c.members) {
        rows.push([c.class_name, m.name, m.present, m.total, m.rate]);
      }
    }
    downloadCsv(`ebd-${year}-${String(month).padStart(2, "0")}.csv`, rows);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsx(KpiCard, { label: "Turmas com registros", value: data.classes.length }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Chamadas no mês", value: totalRecs }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Frequência geral", value: `${overallRate}%`, icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: exportCsv, children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
      "Exportar CSV"
    ] }) }),
    data.classes.map((c) => /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: c.class_name }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
            c.meetings,
            " encontros"
          ] }),
          /* @__PURE__ */ jsxs(Badge, { children: [
            c.rate,
            "% frequência"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Aluno" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Presenças" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Total" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Frequência" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: c.members.map((m) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: m.name }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: m.present }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: m.total }),
          /* @__PURE__ */ jsxs(TableCell, { className: "text-right font-semibold", children: [
            m.rate,
            "%"
          ] })
        ] }, m.member_id)) })
      ] }) })
    ] }, c.class_id))
  ] });
}
function CheckinReport({
  year,
  month
}) {
  const fn = useServerFn(getCheckinMonthly);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["checkin-monthly", year, month],
    queryFn: () => fn({
      data: {
        year,
        month
      }
    })
  });
  if (isLoading) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" });
  if (!data || data.sessions.length === 0) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sem sessões de check-in neste mês." });
  const exportCsv = () => {
    const rows = [["Data", "Culto", "Membros", "Visitantes", "Total"]];
    for (const s of data.sessions) {
      rows.push([s.session_date, s.title, s.members, s.visitors, s.total]);
    }
    downloadCsv(`cultos-${year}-${String(month).padStart(2, "0")}.csv`, rows);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(KpiCard, { label: "Sessões", value: data.totals.sessions }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Check-ins", value: data.totals.total }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Membros", value: data.totals.members }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Visitantes", value: data.totals.visitors })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: exportCsv, children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
      "Exportar CSV"
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Data" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Culto" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Membros" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Visitantes" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Total" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: data.sessions.map((s) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: (/* @__PURE__ */ new Date(s.session_date + "T00:00")).toLocaleDateString("pt-BR") }),
        /* @__PURE__ */ jsx(TableCell, { children: s.title }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: s.members }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: s.visitors }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right font-semibold", children: s.total })
      ] }, s.id)) })
    ] }) }) })
  ] });
}
function SmallGroupsReport() {
  const fn = useServerFn(getSmallGroupsReport);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["sg-report"],
    queryFn: () => fn()
  });
  if (isLoading) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" });
  if (!data || data.groups.length === 0) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma célula cadastrada." });
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const exportCsv = () => {
    const rows = [["Célula", "Líder", "Telefone", "Bairro", "Dia", "Horário", "Membros", "Capacidade", "Ocupação %"]];
    for (const g of data.groups) {
      rows.push([g.name, g.leader_name ?? "", g.leader_phone ?? "", g.neighborhood ?? "", g.weekday != null ? weekdays[g.weekday] : "", g.start_time ?? "", g.members, g.capacity ?? "", g.occupancy ?? ""]);
    }
    downloadCsv("celulas-ranking.csv", rows);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsx(KpiCard, { label: "Células", value: data.totals.groups }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Ativas", value: data.totals.active }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Membros vinculados", value: data.totals.members })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: exportCsv, children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
      "Exportar CSV"
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Ranking de células" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "#" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Célula" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Líder" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Bairro" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Encontro" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Membros" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Ocupação" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: data.groups.map((g, i) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: i + 1 }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            g.name,
            !g.active && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "ml-2", children: "inativa" })
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: g.leader_name ?? "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: g.neighborhood ?? "—" }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            g.weekday != null ? weekdays[g.weekday] : "—",
            g.start_time ? ` ${g.start_time.slice(0, 5)}` : ""
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right font-semibold", children: g.members }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: g.occupancy != null ? `${g.occupancy}%` : "—" })
        ] }, g.id)) })
      ] }) })
    ] })
  ] });
}
function fmtBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
const MONTH_NAMES = Array.from({
  length: 12
}, (_, i) => new Date(2e3, i, 1).toLocaleDateString("pt-BR", {
  month: "long"
}));
function DonationsReport({
  year
}) {
  const fn = useServerFn(getDonationsMonthlyReport);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["donations-monthly", year],
    queryFn: () => fn({
      data: {
        year
      }
    })
  });
  if (isLoading) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" });
  if (!data || data.rows.length === 0) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma doação confirmada neste ano." });
  const totalCents = data.monthly.reduce((s, m) => s + m.totalCents, 0);
  const totalCount = data.monthly.reduce((s, m) => s + m.count, 0);
  const exportCsv = () => {
    const rows = [["Mês", "Quantidade de doações", "Total arrecadado"]];
    for (const m of data.monthly) {
      rows.push([MONTH_NAMES[m.month - 1], m.count, fmtBRL(m.totalCents)]);
    }
    downloadCsv(`doacoes-${year}.csv`, rows);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsx(KpiCard, { label: "Doações pagas no ano", value: totalCount }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Total arrecadado", value: fmtBRL(totalCents), icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Ticket médio", value: totalCount ? fmtBRL(Math.round(totalCents / totalCount)) : fmtBRL(0) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: exportCsv, children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
      "Exportar CSV"
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Por mês" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Mês" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Doações" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: data.monthly.map((m) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "capitalize", children: MONTH_NAMES[m.month - 1] }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: m.count }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right font-semibold", children: fmtBRL(m.totalCents) })
        ] }, m.month)) })
      ] }) })
    ] })
  ] });
}
function KpiCard({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: value })
  ] }) });
}
export {
  ReportsPage as component
};
