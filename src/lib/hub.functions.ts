import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  computeLiveStatus,
  nowInBRT,
  type LiveStreamRow,
  type LiveOverrideRow,
} from "@/lib/live-streams.shared";
import { fetchYoutubeVideos, buildAudioEmbed } from "@/lib/media.server";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";
import { getReligionTerms } from "@/lib/religion-profiles";

const RESERVED = new Set([
  "a",
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "agenda",
  "billing",
  "dashboard",
  "embed",
  "help",
  "login",
  "logout",
  "marketplace",
  "onboarding",
  "public",
  "root",
  "settings",
  "signin",
  "signup",
  "static",
  "support",
  "types",
  "locations",
  "www",
  "e",
  "o",
  "v",
  "h",
  "n",
  "oracoes",
  "eventos",
  "visitantes",
  "hub",
  "noticias",
]);

const SlugInput = z.object({
  slug: z
    .string()
    .transform((slug) => slug.toLowerCase().slice(0, 64))
    .refine((slug) => /^[a-z0-9_-]+$/.test(slug), "invalid slug"),
});

const SiteIdInput = z.object({
  siteId: z
    .string()
    .transform((siteId) => siteId.slice(0, 64))
    .refine((siteId) => /^[a-zA-Z0-9_-]+$/.test(siteId), "invalid site_id"),
});

const PublicNewsPostInput = SlugInput.extend({
  postId: z.string().regex(/^[0-9a-f-]{36}$/i, "invalid post id"),
});

type AgendaItem = {
  id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  type_name: string | null;
  type_id: string | null;
  description: string | null;
  show_type: boolean | null;
  is_live: boolean | null;
  live_url: string | null;
};

type EventPageAgendaRow = {
  id: string;
  // Eventos ativos publicados exigem slug e título; o hub só os expõe nessa forma.
  slug: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  location_name: string | null;
  cover_image_url: string | null;
  price_cents: number;
};

