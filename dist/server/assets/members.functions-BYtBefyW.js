import { c as createServerRpc } from "./createServerRpc-C_8Vdjgs.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
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
const listMembers_createServerFn_handler = createServerRpc({
  id: "b7f69ca8c31846e3e8e27a7ded678ada2faeaaaa74d025348bd7d70d7e81d0f1",
  name: "listMembers",
  filename: "src/lib/members.functions.ts"
}, (opts) => listMembers.__executeServer(opts));
const listMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMembers_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("members").select("*").eq("account_id", userId).order("full_name", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(1).max(160),
  photo_url: z.string().max(800).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  marital_status: z.string().max(30).optional().nullable(),
  role: z.string().max(40),
  member_since: z.string().optional().nullable(),
  status: z.string().max(20),
  address_street: z.string().max(200).optional().nullable(),
  address_number: z.string().max(20).optional().nullable(),
  address_city: z.string().max(100).optional().nullable(),
  address_state: z.string().max(40).optional().nullable(),
  notes: z.string().max(2e3).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  congregation: z.string().max(160).optional().nullable(),
  is_tither: z.boolean().optional().default(false)
});
const upsertMember_createServerFn_handler = createServerRpc({
  id: "bdf01295617cad23066a31e82f26251fbdfa906f69f952b1315d95f1f6d98f86",
  name: "upsertMember",
  filename: "src/lib/members.functions.ts"
}, (opts) => upsertMember.__executeServer(opts));
const upsertMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(upsertMember_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payload = {
    full_name: data.full_name.trim(),
    photo_url: data.photo_url || null,
    email: data.email ? data.email.trim() : null,
    phone: data.phone?.trim() || null,
    birth_date: data.birth_date || null,
    gender: data.gender || null,
    marital_status: data.marital_status || null,
    role: data.role,
    member_since: data.member_since || null,
    status: data.status,
    address_street: data.address_street?.trim() || null,
    address_number: data.address_number?.trim() || null,
    address_city: data.address_city?.trim() || null,
    address_state: data.address_state?.trim() || null,
    notes: data.notes?.trim() || null,
    cpf: data.cpf?.trim() || null,
    congregation: data.congregation?.trim() || null,
    is_tither: data.is_tither ?? false
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("members").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("members").insert({
    ...payload,
    account_id: userId
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteMember_createServerFn_handler = createServerRpc({
  id: "880b26f143e8525de3dd9db731e9ee5f5934f9412a6d8c0ee6ef3ec51205fa29",
  name: "deleteMember",
  filename: "src/lib/members.functions.ts"
}, (opts) => deleteMember.__executeServer(opts));
const deleteMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteMember_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("members").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getPublicMemberCard_createServerFn_handler = createServerRpc({
  id: "64c86fc6bb4f1706a4fdab294f6568b13c13fc880f3638afcd805f16ee683451",
  name: "getPublicMemberCard",
  filename: "src/lib/members.functions.ts"
}, (opts) => getPublicMemberCard.__executeServer(opts));
const getPublicMemberCard = createServerFn({
  method: "GET"
}).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(getPublicMemberCard_createServerFn_handler, async ({
  data
}) => {
  const {
    data: m,
    error
  } = await supabaseAdmin.from("members").select("id, full_name, photo_url, role, member_since, birth_date, status, account_id, cpf, congregation").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!m) return null;
  const {
    data: acc
  } = await supabaseAdmin.from("accounts").select("brand_title, brand_logo_url, primary_color, custom_slug, site_id, card_logo_url, card_logo_height_px, card_accent_color, card_footer_text, card_title_size_px, card_footer_size_px, card_field_size_px, card_label_size_px").eq("id", m.account_id).maybeSingle();
  const safeMember = {
    id: m.id,
    full_name: m.full_name,
    photo_url: m.photo_url,
    role: m.role,
    member_since: m.member_since,
    status: m.status,
    account_id: m.account_id,
    congregation: m.congregation,
    cpf: m.cpf,
    birth_date: m.birth_date
  };
  return {
    member: safeMember,
    church: acc ?? null
  };
});
export {
  deleteMember_createServerFn_handler,
  getPublicMemberCard_createServerFn_handler,
  listMembers_createServerFn_handler,
  upsertMember_createServerFn_handler
};
