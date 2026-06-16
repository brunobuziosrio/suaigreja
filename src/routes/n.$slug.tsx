import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublicNews, getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { Newspaper } from "lucide-react";
import { BackToSite } from "@/components/back-to-site";

export const Route = createFileRoute("/n/$slug")({
  loader: async ({ params }) => {
    const [data, chrome] = await Promise.all([
      getPublicNews({ data: { slug: params.slug } }),
      getHubChrome({ data: { siteId: params.slug } }),
    ]);
    if (!data) throw notFound();
    return { ...data, chrome };
  },
  component: NewsListPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Notícias não encontradas</h1>
        <p className="text-sm text-muted-foreground mt-2">Verifique o endereço.</p>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Notícias — ${loaderData?.account.brand_title ?? ""}` },
      { name: "description", content: `Todas as notícias e artigos de ${loaderData?.account.brand_title ?? "nossa comunidade"}.` },
    ],
  }),
});

function NewsListPage() {
  const { account, news, chrome } = Route.useLoaderData() as any;
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Notícias";

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const truncate = (s: string | null | undefined, n: number) => {
    if (!s) return "";
    const clean = String(s).replace(/<[^>]+>/g, "").trim();
    return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
  };

  const content = (
    <div className="min-h-screen bg-stone-50">
      {/* Header band */}
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
            <Newspaper className="h-4 w-4" />
            Fique por dentro
          </div>
          <h1
            className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Notícias e Artigos
          </h1>
          <p className="mt-3 text-white/85 text-base sm:text-lg max-w-2xl">
            Acompanhe as últimas publicações de {brand}.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {news.length === 0 ? (
          <div className="text-center py-24 text-stone-500">
            <Newspaper className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p>Nenhuma notícia publicada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {news.map((n: any, idx: number) => (
              <Link
                key={n.id}
                to="/n/$slug/$postId"
                params={{ slug, postId: n.id }}
                className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              >
                <div className="aspect-[16/10] bg-stone-100 overflow-hidden flex items-center justify-center">
                  {n.image_url ? (
                    <img
                      src={n.image_url}
                      alt={n.title}
                      loading={idx < 2 ? "eager" : "lazy"}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }}
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${accent}1a`, color: accent }}
                    >
                      Notícias
                    </span>
                    <span className="mx-1">•</span>
                    {fmtDate(n.created_at)}
                  </div>
                  <h2
                    className="mt-3 text-lg sm:text-xl font-bold tracking-tight leading-snug group-hover:underline underline-offset-4 line-clamp-2"
                    style={{ fontFamily: "var(--font-display)", color: accent }}
                  >
                    {n.title}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed line-clamp-3">
                    {truncate(n.subtitle || n.content, 160)}
                  </p>
                  <span
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    Ler matéria →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{content}</HubChrome>;
  return content;
}