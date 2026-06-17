import { c as createServerRpc } from "./createServerRpc-C_8Vdjgs.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
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
const listSmallGroups_createServerFn_handler = createServerRpc({
  id: "8109db9f4bd82d3b6c7de381f60de5439c66721eabc0e77d9e6069e2fda9a150",
  name: "listSmallGroups",
  filename: "src/lib/small-groups.functions.ts"
}, (opts) => listSmallGroups.__executeServer(opts));
const listSmallGroups = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSmallGroups_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("small_groups").select("*").eq("account_id", userId).order("sort_order", {
    ascending: true
  }).order("name", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  leader_name: z.string().max(120).optional().nullable(),
  leader_phone: z.string().max(40).optional().nullable(),
  weekday: z.number().int().min(0).max(6).optional().nullable(),
  start_time: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  neighborhood: z.string().max(120).optional().nullable(),
  description: z.string().max(2e3).optional().nullable(),
  capacity: z.number().int().min(0).max(9999).optional().nullable(),
  active: z.boolean().default(true)
});
const upsertSmallGroup_createServerFn_handler = createServerRpc({
  id: "8f918e9fafc40762cd9ceb133e59d2f827199bcd9170396a299a3081c6582126",
  name: "upsertSmallGroup",
  filename: "src/lib/small-groups.functions.ts"
}, (opts) => upsertSmallGroup.__executeServer(opts));
const upsertSmallGroup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertSmallGroup_createServerFn_handler, async ({
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
    } = await supabase.from("small_groups").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("small_groups").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteSmallGroup_createServerFn_handler = createServerRpc({
  id: "f854b6e02559ffb903cab6dfb7f8a578b3a56dfb53eb0495e3d4c06d0afd0a63",
  name: "deleteSmallGroup",
  filename: "src/lib/small-groups.functions.ts"
}, (opts) => deleteSmallGroup.__executeServer(opts));
const deleteSmallGroup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteSmallGroup_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("small_groups").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteSmallGroup_createServerFn_handler,
  listSmallGroups_createServerFn_handler,
  upsertSmallGroup_createServerFn_handler
};
