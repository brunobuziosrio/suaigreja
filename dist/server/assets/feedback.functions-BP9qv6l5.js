import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
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
async function isAdmin(userId) {
  const {
    data
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}
const listSystemUpdates_createServerFn_handler = createServerRpc({
  id: "b4ab6fdd475a5e269db098380b97b7e982cf9489646a8c8871d5e3ae400064b0",
  name: "listSystemUpdates",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => listSystemUpdates.__executeServer(opts));
const listSystemUpdates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSystemUpdates_createServerFn_handler, async () => {
  const {
    data,
    error
  } = await supabaseAdmin.from("system_updates").select("id, title, content, version, created_at").order("created_at", {
    ascending: false
  }).limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const updateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(1).max(4e3),
  version: z.string().trim().max(40).optional().nullable()
});
const createSystemUpdate_createServerFn_handler = createServerRpc({
  id: "a559b56dc36487c8c22e1e3efc70c4d4b19abf5084b3eb8c5ea8e5b6ec7a5460",
  name: "createSystemUpdate",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => createSystemUpdate.__executeServer(opts));
const createSystemUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => updateSchema.parse(input)).handler(createSystemUpdate_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Acesso negado");
  const {
    error
  } = await supabaseAdmin.from("system_updates").insert({
    title: data.title,
    content: data.content,
    version: data.version || null,
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteSystemUpdate_createServerFn_handler = createServerRpc({
  id: "e4b7436126fe609eb0b8c49acc757ec9f4a2fbd8256afaf3d83d2f7b8b50edf5",
  name: "deleteSystemUpdate",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => deleteSystemUpdate.__executeServer(opts));
const deleteSystemUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteSystemUpdate_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Acesso negado");
  const {
    error
  } = await supabaseAdmin.from("system_updates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const suggestionSchema = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(2e3)
});
const createSuggestion_createServerFn_handler = createServerRpc({
  id: "792ed849e53a88e2a75aabd128f78503e1b0368d9a172614ddbf47e991f75e76",
  name: "createSuggestion",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => createSuggestion.__executeServer(opts));
const createSuggestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => suggestionSchema.parse(input)).handler(createSuggestion_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: acc
  } = await supabaseAdmin.from("accounts").select("id").eq("id", context.userId).maybeSingle();
  const {
    error
  } = await supabaseAdmin.from("feature_suggestions").insert({
    user_id: context.userId,
    account_id: acc?.id ?? null,
    title: data.title,
    message: data.message
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listMySuggestions_createServerFn_handler = createServerRpc({
  id: "4b620a3cd65805f5e944347844894d2350dfd2193f663c1562d679604c9fce66",
  name: "listMySuggestions",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => listMySuggestions.__executeServer(opts));
const listMySuggestions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMySuggestions_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await supabaseAdmin.from("feature_suggestions").select("id, title, message, status, created_at").eq("user_id", context.userId).order("created_at", {
    ascending: false
  }).limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const listAllSuggestions_createServerFn_handler = createServerRpc({
  id: "9bfec0e40bfc14620d9709280eeda6476af6aff12f38578456c6fcb50e6a265b",
  name: "listAllSuggestions",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => listAllSuggestions.__executeServer(opts));
const listAllSuggestions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAllSuggestions_createServerFn_handler, async ({
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Acesso negado");
  const {
    data,
    error
  } = await supabaseAdmin.from("feature_suggestions").select("id, title, message, status, created_at, user_id, account_id").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id).filter(Boolean)));
  const emailMap = /* @__PURE__ */ new Map();
  if (userIds.length) {
    const {
      data: usersData
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1e3
    });
    for (const u of usersData?.users ?? []) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }
  const accIds = Array.from(new Set((data ?? []).map((r) => r.account_id).filter(Boolean)));
  const accMap = /* @__PURE__ */ new Map();
  if (accIds.length) {
    const {
      data: accs
    } = await supabaseAdmin.from("accounts").select("id, brand_title").in("id", accIds);
    for (const a of accs ?? []) accMap.set(a.id, a.brand_title ?? "");
  }
  return (data ?? []).map((r) => ({
    ...r,
    email: r.user_id ? emailMap.get(r.user_id) ?? null : null,
    account_name: r.account_id ? accMap.get(r.account_id) ?? null : null
  }));
});
const deleteSuggestion_createServerFn_handler = createServerRpc({
  id: "96e03f61931eb7c243384fbe6d08294f255a3b20c178b619cad5ee7e586157cf",
  name: "deleteSuggestion",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => deleteSuggestion.__executeServer(opts));
const deleteSuggestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteSuggestion_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Acesso negado");
  const {
    error
  } = await supabaseAdmin.from("feature_suggestions").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  createSuggestion_createServerFn_handler,
  createSystemUpdate_createServerFn_handler,
  deleteSuggestion_createServerFn_handler,
  deleteSystemUpdate_createServerFn_handler,
  listAllSuggestions_createServerFn_handler,
  listMySuggestions_createServerFn_handler,
  listSystemUpdates_createServerFn_handler
};
