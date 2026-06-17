import { jsx, jsxs } from "react/jsx-runtime";
import { Radio } from "lucide-react";
const WEEKDAYS_FULL = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];
const MONTHS_FULL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];
function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function formatDayHeader(iso) {
  const dt = parseDate(iso);
  return {
    weekday: WEEKDAYS_FULL[dt.getDay()].toUpperCase(),
    short: `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`
  };
}
function formatMonthLabel(iso) {
  const dt = parseDate(iso);
  return `${MONTHS_FULL[dt.getMonth()]} de ${dt.getFullYear()}`.toUpperCase();
}
function PublicAgendaView({ account, events, types = [], view = "full" }) {
  const primary = account.primary_color || "#467da5";
  const isSummary = view === "summary";
  const typesById = new Map(types.map((t) => [t.id, t]));
  const forceShowType = !!account.force_show_type;
  const grouped = /* @__PURE__ */ new Map();
  for (const e of events) {
    const arr = grouped.get(e.event_date) ?? [];
    arr.push(e);
    grouped.set(e.event_date, arr);
  }
  const entries = Array.from(grouped.entries());
  const visible = isSummary ? entries.slice(0, 1) : entries;
  const monthLabel = visible.length > 0 ? formatMonthLabel(visible[0][0]) : "";
  const headerTitle = isSummary ? account.brand_today_title || "Celebrações de hoje" : account.brand_title;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "bg-[#faf6ee] text-slate-900 notranslate rounded-lg",
      translate: "no",
      style: { ["--brand"]: primary },
      children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[#e5dcc6] bg-[#faf6ee] overflow-hidden shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4 px-4 sm:px-5 py-4 border-b border-[#e5dcc6]", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900", children: headerTitle }),
          monthLabel && /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm font-semibold tracking-wider text-slate-600", children: monthLabel })
        ] }),
        account.brand_subtitle && !isSummary && /* @__PURE__ */ jsx("p", { className: "px-4 sm:px-5 pt-3 text-sm text-slate-600", children: account.brand_subtitle }),
        visible.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 text-center py-12 px-4", children: account.brand_empty_message }) : /* @__PURE__ */ jsx("div", { className: "p-2 sm:p-3 space-y-2", children: visible.map(([date, items]) => {
          const lbl = formatDayHeader(date);
          return /* @__PURE__ */ jsxs("section", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center justify-between rounded-md px-4 py-2.5 text-white shadow-sm",
                style: { backgroundColor: primary },
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-bold uppercase tracking-wide", children: lbl.weekday }),
                  /* @__PURE__ */ jsx("span", { className: "rounded-full bg-black/25 px-3 py-0.5 text-xs font-semibold tabular-nums", children: lbl.short })
                ]
              }
            ),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: items.map((e) => /* @__PURE__ */ jsxs(
              "li",
              {
                className: "flex items-center gap-3 rounded-md border border-[#e5dcc6] bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.02)]",
                children: [
                  (() => {
                    const t = e.type_id ? typesById.get(e.type_id) : null;
                    const c = t?.color || primary;
                    return /* @__PURE__ */ jsx(
                      "span",
                      {
                        "aria-hidden": true,
                        className: "self-stretch w-1 rounded-sm shrink-0 -my-2.5",
                        style: { backgroundColor: c }
                      }
                    );
                  })(),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex items-baseline gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: e.location_name }),
                    e.description && /* @__PURE__ */ jsx("span", { className: "text-sm italic", style: { color: primary }, children: e.description }),
                    (e.show_type || forceShowType) && (() => {
                      const t = e.type_id ? typesById.get(e.type_id) : null;
                      const isLiveKind = e.type_name === "Transmissão";
                      const isEventKind = e.type_name === "Evento";
                      const c = t?.color || (isLiveKind ? "#dc2626" : isEventKind ? "#059669" : "#64748b");
                      const icon = t?.icon || (isLiveKind ? "📡" : isEventKind ? "🎟️" : "");
                      return /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: "inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5",
                          style: { backgroundColor: `${c}1a`, color: c },
                          children: [
                            icon && /* @__PURE__ */ jsx("span", { children: icon }),
                            /* @__PURE__ */ jsx("span", { children: e.type_name })
                          ]
                        }
                      );
                    })()
                  ] }),
                  e.is_live && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold uppercase text-red-600", children: [
                    /* @__PURE__ */ jsx(Radio, { className: "h-3 w-3" }),
                    e.live_url ? /* @__PURE__ */ jsx("a", { href: e.live_url, target: "_blank", rel: "noopener noreferrer", className: "underline", children: "Ao vivo" }) : "Ao vivo"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-semibold tabular-nums text-slate-800", children: e.start_time?.slice(0, 5) })
                ]
              },
              e.id
            )) })
          ] }, date);
        }) })
      ] })
    }
  );
}
export {
  PublicAgendaView as P
};
