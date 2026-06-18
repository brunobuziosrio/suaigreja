import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { g as getIsAdmin, l as listAllAccounts, d as generateTestData, e as deleteTestData, f as countTestData, A as AppShell } from "./app-shell-C3FK62C1.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import * as React from "react";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { c as cn } from "./utils-H80jjgLf.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { toast } from "sonner";
import { AlertCircle, BarChart3, AlertTriangle, Users, Plus, Calendar, Gift, BookOpen, Loader2, Trash2 } from "lucide-react";
import "@radix-ui/react-slot";
import "./input-DAQqOwjK.js";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./admin-payment-settings.functions-DESQQOGp.js";
import "./server-D1UATaaE.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DAGjxCX9.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./router-DXfKo2Q8.js";
import "./client-DVtn2Z4s.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "clsx";
import "tailwind-merge";
const alertVariants = cva(
  "relative w-full rounded-lg border-l-4 px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "border-sand bg-amber-50 text-[#6B4A25] [&>svg]:text-sand",
        success: "border-forest bg-green-50 text-forest [&>svg]:text-forest",
        warning: "border-[#CA8A04] bg-yellow-50 text-[#CA8A04] [&>svg]:text-[#CA8A04]",
        error: "border-[#DC2626] bg-red-50 text-[#DC2626] [&>svg]:text-[#DC2626]",
        info: "border-ocean bg-cyan-50 text-ocean [&>svg]:text-ocean"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, role: "alert", className: cn(alertVariants({ variant }), className), ...props }));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "h5",
    {
      ref,
      className: cn("mb-1 font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("text-sm [&_p]:leading-relaxed", className), ...props }));
AlertDescription.displayName = "AlertDescription";
function TestDataPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const listAccounts = useServerFn(listAllAccounts);
  const genTestData = useServerFn(generateTestData);
  const delTestData = useServerFn(deleteTestData);
  const countTest = useServerFn(countTestData);
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
    data: accounts
  } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAccounts(),
    enabled: isAdmin
  });
  const {
    data: testDataCounts
  } = useQuery({
    queryKey: ["test-data-count"],
    queryFn: () => countTest(),
    refetchInterval: 5e3
  });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const genMut = useMutation({
    mutationFn: (accountId) => genTestData({
      data: {
        account_id: accountId
      }
    }),
    onSuccess: (result) => {
      toast.success(`${result.created.members} membros, ${result.created.donations} doações e ${result.created.events} eventos criados!`);
      qc.invalidateQueries({
        queryKey: ["test-data-count"]
      });
    },
    onError: (e) => toast.error("Erro: " + e.message)
  });
  const delMut = useMutation({
    mutationFn: (accountId) => delTestData({
      data: {
        account_id: accountId
      }
    }),
    onSuccess: (result) => {
      toast.success(`${result.total} registros de teste deletados!`);
      qc.invalidateQueries({
        queryKey: ["test-data-count"]
      });
      setSelectedAccount(null);
    },
    onError: (e) => toast.error("Erro: " + e.message)
  });
  if (checking) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "w-full text-sm text-muted-foreground", children: "Verificando permissões…" }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Área restrita" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Esta página é só para administradores da plataforma." })
    ] }) });
  }
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BarChart3, { className: "h-6 w-6" }),
        " Gerenciar Dados de Teste"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Gere dados de teste completos para testar painéis, relatórios e funcionalidades." })
    ] }),
    /* @__PURE__ */ jsxs(Alert, { className: "border-amber-200 bg-amber-50", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-amber-700" }),
      /* @__PURE__ */ jsxs(AlertDescription, { className: "text-amber-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Importante:" }),
        ' Todos os dados gerados aqui são marcados como "dados de teste" e podem ser deletados em lote. Use esta ferramenta apenas em ambientes de desenvolvimento.'
      ] })
    ] }),
    testDataCounts && testDataCounts.total > 0 && /* @__PURE__ */ jsx(Card, { className: "p-4 bg-blue-50 border-blue-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-blue-600 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-900", children: "Dados de Teste Detectados" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700 mt-1", children: [
          "Você tem ",
          /* @__PURE__ */ jsx("strong", { children: testDataCounts.total }),
          " registros de teste na sua conta:"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-700 mt-2 space-y-1", children: [
          testDataCounts.counts.members > 0 && /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            testDataCounts.counts.members,
            " membros"
          ] }),
          testDataCounts.counts.donations > 0 && /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            testDataCounts.counts.donations,
            " doações"
          ] }),
          testDataCounts.counts.events > 0 && /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            testDataCounts.counts.events,
            " eventos"
          ] }),
          testDataCounts.counts.ebd_classes > 0 && /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            testDataCounts.counts.ebd_classes,
            " classes de EBD"
          ] }),
          testDataCounts.counts.ebd_enrollments > 0 && /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            testDataCounts.counts.ebd_enrollments,
            " inscrições"
          ] }),
          testDataCounts.counts.ebd_attendance > 0 && /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            testDataCounts.counts.ebd_attendance,
            " registros de frequência"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Selecione uma Conta" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: accounts && accounts.length > 0 ? accounts.map((account) => /* @__PURE__ */ jsx("div", { className: `p-4 border rounded-lg cursor-pointer transition ${selectedAccount === account.id ? "border-blue-500 bg-blue-50" : "border-outline hover:border-outline-strong"}`, onClick: () => setSelectedAccount(account.id), children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: account.brand_title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: account.email }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: account.site_id })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: account.subscription_status === "active" ? "default" : "secondary", children: account.subscription_status })
      ] }) }, account.id)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma conta disponível." }) })
    ] }),
    selectedAccount && /* @__PURE__ */ jsxs(Card, { className: "p-6 border-2 border-blue-200 bg-blue-50", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5 text-green-600" }),
        "Gerar Dados de Teste"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-secondary mb-4", children: "Isso criará dados de teste robustos incluindo:" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-ink-secondary space-y-2 mb-6", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
          " 30 membros com diferentes roles (membros, visitantes, líderes, pastores)"
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
          " 30 eventos (cultos, EBD, células, transmissões, devocionais)"
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Gift, { className: "h-4 w-4" }),
          " 30 doações com valores variados"
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }),
          " 5 classes de EBD com inscrições e frequência"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => genMut.mutate(selectedAccount), disabled: genMut.isPending, className: "w-full bg-forest hover:bg-forest-hover text-white", children: genMut.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Gerando dados…"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Gerar Dados de Teste"
      ] }) })
    ] }),
    selectedAccount && testDataCounts && testDataCounts.total > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-6 border-2 border-red-200 bg-red-50", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5 text-red-600" }),
        "Limpar Todos os Dados de Teste"
      ] }),
      /* @__PURE__ */ jsxs(Alert, { className: "mb-4 border-coral-soft bg-surface-elevated", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }),
        /* @__PURE__ */ jsxs(AlertDescription, { className: "text-red-700", children: [
          /* @__PURE__ */ jsx("strong", { children: "Atenção:" }),
          " Esta ação vai deletar permanentemente todos os ",
          testDataCounts.total,
          " registros de teste da sua conta. Esta ação ",
          /* @__PURE__ */ jsx("strong", { children: "não pode ser desfeita" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        if (window.confirm("Tem certeza? Vai deletar todos os dados de teste. Esta ação não pode ser desfeita.")) {
          delMut.mutate(selectedAccount);
        }
      }, disabled: delMut.isPending, variant: "destructive", className: "w-full", children: delMut.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Deletando…"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
        "Deletar Todos os Dados de Teste (",
        testDataCounts.total,
        " registros)"
      ] }) })
    ] })
  ] }) });
}
export {
  TestDataPage as component
};