type LocationRow = {
  id: string;
  name: string;
  address: string | null;
  is_main: boolean;
  phone: string | null;
  whatsapp: string | null;
  office_hours: string | null;
  transport_info: string | null;
  maps_url: string | null;
  waze_url: string | null;
  uber_url: string | null;
  sort_order: number;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

type HubMediaSettings = {
  media_youtube_url: string | null;
  media_audio_url: string | null;
  media_show_youtube: boolean | null;
  media_show_audio: boolean | null;
};

function compareAgendaItems(a: AgendaItem, b: AgendaItem) {
  if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
  return (a.start_time || "").localeCompare(b.start_time || "");
}

export const getPublicHub = createServerFn({ method: "GET" })
  .validator((input) => SlugInput.parse(input))
  .handler(async ({ data }) => {
    if (RESERVED.has(data.slug)) return null;

    // Edge cache: público, 60s fresh + 5min stale-while-revalidate.
    // Reduz drasticamente queries no Postgres para hubs muito visitados.
    setResponseHeaders(
      new Headers({
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      }),
    );

    let { data: account } = await supabaseAdmin
      .from("accounts")
      .select(
        "id, site_id, custom_slug, hub_enabled, hub_bio, hub_cover_url, hub_show_agenda, hub_show_events, hub_show_prayer, hub_show_visitor, hub_show_all_locations, social_instagram, social_youtube, social_facebook, social_website, pix_key, live_url, brand_title, brand_subtitle, brand_empty_message, brand_today_title, brand_logo_url, brand_logo_height_px, brand_footer_logo_url, force_show_type, primary_color, visitor_whatsapp, hub_whatsapp, hub_show_whatsapp, weekly_message, weekly_verse, weekly_verse_ref, gallery_urls, hub_slides, hub_highlights, cta_label, cta_enabled, media_youtube_url, media_audio_url, media_show_youtube, media_show_audio, donations_fixed_image_url, instagram_post_count, instagram_columns",
      )
      .eq("custom_slug", data.slug)
      .maybeSingle();

    if (!account) {
      const fb = await supabaseAdmin
        .from("accounts")
        .select(
          "id, site_id, custom_slug, hub_enabled, hub_bio, hub_cover_url, hub_show_agenda, hub_show_events, hub_show_prayer, hub_show_visitor, hub_show_all_locations, social_instagram, social_youtube, social_facebook, social_website, pix_key, live_url, brand_title, brand_subtitle, brand_empty_message, brand_today_title, brand_logo_url, brand_logo_height_px, brand_footer_logo_url, force_show_type, primary_color, visitor_whatsapp, hub_whatsapp, hub_show_whatsapp, weekly_message, weekly_verse, weekly_verse_ref, gallery_urls, hub_slides, hub_highlights, cta_label, cta_enabled, media_youtube_url, media_audio_url, media_show_youtube, media_show_audio, donations_fixed_image_url, instagram_post_count, instagram_columns",
        )
        .eq("site_id", data.slug)
        .maybeSingle();
      account = fb.data;
    }
    if (!account || !account.hub_enabled) return null;

    // Next agenda items (today + 14 days)
    let agenda: AgendaItem[] = [];
    let agendaTypes: Array<{ id: string; name: string; color: string | null; icon: string | null }> = [];
    if (account.hub_show_agenda) {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const end = new Date(today);
      end.setDate(end.getDate() + 30);
      const to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
      const { data: ev } = await supabaseAdmin
        .from("events")
        .select(
          "id, event_date, start_time, end_time, location_name, type_name, type_id, description, show_type, is_live, live_url",
        )
        .eq("account_id", account.id)
        .gte("event_date", from)
        .lte("event_date", to)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(20);
      // Also expand live_streams (recurring + one-off) so the agenda summary
      // shows transmissões alongside regular events.
      const [{ data: streamRows }, { data: overrideRows }] = await Promise.all([
        supabaseAdmin
          .from("live_streams")
          .select(
            "id, title, recurrence, weekday, event_date, start_time, duration_minutes, minutes_before, default_live_url, active, sort_order",
          )
          .eq("account_id", account.id)
          .eq("active", true),
        supabaseAdmin
          .from("live_stream_overrides")
          .select("live_stream_id, event_date, live_url, cancelled")
          .eq("account_id", account.id)
          .gte("event_date", from)
          .lte("event_date", to),
      ]);
      const liveOcc: AgendaItem[] = [];
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const totalDays = 30;
      for (const s of (streamRows ?? []) as LiveStreamRow[]) {
        const push = (dateStr: string) => {
          const ov = ((overrideRows ?? []) as LiveOverrideRow[]).find(
            (o) => o.live_stream_id === s.id && o.event_date === dateStr,
          );
          if (ov?.cancelled) return;
          const url =
            (ov?.live_url && ov.live_url.length > 0 ? ov.live_url : s.default_live_url) ?? null;
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
            live_url: url,
          });
        };
        if (s.recurrence === "once") {
          if (s.event_date && s.event_date >= from && s.event_date <= to) push(s.event_date);
        } else if (s.weekday !== null && s.weekday !== undefined) {
          for (let i = 0; i <= totalDays; i++) {
            const d = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate() + i,
            );
            if (d.getDay() === s.weekday) {
              push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
            }
          }
        }
      }
      agenda = [...((ev ?? []) as AgendaItem[]), ...liveOcc].sort(compareAgendaItems);
      const { data: tps } = await supabaseAdmin
        .from("celebration_types")
        .select("id, name, color, icon")
        .eq("account_id", account.id);
      agendaTypes = (tps ?? []) as typeof agendaTypes;
    }

    let events: EventPageAgendaRow[] = [];
    if (account.hub_show_events) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: ep } = await supabaseAdmin
        .from("event_pages")
        .select(
          "id, slug, title, description, event_date, start_time, location_name, cover_image_url, price_cents",
        )
        .eq("account_id", account.id)
        .eq("active", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(6);
      events = ep ?? [];
    }

    // Merge event_pages into the agenda as "Evento" items so the agenda
    // summary reflects everything that's scheduled (including paid/free
    // event pages with their own landing page).
    if (account.hub_show_agenda) {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const end = new Date(today);
      end.setDate(end.getDate() + 30);
      const to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
      const { data: epAll } = await supabaseAdmin
        .from("event_pages")
        .select("id, slug, title, event_date, start_time, location_name")
        .eq("account_id", account.id)
        .eq("active", true)
        .gte("event_date", from)
        .lte("event_date", to)
        .order("event_date", { ascending: true });
      const epOcc = ((epAll ?? []) as EventPageAgendaRow[]).map(
        (e): AgendaItem => ({
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
          live_url: null,
        }),
      );
      agenda = [...agenda, ...epOcc].sort(compareAgendaItems);
    }

    const { data: newsData } = await supabaseAdmin
      .from("news_posts")
      .select("id, title, subtitle, content, image_url, created_at")
      .eq("account_id", account.id)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);
    const news = newsData ?? [];

    // All active locations (matriz + capelas) — for the "Onde estamos" section
    const { data: locsData } = await supabaseAdmin
      .from("locations")
      .select(
        "id, name, address, is_main, phone, whatsapp, office_hours, transport_info, maps_url, waze_url, uber_url, sort_order, latitude, longitude, place_id, neighborhood, city, state, postal_code, country",
      )
      .eq("account_id", account.id)
      .eq("active", true)
      .order("is_main", { ascending: false })
      .order("sort_order", { ascending: true });
    const locations = ((locsData ?? []) as LocationRow[]).filter((l) => l.address);
    // Backwards-compat: keep "location" as first one for legacy consumers.
    const location = locations[0] ?? null;

    // Recent approved prayer intentions (anonymized)
    const { data: pr } = await supabaseAdmin
      .from("prayer_requests")
      .select("id, name, message, is_anonymous, prayer_count, created_at")
      .eq("account_id", account.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);
    const prayers = (pr ?? []).map((p) => ({
      id: p.id,
      name: p.is_anonymous ? "Anônimo" : p.name,
      message: p.message,
      prayer_count: p.prayer_count,
      created_at: p.created_at,
    }));

    // Active donation campaigns (preview on home)
    const { data: donationsData } = await supabaseAdmin
      .from("donation_campaigns")
      .select("id, title, description, image_url, goal_cents, featured")
      .eq("account_id", account.id)
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(4);
    const donations = donationsData ?? [];

    // Today's published devotional, when available.
    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: devRow } = await supabaseAdmin
      .from("devotionals")
      .select("verse_ref, verse_text, message, devotional_date")
      .eq("account_id", account.id)
      .eq("published", true)
      .lte("devotional_date", todayStr)
      .order("devotional_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    const devotional = devRow ?? null;

    // Live transmissions: compute current/upcoming + weekly schedule for display
    const [{ data: streamRows }, { data: overrideRows }] = await Promise.all([
      supabaseAdmin
        .from("live_streams")
        .select(
          "id, title, recurrence, weekday, event_date, start_time, duration_minutes, minutes_before, default_live_url, active, sort_order",
        )
        .eq("account_id", account.id)
        .eq("active", true),
      supabaseAdmin
        .from("live_stream_overrides")
        .select("live_stream_id, event_date, live_url, cancelled")
        .eq("account_id", account.id),
    ]);
    const streams = (streamRows ?? []) as LiveStreamRow[];
    const overrides = (overrideRows ?? []) as LiveOverrideRow[];
    const liveStatus = computeLiveStatus(streams, overrides, nowInBRT());
    const liveSchedule = streams
      .filter((s) => s.recurrence === "weekly" && s.weekday !== null)
      .map((s) => ({
        title: s.title,
        weekday: s.weekday as number,
        start_time: s.start_time,
      }));

    // Media (YouTube + audio embed) — feeds external sources; cached server-side.
    const mediaSettings = account as typeof account & HubMediaSettings;
    const showYoutube = mediaSettings.media_show_youtube !== false;
    const showAudio = mediaSettings.media_show_audio !== false;
    const youtubeVideos = showYoutube
      ? await fetchYoutubeVideos(mediaSettings.media_youtube_url, 5)
      : [];
    const audioEmbed = showAudio ? buildAudioEmbed(mediaSettings.media_audio_url) : null;

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
      devotional,
    };
  });

