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
const listTypes_createServerFn_handler = createServerRpc({
  id: "8630dbc933fd37e262b4e12d2f3d872918fcb3a820867b983891641c26986b62",
  name: "listTypes",
  filename: "src/lib/types.functions.ts"
}, (opts) => listTypes.__executeServer(opts));
const listTypes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTypes_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("celebration_types").select("*").eq("account_id", userId).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  active: z.boolean().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(8).optional()
});
const upsertType_createServerFn_handler = createServerRpc({
  id: "d2698d757da9e7ab3735f3cc22ae08e6dbd5cc3dc42d0fc644a05092413d7de1",
  name: "upsertType",
  filename: "src/lib/types.functions.ts"
}, (opts) => upsertType.__executeServer(opts));
const upsertType = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertType_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (data.id) {
    const {
      error
    } = await supabase.from("celebration_types").update({
      name: data.name,
      active: data.active ?? true,
      color: data.color ?? "#467da5",
      icon: data.icon ?? ""
    }).eq("id", data.id).eq("account_id", userId);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabase.from("celebration_types").insert({
      account_id: userId,
      name: data.name,
      active: data.active ?? true,
      color: data.color ?? "#467da5",
      icon: data.icon ?? ""
    });
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const deleteType_createServerFn_handler = createServerRpc({
  id: "e210c93408e1024b87db0bb69ce6731f58410fc743dca9f3021ad2bae36584c6",
  name: "deleteType",
  filename: "src/lib/types.functions.ts"
}, (opts) => deleteType.__executeServer(opts));
const deleteType = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteType_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("celebration_types").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteType_createServerFn_handler,
  listTypes_createServerFn_handler,
  upsertType_createServerFn_handler
};
