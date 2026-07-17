import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { supabaseAdmin } from "./integrations/supabase/client.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

type DomainRoute = {
  slug: string;
  expiresAt: number;
};

const customDomainCache = new Map<string, DomainRoute>();
const PLATFORM_HOSTS = new Set([
  "suaigreja.top",
  "www.suaigreja.top",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

function normalizeHost(host: string | null) {
  return (host ?? "").toLowerCase().split(":")[0].replace(/^www\./, "");
}

function isPublicAssetPath(pathname: string) {
  return (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_build/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon-") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json"
  );
}

async function resolveCustomDomain(host: string): Promise<DomainRoute | null> {
  if (!host || PLATFORM_HOSTS.has(host)) return null;

  const cached = customDomainCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("site_id, custom_slug")
    .eq("custom_domain", host)
    .eq("custom_domain_status", "verified")
    .maybeSingle();

  if (error || !data) {
    customDomainCache.delete(host);
    return null;
  }

  const route = {
    slug: data.custom_slug || data.site_id,
    expiresAt: Date.now() + 60_000,
  };
  customDomainCache.set(host, route);
  return route;
}

async function rewriteCustomDomainRequest(request: Request) {
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

  const requestInit: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: request.redirect,
    signal: request.signal,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    requestInit.body = request.body;
    requestInit.duplex = "half";
  }

  return new Request(url, requestInit);
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/health") {
        const { error } = await supabaseAdmin.from("accounts").select("id").limit(1);
        const healthy = !error;
        return Response.json({ status: healthy ? "ok" : "degraded", database: healthy ? "ok" : "unavailable", timestamp: new Date().toISOString() }, {
          status: healthy ? 200 : 503,
          headers: { "cache-control": "no-store" },
        });
      }
      const handler = await getServerEntry();
      const routedRequest = await rewriteCustomDomainRequest(request);
      const response = await handler.fetch(routedRequest, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
