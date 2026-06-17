import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn } from "./server-aNfUBU9s.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
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
const MSG_KINDS = ["birthday", "event_reminder", "welcome", "manual", "culto_reminder", "celula_reminder", "prayer_request", "tithe_reminder", "newsletter"];
const SettingsInput = z.object({
  enabled: z.boolean(),
  send_hour_brt: z.number().int().min(0).max(23),
  sender_name: z.string().max(80).nullable(),
  birthday_enabled: z.boolean(),
  birthday_template: z.string().min(10).max(800),
  welcome_enabled: z.boolean(),
  welcome_template: z.string().min(10).max(800),
  culto_reminder_enabled: z.boolean(),
  culto_reminder_template: z.string().min(10).max(800),
  celula_reminder_enabled: z.boolean(),
  celula_reminder_template: z.string().min(10).max(800),
  prayer_request_enabled: z.boolean(),
  prayer_request_template: z.string().min(10).max(800),
  tithe_reminder_enabled: z.boolean(),
  tithe_reminder_template: z.string().min(10).max(800),
  newsletter_enabled: z.boolean(),
  newsletter_template: z.string().min(10).max(800)
});
const getWhatsappData_createServerFn_handler = createServerRpc({
  id: "0b1a7d021059e2e95a4ad3e2dbce72fb3f3a072ad3df6f9c01224a304c931196",
  name: "getWhatsappData",
  filename: "src/lib/whatsapp.functions.ts"
}, (opts) => getWhatsappData.__executeServer(opts));
const getWhatsappData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getWhatsappData_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const [{
    data: settings
  }, {
    data: packages
  }, {
    data: recent
  }, {
    data: counts
  }] = await Promise.all([supabase.from("whatsapp_settings").select("*").eq("account_id", userId).maybeSingle(), supabase.from("whatsapp_packages").select("*").eq("active", true).order("sort_order"), supabase.from("whatsapp_messages").select("id, kind, phone, recipient_name, content, status, scheduled_for, sent_at, error_message, created_at").eq("account_id", userId).order("created_at", {
    ascending: false
  }).limit(100), supabase.from("whatsapp_messages").select("status, kind").eq("account_id", userId)]);
  const totals = (counts ?? []).reduce((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    acc[`kind_${m.kind}`] = (acc[`kind_${m.kind}`] ?? 0) + 1;
    acc.total = (acc.total ?? 0) + 1;
    return acc;
  }, {
    total: 0
  });
  return {
    settings: settings ?? null,
    packages: packages ?? [],
    recent: recent ?? [],
    totals
  };
});
const upsertWhatsappSettings_createServerFn_handler = createServerRpc({
  id: "f586cf011e79c5a8c2f07c0bd19a231ed27fc6f2f5633d074eab036d0e528f51",
  name: "upsertWhatsappSettings",
  filename: "src/lib/whatsapp.functions.ts"
}, (opts) => upsertWhatsappSettings.__executeServer(opts));
const upsertWhatsappSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => SettingsInput.parse(input)).handler(upsertWhatsappSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("whatsapp_settings").upsert({
    account_id: userId,
    ...data
  }, {
    onConflict: "account_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteQueuedWhatsappMessage_createServerFn_handler = createServerRpc({
  id: "91d42bc5cae84af8af0f00717f09022218898f7aa48732459ea5f2ee39896736",
  name: "deleteQueuedWhatsappMessage",
  filename: "src/lib/whatsapp.functions.ts"
}, (opts) => deleteQueuedWhatsappMessage.__executeServer(opts));
const deleteQueuedWhatsappMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteQueuedWhatsappMessage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("whatsapp_messages").delete().eq("id", data.id).eq("account_id", userId).eq("status", "queued");
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const enqueueWhatsappMessage_createServerFn_handler = createServerRpc({
  id: "8defb47fa5aefe3f234948ee19ff962e347b3cad06bdf60069fb494c624a03dc",
  name: "enqueueWhatsappMessage",
  filename: "src/lib/whatsapp.functions.ts"
}, (opts) => enqueueWhatsappMessage.__executeServer(opts));
const enqueueWhatsappMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  phone: z.string().min(10).max(20),
  recipient_name: z.string().max(200).nullable().optional(),
  content: z.string().min(1).max(800),
  kind: z.enum(MSG_KINDS),
  member_id: z.string().uuid().nullable().optional()
}).parse(input)).handler(enqueueWhatsappMessage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: settings
  } = await supabase.from("whatsapp_settings").select("credits_balance, enabled").eq("account_id", userId).maybeSingle();
  if (!settings?.enabled) throw new Error("WhatsApp não está ativado nas configurações gerais.");
  if ((settings?.credits_balance ?? 0) < 1) throw new Error("Créditos insuficientes. Adquira mais créditos para continuar.");
  const phone = String(data.phone).replace(/\D/g, "");
  if (phone.length < 10) throw new Error("Número de telefone inválido (mínimo 10 dígitos com DDD).");
  const {
    error
  } = await supabase.from("whatsapp_messages").insert({
    account_id: userId,
    member_id: data.member_id ?? null,
    kind: data.kind,
    phone,
    recipient_name: data.recipient_name ?? null,
    content: data.content,
    status: "queued",
    scheduled_for: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteQueuedWhatsappMessage_createServerFn_handler,
  enqueueWhatsappMessage_createServerFn_handler,
  getWhatsappData_createServerFn_handler,
  upsertWhatsappSettings_createServerFn_handler
};
