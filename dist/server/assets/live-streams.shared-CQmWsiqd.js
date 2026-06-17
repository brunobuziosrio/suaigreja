function nowInBRT() {
  const n = /* @__PURE__ */ new Date();
  return new Date(n.getTime() - 3 * 60 * 60 * 1e3);
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function computeLiveStatus(streams, overrides, now) {
  const occurrences = [];
  const push = (s, dateStr) => {
    const ov = overrides.find((o) => o.live_stream_id === s.id && o.event_date === dateStr);
    if (ov?.cancelled) return;
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = (s.start_time || "00:00").split(":").map(Number);
    const start = new Date(y, m - 1, d, hh, mm);
    occurrences.push({
      stream: s,
      date: dateStr,
      start,
      url: (ov?.live_url && ov.live_url.length > 0 ? ov.live_url : s.default_live_url) ?? null
    });
  };
  for (const s of streams) {
    if (!s.active) continue;
    if (s.recurrence === "once") {
      if (s.event_date) push(s, s.event_date);
    } else {
      if (s.weekday === null || s.weekday === void 0) continue;
      for (let i = 0; i < 21; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        if (d.getDay() === s.weekday) {
          push(s, `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        }
      }
    }
  }
  occurrences.sort((a, b) => a.start.getTime() - b.start.getTime());
  for (const o of occurrences) {
    const liveStart = new Date(o.start.getTime() - o.stream.minutes_before * 6e4);
    const liveEnd = new Date(o.start.getTime() + o.stream.duration_minutes * 6e4);
    if (now >= liveStart && now <= liveEnd) {
      return {
        status: "live",
        title: o.stream.title,
        url: o.url,
        date: o.date,
        startTime: o.stream.start_time
      };
    }
  }
  const next = occurrences.find((o) => o.start.getTime() > now.getTime());
  if (next) {
    return {
      status: "upcoming",
      title: next.stream.title,
      url: next.url,
      date: next.date,
      startTime: next.stream.start_time
    };
  }
  return { status: "none" };
}
function nextOccurrences(stream, overrides, now, limit = 5) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const addDate = (dateStr) => {
    if (seen.has(dateStr)) return;
    seen.add(dateStr);
    const ov = overrides.find((o) => o.event_date === dateStr);
    out.push({
      date: dateStr,
      cancelled: !!ov?.cancelled,
      live_url: ov?.live_url ?? null
    });
  };
  if (stream.recurrence === "once") {
    if (stream.event_date) addDate(stream.event_date);
  } else if (stream.weekday !== null && stream.weekday !== void 0) {
    for (let i = 0; i < 60 && out.length < limit; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (d.getDay() === stream.weekday) {
        addDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      }
    }
  }
  return out.slice(0, limit);
}
export {
  nextOccurrences as a,
  computeLiveStatus as c,
  nowInBRT as n
};
