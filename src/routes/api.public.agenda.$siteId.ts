import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export const Route = createFileRoute("/api/public/agenda/$siteId")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params }) => {
        const siteId = String(params.siteId || "").slice(0, 64);
        if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) {
          return new Response(JSON.stringify({ error: "invalid site_id" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const lookup = siteId.toLowerCase();
        let { data: account, error: accErr } = await supabaseAdmin
          .from("accounts")
          .select(
            "id, site_id, brand_title, brand_subtitle, brand_empty_message, primary_color, force_show_type",
          )
          .eq("custom_slug", lookup)
          .maybeSingle();
        if (!accErr && !account) {
          const fb = await supabaseAdmin
            .from("accounts")
            .select(
              "id, site_id, brand_title, brand_subtitle, brand_empty_message, primary_color, force_show_type",
            )
            .eq("site_id", siteId)
            .maybeSingle();
          account = fb.data;
          accErr = fb.error;
        }
        if (accErr || !account) {
          return new Response(JSON.stringify({ error: "not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const today = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const horizon = new Date(today);
        horizon.setDate(horizon.getDate() + 90);
        const to = `${horizon.getFullYear()}-${pad(horizon.getMonth() + 1)}-${pad(horizon.getDate())}`;

        const { data: events, error: evErr } = await supabaseAdmin
          .from("events")
          .select(
            "id, event_date, start_time, end_time, location_name, type_name, type_id, description, show_type, is_live, live_url",
          )
          .eq("account_id", account.id)
          .gte("event_date", from)
          .lte("event_date", to)
          .order("event_date", { ascending: true })
          .order("start_time", { ascending: true });
        if (evErr) {
          return new Response(JSON.stringify({ error: evErr.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const { data: types } = await supabaseAdmin
          .from("celebration_types")
          .select("id, name, color, icon")
          .eq("account_id", account.id);

        return new Response(
          JSON.stringify({
            account: {
              brand_title: account.brand_title,
              brand_subtitle: account.brand_subtitle,
              brand_empty_message: account.brand_empty_message,
              primary_color: account.primary_color,
              force_show_type: account.force_show_type,
            },
            events: events ?? [],
            types: types ?? [],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=60",
              ...CORS,
            },
          },
        );
      },
    },
  },
});