import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { listPublicEventsBySite } from "@/lib/event-pages.functions";
import { getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { CalendarHeart, ArrowUpRight } from "lucide-react";
import { BackToSite } from "@/components/back-to-site";

export const Route = createFileRoute("/eventos/$slug")({
  loader: async ({ params }) => {
    const [data, chrome] = await Promise.all([
      listPublicEventsBySite({ data: { slug: params.slug } }),
      getHubChrome({ data: { siteId: params.slug } }),
    ]);
    if (!data) throw notFound();
    return { ...data, chrome };
  },
  component: EventsListPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Eventos não encontrados</h1>
        <p className="text-sm text-muted-foreground mt-2">Verifique o endereço.</p>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Eventos — ${loaderData?.account.brand_title ?? ""}` },
      { name: "description", content: `Próximos eventos de ${loaderData?.account.brand_title ?? "nossa comunidade"}.` },
    ],
  }),
});

function EventsListPage() {
  const { account, events, chrome } = Route.useLoaderData() as any;
  const accent = account.primary_color || "#467da5";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Eventos";

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };
  const priceLabel = (cents: number) =>
    cents > 0 ? `R$ ${(cents / 100).toFixed(2).replace(".", ",")}` : "Gratuito";
  const truncate = (s: string | null | undefined, n: number) => {
    if (!s) return "";
    const clean = String(s).replace(/<[^>]+>/g, "").trim();
    return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
  };

  const content = (
    <div className="min-h-screen bg-stone-50">
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.6) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.4) 0, transparent 45%)",
        }} />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <BackToSite slug={slug} className="mb-6" />
          <div className="flex items-center gap-3 text-white/80 text-xs uppercase tracking-[0.3em] font-semibold">
            <CalendarHeart className="h-4 w-4" />
            Próximos encontros
          </div>
          <h1
            className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Eventos
          </h1>
          <p className="mt-3 text-white/85 text-base sm:text-lg max-w-2xl">
            Acompanhe os próximos eventos de {brand}.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {events.length === 0 ? (
          <div className="text-center py-24 text-stone-500">
            <CalendarHeart className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p>Nenhum evento programado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {events.map((e: any, idx: number) => {
              const free = !e.price_cents || e.price_cents <= 0;
              return (
                <Link
                  key={e.id}
                  to="/e/$slug"
                  params={{ slug: e.slug }}
                  className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-stone-100 overflow-hidden flex items-center justify-center">
                    {e.cover_image_url ? (
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        loading={idx < 2 ? "eager" : "lazy"}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${accent}1a`, color: accent }}
                      >
                        Evento
                      </span>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={
                          free
                            ? { background: "#16a34a1a", color: "#15803d" }
                            : { background: `${accent}1a`, color: accent }
                        }
                      >
                        {priceLabel(e.price_cents)}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500">
                      {fmtDate(e.event_date)} · {e.start_time?.slice(0, 5)}
                    </div>
                    <h2
                      className="text-lg sm:text-xl font-bold tracking-tight leading-snug group-hover:underline underline-offset-4 line-clamp-2"
                      style={{ fontFamily: "var(--font-display)", color: accent }}
                    >
                      {e.title}
                    </h2>
                    {e.description && (
                      <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
                        {truncate(e.description, 160)}
                      </p>
                    )}
                    <span
                      className="self-start mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider shadow-sm group-hover:shadow-md transition"
                      style={{ background: accent }}
                    >
                      {free ? "Saiba mais" : "Inscrever-se"} <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{content}</HubChrome>;
  return content;
}