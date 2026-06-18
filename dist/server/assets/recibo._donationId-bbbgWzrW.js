import { jsxs, jsx } from "react/jsx-runtime";
import { B as Button } from "./button-Bt6uLOVU.js";
import { HandCoins, Printer } from "lucide-react";
import { a as Route } from "./router-DXfKo2Q8.js";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "sonner";
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
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
function fmtBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function ReceiptPage() {
  const {
    donation,
    church,
    campaignTitle
  } = Route.useLoaderData();
  const primary = church?.primary_color || "#0c2340";
  const paidAt = donation.paid_at ? new Date(donation.paid_at) : null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:bg-white", style: {
    background: `linear-gradient(135deg, ${primary}18, ${primary}04)`
  }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @media print {
          @page { size: A4 portrait; margin: 16mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-xl border bg-background p-6 shadow-sm print:shadow-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(HandCoins, { className: "h-6 w-6", style: {
          color: primary
        } }),
        /* @__PURE__ */ jsx("h1", { className: "font-semibold", children: church?.brand_title ?? "Igreja" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Comprovante de doação" }),
      /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
        donation.donor_name && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "Doador" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-right", children: donation.donor_name })
        ] }),
        campaignTitle && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "Campanha" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-right", children: campaignTitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "Valor" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-right", children: fmtBRL(donation.amount_cents) })
        ] }),
        paidAt && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "Data" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-right", children: paidAt.toLocaleString("pt-BR") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsx("dd", { className: "font-medium text-right text-green-600", children: "Pago" })
        ] }),
        donation.mercadopago_payment_id && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "ID da transação" }),
          /* @__PURE__ */ jsx("dd", { className: "font-mono text-xs text-right", children: donation.mercadopago_payment_id })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center print:hidden", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => window.print(), children: [
        /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4 mr-2" }),
        "Imprimir / salvar como PDF"
      ] }) })
    ] })
  ] });
}
export {
  ReceiptPage as component
};
