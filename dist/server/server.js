import { createClient } from "@supabase/supabase-js";
let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
      ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
const client_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  supabaseAdmin
}, Symbol.toStringTag, { value: "Module" }));
let serverEntryPromise;
const customDomainCache = /* @__PURE__ */ new Map();
const PLATFORM_HOSTS = /* @__PURE__ */ new Set([
  "suaigreja.top",
  "www.suaigreja.top",
  "localhost",
  "127.0.0.1",
  "0.0.0.0"
]);
function normalizeHost(host) {
  return (host ?? "").toLowerCase().split(":")[0].replace(/^www\./, "");
}
function isPublicAssetPath(pathname) {
  return pathname.startsWith("/assets/") || pathname.startsWith("/api/") || pathname.startsWith("/_build/") || pathname.startsWith("/favicon") || pathname.startsWith("/icon-") || pathname === "/manifest.json";
}
async function resolveCustomDomain(host) {
  if (!host || PLATFORM_HOSTS.has(host)) return null;
  const cached = customDomainCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }
  const { data, error } = await supabaseAdmin.from("accounts").select("site_id, custom_slug").eq("custom_domain", host).eq("custom_domain_status", "verified").maybeSingle();
  if (error || !data) {
    customDomainCache.delete(host);
    return null;
  }
  const route = {
    slug: data.custom_slug || data.site_id,
    expiresAt: Date.now() + 6e4
  };
  customDomainCache.set(host, route);
  return route;
}
async function rewriteCustomDomainRequest(request) {
  const url = new URL(request.url);
  if (isPublicAssetPath(url.pathname)) return request;
  const host = normalizeHost(request.headers.get("host"));
  const domainRoute = await resolveCustomDomain(host);
  if (!domainRoute) return request;
  let nextPath = url.pathname;
  if (nextPath === "/" || nextPath === "") nextPath = `/${domainRoute.slug}`;
  else if (nextPath === "/agenda") nextPath = `/a/${domainRoute.slug}`;
  else if (nextPath === "/eventos") nextPath = `/eventos/${domainRoute.slug}`;
  else if (nextPath === "/noticias") nextPath = `/n/${domainRoute.slug}`;
  else if (nextPath === "/oracao" || nextPath === "/oracoes") nextPath = `/o/${domainRoute.slug}`;
  else if (nextPath === "/visitantes") nextPath = `/v/${domainRoute.slug}`;
  else if (nextPath === "/doacoes") nextPath = `/d/${domainRoute.slug}`;
  if (nextPath === url.pathname) return request;
  url.pathname = nextPath;
  const headers = new Headers(request.headers);
  headers.set("x-suaigreja-custom-domain", host);
  headers.set("x-suaigreja-domain-slug", domainRoute.slug);
  const requestInit = {
    method: request.method,
    headers,
    redirect: request.redirect,
    signal: request.signal
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    requestInit.body = request.body;
    requestInit.duplex = "half";
  }
  return new Request(url, requestInit);
}
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./assets/server-Bkwhd4uB.js").then((n) => n.i).then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}
function brandedErrorResponse() {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
function isCatastrophicSsrErrorBody(body, responseStatus) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }
  const fields = payload;
  const expectedKeys = /* @__PURE__ */ new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }
  return fields.unhandled === true && fields.message === "HTTPError" && (fields.status === void 0 || fields.status === responseStatus);
}
async function normalizeCatastrophicSsrResponse(response) {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}
const server = {
  async fetch(request, env, ctx) {
    try {
      const handler = await getServerEntry();
      const routedRequest = await rewriteCustomDomainRequest(request);
      const response = await handler.fetch(routedRequest, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  }
};
export {
  client_server as c,
  server as default,
  renderErrorPage as r,
  supabaseAdmin as s
};
