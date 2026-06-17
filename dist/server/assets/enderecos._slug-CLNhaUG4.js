import { jsxs, jsx } from "react/jsx-runtime";
import { B as BackToSite, H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { f as Route } from "./router-BudgN2VI.js";
import "@tanstack/react-router";
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
function LocationsPage() {
  const {
    account,
    locations,
    chrome
  } = Route.useLoaderData();
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Nossos endereços";
  const list = (locations ?? []).filter((l) => l.address);
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
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
          "Venha nos visitar"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-white", style: {
          fontFamily: "var(--font-display)"
        }, children: "Nossos endereços" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-white/85 text-base sm:text-lg max-w-2xl", children: [
          "Todas as unidades, capelas e pontos de encontro de ",
          brand,
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16", children: list.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-24 text-stone-500", children: [
      /* @__PURE__ */ jsx(MapPin, { className: "h-10 w-10 mx-auto mb-4 opacity-40" }),
      /* @__PURE__ */ jsx("p", { children: "Nenhum endereço cadastrado ainda." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch", children: list.map((loc) => /* @__PURE__ */ jsx(FullLocationCard, { loc, accent }, loc.id ?? loc.name)) }) })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: content });
  return content;
}
function FullLocationCard({
  loc,
  accent
}) {
  const address = loc.address;
  const lat = loc.latitude != null ? Number(loc.latitude) : NaN;
  const lng = loc.longitude != null ? Number(loc.longitude) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const coords = hasCoords ? `${lat},${lng}` : null;
  const mapEmbedSrc = hasCoords ? `https://www.google.com/maps?q=${coords}&z=17&output=embed` : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapsHref = loc.maps_url || (loc.place_id ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${loc.place_id}` : hasCoords ? `https://www.google.com/maps/search/?api=1&query=${coords}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  const wazeHref = loc.waze_url || (hasCoords ? `https://www.waze.com/ul?ll=${coords}&navigate=yes` : `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`);
  const uberHref = loc.uber_url || (hasCoords ? `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[formatted_address]=${encodeURIComponent(address)}` : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(address)}`);
  const waLink = loc.whatsapp ? `https://wa.me/${String(loc.whatsapp).replace(/\D/g, "")}` : null;
  const telLink = loc.phone ? `tel:${String(loc.phone).replace(/\s/g, "")}` : null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative bg-stone-100", style: {
      aspectRatio: "4/3"
    }, children: [
      /* @__PURE__ */ jsx("iframe", { title: `Mapa ${loc.name}`, src: mapEmbedSrc, className: "absolute inset-0 w-full h-full border-0", loading: "lazy", referrerPolicy: "no-referrer-when-downgrade" }),
      loc.is_main && /* @__PURE__ */ jsx("span", { className: "absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow", style: {
        background: accent
      }, children: "Matriz" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 flex-1 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full flex items-center justify-center shrink-0", style: {
          background: `${accent}1f`,
          color: accent
        }, children: /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl tracking-tight text-stone-900 leading-tight", style: {
            fontFamily: "var(--font-display)"
          }, children: loc.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-stone-700 leading-relaxed", children: address })
        ] })
      ] }),
      (loc.office_hours || telLink || waLink) && /* @__PURE__ */ jsxs("div", { className: "space-y-2.5 text-sm border-t border-stone-100 pt-4", children: [
        loc.office_hours && /* @__PURE__ */ jsx("p", { className: "text-stone-700 whitespace-pre-line", children: loc.office_hours }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 text-stone-700", children: [
          telLink && /* @__PURE__ */ jsxs("a", { href: telLink, className: "inline-flex items-center gap-1.5 hover:underline", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            loc.phone
          ] }),
          waLink && /* @__PURE__ */ jsxs("a", { href: waLink, target: "_blank", rel: "noopener", className: "inline-flex items-center gap-1.5 text-emerald-700 hover:underline", children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
            " WhatsApp"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-4 border-t border-stone-100", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2", children: "Como chegar" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs("a", { href: mapsHref, target: "_blank", rel: "noopener", className: "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: "🗺️" }),
            "Maps"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: wazeHref, target: "_blank", rel: "noopener", className: "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: "🚗" }),
            "Waze"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: uberHref, target: "_blank", rel: "noopener", className: "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: "🚕" }),
            "Uber"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  LocationsPage as component
};
