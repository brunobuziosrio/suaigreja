import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const REDIRECT_URI = "https://suaigreja.top/api/public/instagram/callback";
const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
].join(",");

async function signState(accountId: string): Promise<string> {
  const { createHmac } = await import("node:crypto");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
  const nonce = Math.random().toString(36).slice(2, 12);
  const payload = `${accountId}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
  return `${payload}.${sig}`;
}

export async function verifyState(state: string): Promise<string | null> {
  const { createHmac } = await import("node:crypto");
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [accountId, nonce, sig] = parts;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
  const expected = createHmac("sha256", secret)
    .update(`${accountId}.${nonce}`)
    .digest("hex")
    .slice(0, 32);
  return expected === sig ? accountId : null;
}

/** Returns the Instagram OAuth authorization URL for the current user to connect their IG. */
export const startInstagramConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
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
    return { authorizationUrl: url.toString() };
  });

/** Reads the current user's Instagram connection (if any). */
export const getInstagramConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context;
    const { data } = await supabaseAdmin
      .from("instagram_connections")
      .select("ig_user_id, username, connected_at, token_expires_at")
      .eq("account_id", userId)
      .maybeSingle();
    return data ?? null;
  });

/** Disconnects the current user's Instagram (deletes the stored token). */
export const disconnectInstagram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context;
    await supabaseAdmin.from("instagram_connections").delete().eq("account_id", userId);
    return { ok: true };
  });

export type InstagramPost = {
  id: string;
  caption: string | null;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  permalink: string;
  timestamp: string;
};

async function fetchPostsForAccount(accountId: string, limit = 30): Promise<InstagramPost[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: conn } = await supabaseAdmin
    .from("instagram_connections")
    .select("access_token")
    .eq("account_id", accountId)
    .maybeSingle();
  if (!conn?.access_token) return [];
  const url = new URL("https://graph.instagram.com/v21.0/me/media");
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", conn.access_token);
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("[instagram] fetch media failed", res.status, await res.text());
    return [];
  }
  const body = (await res.json()) as { data?: InstagramPost[] };
  return body.data ?? [];
}

/** Public: returns recent IG posts for a given site slug (or null if no connection). */
export const getPublicInstagramPosts = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
    if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
    return { slug };
  })
  .handler(async ({ data }) => {
    const { setResponseHeaders } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    setResponseHeaders(
      new Headers({
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      }),
    );
    let { data: account } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("custom_slug", data.slug)
      .maybeSingle();
    if (!account) {
      const fb = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("site_id", data.slug)
        .maybeSingle();
      account = fb.data;
    }
    if (!account) return [];
    return fetchPostsForAccount(account.id, 30);
  });

/** Server-only: exchange an OAuth code for tokens and persist the connection. */
export async function completeInstagramOAuth(params: {
  accountId: string;
  code: string;
}): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) throw new Error("Instagram app credentials missing");

  // 1) Short-lived token exchange
  const form = new URLSearchParams();
  form.set("client_id", appId);
  form.set("client_secret", appSecret);
  form.set("grant_type", "authorization_code");
  form.set("redirect_uri", REDIRECT_URI);
  form.set("code", params.code);

  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!shortRes.ok) {
    const t = await shortRes.text();
    throw new Error(`Short token exchange failed: ${shortRes.status} ${t}`);
  }
  const shortBody = (await shortRes.json()) as { access_token: string; user_id: number | string };

  // 2) Long-lived token exchange (60d)
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("access_token", shortBody.access_token);
  const longRes = await fetch(longUrl.toString());
  if (!longRes.ok) {
    const t = await longRes.text();
    throw new Error(`Long token exchange failed: ${longRes.status} ${t}`);
  }
  const longBody = (await longRes.json()) as { access_token: string; expires_in: number };

  // 3) Get username
  const meUrl = new URL("https://graph.instagram.com/v21.0/me");
  meUrl.searchParams.set("fields", "id,username");
  meUrl.searchParams.set("access_token", longBody.access_token);
  const meRes = await fetch(meUrl.toString());
  const me = meRes.ok
    ? ((await meRes.json()) as { id: string; username: string })
    : { id: String(shortBody.user_id), username: "" };

  const expiresAt = new Date(Date.now() + longBody.expires_in * 1000).toISOString();

  // 4) Upsert connection
  const { error } = await supabaseAdmin.from("instagram_connections").upsert(
    {
      account_id: params.accountId,
      ig_user_id: me.id,
      username: me.username || null,
      access_token: longBody.access_token,
      token_expires_at: expiresAt,
    },
    { onConflict: "account_id" },
  );
  if (error) throw new Error(`Persist connection failed: ${error.message}`);
}