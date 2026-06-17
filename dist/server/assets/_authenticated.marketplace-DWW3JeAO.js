import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { l as listProducts } from "./products.functions-BwyqQoeG.js";
import { f as formatCentsBRL } from "./billing-plans-Ce8xzhRW.js";
import { Store, Package, Sparkles, ArrowRight } from "lucide-react";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./input-DAQqOwjK.js";
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
import "./router-BAWvi9U-.js";
import "./client-DVtn2Z4s.js";
import "sonner";
import "@radix-ui/react-collapsible";
function MarketplacePage() {
  const fetchProducts = useServerFn(listProducts);
  const {
    data: products = [],
    isLoading
  } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: () => fetchProducts()
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Store, { className: "h-6 w-6" }),
        " Plugins & Extras"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Amplie seu sistema com módulos extras — liturgia, cadastro de membros, dízimos e mais." })
    ] }),
    isLoading && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando…" }),
    !isLoading && products.length === 0 && /* @__PURE__ */ jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsx(Package, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Em breve, novos produtos" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Estamos preparando novos módulos. Volte em breve!" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5", children: products.map((p) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden flex flex-col group hover:border-primary transition-colors", children: [
      /* @__PURE__ */ jsxs("div", { className: "aspect-video bg-gradient-to-br from-primary/10 via-muted to-accent/10 relative overflow-hidden", children: [
        p.image_url ? /* @__PURE__ */ jsx("img", { src: p.image_url, alt: p.name, className: "w-full h-full object-cover", loading: "lazy" }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(Package, { className: "h-12 w-12 text-muted-foreground/40" }) }),
        p.featured && /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2", children: /* @__PURE__ */ jsxs(Badge, { className: "gap-1", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
          " Destaque"
        ] }) }),
        p.badge && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: p.badge }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 flex-1 flex flex-col", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold leading-tight", children: p.name }),
        p.tagline && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-2", children: p.tagline }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 flex items-end justify-between gap-3", children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold", children: p.price_cents > 0 ? formatCentsBRL(p.price_cents) : /* @__PURE__ */ jsx("span", { className: "text-base text-muted-foreground", children: "Grátis" }) }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-4 w-full", children: /* @__PURE__ */ jsxs(Link, { to: "/marketplace/$slug", params: {
          slug: p.slug
        }, children: [
          "Ver detalhes ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
        ] }) })
      ] })
    ] }, p.id)) })
  ] }) });
}
export {
  MarketplacePage as component
};
