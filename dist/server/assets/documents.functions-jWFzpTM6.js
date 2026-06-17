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
const listDocumentTemplates_createServerFn_handler = createServerRpc({
  id: "efa320aa986ffda6055cc767266f5037639f55c6e8656b7adda87bd9abdd9523",
  name: "listDocumentTemplates",
  filename: "src/lib/documents.functions.ts"
}, (opts) => listDocumentTemplates.__executeServer(opts));
const listDocumentTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listDocumentTemplates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("document_templates").select("*").or(`is_global.eq.true,account_id.eq.${userId}`).eq("active", true).order("is_global", {
    ascending: false
  }).order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const listMemberDocuments_createServerFn_handler = createServerRpc({
  id: "cf9dc24cd8709d1b7e869e41282d21a3d35b9a81ee128142a78e931b606c4754",
  name: "listMemberDocuments",
  filename: "src/lib/documents.functions.ts"
}, (opts) => listMemberDocuments.__executeServer(opts));
const listMemberDocuments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMemberDocuments_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("member_documents").select("*, members(full_name)").eq("account_id", userId).order("issued_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const issueSchema = z.object({
  id: z.string().uuid().optional(),
  template_id: z.string().uuid().nullable().optional(),
  member_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1e4),
  issued_at: z.string().optional()
});
const upsertMemberDocument_createServerFn_handler = createServerRpc({
  id: "2ea37dbf5f02b1cc4bb63189b76a5fcc02ad4305f527ac76edf77953726625cd",
  name: "upsertMemberDocument",
  filename: "src/lib/documents.functions.ts"
}, (opts) => upsertMemberDocument.__executeServer(opts));
const upsertMemberDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => issueSchema.parse(i)).handler(upsertMemberDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payload = {
    template_id: data.template_id || null,
    member_id: data.member_id || null,
    title: data.title,
    body: data.body,
    issued_at: data.issued_at || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("member_documents").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("member_documents").insert({
    ...payload,
    account_id: userId
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteMemberDocument_createServerFn_handler = createServerRpc({
  id: "7d82a60efe5bf0af48533cb674c02701532d3f0f452109a357478871ae420b25",
  name: "deleteMemberDocument",
  filename: "src/lib/documents.functions.ts"
}, (opts) => deleteMemberDocument.__executeServer(opts));
const deleteMemberDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteMemberDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("member_documents").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteMemberDocument_createServerFn_handler,
  listDocumentTemplates_createServerFn_handler,
  listMemberDocuments_createServerFn_handler,
  upsertMemberDocument_createServerFn_handler
};
