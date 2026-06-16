import { Radio } from "lucide-react";

export type PublicAgendaAccount = {
  brand_title: string;
  brand_subtitle: string;
  brand_empty_message: string;
  brand_today_title?: string | null;
  primary_color: string;
  force_show_type?: boolean | null;
};

export type PublicAgendaEvent = {
  id: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  location_name: string;
  type_name: string;
  type_id?: string | null;
  description?: string | null;
  show_type: boolean;
  is_live: boolean;
  live_url?: string | null;
};

export type PublicAgendaType = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

const WEEKDAYS_FULL = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];
const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatDayHeader(iso: string) {
  const dt = parseDate(iso);
  return {
    weekday: WEEKDAYS_FULL[dt.getDay()].toUpperCase(),
    short: `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`,
  };
}

function formatMonthLabel(iso: string) {
  const dt = parseDate(iso);
  return `${MONTHS_FULL[dt.getMonth()]} de ${dt.getFullYear()}`.toUpperCase();
}

type Props = {
  account: PublicAgendaAccount;
  events: PublicAgendaEvent[];
  types?: PublicAgendaType[];
  view?: "full" | "summary";
};

export function PublicAgendaView({ account, events, types = [], view = "full" }: Props) {
  const primary = account.primary_color || "#467da5";
  const isSummary = view === "summary";
  const typesById = new Map(types.map((t) => [t.id, t]));
  const forceShowType = !!account.force_show_type;

  const grouped = new Map<string, PublicAgendaEvent[]>();
  for (const e of events) {
    const arr = grouped.get(e.event_date) ?? [];
    arr.push(e);
    grouped.set(e.event_date, arr);
  }

  const entries = Array.from(grouped.entries());
  const visible = isSummary ? entries.slice(0, 1) : entries;
  const monthLabel = visible.length > 0 ? formatMonthLabel(visible[0][0]) : "";
  const headerTitle = isSummary
    ? (account.brand_today_title || "Celebrações de hoje")
    : account.brand_title;

  return (
    <div
      className="bg-[#faf6ee] text-slate-900 notranslate rounded-lg"
      translate="no"
      style={{ ["--brand" as never]: primary }}
    >
      <div className="rounded-lg border border-[#e5dcc6] bg-[#faf6ee] overflow-hidden shadow-sm">
        <div className="flex items-baseline justify-between gap-4 px-4 sm:px-5 py-4 border-b border-[#e5dcc6]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {headerTitle}
          </h1>
          {monthLabel && (
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-600">
              {monthLabel}
            </span>
          )}
        </div>

        {account.brand_subtitle && !isSummary && (
          <p className="px-4 sm:px-5 pt-3 text-sm text-slate-600">
            {account.brand_subtitle}
          </p>
        )}

        {visible.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12 px-4">
            {account.brand_empty_message}
          </p>
        ) : (
          <div className="p-2 sm:p-3 space-y-2">
            {visible.map(([date, items]) => {
              const lbl = formatDayHeader(date);
              return (
                <section key={date} className="space-y-1.5">
                  <div
                    className="flex items-center justify-between rounded-md px-4 py-2.5 text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    <span className="text-sm font-bold uppercase tracking-wide">{lbl.weekday}</span>
                    <span className="rounded-full bg-black/25 px-3 py-0.5 text-xs font-semibold tabular-nums">
                      {lbl.short}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-3 rounded-md border border-[#e5dcc6] bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                      >
                        {(() => {
                          const t = e.type_id ? typesById.get(e.type_id) : null;
                          const c = t?.color || primary;
                          return (
                            <span
                              aria-hidden
                              className="self-stretch w-1 rounded-sm shrink-0 -my-2.5"
                              style={{ backgroundColor: c }}
                            />
                          );
                        })()}
                        <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{e.location_name}</span>
                          {e.description && (
                            <span className="text-sm italic" style={{ color: primary }}>
                              {e.description}
                            </span>
                          )}
                          {(e.show_type || forceShowType) && (
                            (() => {
                              const t = e.type_id ? typesById.get(e.type_id) : null;
                              // Special-case synthetic kinds so they are visually distinct
                              // from celebration types (which carry their own color).
                              const isLiveKind = e.type_name === "Transmissão";
                              const isEventKind = e.type_name === "Evento";
                              const c = t?.color
                                || (isLiveKind ? "#dc2626" : isEventKind ? "#059669" : "#64748b");
                              const icon = t?.icon || (isLiveKind ? "📡" : isEventKind ? "🎟️" : "");
                              return (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5"
                                  style={{ backgroundColor: `${c}1a`, color: c }}
                                >
                                  {icon && <span>{icon}</span>}
                                  <span>{e.type_name}</span>
                                </span>
                              );
                            })()
                          )}
                        </div>
                        {e.is_live && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase text-red-600">
                            <Radio className="h-3 w-3" />
                            {e.live_url ? (
                              <a href={e.live_url} target="_blank" rel="noopener noreferrer" className="underline">
                                Ao vivo
                              </a>
                            ) : (
                              "Ao vivo"
                            )}
                          </span>
                        )}
                        <span className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-semibold tabular-nums text-slate-800">
                          {e.start_time?.slice(0, 5)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}