const SlideSchema = z.object({
  image_url: z.string().url().max(500),
  title: z.string().max(120).nullable(),
  subtitle: z.string().max(200).nullable(),
  cta_label: z.string().max(40).nullable(),
  cta_url: z.string().max(500).nullable(),
  title_size: z.enum(["sm", "md", "lg", "xl"]).nullable().optional(),
});

const HighlightSchema = z.object({
  icon: z.string().min(1).max(40),
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  sublabel: z.string().max(120).nullable(),
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
  weekly_message: z.string().max(1000).nullable(),
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
  instagram_columns: z.number().int().min(2).max(6).optional(),
});

export const updateHubSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => HubSettingsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    const { error } = await supabase.from("accounts").update(data).eq("id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Modelo inicial compartilhado: configura dados leves e editáveis, sem copiar
// imagens para o storage de cada cliente.
export const applyHubStarterTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    const { data: account, error: readError } = await supabase
      .from("accounts")
      .select("brand_title, religion_profile")
      .eq("id", accountId)
      .single();
    if (readError) throw new Error(readError.message);
    const name = account.brand_title || "Nossa comunidade";
    const gathering = getReligionTerms(account.religion_profile).mainGathering;
    const { error } = await supabase.from("accounts").update({
      hub_enabled: true,
      hub_bio: `Bem-vindo à ${name}. Um lugar para caminhar em comunidade, participar e encontrar esperança.`,
      hub_show_agenda: true,
      hub_show_events: true,
      hub_show_prayer: true,
      hub_show_visitor: true,
      hub_show_all_locations: false,
      weekly_message: `Participe do nosso próximo ${gathering} e conheça nossa comunidade.`,
      weekly_verse: "Tudo o que fizerdes, fazei-o de todo o coração.",
      weekly_verse_ref: "Colossenses 3:23",
      hub_highlights: [
        { icon: "CalendarDays", value: "Agenda", label: "Programação atualizada", sublabel: null },
        { icon: "Heart", value: "Cuidado", label: "Pedidos e acompanhamento", sublabel: null },
        { icon: "Users", value: "Comunidade", label: "Todos são bem-vindos", sublabel: null },
      ],
    } as never).eq("id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===================== NEWS =====================

export const listMyNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("news_posts")
      .select("id, title, subtitle, content, image_url, published, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const NewsInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300),
  content: z.string().max(10000),
  image_url: z.string().url().max(500).nullable(),
  published: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const upsertNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => NewsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const row = { ...data, account_id: accountId };
    const { error } = data.id
      ? await supabase.from("news_posts").update(row).eq("id", data.id)
      : await supabase.from("news_posts").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("news_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===================== ASSET UPLOAD (server-side, bypasses browser RLS) =====================

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "ico"]);

const UploadInput = z.object({
  folder: z.enum(["hub-cover", "gallery", "slide", "news", "product-images"]),
  filename: z.string().min(1).max(120),
  contentType: z
    .string()
    .min(1)
    .max(100)
    .refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
      message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO.",
    }),
  // base64-encoded file bytes (no data: prefix), max ~8MB encoded
  base64: z.string().min(1).max(12_000_000),
});

