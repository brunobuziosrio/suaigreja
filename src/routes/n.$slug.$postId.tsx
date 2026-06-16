import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublicNewsPost, getHubChrome } from "@/lib/hub.functions";
import { HubChrome } from "@/components/hub-chrome";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { BackToSite } from "@/components/back-to-site";
import { useState } from "react";
import { toast } from "sonner";
import DOMPurify from "isomorphic-dompurify";

export const Route = createFileRoute("/n/$slug/$postId")({
  loader: async ({ params }) => {
    const [data, chrome] = await Promise.all([
      getPublicNewsPost({ data: { slug: params.slug, postId: params.postId } }),
      getHubChrome({ data: { siteId: params.slug } }),
    ]);
    if (!data) throw notFound();
    return { ...data, chrome };
  },
  component: NewsPostPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Notícia não encontrada</h1>
        <p className="text-sm text-muted-foreground mt-2">Talvez tenha sido removida.</p>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post.title ?? "Notícia"} — ${loaderData?.account.brand_title ?? ""}` },
      { name: "description", content: loaderData?.post.subtitle || loaderData?.post.title || "" },
      ...(loaderData?.post.image_url
        ? [{ property: "og:image", content: loaderData.post.image_url }]
        : []),
    ],
  }),
});

function NewsPostPage() {
  const { account, post, related, chrome } = Route.useLoaderData() as any;
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Notícias";
  const [imgOpen, setImgOpen] = useState(false);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.subtitle || "", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado!");
      }
    } catch {
      /* user cancelled */
    }
  };

  // Render content: if it contains HTML tags, render as HTML; otherwise treat as plain text with paragraphs
  const looksLikeHtml = typeof post.content === "string" && /<[a-z][\s\S]*>/i.test(post.content);

  const content = (
    <div className="min-h-screen bg-stone-50">
      {/* Header band */}
      <div
        className="relative"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6">
            <BackToSite slug={slug} />
            <Link
              to="/n/$slug"
              params={{ slug }}
              className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Todas as notícias
            </Link>
          </div>
          <p className="text-white/80 text-xs uppercase tracking-[0.3em] font-semibold inline-flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> {fmtDate(post.created_at)}
          </p>
          <h1
            className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-4 text-white/90 text-lg sm:text-xl leading-relaxed max-w-2xl">
              {post.subtitle}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-white/85 text-sm">
              Publicado por <span className="font-semibold">{brand}</span>
            </span>
            <button
              type="button"
              onClick={share}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium backdrop-blur-sm transition"
            >
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {post.image_url && (
          <button
            type="button"
            onClick={() => setImgOpen(true)}
            className="block w-full mb-10 group"
            aria-label="Ampliar imagem"
          >
            <div className="w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-auto object-contain max-h-[80vh] group-hover:opacity-95 transition"
              />
            </div>
            <span className="block text-center text-xs text-stone-500 mt-2">
              Toque na imagem para ampliar
            </span>
          </button>
        )}

        {post.content && (
          looksLikeHtml ? (
            <div
              className="prose prose-stone max-w-none prose-headings:font-bold prose-a:underline text-stone-800 leading-relaxed text-[17px]"
              style={{ fontFamily: "var(--font-body, inherit)" }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          ) : (
            <div className="text-stone-800 leading-relaxed text-[17px] sm:text-lg space-y-5 whitespace-pre-wrap">
              {String(post.content).split(/\n{2,}/).map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )
        )}

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t border-stone-200 flex flex-wrap gap-3 items-center justify-between">
          <Link
            to="/n/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" /> Ver todas as notícias
          </Link>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-sm hover:opacity-90 transition"
            style={{ background: accent }}
          >
            <Share2 className="h-4 w-4" /> Compartilhar
          </button>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "var(--font-display)", color: accent }}
            >
              Continue lendo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r: any) => (
                <Link
                  key={r.id}
                  to="/n/$slug/$postId"
                  params={{ slug, postId: r.id }}
                  className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] text-stone-500">{fmtDate(r.created_at)}</p>
                    <h3
                      className="mt-1 font-bold leading-snug line-clamp-3"
                      style={{ fontFamily: "var(--font-display)", color: accent }}
                    >
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox */}
      {imgOpen && post.image_url && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={post.image_url}
            alt={post.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setImgOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl flex items-center justify-center"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );

  if (chrome) return <HubChrome account={chrome as any} contained={false}>{content}</HubChrome>;
  return content;
}