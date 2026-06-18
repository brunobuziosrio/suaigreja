import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import "./client.server-D5ro3rAQ.js";
import { z } from "zod";
import { B as BILLING_PLANS, f as formatCentsBRL } from "./billing-plans-Ce8xzhRW.js";
import { WalletCards, Loader2, Check, QrCode, Copy } from "lucide-react";
import { toast } from "sonner";
import "react";
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
import "@radix-ui/react-collapsible";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const listMyPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6eb89a05f6dfdb2f8c66b594f0bc454393b14a13f25b944d3756770af6bca129"));
const getBillingSetup = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a5483ba61a40e70deefe5cd39c28f5e1619a298c48ae355e7f277f4873f56aa6"));
const createPixPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  plan: z.enum(["monthly", "annual"])
}).parse(input)).handler(createSsrRpc("f8dd72aee13ccb48d3bbce5334d4dc0e89d734ab33bb399313af66107be91370"));
const STATUS_LABELS = {
  pending: "Aguardando pagamento",
  waiting_payment: "Aguardando pagamento",
  paid: "Pago",
  authorized: "Pago",
  expired: "Expirado",
  canceled: "Cancelado",
  refused: "Recusado"
};
function BillingPage() {
  const getSetup = useServerFn(getBillingSetup);
  const getPayments = useServerFn(listMyPayments);
  const createPayment = useServerFn(createPixPayment);
  const qc = useQueryClient();
  const {
    data: setup,
    isLoading: setupLoading
  } = useQuery({
    queryKey: ["billing-setup"],
    queryFn: () => getSetup()
  });
  const {
    data: payments = [],
    isLoading: paymentsLoading
  } = useQuery({
    queryKey: ["billing-payments"],
    queryFn: () => getPayments()
  });
  const activePayment = payments.find((p) => ["pending", "waiting_payment"].includes(p.status));
  const mut = useMutation({
    mutationFn: (plan) => createPayment({
      data: {
        plan
      }
    }),
    onSuccess: () => {
      toast.success("PIX gerado");
      qc.invalidateQueries({
        queryKey: ["billing-payments"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const copy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Código PIX copiado");
  };
  const account = setup?.account;
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(WalletCards, { className: "h-6 w-6" }),
        " Assinatura"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "O pagamento é por PIX manual. A cada ciclo você gera uma nova cobrança." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      setupLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
        " Carregando status…"
      ] }) : /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { children: account?.subscription_status === "active" ? "Ativo" : "Trial" }),
          account?.current_plan && /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
            "Plano ",
            BILLING_PLANS[account.current_plan]?.label
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: account?.subscription_ends_at ? `Assinatura válida até ${new Date(account.subscription_ends_at).toLocaleDateString("pt-BR")}` : `Trial válido até ${account?.trial_ends_at ? new Date(account.trial_ends_at).toLocaleDateString("pt-BR") : "—"}` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Webhook: ",
        /* @__PURE__ */ jsx("code", { children: "/api/public/ativopay-webhook" })
      ] })
    ] }),
    !setup?.hasAtivoPayKey && /* @__PURE__ */ jsxs(Card, { className: "p-5 border-destructive/40", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Falta só a chave da AtivoPay" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
        "No painel da AtivoPay, entre em ",
        /* @__PURE__ */ jsx("b", { children: "Suas Chaves → Chave de API" }),
        ". Depois me envie a chave ou peça para salvar como ",
        /* @__PURE__ */ jsx("b", { children: "ATIVOPAY_API_KEY" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-5", children: Object.keys(BILLING_PLANS).map((planId) => {
      const plan = BILLING_PLANS[planId];
      return /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold", children: [
              "Plano ",
              plan.label
            ] }),
            planId === "annual" && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "2 meses grátis" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold mt-3", children: plan.priceLabel })
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-primary" }),
            " Agenda e embed ilimitados"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-primary" }),
            " Pagamento por PIX via AtivoPay"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-primary" }),
            " Ativação automática pelo webhook"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "w-full", disabled: !setup?.hasAtivoPayKey || mut.isPending, onClick: () => mut.mutate(planId), children: mut.isPending ? "Gerando…" : "Gerar PIX" })
      ] }, plan.id);
    }) }),
    activePayment && /* @__PURE__ */ jsxs(Card, { className: "p-6 grid md:grid-cols-[320px_1fr] gap-6 items-start", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-md border p-4 flex items-center justify-center bg-background", children: activePayment.qr_code ? /* @__PURE__ */ jsx("img", { src: activePayment.qr_code, alt: "QR Code PIX", className: "w-64 h-64" }) : /* @__PURE__ */ jsx(QrCode, { className: "h-24 w-24 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "PIX aguardando pagamento" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
            BILLING_PLANS[activePayment.plan]?.label,
            " • ",
            formatCentsBRL(activePayment.amount_cents)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Input, { readOnly: true, value: activePayment.copy_paste ?? "", className: "font-mono text-xs" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => copy(activePayment.copy_paste), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Depois do pagamento, a AtivoPay envia o webhook e a assinatura fica ativa automaticamente." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Histórico de cobranças" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
        paymentsLoading && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" }),
        !paymentsLoading && payments.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma cobrança gerada ainda." }),
        payments.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border rounded-md p-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
              "Plano ",
              BILLING_PLANS[p.plan]?.label,
              " — ",
              formatCentsBRL(p.amount_cents)
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: new Date(p.created_at).toLocaleString("pt-BR") })
          ] }),
          /* @__PURE__ */ jsx(Badge, { variant: p.status === "paid" || p.status === "authorized" ? "default" : "secondary", children: STATUS_LABELS[p.status] ?? p.status })
        ] }, p.id))
      ] })
    ] })
  ] }) });
}
export {
  BillingPage as component
};
