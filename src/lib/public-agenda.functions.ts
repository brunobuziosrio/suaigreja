import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { LiveStreamRow, LiveOverrideRow } from "@/lib/live-streams.shared";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function expandLiveStreams(
  streams: LiveStreamRow[],
  overrides: LiveOverrideRow[],
  fromIso: string,
  toIso: string,
) {
  const out: Array<{
    id: string;
    event_date: string;
    start_time: string;
    end_time: string | null;
    location_name: string;
    type_name: string;
    type_id: string | null;
    description: string | null;
    show_type: boolean;
    is_live: boolean;
    live_url: string | null;
  }> = [];

  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  const start = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  const totalDays = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));

  const pushOcc = (s: LiveStreamRow, dateStr: string) => {
    const ov = overrides.find((o) => o.live_stream_id === s.id && o.event_date === dateStr);
    if (ov?.cancelled) return;
    const url = (ov?.live_url && ov.live_url.length > 0 ? ov.live_url : s.default_live_url) ?? null;
    out.push({
      id: `live:${s.id}:${dateStr}`,
      event_date: dateStr,
      start_time: s.start_time,
      end_time: null,
      location_name: s.title,
      type_name: "Transmissão",
      type_id: null,
      description: null,
      show_type: true,
      is_live: true,
      live_url: url,
    });
  };

  for (const s of streams) {
    if (!s.active) continue;
    if (s.recurrence === "once") {
      if (s.event_date && s.event_date >= fromIso && s.event_date <= toIso) {
        pushOcc(s, s.event_date);
      }
    } else if (s.weekday !== null && s.weekday !== undefined) {
      for (let i = 0; i <= totalDays; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        if (d.getDay() === s.weekday) {
          pushOcc(s, `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        }
      }
    }
  }
  return out;
}

export const getPublicAgenda = createServerFn({ method: "GET" })
  .inputValidator((input: { siteId: string }) => {
    const siteId = String(input?.siteId || "").slice(0, 64);
    if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site_id");
    return { siteId };
  })
  .handler(async ({ data }) => {
    const lookup = data.siteId.toLowerCase();
    // Resolve by custom_slug first (case-insensitive), then fall back to site_id.
    let { data: account } = await supabaseAdmin
      .from("accounts")
      .select("id, site_id, brand_title, brand_subtitle, brand_empty_message, brand_today_title, primary_color, force_show_type")
      .eq("custom_slug", lookup)
      .maybeSingle();
    if (!account) {
      const fallback = await supabaseAdmin
        .from("accounts")
        .select("id, site_id, brand_title, brand_subtitle, brand_empty_message, brand_today_title, primary_color, force_show_type")
        .eq("site_id", data.siteId)
        .maybeSingle();
      account = fallback.data;
    }
    if (!account) return null;

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const h = new Date(today);
    h.setDate(h.getDate() + 90);
    const to = `${h.getFullYear()}-${pad(h.getMonth() + 1)}-${pad(h.getDate())}`;

    const { data: events } = await supabaseAdmin
      .from("events")
      .select("id, event_date, start_time, end_time, location_name, type_name, type_id, description, show_type, is_live, live_url")
      .eq("account_id", account.id)
      .gte("event_date", from)
      .lte("event_date", to)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    const { data: types } = await supabaseAdmin
      .from("celebration_types")
      .select("id, name, color, icon")
      .eq("account_id", account.id);

    const [{ data: streams }, { data: overrides }] = await Promise.all([
      supabaseAdmin
        .from("live_streams")
        .select("id, title, recurrence, weekday, event_date, start_time, duration_minutes, minutes_before, default_live_url, active, sort_order")
        .eq("account_id", account.id),
      supabaseAdmin
        .from("live_stream_overrides")
        .select("live_stream_id, event_date, live_url, cancelled")
        .eq("account_id", account.id)
        .gte("event_date", from)
        .lte("event_date", to),
    ]);

    const liveOccurrences = expandLiveStreams(
      (streams ?? []) as LiveStreamRow[],
      (overrides ?? []) as LiveOverrideRow[],
      from,
      to,
    );

    const { data: epRows } = await supabaseAdmin
      .from("event_pages")
      .select("id, title, event_date, start_time, location_name")
      .eq("account_id", account.id)
      .eq("active", true)
      .gte("event_date", from)
      .lte("event_date", to);
    const epOccurrences = (epRows ?? []).map((e: any) => ({
      id: `evp:${e.id}`,
      event_date: e.event_date,
      start_time: e.start_time || "00:00",
      end_time: null,
      location_name: e.title,
      type_name: "Evento",
      type_id: null,
      description: e.location_name || null,
      show_type: true,
      is_live: false,
      live_url: null,
    }));

    const merged = [...(events ?? []), ...liveOccurrences, ...epOccurrences].sort((a, b) => {
      if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
      return (a.start_time || "").localeCompare(b.start_time || "");
    });

    return {
      account: {
        brand_title: account.brand_title,
        brand_subtitle: account.brand_subtitle,
        brand_empty_message: account.brand_empty_message,
        brand_today_title: account.brand_today_title,
        primary_color: account.primary_color,
        force_show_type: account.force_show_type,
      },
      events: merged,
      types: types ?? [],
    };
  });