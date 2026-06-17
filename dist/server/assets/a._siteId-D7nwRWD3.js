import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { P as PublicAgendaView } from "./public-agenda-view-Cj58QWoJ.js";
import { H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { P as PublicHero } from "./public-hero-DP67X3-I.js";
import { CalendarDays } from "lucide-react";
import { l as Route } from "./router-BAWvi9U-.js";
import "@tanstack/react-router";
import "react";
import "@tanstack/react-query";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "sonner";
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
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
function PublicAgenda() {
  const {
    account,
    events,
    types,
    chrome
  } = Route.useLoaderData();
  const params = Route.useParams();
  const {
    view
  } = Route.useSearch();
  const grouped = /* @__PURE__ */ new Map();
  for (const e of events) {
    const arr = grouped.get(e.event_date) ?? [];
    arr.push(e);
    grouped.set(e.event_date, arr);
  }
  const hasMore = view === "summary" && grouped.size > 1;
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PublicHero, { color: account.primary_color || "#467da5", title: "Agenda", subtitle: account.brand_title, icon: /* @__PURE__ */ jsx(CalendarDays, { className: "h-10 w-10" }), slug: params.siteId }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsx(PublicAgendaView, { account, events, types, view }),
      hasMore && /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-slate-500 mt-3", children: "Agenda completa disponível no site." })
    ] })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: content });
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#faf6ee]", children: /* @__PURE__ */ jsx("main", { children: content }) });
}
export {
  PublicAgenda as component
};
