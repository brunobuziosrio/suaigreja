import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
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
const REDIRECT_URI = "https://suaigreja.top/api/public/instagram/callback";
const SCOPES = ["instagram_business_basic", "instagram_business_manage_messages", "instagram_business_manage_comments", "instagram_business_content_publish", "instagram_business_manage_insights"].join(",");
async function signState(accountId) {
  const {
    createHmac
  } = await import("node:crypto");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
  const nonce = Math.random().toString(36).slice(2, 12);
  const payload = `${accountId}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
  return `${payload}.${sig}`;
}
const startInstagramConnect_createServerFn_handler = createServerRpc({
  id: "c811fd7db0f106c9d94cb23fd4e3eab5b55f4e7f7cde516bebac94e470fb740a",
  name: "startInstagramConnect",
  filename: "src/lib/instagram.functions.ts"
}, (opts) => startInstagramConnect.__executeServer(opts));
const startInstagramConnect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(startInstagramConnect_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) throw new Error("INSTAGRAM_APP_ID não está configurado");
  const state = await signState(userId);
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("force_reauth", "true");
  return {
    authorizationUrl: url.toString()
  };
});
const getInstagramConnection_createServerFn_handler = createServerRpc({
  id: "2b3a6d41dc6818c4d642f5d8f52b3d02a593df6588ab61399b6e78011731dd4b",
  name: "getInstagramConnection",
  filename: "src/lib/instagram.functions.ts"
}, (opts) => getInstagramConnection.__executeServer(opts));
const getInstagramConnection = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getInstagramConnection_createServerFn_handler, async ({
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.js");
  const {
    userId
  } = context;
  const {
    data
  } = await supabaseAdmin.from("instagram_connections").select("ig_user_id, username, connected_at, token_expires_at").eq("account_id", userId).maybeSingle();
  return data ?? null;
});
const disconnectInstagram_createServerFn_handler = createServerRpc({
  id: "995253a1c82ea2f98b207984482cb910589d1e85398f12c28f7833c9546e5525",
  name: "disconnectInstagram",
  filename: "src/lib/instagram.functions.ts"
}, (opts) => disconnectInstagram.__executeServer(opts));
const disconnectInstagram = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(disconnectInstagram_createServerFn_handler, async ({
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.js");
  const {
    userId
  } = context;
  await supabaseAdmin.from("instagram_connections").delete().eq("account_id", userId);
  return {
    ok: true
  };
});
async function fetchPostsForAccount(accountId, limit = 30) {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.js");
  const {
    data: conn
  } = await supabaseAdmin.from("instagram_connections").select("access_token").eq("account_id", accountId).maybeSingle();
  if (!conn?.access_token) return [];
  const url = new URL("https://graph.instagram.com/v21.0/me/media");
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", conn.access_token);
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("[instagram] fetch media failed", res.status, await res.text());
    return [];
  }
  const body = await res.json();
  return body.data ?? [];
}
const getPublicInstagramPosts_createServerFn_handler = createServerRpc({
  id: "6ba7348804860fe1130a990c092d065448a312d9d53003d73c190e393af98848",
  name: "getPublicInstagramPosts",
  filename: "src/lib/instagram.functions.ts"
}, (opts) => getPublicInstagramPosts.__executeServer(opts));
const getPublicInstagramPosts = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(getPublicInstagramPosts_createServerFn_handler, async ({
  data
}) => {
  const {
    setResponseHeaders
  } = await import("./server-B-ZH7zOM.js");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.js");
  setResponseHeaders(new Headers({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900"
  }));
  let {
    data: account
  } = await supabaseAdmin.from("accounts").select("id").eq("custom_slug", data.slug).maybeSingle();
  if (!account) {
    const fb = await supabaseAdmin.from("accounts").select("id").eq("site_id", data.slug).maybeSingle();
    account = fb.data;
  }
  if (!account) return [];
  return fetchPostsForAccount(account.id, 30);
});
export {
  disconnectInstagram_createServerFn_handler,
  getInstagramConnection_createServerFn_handler,
  getPublicInstagramPosts_createServerFn_handler,
  startInstagramConnect_createServerFn_handler
};
