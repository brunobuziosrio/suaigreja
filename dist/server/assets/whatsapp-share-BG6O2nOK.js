const WEEKDAYS_LONG = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];
function parseIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function formatLongDate(iso) {
  const d = parseIso(iso);
  const wd = WEEKDAYS_LONG[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${wd}, ${day}/${month}`;
}
function formatTime(t) {
  if (!t) return "";
  return t.slice(0, 5);
}
function lineFor(e) {
  const time = formatTime(e.start_time);
  const end = e.end_time ? ` – ${formatTime(e.end_time)}` : "";
  const type = e.show_type !== false && e.type_name ? ` • ${e.type_name}` : "";
  const live = e.is_live ? " 🔴 AO VIVO" : "";
  const liveLink = e.is_live && e.live_url ? `
   ${e.live_url}` : "";
  return `🕒 ${time}${end} – ${e.location_name}${type}${live}${liveLink}`;
}
function buildDayMessage(iso, events, brandTitle) {
  const header = brandTitle?.trim() || "Agenda";
  if (events.length === 0) {
    return `*${header}*
${formatLongDate(iso)}

Nenhuma programação para este dia.`;
  }
  const sorted = [...events].sort(
    (a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? "")
  );
  const body = sorted.map(lineFor).join("\n");
  return `*${header}*
📅 ${formatLongDate(iso)}

${body}`;
}
function buildRangeMessage(events, brandTitle, rangeLabel) {
  const header = brandTitle?.trim() || "Agenda";
  if (events.length === 0) {
    return `*${header}*${rangeLabel ? `
${rangeLabel}` : ""}

Nenhuma programação no período.`;
  }
  const byDate = /* @__PURE__ */ new Map();
  for (const e of events) {
    const arr = byDate.get(e.event_date) ?? [];
    arr.push(e);
    byDate.set(e.event_date, arr);
  }
  const dates = [...byDate.keys()].sort();
  const sections = dates.map((iso) => {
    const items = (byDate.get(iso) ?? []).sort(
      (a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? "")
    );
    return `📅 ${formatLongDate(iso)}
${items.map(lineFor).join("\n")}`;
  });
  return `*${header}*${rangeLabel ? `
${rangeLabel}` : ""}

${sections.join("\n\n")}`;
}
function openWhatsAppShare(message) {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  if (nav?.share) {
    nav.share({ text: message }).catch(() => {
      fallbackCopy(message);
    });
    return;
  }
  fallbackCopy(message);
}
function fallbackCopy(message) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(message);
      import("sonner").then(
        ({ toast }) => toast.success("Mensagem copiada! Cole no WhatsApp para compartilhar.")
      );
      return;
    }
  } catch {
  }
  if (typeof window !== "undefined") {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }
}
export {
  buildDayMessage as a,
  buildRangeMessage as b,
  openWhatsAppShare as o
};
