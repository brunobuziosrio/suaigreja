import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  recurrence: z.enum(["weekly", "once"]),
  weekday: z.number().int().min(0).max(6).nullable(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_minutes: z.number().int().min(5).max(720),
  minutes_before: z.number().int().min(0).max(180),
  default_live_url: z.string().url().max(500).nullable(),
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999).optional()
});
const listLiveStreams_createServerFn_handler = createServerRpc({
  id: "faed6e5154c6e5bacbd9d2e2a831bd865c0ad0284b73f7c9755999360169ae01",
  name: "listLiveStreams",
  filename: "src/lib/live-streams.functions.ts"
}, (opts) => listLiveStreams.__executeServer(opts));
const listLiveStreams = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listLiveStreams_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const [{
    data: streams,
    error
  }, {
    data: overrides,
    error: ovErr
  }] = await Promise.all([supabase.from("live_streams").select("id, title, recurrence, weekday, event_date, start_time, duration_minutes, minutes_before, default_live_url, active, sort_order").eq("account_id", userId).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  }), supabase.from("live_stream_overrides").select("id, live_stream_id, event_date, live_url, cancelled").eq("account_id", userId)]);
  if (error) throw new Error(error.message);
  if (ovErr) throw new Error(ovErr.message);
  return {
    streams: streams ?? [],
    overrides: overrides ?? []
  };
});
const upsertLiveStream_createServerFn_handler = createServerRpc({
  id: "bbb28bdec19643272ad0a0b859eb49f7ccaee5933c708270c05eb63cc34ef226",
  name: "upsertLiveStream",
  filename: "src/lib/live-streams.functions.ts"
}, (opts) => upsertLiveStream.__executeServer(opts));
const upsertLiveStream = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertLiveStream_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payload = {
    account_id: userId,
    title: data.title,
    recurrence: data.recurrence,
    weekday: data.recurrence === "weekly" ? data.weekday : null,
    event_date: data.recurrence === "once" ? data.event_date : null,
    start_time: data.start_time,
    duration_minutes: data.duration_minutes,
    minutes_before: data.minutes_before,
    default_live_url: data.default_live_url,
    active: data.active,
    sort_order: data.sort_order ?? 0
  };
  if (data.id) {
    const {
      error
    } = await supabase.from("live_streams").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabase.from("live_streams").insert(payload);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const deleteLiveStream_createServerFn_handler = createServerRpc({
  id: "c17234f15eaf7f37f21c54a5e2e20dc44d866d83cf613833da65d41de5999e2b",
  name: "deleteLiveStream",
  filename: "src/lib/live-streams.functions.ts"
}, (opts) => deleteLiveStream.__executeServer(opts));
const deleteLiveStream = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteLiveStream_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("live_streams").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const overrideSchema = z.object({
  live_stream_id: z.string().uuid(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  live_url: z.string().url().max(500).nullable(),
  cancelled: z.boolean()
});
const upsertLiveStreamOverride_createServerFn_handler = createServerRpc({
  id: "860702f08f127cbd5a89b9b6303462c1b38236fb5653282423d0d5920666cea6",
  name: "upsertLiveStreamOverride",
  filename: "src/lib/live-streams.functions.ts"
}, (opts) => upsertLiveStreamOverride.__executeServer(opts));
const upsertLiveStreamOverride = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => overrideSchema.parse(i)).handler(upsertLiveStreamOverride_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (!data.live_url && !data.cancelled) {
    const {
      error: error2
    } = await supabase.from("live_stream_overrides").delete().eq("account_id", userId).eq("live_stream_id", data.live_stream_id).eq("event_date", data.event_date);
    if (error2) throw new Error(error2.message);
    return {
      ok: true
    };
  }
  const {
    error
  } = await supabase.from("live_stream_overrides").upsert({
    account_id: userId,
    live_stream_id: data.live_stream_id,
    event_date: data.event_date,
    live_url: data.live_url,
    cancelled: data.cancelled
  }, {
    onConflict: "live_stream_id,event_date"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteLiveStream_createServerFn_handler,
  listLiveStreams_createServerFn_handler,
  upsertLiveStreamOverride_createServerFn_handler,
  upsertLiveStream_createServerFn_handler
};
