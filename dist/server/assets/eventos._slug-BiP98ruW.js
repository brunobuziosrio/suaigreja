import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { B as BackToSite, H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { CalendarHeart, ArrowUpRight } from "lucide-react";
import { e as Route } from "./router-BudgN2VI.js";
import "react";
import "@tanstack/react-query";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "sonner";
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
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
function EventsListPage() {
  const {
    account,
    events,
    chrome
  } = Route.useLoaderData();
  const accent = account.primary_color || "#467da5";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Eventos";
  const fmtDate = (d) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };
  const priceLabel = (cents) => cents > 0 ? `R$ ${(cents / 100).toFixed(2).replace(".", ",")}` : "Gratuito";
  const truncate = (s, n) => {
    if (!s) return "";
    const clean = String(s).replace(/<[^>]+>/g, "").trim();
    return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
  };
  const content = /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-stone-50", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", style: {
      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10", style: {
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.6) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.4) 0, transparent 45%)"
      } }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20", children: [
        /* @__PURE__ */ jsx(BackToSite, { slug, className: "mb-6" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-white/80 text-xs uppercase tracking-[0.3em] font-semibold", children: [
          /* @__PURE__ */ jsx(CalendarHeart, { className: "h-4 w-4" }),
          "Próximos encontros"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-white", style: {
          fontFamily: "var(--font-display)"
        }, children: "Eventos" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-white/85 text-base sm:text-lg max-w-2xl", children: [
          "Acompanhe os próximos eventos de ",
          brand,
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16", children: events.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-24 text-stone-500", children: [
      /* @__PURE__ */ jsx(CalendarHeart, { className: "h-10 w-10 mx-auto mb-4 opacity-40" }),
      /* @__PURE__ */ jsx("p", { children: "Nenhum evento programado no momento." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch", children: events.map((e, idx) => {
      const free = !e.price_cents || e.price_cents <= 0;
      return /* @__PURE__ */ jsxs(Link, { to: "/e/$slug", params: {
        slug: e.slug
      }, className: "group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[16/10] bg-stone-100 overflow-hidden flex items-center justify-center", children: e.cover_image_url ? /* @__PURE__ */ jsx("img", { src: e.cover_image_url, alt: e.title, loading: idx < 2 ? "eager" : "lazy", className: "w-full h-full object-cover group-hover:scale-[1.04] transition duration-700" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full", style: {
          background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
        } }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 p-5 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-stone-500", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", style: {
              background: `${accent}1a`,
              color: accent
            }, children: "Evento" }),
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", style: free ? {
              background: "#16a34a1a",
              color: "#15803d"
            } : {
              background: `${accent}1a`,
              color: accent
            }, children: priceLabel(e.price_cents) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-stone-500", children: [
            fmtDate(e.event_date),
            " · ",
            e.start_time?.slice(0, 5)
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "text-lg sm:text-xl font-bold tracking-tight leading-snug group-hover:underline underline-offset-4 line-clamp-2", style: {
            fontFamily: "var(--font-display)",
            color: accent
          }, children: e.title }),
          e.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-600 leading-relaxed line-clamp-3", children: truncate(e.description, 160) }),
          /* @__PURE__ */ jsxs("span", { className: "self-start mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider shadow-sm group-hover:shadow-md transition", style: {
            background: accent
          }, children: [
            free ? "Saiba mais" : "Inscrever-se",
            " ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" })
          ] })
        ] })
      ] }, e.id);
    }) }) })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: content });
  return content;
}
export {
  EventsListPage as component
};
