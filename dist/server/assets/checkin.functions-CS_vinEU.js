import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn } from "./server-aNfUBU9s.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
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
const listCheckinSessions_createServerFn_handler = createServerRpc({
  id: "514f5210ea460b4733a80082389a266355cd01a46b70486d386ea969b4e5306a",
  name: "listCheckinSessions",
  filename: "src/lib/checkin.functions.ts"
}, (opts) => listCheckinSessions.__executeServer(opts));
const listCheckinSessions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listCheckinSessions_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("checkin_sessions").select("*").eq("account_id", userId).order("session_date", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const listCheckinEntries_createServerFn_handler = createServerRpc({
  id: "656b2725ba30b01798af4865aac02024ecbf26cc5c564a1bb572b4e209ebc8dc",
  name: "listCheckinEntries",
  filename: "src/lib/checkin.functions.ts"
}, (opts) => listCheckinEntries.__executeServer(opts));
const listCheckinEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  session_id: z.string().uuid()
}).parse(i)).handler(listCheckinEntries_createServerFn_handler, async ({
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
  } = await supabase.from("checkin_entries").select("*, members(full_name, photo_url)").eq("account_id", userId).eq("session_id", data.session_id).order("checked_in_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  session_date: z.string(),
  start_time: z.string().optional().nullable(),
  notes: z.string().max(2e3).optional().nullable(),
  active: z.boolean().default(true)
});
const upsertCheckinSession_createServerFn_handler = createServerRpc({
  id: "48ed0650c06125c6742264f9c6fe66713f81f0b5e2b0e3fbe5f535d1ec97bff3",
  name: "upsertCheckinSession",
  filename: "src/lib/checkin.functions.ts"
}, (opts) => upsertCheckinSession.__executeServer(opts));
const upsertCheckinSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertCheckinSession_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payload = {
    ...data,
    account_id: userId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("checkin_sessions").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("checkin_sessions").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteCheckinSession_createServerFn_handler = createServerRpc({
  id: "a807cc612cbbbba0c7d94dfdce7e3e9ceb087679951fb8fe87038e6e6ff5aeac",
  name: "deleteCheckinSession",
  filename: "src/lib/checkin.functions.ts"
}, (opts) => deleteCheckinSession.__executeServer(opts));
const deleteCheckinSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteCheckinSession_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("checkin_sessions").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const publicSchema = z.object({
  session_id: z.string().uuid(),
  member_id: z.string().uuid().optional().nullable(),
  visitor_name: z.string().max(120).optional().nullable(),
  visitor_phone: z.string().max(40).optional().nullable()
});
const publicCheckin_createServerFn_handler = createServerRpc({
  id: "172eae4784224f3149420f5a20758ac94ad509831aeb225d075486739f56ed1c",
  name: "publicCheckin",
  filename: "src/lib/checkin.functions.ts"
}, (opts) => publicCheckin.__executeServer(opts));
const publicCheckin = createServerFn({
  method: "POST"
}).inputValidator((i) => publicSchema.parse(i)).handler(publicCheckin_createServerFn_handler, async ({
  data
}) => {
  const {
    data: session,
    error: sErr
  } = await supabaseAdmin.from("checkin_sessions").select("id, account_id, active, title").eq("id", data.session_id).maybeSingle();
  if (sErr || !session || !session.active) throw new Error("Sessão não encontrada ou encerrada");
  const {
    error: insertErr
  } = await supabaseAdmin.from("checkin_entries").insert({
    account_id: session.account_id,
    session_id: session.id,
    member_id: data.member_id || null,
    visitor_name: data.visitor_name || null,
    visitor_phone: data.visitor_phone || null
  });
  if (insertErr) throw new Error(insertErr.message);
  if (!data.member_id && data.visitor_name) {
    const {
      data: existingVisitor
    } = await supabaseAdmin.from("visitors").select("id").eq("account_id", session.account_id).eq("phone", data.visitor_phone || "").maybeSingle();
    if (!existingVisitor) {
      await supabaseAdmin.from("visitors").insert({
        account_id: session.account_id,
        name: data.visitor_name,
        phone: data.visitor_phone || null,
        status: "new",
        how_found: `Check-in: ${session.title}`
      });
    }
  }
  return {
    ok: true
  };
});
const getPublicCheckinSession_createServerFn_handler = createServerRpc({
  id: "21a5d2452424aa2f06825ae4bade4822073d9792037827ca81fd180facab58f6",
  name: "getPublicCheckinSession",
  filename: "src/lib/checkin.functions.ts"
}, (opts) => getPublicCheckinSession.__executeServer(opts));
const getPublicCheckinSession = createServerFn({
  method: "GET"
}).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(getPublicCheckinSession_createServerFn_handler, async ({
  data
}) => {
  const {
    data: session
  } = await supabaseAdmin.from("checkin_sessions").select("id, title, session_date, start_time, active, account_id").eq("id", data.id).maybeSingle();
  if (!session) return null;
  const {
    data: account
  } = await supabaseAdmin.from("accounts").select("brand_title, brand_logo_url, primary_color").eq("id", session.account_id).maybeSingle();
  return {
    session,
    account
  };
});
export {
  deleteCheckinSession_createServerFn_handler,
  getPublicCheckinSession_createServerFn_handler,
  listCheckinEntries_createServerFn_handler,
  listCheckinSessions_createServerFn_handler,
  publicCheckin_createServerFn_handler,
  upsertCheckinSession_createServerFn_handler
};
