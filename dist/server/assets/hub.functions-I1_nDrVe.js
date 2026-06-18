import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn, s as setResponseHeaders } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
import { c as computeLiveStatus, n as nowInBRT } from "./live-streams.shared-CQmWsiqd.js";
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
const VIDEO_CACHE = /* @__PURE__ */ new Map();
const CHANNEL_ID_CACHE = /* @__PURE__ */ new Map();
const TTL_MS = 60 * 60 * 1e3;
function extractChannelIdFromUrl(url) {
  const m = url.match(/\/channel\/(UC[\w-]{20,})/);
  return m ? m[1] : null;
}
async function resolveChannelId(rawUrl) {
  const url = rawUrl.trim();
  if (!url) return null;
  const direct = extractChannelIdFromUrl(url);
  if (direct) return direct;
  const cached = CHANNEL_ID_CACHE.get(url);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.id;
  try {
    let target = url;
    if (!/^https?:\/\//i.test(target)) {
      const handle = target.replace(/^@/, "");
      target = `https://www.youtube.com/@${handle}`;
    }
    const res = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SuaIgrejaBot/1.0; +https://suaigreja.top)",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
      }
    });
    if (!res.ok) {
      CHANNEL_ID_CACHE.set(url, { ts: Date.now(), id: null });
      return null;
    }
    const html = await res.text();
    let id = null;
    const m1 = html.match(/"channelId":"(UC[\w-]{20,})"/);
    if (m1) id = m1[1];
    if (!id) {
      const m2 = html.match(
        /<link\s+rel=["']canonical["']\s+href=["'][^"']*\/channel\/(UC[\w-]{20,})["']/i
      );
      if (m2) id = m2[1];
    }
    if (!id) {
      const m3 = html.match(/\/channel\/(UC[\w-]{20,})/);
      if (m3) id = m3[1];
    }
    CHANNEL_ID_CACHE.set(url, { ts: Date.now(), id });
    return id;
  } catch {
    CHANNEL_ID_CACHE.set(url, { ts: Date.now(), id: null });
    return null;
  }
}
function parseFeed(xml, limit) {
  const entries = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = re.exec(xml)) && entries.length < limit) {
    const block = match[1];
    const id = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = block.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];
    const thumb = block.match(/<media:thumbnail\s+url="([^"]+)"/)?.[1];
    if (!id || !title) continue;
    entries.push({
      id,
      title: decodeXmlEntities(title),
      published_at: published || "",
      thumbnail: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`
    });
  }
  return entries;
}
function decodeXmlEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}
async function fetchYoutubeVideos(rawUrl, limit = 5) {
  if (!rawUrl) return [];
  const channelId = await resolveChannelId(rawUrl);
  if (!channelId) return [];
  const key = `${channelId}:${limit}`;
  const cached = VIDEO_CACHE.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.videos;
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(feedUrl);
    if (!res.ok) return cached?.videos ?? [];
    const xml = await res.text();
    const videos = parseFeed(xml, limit);
    VIDEO_CACHE.set(key, { ts: Date.now(), videos });
    return videos;
  } catch {
    return cached?.videos ?? [];
  }
}
function buildAudioEmbed(rawUrl) {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;
  if (/soundcloud\.com/i.test(url)) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23467da5&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    return { provider: "soundcloud", src, height: 420 };
  }
  const sp = url.match(
    /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(show|episode|playlist|album|track|artist)\/([A-Za-z0-9]+)/i
  );
  if (sp) {
    const [, kind, id] = sp;
    const src = `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator`;
    return { provider: "spotify", src, height: kind === "show" ? 420 : 352 };
  }
  if (/^https?:\/\//i.test(url)) {
    return { provider: "iframe", src: url, height: 420 };
  }
  return null;
}
const RESERVED = /* @__PURE__ */ new Set(["a", "admin", "api", "app", "assets", "auth", "agenda", "billing", "dashboard", "embed", "help", "login", "logout", "marketplace", "onboarding", "public", "root", "settings", "signin", "signup", "static", "support", "types", "locations", "www", "e", "o", "v", "h", "n", "oracoes", "eventos", "visitantes", "hub", "noticias"]);
const getPublicHub_createServerFn_handler = createServerRpc({
  id: "bed65d7c2e6ff2d5aec73e1397bfd52cb63c48bd55870a35e52d1e6ab51e1135",
  name: "getPublicHub",
  filename: "src/lib/hub.functions.ts"
}, (opts) => getPublicHub.__executeServer(opts));
const getPublicHub = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(getPublicHub_createServerFn_handler, async ({
  data
}) => {
  if (RESERVED.has(data.slug)) return null;
  setResponseHeaders(new Headers({
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
  }));
  let {
    data: account
  } = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, hub_enabled, hub_bio, hub_cover_url, hub_show_agenda, hub_show_events, hub_show_prayer, hub_show_visitor, hub_show_all_locations, social_instagram, social_youtube, social_facebook, social_website, pix_key, live_url, brand_title, brand_subtitle, brand_empty_message, brand_today_title, brand_logo_url, brand_logo_height_px, force_show_type, primary_color, visitor_whatsapp, hub_whatsapp, hub_show_whatsapp, weekly_message, weekly_verse, weekly_verse_ref, gallery_urls, hub_slides, hub_highlights, cta_label, cta_enabled, media_youtube_url, media_audio_url, media_show_youtube, media_show_audio, donations_fixed_image_url, instagram_post_count, instagram_columns").eq("custom_slug", data.slug).maybeSingle();
  if (!account) {
    const fb = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, hub_enabled, hub_bio, hub_cover_url, hub_show_agenda, hub_show_events, hub_show_prayer, hub_show_visitor, hub_show_all_locations, social_instagram, social_youtube, social_facebook, social_website, pix_key, live_url, brand_title, brand_subtitle, brand_empty_message, brand_today_title, brand_logo_url, brand_logo_height_px, force_show_type, primary_color, visitor_whatsapp, hub_whatsapp, hub_show_whatsapp, weekly_message, weekly_verse, weekly_verse_ref, gallery_urls, hub_slides, hub_highlights, cta_label, cta_enabled, media_youtube_url, media_audio_url, media_show_youtube, media_show_audio, donations_fixed_image_url, instagram_post_count, instagram_columns").eq("site_id", data.slug).maybeSingle();
    account = fb.data;
  }
  if (!account || !account.hub_enabled) return null;
  let agenda = [];
  let agendaTypes = [];
  if (account.hub_show_agenda) {
    const today = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    const to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    const {
      data: ev
    } = await supabaseAdmin.from("events").select("id, event_date, start_time, end_time, location_name, type_name, type_id, description, show_type, is_live, live_url").eq("account_id", account.id).gte("event_date", from).lte("event_date", to).order("event_date", {
      ascending: true
    }).order("start_time", {
      ascending: true
    }).limit(20);
    const [{
      data: streamRows2
    }, {
      data: overrideRows2
    }] = await Promise.all([supabaseAdmin.from("live_streams").select("id, title, recurrence, weekday, event_date, start_time, duration_minutes, minutes_before, default_live_url, active, sort_order").eq("account_id", account.id).eq("active", true), supabaseAdmin.from("live_stream_overrides").select("live_stream_id, event_date, live_url, cancelled").eq("account_id", account.id).gte("event_date", from).lte("event_date", to)]);
    const liveOcc = [];
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const totalDays = 30;
    for (const s of streamRows2 ?? []) {
      const push = (dateStr) => {
        const ov = (overrideRows2 ?? []).find((o) => o.live_stream_id === s.id && o.event_date === dateStr);
        if (ov?.cancelled) return;
        const url = (ov?.live_url && ov.live_url.length > 0 ? ov.live_url : s.default_live_url) ?? null;
        liveOcc.push({
          id: `live:${s.id}:${dateStr}`,
          event_date: dateStr,
          start_time: s.start_time,
          end_time: null,
          location_name: s.title,
          type_name: "Transmissão",
          type_id: null,
          description: null,
          show_type: true,
          is_live: true,
          live_url: url
        });
      };
      if (s.recurrence === "once") {
        if (s.event_date && s.event_date >= from && s.event_date <= to) push(s.event_date);
      } else if (s.weekday !== null && s.weekday !== void 0) {
        for (let i = 0; i <= totalDays; i++) {
          const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
          if (d.getDay() === s.weekday) {
            push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
          }
        }
      }
    }
    agenda = [...ev ?? [], ...liveOcc].sort((a, b) => {
      if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
      return (a.start_time || "").localeCompare(b.start_time || "");
    });
    const {
      data: tps
    } = await supabaseAdmin.from("celebration_types").select("id, name, color, icon").eq("account_id", account.id);
    agendaTypes = tps ?? [];
  }
  let events = [];
  if (account.hub_show_events) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const {
      data: ep
    } = await supabaseAdmin.from("event_pages").select("id, slug, title, description, event_date, start_time, location_name, cover_image_url, price_cents").eq("account_id", account.id).eq("active", true).gte("event_date", today).order("event_date", {
      ascending: true
    }).limit(6);
    events = ep ?? [];
  }
  if (account.hub_show_agenda) {
    const today = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    const to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    const {
      data: epAll
    } = await supabaseAdmin.from("event_pages").select("id, slug, title, event_date, start_time, location_name").eq("account_id", account.id).eq("active", true).gte("event_date", from).lte("event_date", to).order("event_date", {
      ascending: true
    });
    const epOcc = (epAll ?? []).map((e) => ({
      id: `evp:${e.id}`,
      event_date: e.event_date,
      start_time: e.start_time || "00:00",
      end_time: null,
      location_name: e.title,
      type_name: "Evento",
      type_id: null,
      description: e.location_name || null,
      show_type: true,
      is_live: false,
      live_url: null
    }));
    agenda = [...agenda, ...epOcc].sort((a, b) => {
      if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
      return (a.start_time || "").localeCompare(b.start_time || "");
    });
  }
  const {
    data: newsData
  } = await supabaseAdmin.from("news_posts").select("id, title, subtitle, content, image_url, created_at").eq("account_id", account.id).eq("published", true).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  }).limit(6);
  const news = newsData ?? [];
  const {
    data: locsData
  } = await supabaseAdmin.from("locations").select("id, name, address, is_main, phone, whatsapp, office_hours, transport_info, maps_url, waze_url, uber_url, sort_order, latitude, longitude, place_id, neighborhood, city, state, postal_code, country").eq("account_id", account.id).eq("active", true).order("is_main", {
    ascending: false
  }).order("sort_order", {
    ascending: true
  });
  const locations = (locsData ?? []).filter((l) => l.address);
  const location = locations[0] ?? null;
  const {
    data: pr
  } = await supabaseAdmin.from("prayer_requests").select("id, name, message, is_anonymous, prayer_count, created_at").eq("account_id", account.id).eq("status", "approved").order("created_at", {
    ascending: false
  }).limit(6);
  const prayers = (pr ?? []).map((p) => ({
    id: p.id,
    name: p.is_anonymous ? "Anônimo" : p.name,
    message: p.message,
    prayer_count: p.prayer_count,
    created_at: p.created_at
  }));
  const {
    data: donationsData
  } = await supabaseAdmin.from("donation_campaigns").select("id, title, description, image_url, goal_cents, featured").eq("account_id", account.id).eq("active", true).order("featured", {
    ascending: false
  }).order("sort_order", {
    ascending: true
  }).limit(4);
  const donations = donationsData ?? [];
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: devRow
  } = await supabaseAdmin.from("devotionals").select("verse_ref, verse_text, message, devotional_date").eq("account_id", account.id).eq("published", true).lte("devotional_date", todayStr).order("devotional_date", {
    ascending: false
  }).limit(1).maybeSingle();
  const devotional = devRow ?? null;
  const [{
    data: streamRows
  }, {
    data: overrideRows
  }] = await Promise.all([supabaseAdmin.from("live_streams").select("id, title, recurrence, weekday, event_date, start_time, duration_minutes, minutes_before, default_live_url, active, sort_order").eq("account_id", account.id).eq("active", true), supabaseAdmin.from("live_stream_overrides").select("live_stream_id, event_date, live_url, cancelled").eq("account_id", account.id)]);
  const streams = streamRows ?? [];
  const overrides = overrideRows ?? [];
  const liveStatus = computeLiveStatus(streams, overrides, nowInBRT());
  const liveSchedule = streams.filter((s) => s.recurrence === "weekly" && s.weekday !== null).map((s) => ({
    title: s.title,
    weekday: s.weekday,
    start_time: s.start_time
  }));
  const showYoutube = account.media_show_youtube !== false;
  const showAudio = account.media_show_audio !== false;
  const youtubeVideos = showYoutube ? await fetchYoutubeVideos(account.media_youtube_url, 5) : [];
  const audioEmbed = showAudio ? buildAudioEmbed(account.media_audio_url) : null;
  return {
    account,
    agenda,
    agendaTypes,
    events,
    news,
    location,
    locations,
    prayers,
    donations,
    liveStatus,
    liveSchedule,
    youtubeVideos,
    audioEmbed,
    devotional
  };
});
const SlideSchema = z.object({
  image_url: z.string().url().max(500),
  title: z.string().max(120).nullable(),
  subtitle: z.string().max(200).nullable(),
  cta_label: z.string().max(40).nullable(),
  cta_url: z.string().max(500).nullable(),
  title_size: z.enum(["sm", "md", "lg", "xl"]).nullable().optional()
});
const HighlightSchema = z.object({
  icon: z.string().min(1).max(40),
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  sublabel: z.string().max(120).nullable()
});
const HubSettingsInput = z.object({
  hub_enabled: z.boolean(),
  hub_bio: z.string().max(500).nullable(),
  hub_cover_url: z.string().url().max(500).nullable(),
  hub_show_agenda: z.boolean(),
  hub_show_events: z.boolean(),
  hub_show_prayer: z.boolean(),
  hub_show_visitor: z.boolean(),
  hub_show_all_locations: z.boolean().optional(),
  social_instagram: z.string().max(200).nullable(),
  social_youtube: z.string().max(200).nullable(),
  social_facebook: z.string().max(200).nullable(),
  social_website: z.string().max(200).nullable(),
  pix_key: z.string().max(200).nullable().optional(),
  live_url: z.string().max(300).nullable(),
  hub_whatsapp: z.string().max(30).nullable(),
  hub_show_whatsapp: z.boolean(),
  weekly_message: z.string().max(1e3).nullable(),
  weekly_verse: z.string().max(500).nullable(),
  weekly_verse_ref: z.string().max(100).nullable(),
  gallery_urls: z.array(z.string().url().max(500)).max(12),
  hub_slides: z.array(SlideSchema).max(8),
  hub_highlights: z.array(HighlightSchema).max(6),
  media_youtube_url: z.string().max(300).nullable().optional(),
  media_audio_url: z.string().max(500).nullable().optional(),
  media_show_youtube: z.boolean().optional(),
  media_show_audio: z.boolean().optional(),
  instagram_post_count: z.number().int().min(3).max(30).optional(),
  instagram_columns: z.number().int().min(2).max(6).optional()
});
const updateHubSettings_createServerFn_handler = createServerRpc({
  id: "520e2a8e6553eb7091205dfb29f8c13213d4452935c7a2bf94c68581db130295",
  name: "updateHubSettings",
  filename: "src/lib/hub.functions.ts"
}, (opts) => updateHubSettings.__executeServer(opts));
const updateHubSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => HubSettingsInput.parse(input)).handler(updateHubSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("accounts").update(data).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listMyNews_createServerFn_handler = createServerRpc({
  id: "24bfad6b7472d3c53d57aa03340c5619c3f6925ec5e9858cb82b656426a6458b",
  name: "listMyNews",
  filename: "src/lib/hub.functions.ts"
}, (opts) => listMyNews.__executeServer(opts));
const listMyNews = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyNews_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("news_posts").select("id, title, subtitle, content, image_url, published, sort_order, created_at").order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const NewsInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300),
  content: z.string().max(1e4),
  image_url: z.string().url().max(500).nullable(),
  published: z.boolean(),
  sort_order: z.number().int().min(0).max(9999)
});
const upsertNews_createServerFn_handler = createServerRpc({
  id: "8894fe714735b86f9977ddbbfdeb47120917d0b9dd5dffe09b5eb5357e078811",
  name: "upsertNews",
  filename: "src/lib/hub.functions.ts"
}, (opts) => upsertNews.__executeServer(opts));
const upsertNews = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => NewsInput.parse(input)).handler(upsertNews_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const row = {
    ...data,
    account_id: userId
  };
  const {
    error
  } = data.id ? await supabase.from("news_posts").update(row).eq("id", data.id) : await supabase.from("news_posts").insert(row);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteNews_createServerFn_handler = createServerRpc({
  id: "d9251c9c8094c3d38d24a7bf28685b4c34dda89aad058492f87927f8bb625494",
  name: "deleteNews",
  filename: "src/lib/hub.functions.ts"
}, (opts) => deleteNews.__executeServer(opts));
const deleteNews = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteNews_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("news_posts").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ALLOWED_IMAGE_MIME = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]);
const ALLOWED_IMAGE_EXT = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "webp", "gif", "ico"]);
const UploadInput = z.object({
  folder: z.enum(["hub-cover", "gallery", "slide", "news", "product-images"]),
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(100).refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
    message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO."
  }),
  // base64-encoded file bytes (no data: prefix), max ~8MB encoded
  base64: z.string().min(1).max(12e6)
});
const uploadHubAsset_createServerFn_handler = createServerRpc({
  id: "0dbcdb0249b0ffe1d46fbc680a516566217d1c4a5c2133c629b7a3c1b48ad9e6",
  name: "uploadHubAsset",
  filename: "src/lib/hub.functions.ts"
}, (opts) => uploadHubAsset.__executeServer(opts));
const uploadHubAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => UploadInput.parse(input)).handler(uploadHubAsset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  let ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${data.folder}-${Date.now()}-${rand}.${ext}`;
  const bytes = Buffer.from(data.base64, "base64");
  const contentType = data.contentType.toLowerCase();
  const bucket = data.folder === "product-images" ? "product-images" : "event-covers";
  const {
    error
  } = await supabaseAdmin.storage.from(bucket).upload(path, bytes, {
    contentType: contentType === "image/x-icon" || contentType === "image/vnd.microsoft.icon" ? "image/png" : contentType,
    upsert: false
  });
  if (error) throw new Error(error.message);
  const {
    data: pub
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return {
    url: pub.publicUrl
  };
});
const SignInput = z.object({
  folder: z.enum(["hub-cover", "gallery", "slide", "news"]),
  filename: z.string().min(1).max(120)
});
const createHubUploadUrl_createServerFn_handler = createServerRpc({
  id: "ed8b645863bbaa87458bf6c7cde61e9312766091e8e4a2ec1d7647143d578de6",
  name: "createHubUploadUrl",
  filename: "src/lib/hub.functions.ts"
}, (opts) => createHubUploadUrl.__executeServer(opts));
const createHubUploadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => SignInput.parse(input)).handler(createHubUploadUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  let ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${data.folder}-${Date.now()}-${rand}.${ext}`;
  const {
    data: signed,
    error
  } = await supabaseAdmin.storage.from("event-covers").createSignedUploadUrl(path);
  if (error || !signed) throw new Error(error?.message || "Falha ao gerar URL de upload");
  const {
    data: pub
  } = supabaseAdmin.storage.from("event-covers").getPublicUrl(path);
  return {
    path,
    token: signed.token,
    publicUrl: pub.publicUrl
  };
});
const CHROME_COLS = "id, site_id, custom_slug, brand_title, brand_logo_url, brand_logo_height_px, hub_bio, primary_color, hub_show_agenda, hub_show_prayer, hub_show_visitor, hub_show_events, social_instagram, social_youtube, social_facebook, social_website, visitor_whatsapp, hub_whatsapp, hub_show_whatsapp, live_url, pix_key, cta_label, cta_enabled";
const getHubChrome_createServerFn_handler = createServerRpc({
  id: "1b7e5b400025e5852038477f99f170afd92d610e72dd959a007bc8e05fc4c8dc",
  name: "getHubChrome",
  filename: "src/lib/hub.functions.ts"
}, (opts) => getHubChrome.__executeServer(opts));
const getHubChrome = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const siteId = String(input?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site_id");
  return {
    siteId
  };
}).handler(getHubChrome_createServerFn_handler, async ({
  data
}) => {
  const lookup = data.siteId.toLowerCase();
  let {
    data: acc
  } = await supabaseAdmin.from("accounts").select(CHROME_COLS).eq("custom_slug", lookup).maybeSingle();
  if (!acc) {
    const fb = await supabaseAdmin.from("accounts").select(CHROME_COLS).eq("site_id", data.siteId).maybeSingle();
    acc = fb.data;
  }
  return acc ?? null;
});
const getPublicNews_createServerFn_handler = createServerRpc({
  id: "e3624534a8e6bdbe76d11b9606a441f4bbf0bd35ed1fd5e67f0a8ac8cd677ace",
  name: "getPublicNews",
  filename: "src/lib/hub.functions.ts"
}, (opts) => getPublicNews.__executeServer(opts));
const getPublicNews = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(getPublicNews_createServerFn_handler, async ({
  data
}) => {
  let {
    data: account
  } = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled").eq("custom_slug", data.slug).maybeSingle();
  if (!account) {
    const fb = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled").eq("site_id", data.slug).maybeSingle();
    account = fb.data;
  }
  if (!account || !account.hub_enabled) return null;
  const {
    data: newsData
  } = await supabaseAdmin.from("news_posts").select("id, title, subtitle, content, image_url, created_at").eq("account_id", account.id).eq("published", true).order("created_at", {
    ascending: false
  }).limit(100);
  return {
    account: {
      site_id: account.site_id,
      custom_slug: account.custom_slug,
      brand_title: account.brand_title,
      primary_color: account.primary_color
    },
    news: newsData ?? []
  };
});
const getPublicNewsPost_createServerFn_handler = createServerRpc({
  id: "b34310bca8f55380afd281a367603f74bd557965a485e99a788adf1bfae73afe",
  name: "getPublicNewsPost",
  filename: "src/lib/hub.functions.ts"
}, (opts) => getPublicNewsPost.__executeServer(opts));
const getPublicNewsPost = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  const postId = String(input?.postId || "");
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  if (!/^[0-9a-f-]{36}$/i.test(postId)) throw new Error("invalid post id");
  return {
    slug,
    postId
  };
}).handler(getPublicNewsPost_createServerFn_handler, async ({
  data
}) => {
  let {
    data: account
  } = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled").eq("custom_slug", data.slug).maybeSingle();
  if (!account) {
    const fb = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled").eq("site_id", data.slug).maybeSingle();
    account = fb.data;
  }
  if (!account || !account.hub_enabled) return null;
  const {
    data: post
  } = await supabaseAdmin.from("news_posts").select("id, title, subtitle, content, image_url, created_at").eq("account_id", account.id).eq("id", data.postId).eq("published", true).maybeSingle();
  if (!post) return null;
  const {
    data: related
  } = await supabaseAdmin.from("news_posts").select("id, title, image_url, created_at").eq("account_id", account.id).eq("published", true).neq("id", post.id).order("created_at", {
    ascending: false
  }).limit(3);
  return {
    account: {
      site_id: account.site_id,
      custom_slug: account.custom_slug,
      brand_title: account.brand_title,
      primary_color: account.primary_color
    },
    post,
    related: related ?? []
  };
});
export {
  createHubUploadUrl_createServerFn_handler,
  deleteNews_createServerFn_handler,
  getHubChrome_createServerFn_handler,
  getPublicHub_createServerFn_handler,
  getPublicNewsPost_createServerFn_handler,
  getPublicNews_createServerFn_handler,
  listMyNews_createServerFn_handler,
  updateHubSettings_createServerFn_handler,
  uploadHubAsset_createServerFn_handler,
  upsertNews_createServerFn_handler
};
