// Server-only helpers to fetch YouTube videos and normalize audio embeds.
// Used by hub.functions.ts to power the public Mídia sections.

type CachedVideos = { ts: number; videos: YoutubeVideo[] };
type CachedChannelId = { ts: number; id: string | null };

export type YoutubeVideo = {
  id: string;
  title: string;
  published_at: string;
  thumbnail: string;
  url: string;
};

const VIDEO_CACHE = new Map<string, CachedVideos>();
const CHANNEL_ID_CACHE = new Map<string, CachedChannelId>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

function extractChannelIdFromUrl(url: string): string | null {
  // /channel/UCxxxx
  const m = url.match(/\/channel\/(UC[\w-]{20,})/);
  return m ? m[1] : null;
}

async function resolveChannelId(rawUrl: string): Promise<string | null> {
  const url = rawUrl.trim();
  if (!url) return null;
  // Direct channel ID in URL.
  const direct = extractChannelIdFromUrl(url);
  if (direct) return direct;

  // Cached resolution.
  const cached = CHANNEL_ID_CACHE.get(url);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.id;

  try {
    let target = url;
    if (!/^https?:\/\//i.test(target)) {
      // Allow just "@handle" or "handle"
      const handle = target.replace(/^@/, "");
      target = `https://www.youtube.com/@${handle}`;
    }
    const res = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SuaIgrejaBot/1.0; +https://suaigreja.top)",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) {
      CHANNEL_ID_CACHE.set(url, { ts: Date.now(), id: null });
      return null;
    }
    const html = await res.text();
    let id: string | null = null;
    const m1 = html.match(/"channelId":"(UC[\w-]{20,})"/);
    if (m1) id = m1[1];
    if (!id) {
      const m2 = html.match(
        /<link\s+rel=["']canonical["']\s+href=["'][^"']*\/channel\/(UC[\w-]{20,})["']/i,
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

function parseFeed(xml: string, limit: number): YoutubeVideo[] {
  const entries: YoutubeVideo[] = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
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
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return entries;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function fetchYoutubeVideos(
  rawUrl: string | null | undefined,
  limit = 5,
): Promise<YoutubeVideo[]> {
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

export type AudioEmbed = {
  provider: "soundcloud" | "spotify" | "iframe";
  src: string;
  height: number;
};

export function buildAudioEmbed(
  rawUrl: string | null | undefined,
): AudioEmbed | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // SoundCloud — use widget player.
  if (/soundcloud\.com/i.test(url)) {
    const src =
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}` +
      `&color=%23467da5&auto_play=false&hide_related=true&show_comments=false` +
      `&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    return { provider: "soundcloud", src, height: 420 };
  }

  // Spotify — transform open.spotify.com paths into /embed/ variant.
  const sp = url.match(
    /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(show|episode|playlist|album|track|artist)\/([A-Za-z0-9]+)/i,
  );
  if (sp) {
    const [, kind, id] = sp;
    const src = `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator`;
    return { provider: "spotify", src, height: kind === "show" ? 420 : 352 };
  }

  // Fallback: assume the URL is itself an embed.
  if (/^https?:\/\//i.test(url)) {
    return { provider: "iframe", src: url, height: 420 };
  }
  return null;
}