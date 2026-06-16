// Helpers to build WhatsApp share URLs (wa.me) from agenda events.
// Zero cost / zero risk — opens the user's own WhatsApp with the message
// pre-filled. Used by the Básico plan.

type EventLike = {
  event_date: string;
  start_time: string | null;
  end_time?: string | null;
  location_name: string;
  type_name: string;
  show_type?: boolean;
  is_live?: boolean;
  live_url?: string | null;
  description?: string | null;
};

const WEEKDAYS_LONG = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatLongDate(iso: string) {
  const d = parseIso(iso);
  const wd = WEEKDAYS_LONG[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${wd}, ${day}/${month}`;
}

function formatTime(t: string | null | undefined) {
  if (!t) return "";
  return t.slice(0, 5);
}

function lineFor(e: EventLike) {
  const time = formatTime(e.start_time);
  const end = e.end_time ? ` – ${formatTime(e.end_time)}` : "";
  const type = e.show_type !== false && e.type_name ? ` • ${e.type_name}` : "";
  const live = e.is_live ? " 🔴 AO VIVO" : "";
  const liveLink = e.is_live && e.live_url ? `\n   ${e.live_url}` : "";
  return `🕒 ${time}${end} – ${e.location_name}${type}${live}${liveLink}`;
}

export function buildDayMessage(
  iso: string,
  events: EventLike[],
  brandTitle?: string | null,
) {
  const header = brandTitle?.trim() || "Agenda";
  if (events.length === 0) {
    return `*${header}*\n${formatLongDate(iso)}\n\nNenhuma programação para este dia.`;
  }
  const sorted = [...events].sort((a, b) =>
    (a.start_time ?? "").localeCompare(b.start_time ?? ""),
  );
  const body = sorted.map(lineFor).join("\n");
  return `*${header}*\n📅 ${formatLongDate(iso)}\n\n${body}`;
}

export function buildRangeMessage(
  events: EventLike[],
  brandTitle?: string | null,
  rangeLabel?: string,
) {
  const header = brandTitle?.trim() || "Agenda";
  if (events.length === 0) {
    return `*${header}*${rangeLabel ? `\n${rangeLabel}` : ""}\n\nNenhuma programação no período.`;
  }
  // group by date
  const byDate = new Map<string, EventLike[]>();
  for (const e of events) {
    const arr = byDate.get(e.event_date) ?? [];
    arr.push(e);
    byDate.set(e.event_date, arr);
  }
  const dates = [...byDate.keys()].sort();
  const sections = dates.map((iso) => {
    const items = (byDate.get(iso) ?? []).sort((a, b) =>
      (a.start_time ?? "").localeCompare(b.start_time ?? ""),
    );
    return `📅 ${formatLongDate(iso)}\n${items.map(lineFor).join("\n")}`;
  });
  return `*${header}*${rangeLabel ? `\n${rangeLabel}` : ""}\n\n${sections.join("\n\n")}`;
}

export function openWhatsAppShare(message: string) {
  // Try native share first (mobile & supported desktop browsers).
  const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
  if (nav?.share) {
    nav.share({ text: message }).catch(() => {
      fallbackCopy(message);
    });
    return;
  }
  fallbackCopy(message);
}

function fallbackCopy(message: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(message);
      // Lazy import to avoid SSR issues
      import("sonner").then(({ toast }) =>
        toast.success("Mensagem copiada! Cole no WhatsApp para compartilhar."),
      );
      return;
    }
  } catch {
    /* ignore */
  }
  // Last resort: open wa.me (may be blocked on some networks)
  if (typeof window !== "undefined") {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
}
