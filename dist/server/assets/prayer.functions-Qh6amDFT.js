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
const listPrayerRequests_createServerFn_handler = createServerRpc({
  id: "51146209d2403523b2b68e3d85efa07b33e76f5d66cbcee49d08388de46ef61b",
  name: "listPrayerRequests",
  filename: "src/lib/prayer.functions.ts"
}, (opts) => listPrayerRequests.__executeServer(opts));
const listPrayerRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPrayerRequests_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("prayer_requests").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const updatePrayerStatus_createServerFn_handler = createServerRpc({
  id: "41d78a2a8bf3c02d62aab24813f733f15cc4f9b75694f8667141f3ad02073782",
  name: "updatePrayerStatus",
  filename: "src/lib/prayer.functions.ts"
}, (opts) => updatePrayerStatus.__executeServer(opts));
const updatePrayerStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "archived"])
}).parse(i)).handler(updatePrayerStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("prayer_requests").update({
    status: data.status
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deletePrayerRequest_createServerFn_handler = createServerRpc({
  id: "f5da85c9863c52e1c7998124b2cb7314aec7d4bed4fa6e3acaf98f2a146255c4",
  name: "deletePrayerRequest",
  filename: "src/lib/prayer.functions.ts"
}, (opts) => deletePrayerRequest.__executeServer(opts));
const deletePrayerRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deletePrayerRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("prayer_requests").delete().eq("id", data.id);
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
const getPublicPrayers_createServerFn_handler = createServerRpc({
  id: "081a0291789d3968e51cab4f4411c5bab8332e0154a83745f0dcf0f0012c5a15",
  name: "getPublicPrayers",
  filename: "src/lib/prayer.functions.ts"
}, (opts) => getPublicPrayers.__executeServer(opts));
const getPublicPrayers = createServerFn({
  method: "GET"
}).inputValidator((i) => {
  const siteId = String(i?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
  return {
    siteId
  };
}).handler(getPublicPrayers_createServerFn_handler, async ({
  data
}) => {
  const accountId = await resolveAccountId(data.siteId);
  if (!accountId) return null;
  const {
    data: account
  } = await supabaseAdmin.from("accounts").select("brand_title, primary_color").eq("id", accountId).maybeSingle();
  const {
    data: prayers
  } = await supabaseAdmin.from("prayer_requests").select("id, name, message, is_anonymous, prayer_count, created_at").eq("account_id", accountId).eq("status", "approved").order("created_at", {
    ascending: false
  }).limit(100);
  return {
    account: account ?? {
      brand_title: "Igreja",
      primary_color: "#467da5"
    },
    accountId,
    prayers: (prayers ?? []).map((p) => ({
      ...p,
      name: p.is_anonymous ? "Anônimo" : p.name
    }))
  };
});
const SubmitInput = z.object({
  siteId: z.string().min(1).max(64),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  message: z.string().min(5).max(2e3),
  is_anonymous: z.boolean().default(false)
});
const submitPrayerRequest_createServerFn_handler = createServerRpc({
  id: "2e1a0d48676dbc5fcec2496b5698e80e49ebe4b6de796512c8430840cb15ae7b",
  name: "submitPrayerRequest",
  filename: "src/lib/prayer.functions.ts"
}, (opts) => submitPrayerRequest.__executeServer(opts));
const submitPrayerRequest = createServerFn({
  method: "POST"
}).inputValidator((i) => SubmitInput.parse(i)).handler(submitPrayerRequest_createServerFn_handler, async ({
  data
}) => {
  const accountId = await resolveAccountId(data.siteId);
  if (!accountId) throw new Error("Comunidade não encontrada.");
  const {
    error
  } = await supabaseAdmin.from("prayer_requests").insert({
    account_id: accountId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    message: data.message,
    is_anonymous: data.is_anonymous,
    status: "pending"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const prayForRequest_createServerFn_handler = createServerRpc({
  id: "1f96c94754b775e930ea8c210109676d5239082be7fdfd0e0a356d0dfdff44eb",
  name: "prayForRequest",
  filename: "src/lib/prayer.functions.ts"
}, (opts) => prayForRequest.__executeServer(opts));
const prayForRequest = createServerFn({
  method: "POST"
}).inputValidator((i) => z.object({
  prayerId: z.string().uuid(),
  fingerprint: z.string().min(4).max(80)
}).parse(i)).handler(prayForRequest_createServerFn_handler, async ({
  data
}) => {
  const {
    error: insErr
  } = await supabaseAdmin.from("prayer_interactions").insert({
    prayer_request_id: data.prayerId,
    visitor_fingerprint: data.fingerprint
  });
  if (insErr) {
    return {
      ok: true,
      alreadyPrayed: true
    };
  }
  const {
    data: cur
  } = await supabaseAdmin.from("prayer_requests").select("prayer_count").eq("id", data.prayerId).single();
  await supabaseAdmin.from("prayer_requests").update({
    prayer_count: (cur?.prayer_count ?? 0) + 1
  }).eq("id", data.prayerId);
  return {
    ok: true,
    alreadyPrayed: false
  };
});
export {
  deletePrayerRequest_createServerFn_handler,
  getPublicPrayers_createServerFn_handler,
  listPrayerRequests_createServerFn_handler,
  prayForRequest_createServerFn_handler,
  submitPrayerRequest_createServerFn_handler,
  updatePrayerStatus_createServerFn_handler
};
