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
const listVisitors_createServerFn_handler = createServerRpc({
  id: "45c12f7920aed087d41dc046b2ec0085f1afab9a74d2d597a5b01f5f36be9324",
  name: "listVisitors",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => listVisitors.__executeServer(opts));
const listVisitors = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listVisitors_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("visitors").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const updateVisitorStatus_createServerFn_handler = createServerRpc({
  id: "e8667fe4ae82af20010a57282b0dda0b4a0eb5420974889f867ec1ba2d6da0ad",
  name: "updateVisitorStatus",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => updateVisitorStatus.__executeServer(opts));
const updateVisitorStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "member", "archived"])
}).parse(i)).handler(updateVisitorStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("visitors").update({
    status: data.status
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateVisitorNotes_createServerFn_handler = createServerRpc({
  id: "187b9e6107ae08a9b0ce45cfa5fa508d245e655a2016371d706a5d287c92feac",
  name: "updateVisitorNotes",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => updateVisitorNotes.__executeServer(opts));
const updateVisitorNotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid(),
  notes: z.string().max(2e3)
}).parse(i)).handler(updateVisitorNotes_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("visitors").update({
    notes: data.notes
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteVisitor_createServerFn_handler = createServerRpc({
  id: "986c5863971bf59042ca406d64258ef5b6a01d4d667995955ed161324d966e88",
  name: "deleteVisitor",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => deleteVisitor.__executeServer(opts));
const deleteVisitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteVisitor_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("visitors").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getVisitorSettings_createServerFn_handler = createServerRpc({
  id: "a7d67100242bef50c701aa6353f07dc0ac44d0d1c6f6c78075922f2fd2a617a6",
  name: "getVisitorSettings",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => getVisitorSettings.__executeServer(opts));
const getVisitorSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getVisitorSettings_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("accounts").select("site_id, custom_slug, visitor_whatsapp, visitor_welcome_message, brand_title, primary_color").eq("id", userId).single();
  return data;
});
const saveVisitorSettings_createServerFn_handler = createServerRpc({
  id: "98f25de12fe735399d11024af4f494ba9e05d00785e09eaea3b80c9bfeb5525e",
  name: "saveVisitorSettings",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => saveVisitorSettings.__executeServer(opts));
const saveVisitorSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  visitor_whatsapp: z.string().max(40).optional(),
  visitor_welcome_message: z.string().max(500).optional()
}).parse(i)).handler(saveVisitorSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("accounts").update({
    visitor_whatsapp: data.visitor_whatsapp || null,
    visitor_welcome_message: data.visitor_welcome_message || null
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
async function resolveAccountId(siteId) {
  const lookup = siteId.toLowerCase();
  const {
    data: a1
  } = await supabaseAdmin.from("accounts").select("id").eq("custom_slug", lookup).maybeSingle();
  if (a1) return a1.id;
  const {
    data: a2
  } = await supabaseAdmin.from("accounts").select("id").eq("site_id", siteId).maybeSingle();
  return a2?.id ?? null;
}
const getPublicVisitorForm_createServerFn_handler = createServerRpc({
  id: "f768ca88e70c2310e647afcadbb91c5a509aa6bb78740c1ad3cf3e8730efb934",
  name: "getPublicVisitorForm",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => getPublicVisitorForm.__executeServer(opts));
const getPublicVisitorForm = createServerFn({
  method: "GET"
}).inputValidator((i) => {
  const siteId = String(i?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
  return {
    siteId
  };
}).handler(getPublicVisitorForm_createServerFn_handler, async ({
  data
}) => {
  const accountId = await resolveAccountId(data.siteId);
  if (!accountId) return null;
  const {
    data: account
  } = await supabaseAdmin.from("accounts").select("brand_title, primary_color, visitor_welcome_message").eq("id", accountId).maybeSingle();
  return account;
});
const VisitorInput = z.object({
  siteId: z.string().min(1).max(64),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30).optional().or(z.literal("")),
  email: z.string().email().max(160).optional().or(z.literal("")),
  age_range: z.string().max(20).optional(),
  how_found: z.string().max(80).optional(),
  is_first_time: z.boolean().default(true),
  prayer_request: z.string().max(1e3).optional(),
  allow_contact: z.boolean().default(true)
});
const submitVisitor_createServerFn_handler = createServerRpc({
  id: "4b5430ce98b070199c8632b0738b0a720cd9e7fc1b0ef1c7e5c6ece951710c5a",
  name: "submitVisitor",
  filename: "src/lib/visitors.functions.ts"
}, (opts) => submitVisitor.__executeServer(opts));
const submitVisitor = createServerFn({
  method: "POST"
}).inputValidator((i) => VisitorInput.parse(i)).handler(submitVisitor_createServerFn_handler, async ({
  data
}) => {
  const accountId = await resolveAccountId(data.siteId);
  if (!accountId) throw new Error("Comunidade não encontrada.");
  const {
    error
  } = await supabaseAdmin.from("visitors").insert({
    account_id: accountId,
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    age_range: data.age_range || null,
    how_found: data.how_found || null,
    is_first_time: data.is_first_time,
    prayer_request: data.prayer_request || null,
    allow_contact: data.allow_contact,
    status: "new"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteVisitor_createServerFn_handler,
  getPublicVisitorForm_createServerFn_handler,
  getVisitorSettings_createServerFn_handler,
  listVisitors_createServerFn_handler,
  saveVisitorSettings_createServerFn_handler,
  submitVisitor_createServerFn_handler,
  updateVisitorNotes_createServerFn_handler,
  updateVisitorStatus_createServerFn_handler
};
