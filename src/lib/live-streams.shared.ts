export type LiveStreamRow = {
  id: string;
  title: string;
  recurrence: "weekly" | "once";
  weekday: number | null;
  event_date: string | null;
  start_time: string;
  duration_minutes: number;
  minutes_before: number;
  default_live_url: string | null;
  active: boolean;
  sort_order?: number;
};

export type LiveOverrideRow = {
  id?: string;
  live_stream_id: string;
  event_date: string;
  live_url: string | null;
  cancelled: boolean;
};

export type LiveStatus =
  | { status: "live"; title: string; url: string | null; date: string; startTime: string }
  | { status: "upcoming"; title: string; url: string | null; date: string; startTime: string }
  | { status: "none" };

/** Brazil is UTC-3 year-round (no DST since 2019). Worker clock is UTC. */
export function nowInBRT(): Date {
  const n = new Date();
  return new Date(n.getTime() - 3 * 60 * 60 * 1000);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function computeLiveStatus(
  streams: LiveStreamRow[],
  overrides: LiveOverrideRow[],
  now: Date,
): LiveStatus {
  type Occ = { stream: LiveStreamRow; date: string; start: Date; url: string | null };
  const occurrences: Occ[] = [];

  const push = (s: LiveStreamRow, dateStr: string) => {
    const ov = overrides.find((o) => o.live_stream_id === s.id && o.event_date === dateStr);
    if (ov?.cancelled) return;
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = (s.start_time || "00:00").split(":").map(Number);
    const start = new Date(y, m - 1, d, hh, mm);
    occurrences.push({
      stream: s,
      date: dateStr,
      start,
      url: (ov?.live_url && ov.live_url.length > 0 ? ov.live_url : s.default_live_url) ?? null,
    });
  };

  for (const s of streams) {
    if (!s.active) continue;
    if (s.recurrence === "once") {
      if (s.event_date) push(s, s.event_date);
    } else {
      if (s.weekday === null || s.weekday === undefined) continue;
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
    const liveStart = new Date(o.start.getTime() - o.stream.minutes_before * 60_000);
    const liveEnd = new Date(o.start.getTime() + o.stream.duration_minutes * 60_000);
    if (now >= liveStart && now <= liveEnd) {
      return {
        status: "live",
        title: o.stream.title,
        url: o.url,
        date: o.date,
        startTime: o.stream.start_time,
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
      startTime: next.stream.start_time,
    };
  }
  return { status: "none" };
}

export function nextOccurrences(
  stream: LiveStreamRow,
  overrides: LiveOverrideRow[],
  now: Date,
  limit = 5,
): Array<{ date: string; cancelled: boolean; live_url: string | null }> {
  const out: Array<{ date: string; cancelled: boolean; live_url: string | null }> = [];
  const seen = new Set<string>();
  const addDate = (dateStr: string) => {
    if (seen.has(dateStr)) return;
    seen.add(dateStr);
    const ov = overrides.find((o) => o.event_date === dateStr);
    out.push({
      date: dateStr,
      cancelled: !!ov?.cancelled,
      live_url: ov?.live_url ?? null,
    });
  };
  if (stream.recurrence === "once") {
    if (stream.event_date) addDate(stream.event_date);
  } else if (stream.weekday !== null && stream.weekday !== undefined) {
    for (let i = 0; i < 60 && out.length < limit; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (d.getDay() === stream.weekday) {
        addDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      }
    }
  }
  return out.slice(0, limit);
}