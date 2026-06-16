import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublicHub } from "@/lib/hub.functions";
import { submitPrayerRequest } from "@/lib/prayer.functions";
import { getPublicInstagramPosts } from "@/lib/instagram.functions";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarDays, HandHeart, UserPlus, Instagram, Youtube,
  Facebook, Globe, Copy, MapPin, ArrowUpRight, Heart, MessageCircle, Quote,
  ChevronLeft, ChevronRight, Menu, X as XIcon,
  Church, Users, HeartHandshake, Cross, Sparkles, CalendarHeart,
  BookOpen, Music, Baby, Home, Flame, Star, Radio, Newspaper, Phone, PlayCircle, Headphones,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import defaultCover from "@/assets/hub-default-cover.jpg";
import QRCode from "qrcode";
import { buildPixBrCode } from "@/lib/pix-brcode";
import { PublicAgendaView } from "@/components/public-agenda-view";
import { openWhatsAppShare } from "@/lib/whatsapp-share";

// Lightweight scroll-reveal wrapper using IntersectionObserver
function Reveal({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const slug = String(params.slug || "").toLowerCase();
    if (!/^[a-z0-9_-]{1,64}$/.test(slug)) throw notFound();

    const data = await getPublicHub({ data: { slug } });
    if (!data) throw notFound();
    return data;
  },
  component: HubPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground mt-2">Verifique o endereço.</p>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.account.brand_title ?? "Hub" },
      {
        name: "description",
        content: loaderData?.account.hub_bio || loaderData?.account.brand_subtitle || "Página oficial da igreja.",
      },
      ...(loaderData?.account.hub_cover_url
        ? [{ property: "og:image", content: loaderData.account.hub_cover_url }]
        : []),
    ],
  }),
});

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function ScrollProgress({ accent }: { accent: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${accent}` }}
      />
    </div>
  );
}

function BackToTop({ accent, offsetBottom = 20 }: { accent: string; offsetBottom?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className={`fixed right-5 z-40 h-11 w-11 rounded-full bg-white text-stone-700 shadow-lg ring-1 ring-stone-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      style={{ bottom: offsetBottom, color: accent }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

function HubPage() {
  const { account, agenda, agendaTypes, events, news, location, locations: locationsRaw, prayers, donations, liveStatus, liveSchedule, youtubeVideos, audioEmbed, devotional } = Route.useLoaderData() as any;
  const locations: any[] = Array.isArray(locationsRaw) && locationsRaw.length > 0
    ? locationsRaw
    : (location && location.address ? [location] : []);
  const slug = account.custom_slug || account.site_id;
  const accent = account.primary_color || "#7d9b76";
  const cover = account.hub_cover_url || defaultCover;
  const gallery: string[] = Array.isArray((account as any).gallery_urls)
    ? ((account as any).gallery_urls as string[])
    : [];

  const fetchIgPosts = useServerFn(getPublicInstagramPosts);
  const { data: igPosts } = useQuery({
    queryKey: ["ig-posts", slug],
    queryFn: () => fetchIgPosts({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });
  const [igOpen, setIgOpen] = useState<any | null>(null);
  useEffect(() => {
    if (!igOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIgOpen(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [igOpen]);
  const weeklyMessage = (account as any).weekly_message as string | null;
  const weeklyVerse = (account as any).weekly_verse as string | null;
  const weeklyVerseRef = (account as any).weekly_verse_ref as string | null;
  const rawSlides = Array.isArray((account as any).hub_slides)
    ? ((account as any).hub_slides as Array<{
        image_url: string; title?: string | null; subtitle?: string | null;
        cta_label?: string | null; cta_url?: string | null;
      }>)
    : [];
  const slides = rawSlides.filter((s) => s && s.image_url);
  const highlights: Array<{ icon: string; value: string; label: string; sublabel?: string | null }> =
    Array.isArray((account as any).hub_highlights) ? (account as any).hub_highlights : [];
  const showWa = (account as any).hub_show_whatsapp !== false;
  const waRaw = ((account as any).hub_whatsapp || account.visitor_whatsapp || "") as string;
  const waNumber = showWa ? waRaw.replace(/\D/g, "") : "";
  const socials: { href: string; Icon: any; label: string; sub: string }[] = [
    account.social_youtube && { href: account.social_youtube, Icon: Youtube, label: "YouTube", sub: "Inscreva-se no canal" },
    account.social_facebook && { href: account.social_facebook, Icon: Facebook, label: "Facebook", sub: "Curta nossa página" },
    account.social_instagram && { href: account.social_instagram, Icon: Instagram, label: "Instagram", sub: "Siga as publicações" },
    waNumber && { href: `https://wa.me/${waNumber}`, Icon: MessageCircle, label: "WhatsApp", sub: "Fale com a gente" },
    account.social_website && { href: account.social_website, Icon: Globe, label: "Site", sub: "Conheça mais" },
  ].filter(Boolean) as any;

  // Top nav menu — padronizado com HubChrome (mesmo em todas as páginas)
  const navItems: { label: string; href: string }[] = [
    { label: "Início", href: `/${slug}` },
    account.hub_show_agenda && { label: "Agenda", href: `/a/${slug}` },
    account.hub_show_events && { label: "Eventos", href: `/eventos/${slug}` },
    { label: "Notícias", href: `/n/${slug}` },
    { label: "Transmissões", href: `/${slug}#transmissoes` },
    account.hub_show_prayer && { label: "Oração", href: `/o/${slug}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div
      id="topo"
      className="min-h-screen font-sans"
      style={{
        background: "linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)",
        color: "#3a3a3a",
        ["--accent" as any]: accent,
      }}
    >
      {/* TOP NAVBAR */}
      <TopNav
        brandTitle={account.brand_title}
        logoUrl={account.brand_logo_url ?? null}
        logoHeight={account.brand_logo_height_px ?? 32}
        accent={accent}
        items={navItems}
        liveUrl={account.live_url}
        ctaLabel={account.cta_enabled === false ? null : (account.cta_label || "Doar Agora")}
        ctaHref={`/d/${slug}`}
      />

      {/* SLIDER (or fallback hero with cover) */}
      {slides.length > 0 ? (
        <HeroSlider slides={slides} accent={accent} />
      ) : (
        <HeroEmotional
          account={account}
          accent={accent}
          cover={cover}
          slug={slug}
          nextEvent={(agenda as any[])[0]}
        />
      )}

      {/* QUICK SHORTCUTS — central de atalhos abaixo do hero */}
      <QuickShortcuts
        accent={accent}
        slug={slug}
        account={account}
        waNumber={waNumber}
        hasEvents={Array.isArray(events) && events.length > 0}
        hasNews={Array.isArray(news) && news.length > 0}
        hasLive={!!account.live_url}
        locationCount={locations.length}
      />

      <main className="max-w-5xl mx-auto px-6 pb-24 mt-10 sm:mt-14 relative">
        {/* LIVE NOW / NEXT CELEBRATION — prominent banner */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-3"
            style={{ color: accent }}
          >
            Viva com a comunidade
          </p>
          <h2
            className="text-[clamp(1rem,4.2vw,2.25rem)] md:text-4xl font-bold tracking-tight text-stone-900 leading-tight whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Acompanhe momentos especiais de onde estiver
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed italic">
            Encontros, transmissões e a vida da nossa comunidade reunidos em um único lugar.
          </p>
          <div
            className="mx-auto mt-5 h-[2px] w-16 rounded-full"
            style={{ background: accent }}
          />
        </div>
        <LiveCombinedSection
          liveStatus={liveStatus}
          liveUrl={account.live_url}
          nextEvent={(agenda as any[])[0]}
          schedule={Array.isArray(liveSchedule) ? liveSchedule : []}
          accent={accent}
        />

        {/* DONATIONS PREVIEW */}
        {Array.isArray(donations) && donations.length > 0 && (
          <DonationsPreview
            campaigns={donations}
            slug={slug}
            accent={accent}
            fixedImageUrl={account?.donations_fixed_image_url ?? null}
          />
        )}

        {/* HIGHLIGHTS */}
        {highlights.length > 0 && (
          <div className="mb-10">
            <HighlightsBar items={highlights} accent={accent} />
          </div>
        )}

        {/* MODULES — prayer form + pix */}
        {(account.hub_show_prayer || account.pix_key) && (
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
            {account.hub_show_prayer && (
              <div className={account.pix_key ? "lg:col-span-3" : "lg:col-span-5"}>
                <InlinePrayerForm siteId={slug} accent={accent} />
              </div>
            )}
            {account.pix_key && (
              <div id="pix" className={`scroll-mt-24 ${account.hub_show_prayer ? "lg:col-span-2" : "lg:col-span-5 max-w-md mx-auto w-full"}`}>
                <PixModule
                  pixKey={account.pix_key}
                  merchantName={account.brand_title ?? "IGREJA"}
                  accent={accent}
                />
              </div>
            )}
          </section>
        )}

        {/* AGENDA — resumo hoje + amanhã */}
        {account.hub_show_agenda && (() => {
          const today = new Date();
          const pad = (n: number) => String(n).padStart(2, "0");
          const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          const todayStr = ymd(today);
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
          const tomorrowStr = ymd(tomorrow);
          const summary = (agenda as any[]).filter((e) => e.event_date === todayStr || e.event_date === tomorrowStr);
          return (
            <section id="agenda" className="mt-20 scroll-mt-24">
              <p className="text-center text-sm italic text-stone-600 max-w-xl mx-auto mb-6">
                Fique por dentro dos próximos encontros e atividades da comunidade.
              </p>
              <div className="flex items-end justify-between mb-6 border-b border-stone-300 pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>Programação</p>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                    Resumo da agenda
                  </h2>
                </div>
                <Link
                  to="/a/$siteId"
                  params={{ siteId: slug }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition hover:opacity-90"
                  style={{ background: accent }}
                >
                  Ver agenda completa <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {summary.length > 0 ? (
                <PublicAgendaView
                  account={{
                    brand_title: account.brand_title || "Agenda",
                    brand_subtitle: "",
                    brand_empty_message: account.brand_empty_message || "Sem celebrações agendadas.",
                    brand_today_title: account.brand_today_title || "Celebrações de hoje",
                    primary_color: accent,
                    force_show_type: account.force_show_type,
                  }}
                  events={summary}
                  types={agendaTypes || []}
                />
              ) : (
                <p className="text-sm text-stone-600 py-6">
                  Nenhuma celebração para hoje ou amanhã.
                </p>
              )}
              <div className="mt-6 sm:hidden">
                <Link
                  to="/a/$siteId"
                  params={{ siteId: slug }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-white"
                  style={{ background: accent }}
                >
                  Ver agenda completa <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          );
        })()}

        {/* NEWS */}
        {news && news.length > 0 && (
          <section id="noticias" className="mt-20 scroll-mt-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: accent }}>
                Fique por dentro
              </p>
              <h2
                className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Notícias e Artigos
              </h2>
              <p className="mt-4 text-sm sm:text-base italic text-stone-600 leading-relaxed">
                Informações, mensagens e momentos da comunidade reunidos para você acompanhar.
              </p>
            </div>

            {(() => {
              const [featured, ...rest] = news as any[];
              const sideItems = rest.slice(0, 2);
              const accountName = account?.display_name || "Notícias";
              const fmtDate = (d: string) =>
                new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
              const truncate = (s: string | null | undefined, n: number) => {
                if (!s) return "";
                const clean = String(s).replace(/<[^>]+>/g, "").trim();
                return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
              };
              const Tag = () => (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${accent}1a`, color: accent }}
                >
                  Notícias
                </span>
              );

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  {/* FEATURED (large) */}
                  <Reveal className="h-full">
                   <Link
                     to="/n/$slug/$postId"
                     params={{ slug, postId: featured.id }}
                     className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden p-2"
                   >
                     <div className="aspect-[16/10] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center">
                      {featured.image_url ? (
                        <img
                          src={featured.image_url}
                          alt={featured.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
                      )}
                    </div>
                    <div className="px-4 sm:px-5 pt-5 pb-5 sm:pt-6 sm:pb-6 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Tag />
                        <span className="mx-1">•</span>
                        {fmtDate(featured.created_at)}
                      </div>
                      <h3
                        className="text-2xl sm:text-3xl leading-tight font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2"
                        style={{ fontFamily: "var(--font-display)", color: accent }}
                      >
                        {featured.title}
                      </h3>
                      <p className="text-[15px] sm:text-base text-stone-600 leading-relaxed line-clamp-3">
                        {truncate(featured.subtitle || featured.content, 220)}
                      </p>
                      <span
                        className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md group-hover:shadow-lg group-hover:translate-y-[-1px] transition"
                        style={{ background: accent }}
                      >
                        Ler matéria <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                  </Reveal>

                  {/* SIDE LIST (horizontal cards) */}
                  <div className="flex flex-col gap-6 h-full">
                    {sideItems.map((n: any, ni: number) => (
                      <Reveal key={n.id} delay={150 + ni * 120} className="flex-1 flex">
                       <Link
                         to="/n/$slug/$postId"
                         params={{ slug, postId: n.id }}
                         className="group w-full grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] gap-4 sm:gap-5 bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden p-2 min-h-[180px]"
                       >
                         <div className="h-full min-h-[140px] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center">
                          {n.image_url ? (
                            <img
                              src={n.image_url}
                              alt={n.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-700"
                            />
                          ) : (
                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
                          )}
                        </div>
                        <div className="flex flex-col justify-between min-w-0 py-3 sm:py-4 pr-3 sm:pr-4 gap-2">
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Tag />
                            <span className="mx-1">•</span>
                            {fmtDate(n.created_at)}
                          </div>
                          <h3
                            className="text-lg sm:text-xl leading-snug font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2"
                            style={{ fontFamily: "var(--font-display)", color: accent }}
                          >
                            {n.title}
                          </h3>
                          <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                            {truncate(n.subtitle || n.content, 110)}
                          </p>
                          <span
                            className="self-start mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider shadow-sm group-hover:shadow-md transition"
                            style={{ background: accent }}
                          >
                            Ler matéria <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="mt-12 flex justify-center">
              <Link
                to="/n/$slug"
                params={{ slug }}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-90 hover:shadow-xl transition"
                style={{ background: accent }}
              >
                Ver todas as notícias <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* YOUTUBE — últimos vídeos do canal */}
        {Array.isArray(youtubeVideos) && youtubeVideos.length > 0 && (
          <section id="videos" className="mt-20 scroll-mt-24">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: accent }}>
                No nosso canal
              </p>
              <h2
                className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Acompanhe nosso canal
              </h2>
              <p className="mt-3 text-sm sm:text-base italic text-stone-600">
                Confira as últimas mensagens publicadas no YouTube.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(youtubeVideos as Array<{ id: string; title: string; thumbnail: string; url: string; published_at: string }>).map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener"
                  className="group block rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  <div className="relative aspect-video bg-stone-100 overflow-hidden">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition">
                      <PlayCircle className="h-12 w-12 text-white drop-shadow-lg opacity-90 group-hover:scale-110 transition" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs sm:text-sm font-medium text-stone-800 line-clamp-2 leading-snug">
                      {v.title}
                    </p>
                    {v.published_at && (
                      <p className="mt-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-500">
                        {new Date(v.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
            {account.social_youtube && (
              <div className="mt-8 flex justify-center">
                <a
                  href={account.social_youtube}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow hover:opacity-90 transition"
                  style={{ background: accent }}
                >
                  <Youtube className="h-4 w-4" /> Ver canal completo
                </a>
              </div>
            )}
          </section>
        )}

        {/* AUDIO — SoundCloud / Spotify embed */}
        {audioEmbed && (
          <section id="audio" className="mt-20 scroll-mt-24">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: accent }}>
                Escute quando quiser
              </p>
              <h2
                className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Nossos canais de áudio
              </h2>
              <p className="mt-3 text-sm sm:text-base italic text-stone-600">
                Mensagens, louvores e estudos para ouvir a qualquer momento.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm">
              <iframe
                title="Player de áudio"
                src={(audioEmbed as { src: string }).src}
                width="100%"
                height={(audioEmbed as { height: number }).height}
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
                style={{ display: "block" }}
              />
            </div>
          </section>
        )}

        {/* VERSÍCULO DA SEMANA — faixa larga com tipografia destacada */}
        {weeklyVerse && (
          <section className="mt-16">
            <div
              className="relative rounded-xl overflow-hidden px-5 py-6 sm:px-10 sm:py-8 text-center"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                color: "#fff",
              }}
            >
              <BookOpen className="absolute top-3 left-3 h-5 w-5 opacity-25" />
              <BookOpen className="absolute bottom-3 right-3 h-5 w-5 opacity-25" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-80">
                Versículo da semana
              </p>
              <blockquote
                className="mt-3 text-base sm:text-lg md:text-xl leading-snug font-light max-w-2xl mx-auto"
                style={{ fontFamily: "var(--font-display)" }}
              >
                “{weeklyVerse}”
              </blockquote>
              {weeklyVerseRef && (
                <p className="mt-3 text-xs sm:text-sm font-semibold tracking-wide opacity-95">
                  — {weeklyVerseRef}
                </p>
              )}
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const parts: string[] = [`*${account.brand_title}*`, "📖 Versículo da semana", "", `"${weeklyVerse}"`];
                    if (weeklyVerseRef) parts.push(`— ${weeklyVerseRef}`);
                    openWhatsAppShare(parts.join("\n"));
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/15 hover:bg-white/25 backdrop-blur transition border border-white/30"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-white" strokeWidth={0} />
                  Compartilhar no WhatsApp
                </button>
              </div>
            </div>
          </section>
        )}

        {/* DEVOCIONAL DO DIA */}
        {devotional && (
          <section id="devocional" className="mt-20 scroll-mt-24">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <p className="text-[11px] uppercase tracking-[0.25em] font-semibold" style={{ color: accent }}>
                Devocional do dia
              </p>
              <h2
                className="mt-2 text-3xl sm:text-4xl tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Uma Palavra para hoje
              </h2>
            </div>
            <div
              className="relative rounded-2xl p-8 sm:p-10 overflow-hidden bg-white shadow-sm"
              style={{ border: `1px solid ${accent}33` }}
            >
              <BookOpen className="absolute top-6 right-6 h-7 w-7 opacity-30" style={{ color: accent }} />
              <div className="max-w-2xl mx-auto text-center">
                <blockquote
                  className="text-xl sm:text-2xl leading-relaxed text-stone-800 italic"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  “{devotional.verse_text}”
                </blockquote>
                <p className="mt-3 text-sm font-semibold" style={{ color: accent }}>
                  — {devotional.verse_ref}
                </p>
                {devotional.message && (
                  <p className="mt-6 text-base text-stone-700 leading-relaxed font-light whitespace-pre-line">
                    {devotional.message}
                  </p>
                )}
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const parts: string[] = [
                        `*${account.brand_title}*`,
                        "📖 Devocional do dia",
                        "",
                        `"${devotional.verse_text}"`,
                        `— ${devotional.verse_ref}`,
                      ];
                      if (devotional.message) parts.push("", devotional.message);
                      openWhatsAppShare(parts.join("\n"));
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white hover:scale-[1.03] active:scale-95 transition shadow-sm"
                    style={{ background: "#25D366" }}
                  >
                    <MessageCircle className="h-4 w-4 fill-white" strokeWidth={0} />
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SOCIAL CONNECT — compact center block */}
        {socials.length > 0 && (
          <section className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Conecte-se</p>
              <h2
                className="mt-2 text-2xl sm:text-3xl tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Confira as novidades e fique perto de {account.brand_title}
              </h2>
              <p className="mt-3 text-sm italic text-stone-600">
                Acesse rapidamente os principais canais e informações.
              </p>
            </div>
            <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-10">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className="group flex flex-col items-center text-center w-24 sm:w-28"
                >
                  <div
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border-2 flex items-center justify-center transition group-hover:scale-105"
                    style={{ borderColor: accent, color: accent }}
                  >
                    <s.Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                    {s.label}
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs text-stone-600 leading-tight">{s.sub}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* GALLERY */}
        {gallery.length > 0 && (
          <section id="galeria" className="mt-20 scroll-mt-24">
            <div className="flex items-end justify-between mb-8 border-b border-stone-300 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>Nossa comunidade</p>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Momentos
                </h2>
                <p className="mt-2 text-sm text-stone-600 max-w-xl">
                  Compartilhando momentos que fortalecem nossa comunidade.
                </p>
              </div>
            </div>
            <LightboxGallery images={gallery} accent={accent} />
          </section>
        )}

        {/* INSTAGRAM POSTS — automaticamente sincronizados via OAuth */}
        {igPosts && igPosts.length > 0 && (
          <section id="instagram" className="mt-20 scroll-mt-24">
            <div className="flex items-end justify-between mb-8 border-b border-stone-300 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>
                  Instagram
                </p>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Últimas publicações
                </h2>
                <p className="mt-2 text-sm text-stone-600 max-w-xl">
                  Acompanhe os momentos da nossa comunidade diretamente do Instagram.
                </p>
              </div>
              {account.social_instagram && (
                <a
                  href={account.social_instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  style={{ color: accent }}
                >
                  Ver perfil <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
            {(() => {
              const igCount = Math.max(3, Math.min(30, Number((account as any).instagram_post_count) || 9));
              const igCols = Math.max(2, Math.min(6, Number((account as any).instagram_columns) || 3));
              const colClass = ({
                2: "sm:grid-cols-2",
                3: "sm:grid-cols-3",
                4: "sm:grid-cols-4",
                5: "sm:grid-cols-5",
                6: "sm:grid-cols-6",
              } as Record<number, string>)[igCols] || "sm:grid-cols-3";
              return (
                <div className={`grid grid-cols-2 ${colClass} gap-2 sm:gap-3`}>
                  {igPosts.slice(0, igCount).map((post: any) => {
                const isVideo = post.media_type === "VIDEO";
                const imgSrc = isVideo ? (post.thumbnail_url || post.media_url) : post.media_url;
                return (
                  <button
                    type="button"
                    key={post.id}
                    onClick={() => setIgOpen(post)}
                    className="relative aspect-square overflow-hidden rounded-md bg-stone-100 group text-left"
                    title={post.caption?.slice(0, 120) || "Abrir publicação"}
                  >
                    <img
                      src={imgSrc}
                      alt={post.caption?.slice(0, 120) || "Post do Instagram"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {isVideo && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                        <PlayCircle className="h-4 w-4" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                  </button>
                );
                  })}
                </div>
              );
            })()}

            {igOpen && (
              <div
                className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
                onClick={() => setIgOpen(null)}
                role="dialog"
                aria-modal="true"
              >
                <div
                  className="relative bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col sm:flex-row shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setIgOpen(null)}
                    aria-label="Fechar"
                    className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                  <div className="bg-black flex-1 min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center">
                    {igOpen.media_type === "VIDEO" ? (
                      <video
                        src={igOpen.media_url}
                        poster={igOpen.thumbnail_url || undefined}
                        controls
                        autoPlay
                        playsInline
                        className="max-w-full max-h-[80vh] w-auto h-auto"
                      />
                    ) : (
                      <img
                        src={igOpen.media_url}
                        alt={igOpen.caption?.slice(0, 120) || "Post do Instagram"}
                        className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                      />
                    )}
                  </div>
                  <div className="sm:w-80 sm:max-w-[40%] flex flex-col bg-white border-t sm:border-t-0 sm:border-l border-stone-200">
                    <div className="flex items-center gap-2 p-4 border-b border-stone-200">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm font-semibold text-stone-800">Instagram</div>
                    </div>
                    <div className="p-4 overflow-y-auto text-sm text-stone-700 whitespace-pre-wrap flex-1">
                      {igOpen.caption || <span className="text-stone-400">Sem legenda</span>}
                    </div>
                    <div className="p-4 border-t border-stone-200">
                      <a
                        href={igOpen.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition w-full justify-center"
                        style={{ background: accent }}
                      >
                        <Instagram className="h-4 w-4" /> Ver no Instagram
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* PALAVRA PASTORAL DA SEMANA — card lateral com aspas */}
        {weeklyMessage && (
          <section className="mt-16">
            <div className="grid md:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start bg-white rounded-xl p-5 sm:p-7 shadow-sm border border-stone-200 max-w-3xl mx-auto">
              <div
                className="hidden md:flex h-10 w-10 rounded-full items-center justify-center shrink-0"
                style={{ background: `${accent}15`, color: accent }}
              >
                <Quote className="h-5 w-5" />
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.22em] font-semibold"
                  style={{ color: accent }}
                >
                  Palavra da semana
                </p>
                <h3
                  className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Uma mensagem para você
                </h3>
                <p className="mt-3 text-sm sm:text-base text-stone-700 leading-relaxed font-light whitespace-pre-line">
                  {weeklyMessage}
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const parts: string[] = [`*${account.brand_title}*`, "✨ Palavra da semana", "", weeklyMessage];
                      openWhatsAppShare(parts.join("\n"));
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white hover:scale-[1.03] active:scale-95 transition shadow-sm"
                    style={{ background: "#25D366" }}
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-white" strokeWidth={0} />
                    Compartilhar no WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PRAYER WALL — mural de intenções */}
        {account.hub_show_prayer && prayers && prayers.length > 0 && (
          <section id="mural" className="mt-20 scroll-mt-24">
            <div className="flex items-end justify-between mb-8 border-b border-stone-300 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>Pedidos da comunidade</p>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Mural de intenções
                </h2>
              </div>
              <Link
                to="/o/$siteId"
                params={{ siteId: slug }}
                className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition hover:opacity-90"
                style={{ background: accent }}
              >
                Deixar meu pedido <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prayers.map((p: any, idx: number) => (
                <Reveal key={p.id} delay={idx * 80}>
                  <article
                    className="relative h-full rounded-lg p-5 bg-white/70 backdrop-blur border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <HandHeart
                      className="absolute top-4 right-4 h-4 w-4 opacity-30"
                      style={{ color: accent }}
                    />
                    <p className="text-sm text-stone-700 leading-relaxed line-clamp-5">
                      "{p.message}"
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-semibold uppercase tracking-wider" style={{ color: accent }}>
                        {p.name}
                      </span>
                      {p.prayer_count > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-current" style={{ color: accent }} />
                          {p.prayer_count}
                        </span>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="mt-6 sm:hidden">
              <Link
                to="/o/$siteId"
                params={{ siteId: slug }}
                className="w-full inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-white"
                style={{ background: accent }}
              >
                Deixar meu pedido <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* MAP — localizações (matriz + capelas) */}
        {locations.length > 0 && (() => {
          const showAllLocs = (account as any).hub_show_all_locations === true;
          const mainLoc = locations.find((l: any) => l.is_main) ?? locations[0];
          const extras = locations.filter((l: any) => l !== mainLoc);
          const displayed = showAllLocs ? locations : [mainLoc];
          const isSingle = displayed.length === 1;
          return (
          <section id="enderecos" className="relative mt-20 scroll-mt-24">
            <span id="mapa" className="absolute -top-24" aria-hidden="true" />
            <div className="flex items-end justify-between mb-8 border-b border-stone-300 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>Venha nos visitar</p>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {displayed.length > 1 ? "Nossas unidades" : "Onde estamos"}
                </h2>
                <p className="mt-2 text-sm text-stone-600 max-w-xl">
                  {displayed.length > 1
                    ? "Encontre a unidade mais próxima de você."
                    : "Estamos sempre próximos para acolher e informar."}
                </p>
              </div>
            </div>
            <Reveal>
              <div
                className={
                  isSingle
                    ? "grid grid-cols-1 gap-6 items-stretch"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                }
              >
                {displayed.map((loc: any) => (
                  <LocationCard key={loc.id ?? loc.name} loc={loc} accent={accent} single={isSingle} />
                ))}
              </div>
            </Reveal>
            {!showAllLocs && extras.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Link
                  to="/enderecos/$slug"
                  params={{ slug: account.custom_slug || account.site_id }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition hover:scale-[1.03] active:scale-95"
                  style={{ borderColor: accent, color: accent }}
                >
                  <MapPin className="h-4 w-4" />
                  Ver todos os endereços ({locations.length})
                </Link>
              </div>
            )}
          </section>
          );
        })()}

        {/* EVENTS — magazine cards */}
        {account.hub_show_events && events.length > 0 && (
          <section id="eventos" className="mt-20 scroll-mt-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: accent }}>
                Em destaque
              </p>
              <h2
                className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Eventos
              </h2>
              <p className="mt-4 text-sm sm:text-base italic text-stone-600 leading-relaxed">
                Celebrações, encontros e momentos especiais da nossa comunidade.
              </p>
            </div>

            {(() => {
              const [featured, ...rest] = events as any[];
              const sideItems = rest.slice(0, 2);
              const Tag = () => (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${accent}1a`, color: accent }}
                >
                  Evento
                </span>
              );
              const priceLabel = (cents: number) =>
                cents > 0 ? `R$ ${(cents / 100).toFixed(2).replace(".", ",")}` : "Gratuito";
              const PriceChip = ({ cents }: { cents: number }) => {
                const free = !cents || cents <= 0;
                return (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={
                      free
                        ? { background: "#16a34a1a", color: "#15803d" }
                        : { background: `${accent}1a`, color: accent }
                    }
                  >
                    {free ? "Gratuito" : priceLabel(cents)}
                  </span>
                );
              };
              const truncate = (s: string | null | undefined, n: number) => {
                if (!s) return "";
                const clean = String(s).replace(/<[^>]+>/g, "").trim();
                return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  {/* FEATURED */}
                  <Reveal className="h-full">
                    <Link
                      to="/e/$slug"
                      params={{ slug: featured.slug }}
                      className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden p-2"
                    >
                      <div className="aspect-[16/10] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center">
                        {featured.cover_image_url ? (
                          <img
                            src={featured.cover_image_url}
                            alt={featured.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
                          />
                        ) : (
                          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
                        )}
                      </div>
                      <div className="px-4 sm:px-5 pt-5 pb-5 sm:pt-6 sm:pb-6 flex-1 flex flex-col justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <Tag />
                          <PriceChip cents={featured.price_cents} />
                          <span className="mx-1">•</span>
                          {formatDate(featured.event_date)} · {featured.start_time?.slice(0, 5)}
                        </div>
                         <h3
                           className="text-2xl sm:text-3xl leading-tight font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2"
                           style={{ fontFamily: "var(--font-display)", color: accent }}
                         >
                           {featured.title}
                         </h3>
                         {featured.description && (
                           <p className="text-[15px] sm:text-base text-stone-600 leading-relaxed line-clamp-3">
                             {truncate(featured.description, 220)}
                           </p>
                         )}
                        <span
                          className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md group-hover:shadow-lg group-hover:translate-y-[-1px] transition"
                          style={{ background: accent }}
                        >
                          {featured.price_cents > 0 ? "Inscrever-se" : "Saiba mais"} <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>

                  {/* SIDE LIST */}
                  <div className="flex flex-col gap-6 h-full">
                    {sideItems.map((e: any, ni: number) => (
                      <Reveal key={e.id} delay={150 + ni * 120} className="flex-1 flex">
                         <Link
                           to="/e/$slug"
                           params={{ slug: e.slug }}
                           className="group w-full grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] gap-4 sm:gap-5 bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden p-2 min-h-[180px]"
                         >
                           <div className="h-full min-h-[140px] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center">
                            {e.cover_image_url ? (
                              <img
                                src={e.cover_image_url}
                                alt={e.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-700"
                              />
                            ) : (
                              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
                            )}
                          </div>
                          <div className="flex flex-col justify-between min-w-0 py-3 sm:py-4 pr-3 sm:pr-4 gap-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                              <Tag />
                              <PriceChip cents={e.price_cents} />
                              <span className="mx-1">•</span>
                              {formatDate(e.event_date)} · {e.start_time?.slice(0, 5)}
                            </div>
                            <h3
                              className="text-lg sm:text-xl leading-snug font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2"
                              style={{ fontFamily: "var(--font-display)", color: accent }}
                            >
                              {e.title}
                            </h3>
                            {e.description && (
                              <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                                {truncate(e.description, 110)}
                              </p>
                            )}
                            <span
                              className="self-start mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider shadow-sm group-hover:shadow-md transition"
                              style={{ background: accent }}
                            >
                              {e.price_cents > 0 ? "Inscrever-se" : "Saiba mais"} <ArrowUpRight className="h-3 w-3" />
                            </span>
                          </div>
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="mt-12 flex justify-center">
              <Link
                to="/eventos/$slug"
                params={{ slug }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-90 hover:shadow-xl transition"
                style={{ background: accent }}
              >
                Ver todos os eventos <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* FOOTER */}
      </main>

      {/* SITE FOOTER */}
      <HubFooter account={account} accent={accent} navItems={navItems} socials={socials} />

      {/* SCROLL PROGRESS BAR (top) */}
      <ScrollProgress accent={accent} />

      {/* BACK TO TOP BUTTON */}
      <BackToTop accent={accent} offsetBottom={20} />

      {/* WHATSAPP FLOATING BUTTON */}
      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${account.brand_title}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] ring-4 ring-white/70 transition-transform hover:scale-110 active:scale-95"
        >
          <MessageCircle className="h-7 w-7 fill-white" strokeWidth={0} />
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
        </a>
      )}
    </div>
  );
}

function QuickShortcuts({
  accent, slug, account, waNumber, hasEvents, hasNews, hasLive, locationCount,
}: {
  accent: string;
  slug: string;
  account: any;
  waNumber: string;
  hasEvents: boolean;
  hasNews: boolean;
  hasLive: boolean;
  locationCount: number;
}) {
  type Item = { label: string; href: string; Icon: any; external?: boolean };
  const items: Item[] = [];
  if (account.hub_show_agenda) items.push({ label: "Agenda", href: "#agenda", Icon: CalendarDays });
  if (hasLive) items.push({ label: "Transmissões", href: `/v/${slug}`, Icon: Radio });
  if (waNumber)
    items.push({
      label: "WhatsApp",
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${account.brand_title}.`)}`,
      Icon: MessageCircle,
      external: true,
    });
  if (hasEvents) items.push({ label: "Eventos", href: `/eventos/${slug}`, Icon: CalendarHeart, external: true });
  if (account.hub_show_prayer) items.push({ label: "Pedidos", href: `/o/${slug}`, Icon: HandHeart, external: true });
  if (hasNews) items.push({ label: "Notícias", href: `/n/${slug}`, Icon: Newspaper, external: true });
  if (locationCount > 0) {
    items.push({
      label: locationCount === 1 ? "Endereço" : "Endereços",
      href: locationCount === 1 ? "#enderecos" : `/enderecos/${slug}`,
      Icon: MapPin,
      external: locationCount > 1,
    });
  }

  if (items.length === 0) return null;

  return (
    <section id="atalhos" className="relative mt-6 sm:mt-10 z-10 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="bg-white/95 backdrop-blur border border-stone-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-3 sm:p-4 rounded-2xl">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
              {items.slice(0, 7).map((it, i) => (
                <a
                  key={i}
                  href={it.href}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noopener" : undefined}
                  className="group flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl text-stone-700 hover:bg-stone-50 hover:-translate-y-0.5 transition-all"
                >
                  <span
                    className="h-11 w-11 rounded-full flex items-center justify-center transition group-hover:scale-110"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    <it.Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-center leading-tight">
                    {it.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TopNav({
  brandTitle, logoUrl, logoHeight, accent, items, liveUrl, ctaLabel, ctaHref,
}: {
  brandTitle: string; logoUrl: string | null; logoHeight: number; accent: string;
  items: { label: string; href: string }[];
  liveUrl: string | null;
  ctaLabel?: string | null;
  ctaHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav
      className={`sticky top-0 z-40 transition-colors ${scrolled ? "bg-white/95 backdrop-blur border-b border-stone-200" : "bg-white/70 backdrop-blur"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <a href="#topo" className="flex items-center gap-2 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandTitle}
              style={{ height: Math.min(Math.max(logoHeight, 16), 48) }}
              className="w-auto object-contain shrink-0"
            />
          ) : (
            <>
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: accent }}
              >
                {brandTitle?.[0]?.toUpperCase() ?? "S"}
              </span>
              <span className="font-medium text-sm text-stone-900 truncate" style={{ fontFamily: "var(--font-display)" }}>
                {brandTitle}
              </span>
            </>
          )}
        </a>
        <div className="hidden md:flex items-center gap-1">
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="px-3 py-1.5 text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 rounded transition"
            >
              {it.label}
            </a>
          ))}
          {ctaLabel && ctaHref && (
            <a
              href={ctaHref}
              className="ml-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider transition hover:opacity-90 shadow-sm"
              style={{ background: accent }}
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              {ctaLabel}
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded text-stone-700 hover:bg-stone-100"
          aria-label="Abrir menu"
        >
          {open ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-stone-700 border-b border-stone-100 last:border-0"
              >
                {it.label}
              </a>
            ))}
            {ctaLabel && ctaHref && (
              <a
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="mt-3 mb-3 flex items-center justify-center gap-2 py-3 rounded-full text-white text-sm font-bold uppercase tracking-wider"
                style={{ background: accent }}
              >
                <Heart className="h-4 w-4 fill-current" /> {ctaLabel}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroEmotional({
  account, accent, cover, slug, nextEvent,
}: {
  account: any;
  accent: string;
  cover: string;
  slug: string;
  nextEvent?: { event_date: string; start_time: string; type_name: string; location_name: string } | null;
}) {
  const headline = "Bem-vindo à nossa comunidade";
  const sub = "Eventos, transmissões e informações em um único lugar.";
  return (
    <header className="relative overflow-hidden">
      {/* background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 animate-[heroZoom_18s_ease-out_forwards]"
        style={{ backgroundImage: `url(${cover})` }}
      />
      {/* dark dramatic gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,15,20,0.55) 0%, rgba(15,15,20,0.45) 45%, rgba(250,248,245,0.95) 92%, #faf8f5 100%)",
        }}
      />
      {/* accent glow */}
      <div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />

      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-32 sm:pt-32 sm:pb-44 text-center">
        <p
          className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-white/80 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700"
        >
          {account.brand_title}
        </p>

        <h1
          className="mt-6 text-4xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight text-white max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000"
          style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
        >
          {headline}
        </h1>

        <p
          className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-white/90 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both"
        >
          {sub}
        </p>

        {/* Single premium CTA */}
        <div className="mt-10 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          {account.hub_show_agenda ? (
            <a
              href="#atalhos"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-stone-900 bg-white/95 backdrop-blur shadow-[0_10px_40px_-8px_rgba(0,0,0,0.4)] hover:bg-white hover:scale-[1.04] active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" style={{ color: accent }} />
              Explorar comunidade
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ) : null}
        </div>

        {/* next event pill */}
        {nextEvent && (
          <div className="mt-12 flex justify-center animate-in fade-in duration-1000 delay-500 fill-mode-both">
            <NextEventPill nextEvent={nextEvent} accent={accent} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes heroZoom { from { transform: scale(1.12); } to { transform: scale(1.02); } }
      `}</style>
    </header>
  );
}

function NextEventPill({
  nextEvent, accent,
}: {
  nextEvent: { event_date: string; start_time: string; type_name: string; location_name: string };
  accent: string;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const [y, m, d] = nextEvent.event_date.split("-").map(Number);
  const [hh, mm] = (nextEvent.start_time || "00:00").split(":").map(Number);
  const target = new Date(y, m - 1, d, hh, mm);
  const diffMs = target.getTime() - now.getTime();
  let countdown = "";
  if (diffMs > 0) {
    const mins = Math.floor(diffMs / 60000);
    const days = Math.floor(mins / (60 * 24));
    const hours = Math.floor((mins % (60 * 24)) / 60);
    const rmins = mins % 60;
    if (days > 0) countdown = `em ${days}d ${hours}h`;
    else if (hours > 0) countdown = `em ${hours}h ${rmins}min`;
    else countdown = `em ${rmins}min`;
  }
  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur shadow-xl shadow-black/20 max-w-full">
      <span
        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${accent}22`, color: accent }}
      >
        <CalendarHeart className="h-4 w-4" />
      </span>
      <div className="text-left min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold">
          Próxima celebração {countdown && `· ${countdown}`}
        </p>
        <p className="text-sm font-semibold text-stone-900 truncate">
          {nextEvent.type_name} · {formatDate(nextEvent.event_date)} · {nextEvent.start_time?.slice(0, 5)}
        </p>
      </div>
    </div>
  );
}

function HeroSlider({
  slides, accent,
}: {
  slides: Array<{ image_url: string; title?: string | null; subtitle?: string | null; cta_label?: string | null; cta_url?: string | null }>;
  accent: string;
}) {
  const [idx, setIdx] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);
  const go = (d: number) => setIdx((i) => (i + d + n) % n);
  return (
    <header className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-stone-900 aspect-[16/9] sm:aspect-[21/9]">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
              aria-hidden={i !== idx}
            >
              <img src={s.image_url} alt={s.title ?? ""} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 100%)",
                }}
              />
              {(s.title || s.subtitle || s.cta_label) && (() => {
                const sizeMap: Record<string, string> = {
                  sm: "text-2xl sm:text-3xl md:text-4xl",
                  md: "text-3xl sm:text-4xl md:text-5xl",
                  lg: "text-4xl sm:text-6xl md:text-7xl",
                  xl: "text-5xl sm:text-7xl md:text-8xl",
                };
                const sizeKey = ((s as any).title_size as string) || "lg";
                const titleSize = sizeMap[sizeKey] ?? sizeMap.lg;
                return (
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-2xl pl-20 pr-20 sm:pl-24 sm:pr-24 text-white">
                    {s.title && (
                      <h2
                        className={`${titleSize} leading-[1.05] tracking-tight font-extrabold`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.title}
                      </h2>
                    )}
                    {s.subtitle && (
                      <p className="mt-4 text-lg sm:text-xl text-white/95 max-w-lg font-medium">{s.subtitle}</p>
                    )}
                    {s.cta_label && s.cta_url && (
                      <a
                        href={s.cta_url}
                        target={s.cta_url.startsWith("http") ? "_blank" : undefined}
                        rel="noopener"
                        className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-stone-900 text-sm font-bold hover:bg-stone-100 transition shadow-lg"
                      >
                        {s.cta_label} <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                );
              })()}
            </div>
          ))}
          {n > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-stone-900 flex items-center justify-center transition"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-stone-900 flex items-center justify-center transition"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === idx ? 24 : 8,
                      background: i === idx ? accent : "rgba(255,255,255,0.6)",
                    }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HubFooter({
  account, accent, navItems, socials,
}: {
  account: any; accent: string;
  navItems: { label: string; href: string }[];
  socials: { href: string; Icon: any; label: string }[];
}) {
  const slug = account.custom_slug || account.site_id;
  const logoUrl: string | null =
    account.brand_footer_logo_url ?? account.brand_logo_url ?? null;

  const explore = [
    { label: "Início", href: `/${slug}` },
    account.hub_show_agenda && { label: "Agenda", href: `/a/${slug}` },
    account.hub_show_events && { label: "Eventos", href: `/eventos/${slug}` },
    { label: "Notícias", href: `/n/${slug}` },
    { label: "Transmissões", href: `/${slug}#transmissoes` },
  ].filter(Boolean) as { label: string; href: string }[];

  const participate = [
    account.hub_show_prayer && { label: "Pedidos de oração", href: `/o/${slug}` },
    account.pix_key && { label: "Contribuir via Pix", href: `/d/${slug}#pix` },
  ].filter(Boolean) as { label: string; href: string }[];

  // Fallback: se navItems trouxer algo fora do explore/participate, anexa
  const knownHrefs = new Set([...explore, ...participate].map((i) => i.href));
  const extras = navItems.filter((n) => !knownHrefs.has(n.href));

  return (
    <footer className="mt-12 bg-stone-900 text-stone-300">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-12">
        {/* Brand */}
        <div className="md:col-span-4 lg:col-span-4 min-w-0">
          <div className="flex flex-col items-start gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={account.brand_title}
                className="object-contain"
                style={{ height: Math.min(56, account.brand_logo_height_px ?? 48) }}
              />
            ) : (
              <span
                className="h-12 w-12 rounded-full flex items-center justify-center text-white text-base font-bold"
                style={{ background: accent }}
              >
                {account.brand_title?.[0]?.toUpperCase() ?? "S"}
              </span>
            )}
            <span
              className="text-lg font-medium text-white leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {account.brand_title}
            </span>
          </div>
        </div>

        {/* Explorar */}
        <div className="md:col-span-3 lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Explorar</p>
          <ul className="mt-4 space-y-2 text-sm">
            {explore.map((it) => (
              <li key={it.href}>
                <a href={it.href} className="hover:text-white transition">{it.label}</a>
              </li>
            ))}
            {extras.map((it) => (
              <li key={it.href}>
                <a href={it.href} className="hover:text-white transition">{it.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Participar */}
        {participate.length > 0 && (
          <div className="md:col-span-2 lg:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Participar</p>
            <ul className="mt-4 space-y-2 text-sm">
              {participate.map((it) => (
                <li key={it.href}>
                  <a href={it.href} className="hover:text-white transition">{it.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conecte-se */}
        <div className="md:col-span-3 lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Conecte-se</p>
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  title={s.label}
                  className="h-10 w-10 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition"
                >
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
          {account.pix_key && (
            <p className="mt-6 text-xs text-stone-500">
              <span className="font-semibold text-stone-300">Pix:</span>{" "}
              <span className="break-all">{account.pix_key}</span>
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-stone-800">
        {account.weekly_verse && (
          <div className="max-w-3xl mx-auto px-6 py-6 text-center">
            <p
              className="text-sm sm:text-base italic text-stone-400 leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              "{account.weekly_verse}"
              {account.weekly_verse_ref && (
                <span className="block mt-1 not-italic text-xs font-medium" style={{ color: accent }}>
                  — {account.weekly_verse_ref}
                </span>
              )}
            </p>
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {account.brand_title}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            Feito com <Heart className="h-3 w-3 fill-current" style={{ color: accent }} /> por{" "}
            <a href="/" className="underline underline-offset-2 hover:text-white">suaigreja</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, Icon }: { href: string; Icon: any }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-stone-200 text-stone-700 hover:bg-white hover:text-stone-900 transition"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function BigModule({
  to, params, icon: Icon, eyebrow, title, accent, span,
}: {
  to: any; params: any; icon: any; eyebrow: string; title: string; accent: string; span?: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={`group relative overflow-hidden rounded-sm p-8 min-h-[180px] flex flex-col justify-between transition ${span ?? ""}`}
      style={{ background: "#3a3a3a", color: "#faf8f5" }}
    >
      <div
        className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">{eyebrow}</span>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <div className="relative flex items-end justify-between">
        <h3
          className="text-2xl sm:text-3xl tracking-tight max-w-xs"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition" />
      </div>
    </Link>
  );
}

function SmallModule({
  to, params, icon: Icon, title, accent,
}: {
  to: any; params: any; icon: any; title: string; accent: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className="group relative overflow-hidden rounded-sm p-6 min-h-[180px] bg-white border border-stone-200 hover:border-stone-400 transition flex flex-col justify-between"
    >
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center"
        style={{ background: `${accent}22`, color: accent }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex items-end justify-between">
        <h3
          className="text-xl tracking-tight text-stone-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition" />
      </div>
    </Link>
  );
}

function ActionCard({
  to, params, icon: Icon, eyebrow, title, subtitle, accent,
}: {
  to: any; params: any; icon: any;
  eyebrow: string; title: string; subtitle: string; accent: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className="group relative overflow-hidden rounded-2xl p-6 min-h-[180px] bg-white border border-stone-200 hover:-translate-y-0.5 hover:shadow-lg transition flex flex-col justify-between"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-2xl transition group-hover:opacity-25"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-stone-300 group-hover:text-stone-900 transition"
        />
      </div>
      <div className="relative mt-6">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: accent }}>
          {eyebrow}
        </p>
        <h3
          className="mt-1.5 text-xl sm:text-2xl tracking-tight text-stone-900 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <p className="mt-1.5 text-xs text-stone-500 leading-snug">{subtitle}</p>
      </div>
    </Link>
  );
}

function InlinePrayerForm({ siteId, accent }: { siteId: string; accent: string }) {
  const submit = useServerFn(submitPrayerRequest);
  const [form, setForm] = useState({ name: "", message: "", is_anonymous: false });
  const [sent, setSent] = useState(false);
  const mut = useMutation({
    mutationFn: () => submit({ data: { siteId, name: form.name, message: form.message, is_anonymous: form.is_anonymous, email: "", phone: "" } }),
    onSuccess: () => {
      setSent(true);
      setForm({ name: "", message: "", is_anonymous: false });
      toast.success("Pedido enviado. Será publicado após aprovação.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="h-full w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden flex flex-col">
      <div className="pt-8 px-7 pb-2 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 items-center sm:items-start">
          <div
            className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center"
            style={{ background: `${accent}1a` }}
          >
            <HandHeart className="h-7 w-7" strokeWidth={1.5} style={{ color: accent }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: accent }}>
              Intercessão
            </p>
            <h3
              className="text-[22px] leading-tight text-stone-800 mt-1"
              style={{ fontFamily: "var(--font-display, 'Playfair Display', serif)" }}
            >
              Envie seu <span className="italic">pedido de oração</span>
            </h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500 leading-relaxed">
          Compartilhe sua intenção. Nossa comunidade vai orar por você.
        </p>
      </div>

      <div className="px-7 pb-7 pt-5 flex-1 flex flex-col">
        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: `${accent}1a`, color: accent }}>
              <Heart className="h-6 w-6" />
            </div>
            <p className="text-sm text-stone-600 max-w-xs">
              Obrigado! Seu pedido foi recebido e será publicado após revisão.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 text-xs uppercase tracking-widest font-semibold"
              style={{ color: accent }}
            >
              Enviar outro pedido
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (!mut.isPending) mut.mutate(); }} className="space-y-3 flex-1 flex flex-col">
            <div>
              <Label htmlFor="pr-name" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500">Seu nome</Label>
              <Input
                id="pr-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 bg-stone-50 border-stone-200/60 rounded-xl h-11"
                placeholder="Como devemos te chamar"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <Label htmlFor="pr-msg" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500">Pedido</Label>
              <Textarea
                id="pr-msg"
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 bg-stone-50 border-stone-200/60 rounded-xl resize-none flex-1 min-h-[110px]"
                placeholder="Pelo que devemos orar?"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="pr-anon" checked={form.is_anonymous} onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })} />
              <Label htmlFor="pr-anon" className="!m-0 cursor-pointer text-xs text-stone-600">Enviar como anônimo</Label>
            </div>
            <button
              type="submit"
              disabled={mut.isPending}
              className="w-full text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer hover:opacity-95 disabled:opacity-60"
              style={{ background: accent, boxShadow: `0 10px 25px -10px ${accent}66` }}
            >
              <HandHeart className="h-[18px] w-[18px]" />
              <span className="text-[15px]">{mut.isPending ? "Enviando..." : "Enviar pedido de oração"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function PixModule({ pixKey, merchantName, accent }: { pixKey: string; merchantName: string; accent: string }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const payload = useMemo(
    () => buildPixBrCode({ pixKey, merchantName, merchantCity: "BRASIL" }),
    [pixKey, merchantName],
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(payload, { margin: 1, width: 320, errorCorrectionLevel: "M" })
      .then((url: string) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [payload]);

  const copy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    toast.success("Código Pix copiado");
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="h-full w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden flex flex-col">
      <div className="pt-7 pb-3 px-6 flex flex-col items-center text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{ background: `${accent}1a` }}
        >
          <Heart className="h-6 w-6" strokeWidth={1.5} style={{ color: accent }} />
        </div>
        <h3
          className="text-[20px] leading-tight text-stone-800 mb-1"
          style={{ fontFamily: "var(--font-display, 'Playfair Display', serif)" }}
        >
          Faça sua <span className="italic">contribuição</span>
        </h3>
        <p className="text-[13px] text-stone-500 leading-relaxed px-1">
          Aponte a câmera do seu banco e escolha o valor.
        </p>
      </div>

      <div className="px-5 pb-6 space-y-3 flex-1 flex flex-col">
        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code Pix" className="w-44 h-44 sm:w-52 sm:h-52" />
          ) : (
            <div className="w-44 h-44 sm:w-52 sm:h-52 animate-pulse bg-stone-200/70 rounded-lg" />
          )}
        </div>

        <button
          type="button"
          onClick={copy}
          className="w-full text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer hover:opacity-95"
          style={{
            background: copied ? "#16a34a" : accent,
            boxShadow: `0 10px 25px -10px ${copied ? "#16a34a" : accent}66`,
          }}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[14px]">Código copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-[18px] w-[18px]" />
              <span className="text-[14px]">Copiar código Pix</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-stone-400 font-medium uppercase tracking-tight">
          Você escolhe o valor &bull; Seguro &bull; Direto
        </p>
      </div>
    </div>
  );
}

const HIGHLIGHT_ICON_MAP: Record<string, any> = {

  church: Church,
  users: Users,
  "heart-handshake": HeartHandshake,
  cross: Cross,
  sparkles: Sparkles,
  heart: Heart,
  "calendar-heart": CalendarHeart,
  "calendar-days": CalendarDays,
  "hand-heart": HandHeart,
  "book-open": BookOpen,
  music: Music,
  globe: Globe,
  baby: Baby,
  home: Home,
  flame: Flame,
  star: Star,
};

function LiveOrNextBanner({
  liveStatus, liveUrl, nextEvent, accent,
}: {
  liveStatus?: { status: "live" | "upcoming" | "none"; title?: string; url?: string | null; date?: string; startTime?: string } | null;
  liveUrl: string | null;
  nextEvent?: { event_date: string; start_time: string; type_name: string; location_name: string; is_live?: boolean; live_url?: string | null } | null;
  accent: string;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // New live-stream system takes precedence
  const streamLive = liveStatus?.status === "live";
  const streamUpcoming = liveStatus?.status === "upcoming" ? liveStatus : null;
  const eventLive = nextEvent?.is_live && nextEvent?.live_url;
  const liveHref = streamLive
    ? liveStatus?.url ?? null
    : eventLive
      ? nextEvent!.live_url!
      : liveUrl;
  const liveTitle = streamLive
    ? liveStatus?.title || "Transmissão em andamento"
    : eventLive
      ? `${nextEvent!.type_name} · transmissão em andamento`
      : "Transmissão em andamento";

  if (liveHref && (streamLive || eventLive || liveUrl)) {
    return (
      <Reveal>
        <a
          href={liveHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl p-5 sm:p-6 mb-10 text-white shadow-xl shadow-black/10 hover:scale-[1.01] transition"
          style={{ background: `linear-gradient(120deg, #b91c1c 0%, ${accent} 100%)` }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur shrink-0">
              <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold opacity-90">Ao vivo agora</p>
              <p className="mt-1 text-base sm:text-lg font-semibold truncate">
                {liveTitle}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-bold uppercase tracking-wider shadow-md group-hover:scale-105 transition">
              Assistir <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </a>
      </Reveal>
    );
  }

  // Prefer an upcoming live stream (from new system) over agenda event
  const target = (() => {
    if (streamUpcoming?.date && streamUpcoming?.startTime) {
      const [y, m, d] = streamUpcoming.date.split("-").map(Number);
      const [hh, mm] = streamUpcoming.startTime.split(":").map(Number);
      return {
        date: new Date(y, m - 1, d, hh, mm),
        label: streamUpcoming.title || "Próxima transmissão",
        dateStr: streamUpcoming.date,
        timeStr: streamUpcoming.startTime,
        eyebrow: "Próxima transmissão",
      };
    }
    if (nextEvent) {
      const [y, m, d] = nextEvent.event_date.split("-").map(Number);
      const [hh, mm] = (nextEvent.start_time || "00:00").split(":").map(Number);
      return {
        date: new Date(y, m - 1, d, hh, mm),
        label: `${nextEvent.type_name}`,
        dateStr: nextEvent.event_date,
        timeStr: nextEvent.start_time,
        eyebrow: "Próxima celebração",
      };
    }
    return null;
  })();

  if (!target) return null;

  const diffMs = target.date.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const Box = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center min-w-[58px] sm:min-w-[68px]">
      <span
        className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight"
        style={{ fontFamily: "var(--font-display)", color: accent }}
      >
        {value}
      </span>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold mt-0.5">
        {label}
      </span>
    </div>
  );

  return (
    <Reveal>
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-10 bg-white/80 backdrop-blur border shadow-sm hover:shadow-md transition"
        style={{ borderColor: `${accent}33` }}
      >
        <div
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: accent }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${accent}1a`, color: accent }}
            >
              <CalendarHeart className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-semibold">
                {target.eyebrow}
              </p>
              <p className="text-sm sm:text-base font-semibold text-stone-900 truncate">
                {target.label} · {formatDate(target.dateStr)} · {target.timeStr?.slice(0, 5)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-end">
            {days > 0 && <Box value={pad(days)} label="dias" />}
            <Box value={pad(hours)} label="horas" />
            <Box value={pad(mins)} label="min" />
            {days === 0 && <Box value={pad(secs)} label="seg" />}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function LightboxGallery({ images, accent, previewCount = 8 }: { images: string[]; accent: string; previewCount?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? images : images.slice(0, previewCount);
  const hasMore = images.length > previewCount;
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, images.length]);
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {visible.map((url, i) => (
          <Reveal key={i} delay={(i % 8) * 60}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={`group relative w-full overflow-hidden rounded-md bg-stone-200 ${
                i % 5 === 0 ? "aspect-[3/4] sm:row-span-2 sm:aspect-auto sm:h-full" : "aspect-square"
              }`}
              aria-label="Abrir imagem"
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                style={{ background: `linear-gradient(180deg, transparent 55%, ${accent}80 100%)` }}
              />
            </button>
          </Reveal>
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90"
            style={{ background: accent }}
          >
            {showAll ? "Mostrar menos" : `Ver galeria completa (${images.length})`}
          </button>
        </div>
      )}
      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Fechar"
          >
            <XIcon className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen((i) => (i! - 1 + images.length) % images.length); }}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen((i) => (i! + 1) % images.length); }}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Próximo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={images[open]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
            {open + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

function HighlightsBar({
  items,
  accent,
}: {
  items: Array<{ icon: string; value: string; label: string; sublabel?: string | null }>;
  accent: string;
}) {
  const cols = items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section
      className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden"
      style={{ borderColor: `${accent}33` }}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${cols} divide-y sm:divide-y-0 sm:divide-x divide-stone-200`}
      >
        {items.map((h, i) => {
          const Icon = HIGHLIGHT_ICON_MAP[h.icon] || Church;
          const numeric = parseInt(String(h.value).replace(/\D/g, ""), 10);
          const hasNumber = Number.isFinite(numeric) && numeric > 0;
          return (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-6 sm:py-7"
            >
              <div
                className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center"
                style={{ background: `${accent}14`, color: accent }}
              >
                <Icon className="h-7 w-7" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-2xl sm:text-3xl font-bold leading-none tracking-tight"
                  style={{ color: accent, fontFamily: "var(--font-display)" }}
                >
                  {hasNumber ? <CountUp target={numeric} prefix="+" /> : h.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-stone-800 leading-snug">
                  {h.label}
                </p>
                {h.sublabel && (
                  <p className="text-xs text-stone-500 leading-snug">{h.sublabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CountUp({ target, prefix = "", duration = 1600 }: { target: number; prefix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") { run(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) run(); });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{value.toLocaleString("pt-BR")}</span>;
}

// ===================== LocationCard (Onde estamos) =====================
function LocationCard({ loc, accent, single }: { loc: any; accent: string; single: boolean }) {
  const address = loc.address as string;
  const lat = loc.latitude != null ? Number(loc.latitude) : NaN;
  const lng = loc.longitude != null ? Number(loc.longitude) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const coords = hasCoords ? `${lat},${lng}` : null;

  const mapEmbedSrc = hasCoords
    ? `https://www.google.com/maps?q=${coords}&z=17&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const mapsHref =
    loc.maps_url ||
    (loc.place_id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${loc.place_id}`
      : hasCoords
        ? `https://www.google.com/maps/search/?api=1&query=${coords}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  const wazeHref =
    loc.waze_url ||
    (hasCoords
      ? `https://www.waze.com/ul?ll=${coords}&navigate=yes`
      : `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`);
  const uberHref =
    loc.uber_url ||
    (hasCoords
      ? `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[formatted_address]=${encodeURIComponent(address)}`
      : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(address)}`);
  const waLink = loc.whatsapp
    ? `https://wa.me/${String(loc.whatsapp).replace(/\D/g, "")}`
    : null;
  const telLink = loc.phone ? `tel:${String(loc.phone).replace(/\s/g, "")}` : null;

  return (
    <div
      className={
        "rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition " +
        (single
          ? "grid grid-cols-1 md:grid-cols-[1.1fr_1fr] md:min-h-[460px]"
          : "flex flex-col")
      }
    >
      {/* Mapa embed */}
      <div
        className={
          "relative bg-stone-100 " +
          (single ? "aspect-[16/10] md:aspect-auto md:h-full" : "")
        }
        style={single ? undefined : { aspectRatio: "4/3" }}
      >
        <iframe
          title={`Mapa ${loc.name}`}
          src={mapEmbedSrc}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {!hasCoords && (
          <span className="absolute bottom-3 right-3 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded shadow">
            Localização aproximada
          </span>
        )}
        {loc.is_main && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow"
            style={{ background: accent }}
          >
            Matriz
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4">
        {/* Header */}
        <div>
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${accent}1f`, color: accent }}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3
                className="text-xl tracking-tight text-stone-900 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {loc.name}
              </h3>
              <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{address}</p>
            </div>
          </div>
        </div>

        {/* Info blocks */}
        {(loc.office_hours || loc.transport_info || telLink || waLink) && (
          <div className="space-y-2.5 text-sm border-t border-stone-100 pt-4">
            {loc.office_hours && (
              <div className="flex gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 mt-0.5 w-20">
                  Secretaria
                </span>
                <p className="text-stone-700 whitespace-pre-line">{loc.office_hours}</p>
              </div>
            )}
            {loc.transport_info && (
              <div className="flex gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 mt-0.5 w-20">
                  Transporte
                </span>
                <p className="text-stone-700 whitespace-pre-line">{loc.transport_info}</p>
              </div>
            )}
            {(telLink || waLink) && (
              <div className="flex gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 mt-0.5 w-20">
                  Contato
                </span>
                <div className="flex flex-wrap gap-3 text-stone-700">
                  {telLink && (
                    <a href={telLink} className="inline-flex items-center gap-1.5 hover:underline">
                      <Phone className="h-3.5 w-3.5" /> {loc.phone}
                    </a>
                  )}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-auto pt-4 border-t border-stone-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
            Como chegar
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener"
              className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700"
            >
              <span className="text-base leading-none">🗺️</span>
              Maps
            </a>
            <a
              href={wazeHref}
              target="_blank"
              rel="noopener"
              className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700"
            >
              <span className="text-base leading-none">🚗</span>
              Waze
            </a>
            <a
              href={uberHref}
              target="_blank"
              rel="noopener"
              className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700"
            >
              <span className="text-base leading-none">🚕</span>
              Uber
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveScheduleStrip({
  items, liveUrl, accent,
}: {
  items: Array<{ title: string; weekday: number; start_time: string }>;
  liveUrl: string | null;
  accent: string;
}) {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return (
    <Reveal>
      <div
        className="rounded-2xl p-5 sm:p-6 mb-10 border bg-white/70 backdrop-blur"
        style={{ borderColor: `${accent}33` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4" style={{ color: accent }} />
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-stone-500">
            Transmissões ao vivo
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex flex-col rounded-lg border border-stone-200 bg-white px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                Toda {days[it.weekday] ?? ""}
              </p>
              <p className="text-sm font-semibold text-stone-900 truncate">{it.title}</p>
              <p className="text-xs text-stone-600">às {it.start_time?.slice(0, 5)}</p>
            </div>
          ))}
        </div>
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: accent }}
          >
            Acessar canal <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </Reveal>
  );
}

function LiveCombinedSection({
  liveStatus, liveUrl, nextEvent, schedule, accent,
}: {
  liveStatus?: { status: "live" | "upcoming" | "none"; title?: string; url?: string | null; date?: string; startTime?: string } | null;
  liveUrl: string | null;
  nextEvent?: { event_date: string; start_time: string; type_name: string; location_name: string; is_live?: boolean; live_url?: string | null } | null;
  schedule: Array<{ title: string; weekday: number; start_time: string }>;
  accent: string;
}) {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const streamLive = liveStatus?.status === "live";
  const eventLive = !!(nextEvent?.is_live && nextEvent?.live_url);
  const isLive = streamLive || eventLive;
  const liveHref = streamLive
    ? liveStatus?.url ?? liveUrl
    : eventLive
      ? nextEvent!.live_url!
      : liveUrl;
  const liveTitle = streamLive
    ? liveStatus?.title || "Transmissão em andamento"
    : eventLive
      ? `${nextEvent!.type_name} · transmissão em andamento`
      : "";

  // Compute next 2 upcoming occurrences from the weekly schedule
  // Compute upcoming occurrences across the next 4 weeks
  const allUpcoming = (() => {
    if (!schedule.length) return [] as Array<{ title: string; weekday: number; start_time: string; nextDate: Date }>;
    const now = new Date();
    const items: Array<{ title: string; weekday: number; start_time: string; nextDate: Date }> = [];
    for (const it of schedule) {
      const base = new Date(now);
      const diff = (it.weekday - now.getDay() + 7) % 7;
      base.setDate(now.getDate() + diff);
      const [hh, mm] = (it.start_time || "00:00").split(":").map(Number);
      base.setHours(hh, mm, 0, 0);
      if (base.getTime() < now.getTime()) base.setDate(base.getDate() + 7);
      for (let w = 0; w < 4; w++) {
        const d = new Date(base);
        d.setDate(base.getDate() + w * 7);
        items.push({ ...it, nextDate: d });
      }
    }
    items.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return items;
  })();
  const upcoming = allUpcoming.slice(0, 2);
  const hasMore = allUpcoming.length > upcoming.length;
  const [showAll, setShowAll] = useState(false);
  const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });

  if (!isLive && upcoming.length === 0 && !liveUrl) return null;

  return (
    <Reveal>
      <div
        className="relative overflow-hidden rounded-2xl mb-10 border bg-white/80 backdrop-blur shadow-sm"
        style={{ borderColor: `${accent}33` }}
      >
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* LEFT: live status panel */}
          <div
            className={`relative md:col-span-2 p-5 sm:p-6 text-white overflow-hidden ${isLive ? "" : ""}`}
            style={{
              background: isLive
                ? `linear-gradient(120deg, #b91c1c 0%, ${accent} 100%)`
                : `linear-gradient(120deg, #1f2937 0%, #334155 100%)`,
            }}
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-4 h-full">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur shrink-0">
                {isLive && (
                  <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                )}
                {isLive ? (
                  <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
                ) : (
                  <Radio className="relative h-4 w-4 text-white/90" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                {isLive ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold opacity-90">
                      Ao vivo agora
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-semibold truncate">
                      {liveTitle}
                    </p>
                  </>
                ) : upcoming.length > 0 ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold opacity-80">
                      Próxima transmissão
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-semibold truncate">
                      {upcoming[0].title}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">
                      {days[upcoming[0].weekday]} · {upcoming[0].start_time?.slice(0, 5)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold opacity-80">
                      Transmissões
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-semibold">
                      Sem transmissão agora
                    </p>
                  </>
                )}
              </div>
              {isLive && liveHref && (
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition"
                >
                  Assistir <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {isLive && liveHref && (
              <a
                href={liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Assistir <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* RIGHT: upcoming schedule */}
          <div className="md:col-span-3 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="h-4 w-4" style={{ color: accent }} />
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-stone-500">
                Próximas transmissões
              </p>
            </div>
            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {upcoming.map((it, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-lg border border-stone-200 bg-white px-3 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                      Toda {days[it.weekday] ?? ""}
                    </p>
                    <p className="text-sm font-semibold text-stone-900 truncate">{it.title}</p>
                    <p className="text-xs text-stone-600">às {it.start_time?.slice(0, 5)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Nenhuma transmissão agendada no momento.</p>
            )}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              {hasMore && (
                <Dialog open={showAll} onOpenChange={setShowAll}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:opacity-80"
                      style={{ color: accent }}
                    >
                      Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Próximas transmissões</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 max-h-[60vh] overflow-y-auto divide-y divide-stone-200">
                      {allUpcoming.map((it, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                              {days[it.weekday]} · {dateFmt.format(it.nextDate)}
                            </p>
                            <p className="text-sm font-semibold text-stone-900 truncate">{it.title}</p>
                          </div>
                          <p className="text-xs text-stone-600 shrink-0 ml-3">às {it.start_time?.slice(0, 5)}</p>
                        </div>
                      ))}
                    </div>
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: accent }}
                      >
                        Acessar canal <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </DialogContent>
                </Dialog>
              )}
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: accent }}
                >
                  Acessar canal <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function DonationsPreview({
  campaigns, slug, accent, fixedImageUrl,
}: {
  campaigns: Array<{ id: string; title: string; description: string | null; image_url: string | null; goal_cents: number | null; featured: boolean }>;
  slug: string;
  accent: string;
  fixedImageUrl?: string | null;
}) {
  const showFixed = !!fixedImageUrl;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }
  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [campaigns.length]);
  function scrollBy(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section id="doacoes" className="mb-12 scroll-mt-24">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>
            Faça parte
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
            Contribua com a obra
          </h2>
        </div>
        <Link
          to="/d/$slug"
          params={{ slug }}
          className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition hover:opacity-90"
          style={{ background: accent }}
        >
          Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="block">
        <div className="relative min-w-0">
          {canPrev && (
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
              className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md border border-stone-200 hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 text-stone-700" />
            </button>
          )}
          {canNext && (
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Próxima"
              className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md border border-stone-200 hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 text-stone-700" />
            </button>
          )}

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {showFixed && (
              <Link
                to="/d/$slug"
                params={{ slug }}
                aria-label="Faça parte da obra"
                className="group snap-start shrink-0 flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 hover:shadow-lg hover:-translate-y-0.5 transition w-[78%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
              >
                <img
                  src={fixedImageUrl!}
                  alt="Faça parte da obra"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
                />
              </Link>
            )}
            {campaigns.map((c) => (
              <Link
                key={c.id}
                to="/d/$slug"
                params={{ slug }}
                className="group snap-start shrink-0 flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-white hover:shadow-lg hover:-translate-y-0.5 transition w-[78%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
              >
                {c.image_url ? (
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                    <img src={c.image_url} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                ) : (
                  <div className="aspect-[16/10]" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <HandHeart className="h-10 w-10" style={{ color: accent }} />
                    </div>
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  {c.featured && (
                    <span className="self-start text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mb-1" style={{ background: `${accent}1a`, color: accent }}>
                      Destaque
                    </span>
                  )}
                  <h3 className="font-semibold text-stone-900 line-clamp-2">{c.title}</h3>
                  {c.description && (
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{c.description}</p>
                  )}
                  <span
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    Contribuir via Pix <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 sm:hidden">
        <Link
          to="/d/$slug"
          params={{ slug }}
          className="w-full inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-white"
          style={{ background: accent }}
        >
          Ver todas as campanhas <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
