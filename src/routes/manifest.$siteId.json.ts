import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FALLBACK_ICON = "/icon-512.png";

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : fallback;
}

function imageType(url: string) {
  const lower = url.split("?")[0].toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  return "image/png";
}

function iconUrl(account: { brand_logo_url?: string | null; card_logo_url?: string | null }) {
  return account.brand_logo_url || account.card_logo_url || FALLBACK_ICON;
}

export const Route = createFileRoute("/manifest/$siteId/json")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const siteId = String(params.siteId || "").slice(0, 64);
        if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) {
          return new Response(JSON.stringify({ error: "invalid site_id" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const lookup = siteId.toLowerCase();
        let { data: account, error } = await supabaseAdmin
          .from("accounts")
          .select("site_id, custom_slug, brand_title, brand_subtitle, primary_color, brand_logo_url, card_logo_url")
          .eq("custom_slug", lookup)
          .maybeSingle();

        if (!error && !account) {
          const fallback = await supabaseAdmin
            .from("accounts")
            .select("site_id, custom_slug, brand_title, brand_subtitle, primary_color, brand_logo_url, card_logo_url")
            .eq("site_id", siteId)
            .maybeSingle();
          account = fallback.data;
          error = fallback.error;
        }

        if (error || !account) {
          return new Response(JSON.stringify({ error: "not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const slug = account.custom_slug || account.site_id || siteId;
        const name = account.brand_title || "Sua Igreja";
        const shortName = name.length > 24 ? name.slice(0, 21).trimEnd() + "..." : name;
        const themeColor = normalizeHexColor(account.primary_color, "#d4a84a");
        const src = iconUrl(account);
        const type = src === FALLBACK_ICON ? "image/png" : imageType(src);

        return new Response(
          JSON.stringify({
            name,
            short_name: shortName,
            lang: "pt-BR",
            description: account.brand_subtitle || `Agenda, conteudos e comunicados de ${name}.`,
            start_url: `/${slug}`,
            scope: "/",
            display: "standalone",
            orientation: "portrait",
            background_color: "#f6f1e3",
            theme_color: themeColor,
            icons: [
              { src, sizes: "512x512", type, purpose: "any" },
              { src, sizes: "192x192", type, purpose: "any" },
            ],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/manifest+json",
              "Cache-Control": "public, max-age=300",
            },
          },
        );
      },
    },
  },
});
