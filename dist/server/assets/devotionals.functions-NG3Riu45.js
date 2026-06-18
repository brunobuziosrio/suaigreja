import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
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
const listDevotionals_createServerFn_handler = createServerRpc({
  id: "b95adc4d43bc4011e33e97fb5fad6d2eb5d67a42768242e85e5c57544393eeb0",
  name: "listDevotionals",
  filename: "src/lib/devotionals.functions.ts"
}, (opts) => listDevotionals.__executeServer(opts));
const listDevotionals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listDevotionals_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("devotionals").select("*").eq("account_id", userId).order("devotional_date", {
    ascending: false
  }).limit(60);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  devotional_date: z.string(),
  verse_ref: z.string().min(1).max(120),
  verse_text: z.string().min(1).max(2e3),
  message: z.string().max(4e3).optional().nullable(),
  published: z.boolean().default(true)
});
const upsertDevotional_createServerFn_handler = createServerRpc({
  id: "7379c03d4faec14278dfe53579562ed3fdfa1ad081c2241db06888ccb7c9df3d",
  name: "upsertDevotional",
  filename: "src/lib/devotionals.functions.ts"
}, (opts) => upsertDevotional.__executeServer(opts));
const upsertDevotional = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertDevotional_createServerFn_handler, async ({
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
    } = await supabase.from("devotionals").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("devotionals").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteDevotional_createServerFn_handler = createServerRpc({
  id: "1e81932655f857b6e4134c3df07a6a26a64b9fc7f0b1134afe51bc4c00ca04a5",
  name: "deleteDevotional",
  filename: "src/lib/devotionals.functions.ts"
}, (opts) => deleteDevotional.__executeServer(opts));
const deleteDevotional = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteDevotional_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("devotionals").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getTodayDevotional_createServerFn_handler = createServerRpc({
  id: "0f8095683ab6925e7aebf2affb0583658496cfec94ccb32446e0eaf236c56a33",
  name: "getTodayDevotional",
  filename: "src/lib/devotionals.functions.ts"
}, (opts) => getTodayDevotional.__executeServer(opts));
const getTodayDevotional = createServerFn({
  method: "GET"
}).inputValidator((i) => z.object({
  account_id: z.string().uuid()
}).parse(i)).handler(getTodayDevotional_createServerFn_handler, async ({
  data
}) => {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: row
  } = await supabaseAdmin.from("devotionals").select("verse_ref, verse_text, message, devotional_date").eq("account_id", data.account_id).eq("published", true).lte("devotional_date", today).order("devotional_date", {
    ascending: false
  }).limit(1).maybeSingle();
  return row;
});
export {
  deleteDevotional_createServerFn_handler,
  getTodayDevotional_createServerFn_handler,
  listDevotionals_createServerFn_handler,
  upsertDevotional_createServerFn_handler
};
