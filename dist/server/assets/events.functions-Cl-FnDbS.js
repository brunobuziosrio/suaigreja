import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn } from "./server-aNfUBU9s.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
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
const listSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
const listEvents_createServerFn_handler = createServerRpc({
  id: "c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9",
  name: "listEvents",
  filename: "src/lib/events.functions.ts"
}, (opts) => listEvents.__executeServer(opts));
const listEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => listSchema.parse(i)).handler(listEvents_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("events").select("*").eq("account_id", userId).gte("event_date", data.from).lte("event_date", data.to).order("event_date", {
    ascending: true
  }).order("start_time", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  location_id: z.string().uuid(),
  type_id: z.string().uuid(),
  description: z.string().max(500).optional().nullable(),
  show_type: z.boolean().optional(),
  is_live: z.boolean().optional(),
  live_url: z.string().url().max(500).optional().nullable()
});
const upsertEvent_createServerFn_handler = createServerRpc({
  id: "f783d064126a6698039e7eec74f0fcc451e4bfd0e3115f6a3e31192fd1c505a6",
  name: "upsertEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => upsertEvent.__executeServer(opts));
const upsertEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const [{
    data: loc,
    error: locErr
  }, {
    data: typ,
    error: typErr
  }] = await Promise.all([supabase.from("locations").select("name").eq("id", data.location_id).eq("account_id", userId).maybeSingle(), supabase.from("celebration_types").select("name").eq("id", data.type_id).eq("account_id", userId).maybeSingle()]);
  if (locErr) throw new Error(locErr.message);
  if (typErr) throw new Error(typErr.message);
  if (!loc) throw new Error("Local não encontrado");
  if (!typ) throw new Error("Tipo não encontrado");
  const payload = {
    account_id: userId,
    event_date: data.event_date,
    start_time: data.start_time,
    end_time: data.end_time || null,
    location_id: data.location_id,
    type_id: data.type_id,
    location_name: loc.name,
    type_name: typ.name,
    description: data.description || null,
    show_type: data.show_type ?? false,
    is_live: data.is_live ?? false,
    live_url: data.live_url || null
  };
  if (data.id) {
    const {
      error
    } = await supabase.from("events").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabase.from("events").insert(payload);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const deleteEvent_createServerFn_handler = createServerRpc({
  id: "283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da",
  name: "deleteEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => deleteEvent.__executeServer(opts));
const deleteEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("events").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteEvent_createServerFn_handler,
  listEvents_createServerFn_handler,
  upsertEvent_createServerFn_handler
};
