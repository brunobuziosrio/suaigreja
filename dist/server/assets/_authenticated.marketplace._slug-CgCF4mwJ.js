import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { g as getProductBySlug, c as createProductPixPayment } from "./products.functions-BwyqQoeG.js";
import { f as formatCentsBRL } from "./billing-plans-Ce8xzhRW.js";
import { Loader2, ArrowLeft, Package, Check, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { J as Route } from "./router-BAWvi9U-.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
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
import "./client-DVtn2Z4s.js";
import "@radix-ui/react-collapsible";
function ProductDetail() {
  const {
    slug
  } = Route.useParams();
  const fetchProduct = useServerFn(getProductBySlug);
  const buy = useServerFn(createProductPixPayment);
  const qc = useQueryClient();
  const [tx, setTx] = useState(null);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct({
      data: {
        slug
      }
    })
  });
  const mut = useMutation({
    mutationFn: () => buy({
      data: {
        productId: data.product.id
      }
    }),
    onSuccess: (t) => {
      setTx(t);
      toast.success("PIX gerado");
      qc.invalidateQueries({
        queryKey: ["product", slug]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full p-6 flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
      " Carregando…"
    ] }) });
  }
  if (!data) return null;
  const {
    product,
    purchase
  } = data;
  const isOwned = purchase?.status === "paid";
  const features = Array.isArray(product.features) ? product.features : [];
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxs(Link, { to: "/marketplace", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Voltar"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-[1.2fr_1fr] gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-video bg-gradient-to-br from-primary/10 via-muted to-accent/10 flex items-center justify-center", children: product.image_url ? /* @__PURE__ */ jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx(Package, { className: "h-16 w-16 text-muted-foreground/40" }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              product.badge && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: product.badge }),
              product.featured && /* @__PURE__ */ jsx(Badge, { children: "Destaque" })
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight mt-2", children: product.name }),
            product.tagline && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-1", children: product.tagline })
          ] }),
          product.description && /* @__PURE__ */ jsx("div", { className: "text-sm leading-relaxed whitespace-pre-line text-foreground/80", children: product.description }),
          features.length > 0 && /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm", children: features.map((f, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
            " ",
            f
          ] }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-4 h-fit sticky top-6", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: product.price_cents > 0 ? formatCentsBRL(product.price_cents) : "Grátis" }),
        isOwned ? /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
            " Você já possui este produto."
          ] }),
          product.external_url && /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "mt-3", children: /* @__PURE__ */ jsxs("a", { href: product.external_url, target: "_blank", rel: "noreferrer", children: [
            "Acessar ",
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
          ] }) })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { className: "w-full", disabled: mut.isPending || product.price_cents <= 0, onClick: () => mut.mutate(), children: mut.isPending ? "Gerando PIX…" : "Comprar com PIX" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Pagamento via AtivoPay. Liberação automática após confirmação." })
        ] }),
        tx && /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-2 border-t", children: [
          tx.qr_code && /* @__PURE__ */ jsx("img", { src: tx.qr_code, alt: "QR Code PIX", className: "w-full max-w-[240px] mx-auto" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Input, { readOnly: true, value: tx.copy_paste ?? "", className: "font-mono text-xs" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: () => {
              if (tx.copy_paste) {
                navigator.clipboard.writeText(tx.copy_paste);
                toast.success("Código PIX copiado");
              }
            }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  ProductDetail as component
};