export const uploadHubAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => UploadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    let ext =
      (data.filename.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 5) || "jpg";
    if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${accountId}/${data.folder}-${Date.now()}-${rand}.${ext}`;
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.length === 0 || bytes.length > 8 * 1024 * 1024) {
      throw new Error("A imagem deve ter entre 1 byte e 8 MB.");
    }

    const contentType = data.contentType.toLowerCase();
    const bucket = data.folder === "product-images" ? "product-images" : "event-covers";

    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, bytes, {
      contentType:
        contentType === "image/x-icon" || contentType === "image/vnd.microsoft.icon"
          ? "image/png"
          : contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return { url: pub.publicUrl };
  });

// Issue a signed upload URL so the browser can PUT directly to storage.
// Avoids sending megabytes of base64 through the server-fn JSON envelope.
const SignInput = z.object({
  folder: z.enum(["hub-cover", "gallery", "slide", "news"]),
  filename: z
    .string()
    .min(1)
    .max(120)
    .refine((name) => {
      const ext = name.split(".").pop()?.toLowerCase() || "";
      return ALLOWED_IMAGE_EXT.has(ext);
    }, "Extensão de imagem não permitida."),
});

export const createHubUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => SignInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    let ext =
      (data.filename.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 5) || "jpg";
    if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${accountId}/${data.folder}-${Date.now()}-${rand}.${ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("event-covers")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message || "Falha ao gerar URL de upload");
    const { data: pub } = supabaseAdmin.storage.from("event-covers").getPublicUrl(path);
    return { path, token: signed.token, publicUrl: pub.publicUrl };
  });

// ===================== HUB CHROME (shared header/footer) =====================

const CHROME_COLS =
  "id, site_id, custom_slug, brand_title, brand_logo_url, brand_logo_height_px, brand_footer_logo_url, hub_bio, primary_color, hub_show_agenda, hub_show_prayer, hub_show_visitor, hub_show_events, social_instagram, social_youtube, social_facebook, social_website, visitor_whatsapp, hub_whatsapp, hub_show_whatsapp, live_url, pix_key, cta_label, cta_enabled";

export const getHubChrome = createServerFn({ method: "GET" })
  .validator((input) => SiteIdInput.parse(input))
  .handler(async ({ data }) => {
    const lookup = data.siteId.toLowerCase();
    let { data: acc } = await supabaseAdmin
      .from("accounts")
      .select(CHROME_COLS)
      .eq("custom_slug", lookup)
      .maybeSingle();
    if (!acc) {
      const fb = await supabaseAdmin
        .from("accounts")
        .select(CHROME_COLS)
        .eq("site_id", data.siteId)
        .maybeSingle();
      acc = fb.data;
    }
    return acc ?? null;
  });

// ===================== PUBLIC NEWS (full listing) =====================

export const getPublicNews = createServerFn({ method: "GET" })
  .validator((input) => SlugInput.parse(input))
  .handler(async ({ data }) => {
    let { data: account } = await supabaseAdmin
      .from("accounts")
      .select(
        "id, site_id, custom_slug, brand_title, primary_color, brand_footer_logo_url, hub_enabled",
      )
      .eq("custom_slug", data.slug)
      .maybeSingle();
    if (!account) {
      const fb = await supabaseAdmin
        .from("accounts")
        .select(
          "id, site_id, custom_slug, brand_title, primary_color, brand_footer_logo_url, hub_enabled",
        )
        .eq("site_id", data.slug)
        .maybeSingle();
      account = fb.data;
    }
    if (!account || !account.hub_enabled) return null;

    const { data: newsData } = await supabaseAdmin
      .from("news_posts")
      .select("id, title, subtitle, content, image_url, created_at")
      .eq("account_id", account.id)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(100);

    return {
      account: {
        site_id: account.site_id,
        custom_slug: account.custom_slug,
        brand_title: account.brand_title,
        primary_color: account.primary_color,
      },
      news: newsData ?? [],
    };
  });

export const getPublicNewsPost = createServerFn({ method: "GET" })
  .validator((input) => PublicNewsPostInput.parse(input))
  .handler(async ({ data }) => {
    let { data: account } = await supabaseAdmin
      .from("accounts")
      .select(
        "id, site_id, custom_slug, brand_title, primary_color, brand_footer_logo_url, hub_enabled",
      )
      .eq("custom_slug", data.slug)
      .maybeSingle();
    if (!account) {
      const fb = await supabaseAdmin
        .from("accounts")
        .select(
          "id, site_id, custom_slug, brand_title, primary_color, brand_footer_logo_url, hub_enabled",
        )
        .eq("site_id", data.slug)
        .maybeSingle();
      account = fb.data;
    }
    if (!account || !account.hub_enabled) return null;

    const { data: post } = await supabaseAdmin
      .from("news_posts")
      .select("id, title, subtitle, content, image_url, created_at")
      .eq("account_id", account.id)
      .eq("id", data.postId)
      .eq("published", true)
      .maybeSingle();
    if (!post) return null;

    const { data: related } = await supabaseAdmin
      .from("news_posts")
      .select("id, title, image_url, created_at")
      .eq("account_id", account.id)
      .eq("published", true)
      .neq("id", post.id)
      .order("created_at", { ascending: false })
      .limit(3);

    return {
      account: {
        site_id: account.site_id,
        custom_slug: account.custom_slug,
        brand_title: account.brand_title,
        primary_color: account.primary_color,
      },
      post,
      related: related ?? [],
    };
  });
