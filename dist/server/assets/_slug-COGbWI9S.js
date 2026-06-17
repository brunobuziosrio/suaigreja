import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { K as Route, L as getPublicInstagramPosts, c as submitPrayerRequest } from "./router-BudgN2VI.js";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQuery, useMutation } from "@tanstack/react-query";
import { I as Input } from "./input-DAQqOwjK.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-D8DF8Lur.js";
import { Youtube, Facebook, Instagram, MessageCircle, Globe, ArrowUpRight, PlayCircle, BookOpen, X, Quote, HandHeart, Heart, MapPin, Menu, ChevronLeft, ChevronRight, Sparkles, CalendarHeart, Newspaper, Radio, Star, Flame, Home, Baby, Music, CalendarDays, Cross, HeartHandshake, Users, Church, Copy, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import { b as buildPixBrCode } from "./pix-brcode-DEjoVxT-.js";
import { P as PublicAgendaView } from "./public-agenda-view-Cj58QWoJ.js";
import { o as openWhatsAppShare } from "./whatsapp-share-BG6O2nOK.js";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "./admin-payment-settings.functions-Buvk9CeQ.js";
import "./server-Bu1wP-pG.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-_63E0ssP.js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@radix-ui/react-switch";
import "@radix-ui/react-dialog";
const defaultCover = "/assets/hub-default-cover-CSnpol7D.jpg";
function Reveal({
  children,
  delay = 0,
  className = ""
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
          break;
        }
      }
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return /* @__PURE__ */ jsx("div", { ref, className, style: {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
    willChange: "opacity, transform"
  }, children });
}
function formatDate(d) {
  const [y, m, day] = d.split("-").map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}
function ScrollProgress({
  accent
}) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? h.scrollTop / total * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "h-full transition-[width] duration-100 ease-out", style: {
    width: `${pct}%`,
    background: accent,
    boxShadow: `0 0 8px ${accent}`
  } }) });
}
function BackToTop({
  accent,
  offsetBottom = 20
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => window.scrollTo({
    top: 0,
    behavior: "smooth"
  }), "aria-label": "Voltar ao topo", className: `fixed right-5 z-40 h-11 w-11 rounded-full bg-white text-stone-700 shadow-lg ring-1 ring-stone-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`, style: {
    bottom: offsetBottom,
    color: accent
  }, children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "18 15 12 9 6 15" }) }) });
}
function HubPage() {
  const {
    account,
    agenda,
    agendaTypes,
    events,
    news,
    location,
    locations: locationsRaw,
    prayers,
    donations,
    liveStatus,
    liveSchedule,
    youtubeVideos,
    audioEmbed,
    devotional
  } = Route.useLoaderData();
  const locations = Array.isArray(locationsRaw) && locationsRaw.length > 0 ? locationsRaw : location && location.address ? [location] : [];
  const slug = account.custom_slug || account.site_id;
  const accent = account.primary_color || "#7d9b76";
  const cover = account.hub_cover_url || defaultCover;
  const gallery = Array.isArray(account.gallery_urls) ? account.gallery_urls : [];
  const fetchIgPosts = useServerFn(getPublicInstagramPosts);
  const {
    data: igPosts
  } = useQuery({
    queryKey: ["ig-posts", slug],
    queryFn: () => fetchIgPosts({
      data: {
        slug
      }
    }),
    staleTime: 5 * 60 * 1e3
  });
  const [igOpen, setIgOpen] = useState(null);
  useEffect(() => {
    if (!igOpen) return;
    const onKey = (e) => {
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
  const weeklyMessage = account.weekly_message;
  const weeklyVerse = account.weekly_verse;
  const weeklyVerseRef = account.weekly_verse_ref;
  const rawSlides = Array.isArray(account.hub_slides) ? account.hub_slides : [];
  const slides = rawSlides.filter((s) => s && s.image_url);
  const highlights = Array.isArray(account.hub_highlights) ? account.hub_highlights : [];
  const showWa = account.hub_show_whatsapp !== false;
  const waRaw = account.hub_whatsapp || account.visitor_whatsapp || "";
  const waNumber = showWa ? waRaw.replace(/\D/g, "") : "";
  const socials = [account.social_youtube && {
    href: account.social_youtube,
    Icon: Youtube,
    label: "YouTube",
    sub: "Inscreva-se no canal"
  }, account.social_facebook && {
    href: account.social_facebook,
    Icon: Facebook,
    label: "Facebook",
    sub: "Curta nossa página"
  }, account.social_instagram && {
    href: account.social_instagram,
    Icon: Instagram,
    label: "Instagram",
    sub: "Siga as publicações"
  }, waNumber && {
    href: `https://wa.me/${waNumber}`,
    Icon: MessageCircle,
    label: "WhatsApp",
    sub: "Fale com a gente"
  }, account.social_website && {
    href: account.social_website,
    Icon: Globe,
    label: "Site",
    sub: "Conheça mais"
  }].filter(Boolean);
  const navItems = [{
    label: "Início",
    href: `/${slug}`
  }, account.hub_show_agenda && {
    label: "Agenda",
    href: `/a/${slug}`
  }, account.hub_show_events && {
    label: "Eventos",
    href: `/eventos/${slug}`
  }, {
    label: "Notícias",
    href: `/n/${slug}`
  }, {
    label: "Transmissões",
    href: `/${slug}#transmissoes`
  }, account.hub_show_prayer && {
    label: "Oração",
    href: `/o/${slug}`
  }].filter(Boolean);
  return /* @__PURE__ */ jsxs("div", { id: "topo", className: "min-h-screen font-sans", style: {
    background: "linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)",
    color: "#3a3a3a",
    ["--accent"]: accent
  }, children: [
    /* @__PURE__ */ jsx(TopNav, { brandTitle: account.brand_title, logoUrl: account.brand_logo_url ?? null, logoHeight: account.brand_logo_height_px ?? 32, accent, items: navItems, liveUrl: account.live_url, ctaLabel: account.cta_enabled === false ? null : account.cta_label || "Doar Agora", ctaHref: `/d/${slug}` }),
    slides.length > 0 ? /* @__PURE__ */ jsx(HeroSlider, { slides, accent }) : /* @__PURE__ */ jsx(HeroEmotional, { account, accent, cover, slug, nextEvent: agenda[0] }),
    /* @__PURE__ */ jsx(QuickShortcuts, { accent, slug, account, waNumber, hasEvents: Array.isArray(events) && events.length > 0, hasNews: Array.isArray(news) && news.length > 0, hasLive: !!account.live_url, locationCount: locations.length }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-5xl mx-auto px-6 pb-24 mt-10 sm:mt-14 relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-8", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-3", style: {
          color: accent
        }, children: "Viva com a comunidade" }),
        /* @__PURE__ */ jsx("h2", { className: "text-[clamp(1rem,4.2vw,2.25rem)] md:text-4xl font-bold tracking-tight text-stone-900 leading-tight whitespace-nowrap", style: {
          fontFamily: "var(--font-display)"
        }, children: "Acompanhe momentos especiais de onde estiver" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm sm:text-base text-stone-600 leading-relaxed italic", children: "Encontros, transmissões e a vida da nossa comunidade reunidos em um único lugar." }),
        /* @__PURE__ */ jsx("div", { className: "mx-auto mt-5 h-[2px] w-16 rounded-full", style: {
          background: accent
        } })
      ] }),
      /* @__PURE__ */ jsx(LiveCombinedSection, { liveStatus, liveUrl: account.live_url, nextEvent: agenda[0], schedule: Array.isArray(liveSchedule) ? liveSchedule : [], accent }),
      Array.isArray(donations) && donations.length > 0 && /* @__PURE__ */ jsx(DonationsPreview, { campaigns: donations, slug, accent, fixedImageUrl: account?.donations_fixed_image_url ?? null }),
      highlights.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-10", children: /* @__PURE__ */ jsx(HighlightsBar, { items: highlights, accent }) }),
      (account.hub_show_prayer || account.pix_key) && /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch", children: [
        account.hub_show_prayer && /* @__PURE__ */ jsx("div", { className: account.pix_key ? "lg:col-span-3" : "lg:col-span-5", children: /* @__PURE__ */ jsx(InlinePrayerForm, { siteId: slug, accent }) }),
        account.pix_key && /* @__PURE__ */ jsx("div", { id: "pix", className: `scroll-mt-24 ${account.hub_show_prayer ? "lg:col-span-2" : "lg:col-span-5 max-w-md mx-auto w-full"}`, children: /* @__PURE__ */ jsx(PixModule, { pixKey: account.pix_key, merchantName: account.brand_title ?? "IGREJA", accent }) })
      ] }),
      account.hub_show_agenda && (() => {
        const today = /* @__PURE__ */ new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const todayStr = ymd(today);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = ymd(tomorrow);
        const summary = agenda.filter((e) => e.event_date === todayStr || e.event_date === tomorrowStr);
        return /* @__PURE__ */ jsxs("section", { id: "agenda", className: "mt-20 scroll-mt-24", children: [
          /* @__PURE__ */ jsx("p", { className: "text-center text-sm italic text-stone-600 max-w-xl mx-auto mb-6", children: "Fique por dentro dos próximos encontros e atividades da comunidade." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 border-b border-stone-300 pb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold", style: {
                color: accent
              }, children: "Programação" }),
              /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900", style: {
                fontFamily: "var(--font-display)"
              }, children: "Resumo da agenda" })
            ] }),
            /* @__PURE__ */ jsxs(Link, { to: "/a/$siteId", params: {
              siteId: slug
            }, target: "_blank", rel: "noopener noreferrer", className: "hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition hover:opacity-90", style: {
              background: accent
            }, children: [
              "Ver agenda completa ",
              /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
            ] })
          ] }),
          summary.length > 0 ? /* @__PURE__ */ jsx(PublicAgendaView, { account: {
            brand_title: account.brand_title || "Agenda",
            brand_subtitle: "",
            brand_empty_message: account.brand_empty_message || "Sem celebrações agendadas.",
            brand_today_title: account.brand_today_title || "Celebrações de hoje",
            primary_color: accent,
            force_show_type: account.force_show_type
          }, events: summary, types: agendaTypes || [] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-600 py-6", children: "Nenhuma celebração para hoje ou amanhã." }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 sm:hidden", children: /* @__PURE__ */ jsxs(Link, { to: "/a/$siteId", params: {
            siteId: slug
          }, target: "_blank", rel: "noopener noreferrer", className: "w-full inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-white", style: {
            background: accent
          }, children: [
            "Ver agenda completa ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
          ] }) })
        ] });
      })(),
      news && news.length > 0 && /* @__PURE__ */ jsxs("section", { id: "noticias", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-12", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold", style: {
            color: accent
          }, children: "Fique por dentro" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Notícias e Artigos" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm sm:text-base italic text-stone-600 leading-relaxed", children: "Informações, mensagens e momentos da comunidade reunidos para você acompanhar." })
        ] }),
        (() => {
          const [featured, ...rest] = news;
          const sideItems = rest.slice(0, 2);
          account?.display_name || "Notícias";
          const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          });
          const truncate = (s, n) => {
            if (!s) return "";
            const clean = String(s).replace(/<[^>]+>/g, "").trim();
            return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
          };
          const Tag = () => /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", style: {
            background: `${accent}1a`,
            color: accent
          }, children: "Notícias" });
          return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch", children: [
            /* @__PURE__ */ jsx(Reveal, { className: "h-full", children: /* @__PURE__ */ jsxs(Link, { to: "/n/$slug/$postId", params: {
              slug,
              postId: featured.id
            }, className: "group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden p-2", children: [
              /* @__PURE__ */ jsx("div", { className: "aspect-[16/10] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center", children: featured.image_url ? /* @__PURE__ */ jsx("img", { src: featured.image_url, alt: featured.title, loading: "lazy", className: "w-full h-full object-cover group-hover:scale-[1.04] transition duration-700" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full", style: {
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "px-4 sm:px-5 pt-5 pb-5 sm:pt-6 sm:pb-6 flex-1 flex flex-col justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-stone-500", children: [
                  /* @__PURE__ */ jsx(Tag, {}),
                  /* @__PURE__ */ jsx("span", { className: "mx-1", children: "•" }),
                  fmtDate(featured.created_at)
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-2xl sm:text-3xl leading-tight font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2", style: {
                  fontFamily: "var(--font-display)",
                  color: accent
                }, children: featured.title }),
                /* @__PURE__ */ jsx("p", { className: "text-[15px] sm:text-base text-stone-600 leading-relaxed line-clamp-3", children: truncate(featured.subtitle || featured.content, 220) }),
                /* @__PURE__ */ jsxs("span", { className: "self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md group-hover:shadow-lg group-hover:translate-y-[-1px] transition", style: {
                  background: accent
                }, children: [
                  "Ler matéria ",
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6 h-full", children: sideItems.map((n, ni) => /* @__PURE__ */ jsx(Reveal, { delay: 150 + ni * 120, className: "flex-1 flex", children: /* @__PURE__ */ jsxs(Link, { to: "/n/$slug/$postId", params: {
              slug,
              postId: n.id
            }, className: "group w-full grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] gap-4 sm:gap-5 bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden p-2 min-h-[180px]", children: [
              /* @__PURE__ */ jsx("div", { className: "h-full min-h-[140px] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center", children: n.image_url ? /* @__PURE__ */ jsx("img", { src: n.image_url, alt: n.title, loading: "lazy", className: "w-full h-full object-cover group-hover:scale-[1.05] transition duration-700" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full", style: {
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between min-w-0 py-3 sm:py-4 pr-3 sm:pr-4 gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-stone-500", children: [
                  /* @__PURE__ */ jsx(Tag, {}),
                  /* @__PURE__ */ jsx("span", { className: "mx-1", children: "•" }),
                  fmtDate(n.created_at)
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl leading-snug font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2", style: {
                  fontFamily: "var(--font-display)",
                  color: accent
                }, children: n.title }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-600 leading-relaxed line-clamp-2", children: truncate(n.subtitle || n.content, 110) }),
                /* @__PURE__ */ jsxs("span", { className: "self-start mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider shadow-sm group-hover:shadow-md transition", style: {
                  background: accent
                }, children: [
                  "Ler matéria ",
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" })
                ] })
              ] })
            ] }) }, n.id)) })
          ] });
        })(),
        /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center", children: /* @__PURE__ */ jsxs(Link, { to: "/n/$slug", params: {
          slug
        }, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-90 hover:shadow-xl transition", style: {
          background: accent
        }, children: [
          "Ver todas as notícias ",
          /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
        ] }) })
      ] }),
      Array.isArray(youtubeVideos) && youtubeVideos.length > 0 && /* @__PURE__ */ jsxs("section", { id: "videos", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-10", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold", style: {
            color: accent
          }, children: "No nosso canal" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Acompanhe nosso canal" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm sm:text-base italic text-stone-600", children: "Confira as últimas mensagens publicadas no YouTube." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", children: youtubeVideos.map((v) => /* @__PURE__ */ jsxs("a", { href: v.url, target: "_blank", rel: "noopener", className: "group block rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg hover:-translate-y-0.5 transition", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-stone-100 overflow-hidden", children: [
            /* @__PURE__ */ jsx("img", { src: v.thumbnail, alt: v.title, loading: "lazy", className: "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition", children: /* @__PURE__ */ jsx(PlayCircle, { className: "h-12 w-12 text-white drop-shadow-lg opacity-90 group-hover:scale-110 transition", strokeWidth: 1.5 }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-medium text-stone-800 line-clamp-2 leading-snug", children: v.title }),
            v.published_at && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-500", children: new Date(v.published_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }) })
          ] })
        ] }, v.id)) }),
        account.social_youtube && /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsxs("a", { href: account.social_youtube, target: "_blank", rel: "noopener", className: "inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow hover:opacity-90 transition", style: {
          background: accent
        }, children: [
          /* @__PURE__ */ jsx(Youtube, { className: "h-4 w-4" }),
          " Ver canal completo"
        ] }) })
      ] }),
      audioEmbed && /* @__PURE__ */ jsxs("section", { id: "audio", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-10", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold", style: {
            color: accent
          }, children: "Escute quando quiser" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Nossos canais de áudio" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm sm:text-base italic text-stone-600", children: "Mensagens, louvores e estudos para ouvir a qualquer momento." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm", children: /* @__PURE__ */ jsx("iframe", { title: "Player de áudio", src: audioEmbed.src, width: "100%", height: audioEmbed.height, frameBorder: 0, allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture", loading: "lazy", style: {
          display: "block"
        } }) })
      ] }),
      weeklyVerse && /* @__PURE__ */ jsx("section", { className: "mt-16", children: /* @__PURE__ */ jsxs("div", { className: "relative rounded-xl overflow-hidden px-5 py-6 sm:px-10 sm:py-8 text-center", style: {
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
        color: "#fff"
      }, children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "absolute top-3 left-3 h-5 w-5 opacity-25" }),
        /* @__PURE__ */ jsx(BookOpen, { className: "absolute bottom-3 right-3 h-5 w-5 opacity-25" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.3em] font-semibold opacity-80", children: "Versículo da semana" }),
        /* @__PURE__ */ jsxs("blockquote", { className: "mt-3 text-base sm:text-lg md:text-xl leading-snug font-light max-w-2xl mx-auto", style: {
          fontFamily: "var(--font-display)"
        }, children: [
          "“",
          weeklyVerse,
          "”"
        ] }),
        weeklyVerseRef && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xs sm:text-sm font-semibold tracking-wide opacity-95", children: [
          "— ",
          weeklyVerseRef
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
          const parts = [`*${account.brand_title}*`, "📖 Versículo da semana", "", `"${weeklyVerse}"`];
          if (weeklyVerseRef) parts.push(`— ${weeklyVerseRef}`);
          openWhatsAppShare(parts.join("\n"));
        }, className: "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/15 hover:bg-white/25 backdrop-blur transition border border-white/30", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 fill-white", strokeWidth: 0 }),
          "Compartilhar no WhatsApp"
        ] }) })
      ] }) }),
      devotional && /* @__PURE__ */ jsxs("section", { id: "devocional", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto mb-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.25em] font-semibold", style: {
            color: accent
          }, children: "Devocional do dia" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-2 text-3xl sm:text-4xl tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Uma Palavra para hoje" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl p-8 sm:p-10 overflow-hidden bg-white shadow-sm", style: {
          border: `1px solid ${accent}33`
        }, children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "absolute top-6 right-6 h-7 w-7 opacity-30", style: {
            color: accent
          } }),
          /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [
            /* @__PURE__ */ jsxs("blockquote", { className: "text-xl sm:text-2xl leading-relaxed text-stone-800 italic", style: {
              fontFamily: "var(--font-display)"
            }, children: [
              "“",
              devotional.verse_text,
              "”"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm font-semibold", style: {
              color: accent
            }, children: [
              "— ",
              devotional.verse_ref
            ] }),
            devotional.message && /* @__PURE__ */ jsx("p", { className: "mt-6 text-base text-stone-700 leading-relaxed font-light whitespace-pre-line", children: devotional.message }),
            /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              const parts = [`*${account.brand_title}*`, "📖 Devocional do dia", "", `"${devotional.verse_text}"`, `— ${devotional.verse_ref}`];
              if (devotional.message) parts.push("", devotional.message);
              openWhatsAppShare(parts.join("\n"));
            }, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white hover:scale-[1.03] active:scale-95 transition shadow-sm", style: {
              background: "#25D366"
            }, children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4 fill-white", strokeWidth: 0 }),
              "Compartilhar"
            ] }) })
          ] })
        ] })
      ] }),
      socials.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-20", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto mb-8", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-stone-500", children: "Conecte-se" }),
          /* @__PURE__ */ jsxs("h2", { className: "mt-2 text-2xl sm:text-3xl tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: [
            "Confira as novidades e fique perto de ",
            account.brand_title
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm italic text-stone-600", children: "Acesse rapidamente os principais canais e informações." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-10", children: socials.map((s, i) => /* @__PURE__ */ jsxs("a", { href: s.href, target: "_blank", rel: "noopener", className: "group flex flex-col items-center text-center w-24 sm:w-28", children: [
          /* @__PURE__ */ jsx("div", { className: "h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border-2 flex items-center justify-center transition group-hover:scale-105", style: {
            borderColor: accent,
            color: accent
          }, children: /* @__PURE__ */ jsx(s.Icon, { className: "h-7 w-7 sm:h-8 sm:w-8", strokeWidth: 1.75 }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs font-bold uppercase tracking-wider", style: {
            color: accent
          }, children: s.label }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] sm:text-xs text-stone-600 leading-tight", children: s.sub })
        ] }, i)) })
      ] }),
      gallery.length > 0 && /* @__PURE__ */ jsxs("section", { id: "galeria", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-end justify-between mb-8 border-b border-stone-300 pb-4", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold", style: {
            color: accent
          }, children: "Nossa comunidade" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Momentos" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-stone-600 max-w-xl", children: "Compartilhando momentos que fortalecem nossa comunidade." })
        ] }) }),
        /* @__PURE__ */ jsx(LightboxGallery, { images: gallery, accent })
      ] }),
      igPosts && igPosts.length > 0 && /* @__PURE__ */ jsxs("section", { id: "instagram", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-8 border-b border-stone-300 pb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold", style: {
              color: accent
            }, children: "Instagram" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900", style: {
              fontFamily: "var(--font-display)"
            }, children: "Últimas publicações" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-stone-600 max-w-xl", children: "Acompanhe os momentos da nossa comunidade diretamente do Instagram." })
          ] }),
          account.social_instagram && /* @__PURE__ */ jsxs("a", { href: account.social_instagram, target: "_blank", rel: "noreferrer", className: "hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:underline", style: {
            color: accent
          }, children: [
            "Ver perfil ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
          ] })
        ] }),
        (() => {
          const igCount = Math.max(3, Math.min(30, Number(account.instagram_post_count) || 9));
          const igCols = Math.max(2, Math.min(6, Number(account.instagram_columns) || 3));
          const colClass = {
            2: "sm:grid-cols-2",
            3: "sm:grid-cols-3",
            4: "sm:grid-cols-4",
            5: "sm:grid-cols-5",
            6: "sm:grid-cols-6"
          }[igCols] || "sm:grid-cols-3";
          return /* @__PURE__ */ jsx("div", { className: `grid grid-cols-2 ${colClass} gap-2 sm:gap-3`, children: igPosts.slice(0, igCount).map((post) => {
            const isVideo = post.media_type === "VIDEO";
            const imgSrc = isVideo ? post.thumbnail_url || post.media_url : post.media_url;
            return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setIgOpen(post), className: "relative aspect-square overflow-hidden rounded-md bg-stone-100 group text-left", title: post.caption?.slice(0, 120) || "Abrir publicação", children: [
              /* @__PURE__ */ jsx("img", { src: imgSrc, alt: post.caption?.slice(0, 120) || "Post do Instagram", loading: "lazy", className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }),
              isVideo && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1", children: /* @__PURE__ */ jsx(PlayCircle, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3", children: /* @__PURE__ */ jsx(Instagram, { className: "h-5 w-5 text-white" }) })
            ] }, post.id);
          }) });
        })(),
        igOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8", onClick: () => setIgOpen(null), role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "relative bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col sm:flex-row shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIgOpen(null), "aria-label": "Fechar", className: "absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("div", { className: "bg-black flex-1 min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center", children: igOpen.media_type === "VIDEO" ? /* @__PURE__ */ jsx("video", { src: igOpen.media_url, poster: igOpen.thumbnail_url || void 0, controls: true, autoPlay: true, playsInline: true, className: "max-w-full max-h-[80vh] w-auto h-auto" }) : /* @__PURE__ */ jsx("img", { src: igOpen.media_url, alt: igOpen.caption?.slice(0, 120) || "Post do Instagram", className: "max-w-full max-h-[80vh] w-auto h-auto object-contain" }) }),
          /* @__PURE__ */ jsxs("div", { className: "sm:w-80 sm:max-w-[40%] flex flex-col bg-white border-t sm:border-t-0 sm:border-l border-stone-200", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-4 border-b border-stone-200", children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4 text-white" }) }),
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-stone-800", children: "Instagram" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-4 overflow-y-auto text-sm text-stone-700 whitespace-pre-wrap flex-1", children: igOpen.caption || /* @__PURE__ */ jsx("span", { className: "text-stone-400", children: "Sem legenda" }) }),
            /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-stone-200", children: /* @__PURE__ */ jsxs("a", { href: igOpen.permalink, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition w-full justify-center", style: {
              background: accent
            }, children: [
              /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4" }),
              " Ver no Instagram",
              /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
            ] }) })
          ] })
        ] }) })
      ] }),
      weeklyMessage && /* @__PURE__ */ jsx("section", { className: "mt-16", children: /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start bg-white rounded-xl p-5 sm:p-7 shadow-sm border border-stone-200 max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "hidden md:flex h-10 w-10 rounded-full items-center justify-center shrink-0", style: {
          background: `${accent}15`,
          color: accent
        }, children: /* @__PURE__ */ jsx(Quote, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.22em] font-semibold", style: {
            color: accent
          }, children: "Palavra da semana" }),
          /* @__PURE__ */ jsx("h3", { className: "mt-1 text-lg sm:text-xl font-bold tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Uma mensagem para você" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm sm:text-base text-stone-700 leading-relaxed font-light whitespace-pre-line", children: weeklyMessage }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
            const parts = [`*${account.brand_title}*`, "✨ Palavra da semana", "", weeklyMessage];
            openWhatsAppShare(parts.join("\n"));
          }, className: "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white hover:scale-[1.03] active:scale-95 transition shadow-sm", style: {
            background: "#25D366"
          }, children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 fill-white", strokeWidth: 0 }),
            "Compartilhar no WhatsApp"
          ] }) })
        ] })
      ] }) }),
      account.hub_show_prayer && prayers && prayers.length > 0 && /* @__PURE__ */ jsxs("section", { id: "mural", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-8 border-b border-stone-300 pb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold", style: {
              color: accent
            }, children: "Pedidos da comunidade" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900", style: {
              fontFamily: "var(--font-display)"
            }, children: "Mural de intenções" })
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/o/$siteId", params: {
            siteId: slug
          }, className: "hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition hover:opacity-90", style: {
            background: accent
          }, children: [
            "Deixar meu pedido ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: prayers.map((p, idx) => /* @__PURE__ */ jsx(Reveal, { delay: idx * 80, children: /* @__PURE__ */ jsxs("article", { className: "relative h-full rounded-lg p-5 bg-white/70 backdrop-blur border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition", children: [
          /* @__PURE__ */ jsx(HandHeart, { className: "absolute top-4 right-4 h-4 w-4 opacity-30", style: {
            color: accent
          } }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-700 leading-relaxed line-clamp-5", children: [
            '"',
            p.message,
            '"'
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-stone-500", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold uppercase tracking-wider", style: {
              color: accent
            }, children: p.name }),
            p.prayer_count > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 fill-current", style: {
                color: accent
              } }),
              p.prayer_count
            ] })
          ] })
        ] }) }, p.id)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 sm:hidden", children: /* @__PURE__ */ jsxs(Link, { to: "/o/$siteId", params: {
          siteId: slug
        }, className: "w-full inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-white", style: {
          background: accent
        }, children: [
          "Deixar meu pedido ",
          /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
        ] }) })
      ] }),
      locations.length > 0 && (() => {
        const showAllLocs = account.hub_show_all_locations === true;
        const mainLoc = locations.find((l) => l.is_main) ?? locations[0];
        const extras = locations.filter((l) => l !== mainLoc);
        const displayed = showAllLocs ? locations : [mainLoc];
        const isSingle = displayed.length === 1;
        return /* @__PURE__ */ jsxs("section", { id: "enderecos", className: "relative mt-20 scroll-mt-24", children: [
          /* @__PURE__ */ jsx("span", { id: "mapa", className: "absolute -top-24", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end justify-between mb-8 border-b border-stone-300 pb-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold", style: {
              color: accent
            }, children: "Venha nos visitar" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900", style: {
              fontFamily: "var(--font-display)"
            }, children: displayed.length > 1 ? "Nossas unidades" : "Onde estamos" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-stone-600 max-w-xl", children: displayed.length > 1 ? "Encontre a unidade mais próxima de você." : "Estamos sempre próximos para acolher e informar." })
          ] }) }),
          /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("div", { className: isSingle ? "grid grid-cols-1 gap-6 items-stretch" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: displayed.map((loc) => /* @__PURE__ */ jsx(LocationCard, { loc, accent, single: isSingle }, loc.id ?? loc.name)) }) }),
          !showAllLocs && extras.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsxs(Link, { to: "/enderecos/$slug", params: {
            slug: account.custom_slug || account.site_id
          }, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition hover:scale-[1.03] active:scale-95", style: {
            borderColor: accent,
            color: accent
          }, children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
            "Ver todos os endereços (",
            locations.length,
            ")"
          ] }) })
        ] });
      })(),
      account.hub_show_events && events.length > 0 && /* @__PURE__ */ jsxs("section", { id: "eventos", className: "mt-20 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-12", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold", style: {
            color: accent
          }, children: "Em destaque" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900", style: {
            fontFamily: "var(--font-display)"
          }, children: "Eventos" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm sm:text-base italic text-stone-600 leading-relaxed", children: "Celebrações, encontros e momentos especiais da nossa comunidade." })
        ] }),
        (() => {
          const [featured, ...rest] = events;
          const sideItems = rest.slice(0, 2);
          const Tag = () => /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", style: {
            background: `${accent}1a`,
            color: accent
          }, children: "Evento" });
          const priceLabel = (cents) => cents > 0 ? `R$ ${(cents / 100).toFixed(2).replace(".", ",")}` : "Gratuito";
          const PriceChip = ({
            cents
          }) => {
            const free = !cents || cents <= 0;
            return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", style: free ? {
              background: "#16a34a1a",
              color: "#15803d"
            } : {
              background: `${accent}1a`,
              color: accent
            }, children: free ? "Gratuito" : priceLabel(cents) });
          };
          const truncate = (s, n) => {
            if (!s) return "";
            const clean = String(s).replace(/<[^>]+>/g, "").trim();
            return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
          };
          return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch", children: [
            /* @__PURE__ */ jsx(Reveal, { className: "h-full", children: /* @__PURE__ */ jsxs(Link, { to: "/e/$slug", params: {
              slug: featured.slug
            }, className: "group flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden p-2", children: [
              /* @__PURE__ */ jsx("div", { className: "aspect-[16/10] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center", children: featured.cover_image_url ? /* @__PURE__ */ jsx("img", { src: featured.cover_image_url, alt: featured.title, loading: "lazy", className: "w-full h-full object-cover group-hover:scale-[1.04] transition duration-700" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full", style: {
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "px-4 sm:px-5 pt-5 pb-5 sm:pt-6 sm:pb-6 flex-1 flex flex-col justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-stone-500", children: [
                  /* @__PURE__ */ jsx(Tag, {}),
                  /* @__PURE__ */ jsx(PriceChip, { cents: featured.price_cents }),
                  /* @__PURE__ */ jsx("span", { className: "mx-1", children: "•" }),
                  formatDate(featured.event_date),
                  " · ",
                  featured.start_time?.slice(0, 5)
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-2xl sm:text-3xl leading-tight font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2", style: {
                  fontFamily: "var(--font-display)",
                  color: accent
                }, children: featured.title }),
                featured.description && /* @__PURE__ */ jsx("p", { className: "text-[15px] sm:text-base text-stone-600 leading-relaxed line-clamp-3", children: truncate(featured.description, 220) }),
                /* @__PURE__ */ jsxs("span", { className: "self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md group-hover:shadow-lg group-hover:translate-y-[-1px] transition", style: {
                  background: accent
                }, children: [
                  featured.price_cents > 0 ? "Inscrever-se" : "Saiba mais",
                  " ",
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6 h-full", children: sideItems.map((e, ni) => /* @__PURE__ */ jsx(Reveal, { delay: 150 + ni * 120, className: "flex-1 flex", children: /* @__PURE__ */ jsxs(Link, { to: "/e/$slug", params: {
              slug: e.slug
            }, className: "group w-full grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] gap-4 sm:gap-5 bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden p-2 min-h-[180px]", children: [
              /* @__PURE__ */ jsx("div", { className: "h-full min-h-[140px] bg-stone-100 overflow-hidden rounded-xl flex items-center justify-center", children: e.cover_image_url ? /* @__PURE__ */ jsx("img", { src: e.cover_image_url, alt: e.title, loading: "lazy", className: "w-full h-full object-cover group-hover:scale-[1.05] transition duration-700" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full", style: {
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between min-w-0 py-3 sm:py-4 pr-3 sm:pr-4 gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-stone-500", children: [
                  /* @__PURE__ */ jsx(Tag, {}),
                  /* @__PURE__ */ jsx(PriceChip, { cents: e.price_cents }),
                  /* @__PURE__ */ jsx("span", { className: "mx-1", children: "•" }),
                  formatDate(e.event_date),
                  " · ",
                  e.start_time?.slice(0, 5)
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl leading-snug font-bold tracking-tight group-hover:underline underline-offset-4 line-clamp-2", style: {
                  fontFamily: "var(--font-display)",
                  color: accent
                }, children: e.title }),
                e.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-600 leading-relaxed line-clamp-2", children: truncate(e.description, 110) }),
                /* @__PURE__ */ jsxs("span", { className: "self-start mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider shadow-sm group-hover:shadow-md transition", style: {
                  background: accent
                }, children: [
                  e.price_cents > 0 ? "Inscrever-se" : "Saiba mais",
                  " ",
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" })
                ] })
              ] })
            ] }) }, e.id)) })
          ] });
        })(),
        /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center", children: /* @__PURE__ */ jsxs(Link, { to: "/eventos/$slug", params: {
          slug
        }, className: "inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-90 hover:shadow-xl transition", style: {
          background: accent
        }, children: [
          "Ver todos os eventos ",
          /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(HubFooter, { account, accent, navItems, socials }),
    /* @__PURE__ */ jsx(ScrollProgress, { accent }),
    /* @__PURE__ */ jsx(BackToTop, { accent, offsetBottom: 20 }),
    waNumber && /* @__PURE__ */ jsxs("a", { href: `https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${account.brand_title}.`)}`, target: "_blank", rel: "noopener noreferrer", "aria-label": "Falar no WhatsApp", className: "fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] ring-4 ring-white/70 transition-transform hover:scale-110 active:scale-95", children: [
      /* @__PURE__ */ jsx(MessageCircle, { className: "h-7 w-7 fill-white", strokeWidth: 0 }),
      /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" })
    ] })
  ] });
}
function QuickShortcuts({
  accent,
  slug,
  account,
  waNumber,
  hasEvents,
  hasNews,
  hasLive,
  locationCount
}) {
  const items = [];
  if (account.hub_show_agenda) items.push({
    label: "Agenda",
    href: "#agenda",
    Icon: CalendarDays
  });
  if (hasLive) items.push({
    label: "Transmissões",
    href: `/v/${slug}`,
    Icon: Radio
  });
  if (waNumber) items.push({
    label: "WhatsApp",
    href: `https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${account.brand_title}.`)}`,
    Icon: MessageCircle,
    external: true
  });
  if (hasEvents) items.push({
    label: "Eventos",
    href: `/eventos/${slug}`,
    Icon: CalendarHeart,
    external: true
  });
  if (account.hub_show_prayer) items.push({
    label: "Pedidos",
    href: `/o/${slug}`,
    Icon: HandHeart,
    external: true
  });
  if (hasNews) items.push({
    label: "Notícias",
    href: `/n/${slug}`,
    Icon: Newspaper,
    external: true
  });
  if (locationCount > 0) {
    items.push({
      label: locationCount === 1 ? "Endereço" : "Endereços",
      href: locationCount === 1 ? "#enderecos" : `/enderecos/${slug}`,
      Icon: MapPin,
      external: locationCount > 1
    });
  }
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsx("section", { id: "atalhos", className: "relative mt-6 sm:mt-10 z-10 scroll-mt-24", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("div", { className: "bg-white/95 backdrop-blur border border-stone-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-3 sm:p-4 rounded-2xl", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2", children: items.slice(0, 7).map((it, i) => /* @__PURE__ */ jsxs("a", { href: it.href, target: it.external ? "_blank" : void 0, rel: it.external ? "noopener" : void 0, className: "group flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl text-stone-700 hover:bg-stone-50 hover:-translate-y-0.5 transition-all", children: [
    /* @__PURE__ */ jsx("span", { className: "h-11 w-11 rounded-full flex items-center justify-center transition group-hover:scale-110", style: {
      background: `${accent}15`,
      color: accent
    }, children: /* @__PURE__ */ jsx(it.Icon, { className: "h-5 w-5", strokeWidth: 1.75 }) }),
    /* @__PURE__ */ jsx("span", { className: "text-[11px] sm:text-xs font-semibold tracking-wide text-center leading-tight", children: it.label })
  ] }, i)) }) }) }) }) });
}
function TopNav({
  brandTitle,
  logoUrl,
  logoHeight,
  accent,
  items,
  liveUrl,
  ctaLabel,
  ctaHref
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxs("nav", { className: `sticky top-0 z-40 transition-colors ${scrolled ? "bg-white/95 backdrop-blur border-b border-stone-200" : "bg-white/70 backdrop-blur"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("a", { href: "#topo", className: "flex items-center gap-2 min-w-0", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: brandTitle, style: {
        height: Math.min(Math.max(logoHeight, 16), 48)
      }, className: "w-auto object-contain shrink-0" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", style: {
          background: accent
        }, children: brandTitle?.[0]?.toUpperCase() ?? "S" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-stone-900 truncate", style: {
          fontFamily: "var(--font-display)"
        }, children: brandTitle })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-1", children: [
        items.map((it) => /* @__PURE__ */ jsx("a", { href: it.href, className: "px-3 py-1.5 text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 rounded transition", children: it.label }, it.href)),
        ctaLabel && ctaHref && /* @__PURE__ */ jsxs("a", { href: ctaHref, className: "ml-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider transition hover:opacity-90 shadow-sm", style: {
          background: accent
        }, children: [
          /* @__PURE__ */ jsx(Heart, { className: "h-3.5 w-3.5 fill-current" }),
          ctaLabel
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setOpen((o) => !o), className: "md:hidden h-9 w-9 flex items-center justify-center rounded text-stone-700 hover:bg-stone-100", "aria-label": "Abrir menu", children: open ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" }) })
    ] }),
    open && /* @__PURE__ */ jsx("div", { className: "md:hidden border-t border-stone-200 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-2 flex flex-col", children: [
      items.map((it) => /* @__PURE__ */ jsx("a", { href: it.href, onClick: () => setOpen(false), className: "py-3 text-sm text-stone-700 border-b border-stone-100 last:border-0", children: it.label }, it.href)),
      ctaLabel && ctaHref && /* @__PURE__ */ jsxs("a", { href: ctaHref, onClick: () => setOpen(false), className: "mt-3 mb-3 flex items-center justify-center gap-2 py-3 rounded-full text-white text-sm font-bold uppercase tracking-wider", style: {
        background: accent
      }, children: [
        /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4 fill-current" }),
        " ",
        ctaLabel
      ] })
    ] }) })
  ] });
}
function HeroEmotional({
  account,
  accent,
  cover,
  slug,
  nextEvent
}) {
  const headline = "Bem-vindo à nossa comunidade";
  const sub = "Eventos, transmissões e informações em um único lugar.";
  return /* @__PURE__ */ jsxs("header", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-cover bg-center scale-105 animate-[heroZoom_18s_ease-out_forwards]", style: {
      backgroundImage: `url(${cover})`
    } }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: {
      background: "linear-gradient(180deg, rgba(15,15,20,0.55) 0%, rgba(15,15,20,0.45) 45%, rgba(250,248,245,0.95) 92%, #faf8f5 100%)"
    } }),
    /* @__PURE__ */ jsx("div", { className: "absolute -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-3xl opacity-30 pointer-events-none", style: {
      background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`
    } }),
    /* @__PURE__ */ jsxs("div", { className: "relative max-w-5xl mx-auto px-6 pt-20 pb-32 sm:pt-32 sm:pb-44 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs uppercase tracking-[0.3em] text-white/80 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700", children: account.brand_title }),
      /* @__PURE__ */ jsx("h1", { className: "mt-6 text-4xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight text-white max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000", style: {
        fontFamily: "var(--font-display)",
        textShadow: "0 2px 24px rgba(0,0,0,0.35)"
      }, children: headline }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-xl mx-auto text-base sm:text-lg text-white/90 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both", children: sub }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both", children: account.hub_show_agenda ? /* @__PURE__ */ jsxs("a", { href: "#atalhos", className: "group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-stone-900 bg-white/95 backdrop-blur shadow-[0_10px_40px_-8px_rgba(0,0,0,0.4)] hover:bg-white hover:scale-[1.04] active:scale-95 transition-all", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4", style: {
          color: accent
        } }),
        "Explorar comunidade",
        /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
      ] }) : null }),
      nextEvent && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center animate-in fade-in duration-1000 delay-500 fill-mode-both", children: /* @__PURE__ */ jsx(NextEventPill, { nextEvent, accent }) })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes heroZoom { from { transform: scale(1.12); } to { transform: scale(1.02); } }
      ` })
  ] });
}
function NextEventPill({
  nextEvent,
  accent
}) {
  const [now, setNow] = useState(() => /* @__PURE__ */ new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 6e4);
    return () => clearInterval(t);
  }, []);
  const [y, m, d] = nextEvent.event_date.split("-").map(Number);
  const [hh, mm] = (nextEvent.start_time || "00:00").split(":").map(Number);
  const target = new Date(y, m - 1, d, hh, mm);
  const diffMs = target.getTime() - now.getTime();
  let countdown = "";
  if (diffMs > 0) {
    const mins = Math.floor(diffMs / 6e4);
    const days = Math.floor(mins / (60 * 24));
    const hours = Math.floor(mins % (60 * 24) / 60);
    const rmins = mins % 60;
    if (days > 0) countdown = `em ${days}d ${hours}h`;
    else if (hours > 0) countdown = `em ${hours}h ${rmins}min`;
    else countdown = `em ${rmins}min`;
  }
  return /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur shadow-xl shadow-black/20 max-w-full", children: [
    /* @__PURE__ */ jsx("span", { className: "h-9 w-9 rounded-full flex items-center justify-center shrink-0", style: {
      background: `${accent}22`,
      color: accent
    }, children: /* @__PURE__ */ jsx(CalendarHeart, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxs("div", { className: "text-left min-w-0", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold", children: [
        "Próxima celebração ",
        countdown && `· ${countdown}`
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-stone-900 truncate", children: [
        nextEvent.type_name,
        " · ",
        formatDate(nextEvent.event_date),
        " · ",
        nextEvent.start_time?.slice(0, 5)
      ] })
    ] })
  ] });
}
function HeroSlider({
  slides,
  accent
}) {
  const [idx, setIdx] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 6e3);
    return () => clearInterval(t);
  }, [n]);
  const go = (d) => setIdx((i) => (i + d + n) % n);
  return /* @__PURE__ */ jsx("header", { className: "relative", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-stone-900 aspect-[16/9] sm:aspect-[21/9]", children: [
    slides.map((s, i) => /* @__PURE__ */ jsxs("div", { className: `absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`, "aria-hidden": i !== idx, children: [
      /* @__PURE__ */ jsx("img", { src: s.image_url, alt: s.title ?? "", className: "w-full h-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: {
        background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 100%)"
      } }),
      (s.title || s.subtitle || s.cta_label) && (() => {
        const sizeMap = {
          sm: "text-2xl sm:text-3xl md:text-4xl",
          md: "text-3xl sm:text-4xl md:text-5xl",
          lg: "text-4xl sm:text-6xl md:text-7xl",
          xl: "text-5xl sm:text-7xl md:text-8xl"
        };
        const sizeKey = s.title_size || "lg";
        const titleSize = sizeMap[sizeKey] ?? sizeMap.lg;
        return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl pl-20 pr-20 sm:pl-24 sm:pr-24 text-white", children: [
          s.title && /* @__PURE__ */ jsx("h2", { className: `${titleSize} leading-[1.05] tracking-tight font-extrabold`, style: {
            fontFamily: "var(--font-display)"
          }, children: s.title }),
          s.subtitle && /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg sm:text-xl text-white/95 max-w-lg font-medium", children: s.subtitle }),
          s.cta_label && s.cta_url && /* @__PURE__ */ jsxs("a", { href: s.cta_url, target: s.cta_url.startsWith("http") ? "_blank" : void 0, rel: "noopener", className: "mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-stone-900 text-sm font-bold hover:bg-stone-100 transition shadow-lg", children: [
            s.cta_label,
            " ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
          ] })
        ] }) });
      })()
    ] }, i)),
    n > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => go(-1), className: "absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-stone-900 flex items-center justify-center transition", "aria-label": "Anterior", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => go(1), className: "absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-stone-900 flex items-center justify-center transition", "aria-label": "Próximo", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2", children: slides.map((_, i) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIdx(i), className: "h-2 rounded-full transition-all", style: {
        width: i === idx ? 24 : 8,
        background: i === idx ? accent : "rgba(255,255,255,0.6)"
      }, "aria-label": `Slide ${i + 1}` }, i)) })
    ] })
  ] }) }) });
}
function HubFooter({
  account,
  accent,
  navItems,
  socials
}) {
  const slug = account.custom_slug || account.site_id;
  const logoUrl = account.brand_footer_logo_url ?? account.brand_logo_url ?? null;
  const explore = [{
    label: "Início",
    href: `/${slug}`
  }, account.hub_show_agenda && {
    label: "Agenda",
    href: `/a/${slug}`
  }, account.hub_show_events && {
    label: "Eventos",
    href: `/eventos/${slug}`
  }, {
    label: "Notícias",
    href: `/n/${slug}`
  }, {
    label: "Transmissões",
    href: `/${slug}#transmissoes`
  }].filter(Boolean);
  const participate = [account.hub_show_prayer && {
    label: "Pedidos de oração",
    href: `/o/${slug}`
  }, account.pix_key && {
    label: "Contribuir via Pix",
    href: `/d/${slug}#pix`
  }].filter(Boolean);
  const knownHrefs = new Set([...explore, ...participate].map((i) => i.href));
  const extras = navItems.filter((n) => !knownHrefs.has(n.href));
  return /* @__PURE__ */ jsxs("footer", { className: "mt-12 bg-stone-900 text-stone-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-12", children: [
      /* @__PURE__ */ jsx("div", { className: "md:col-span-4 lg:col-span-4 min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-3", children: [
        logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: account.brand_title, className: "object-contain", style: {
          height: Math.min(56, account.brand_logo_height_px ?? 48)
        } }) : /* @__PURE__ */ jsx("span", { className: "h-12 w-12 rounded-full flex items-center justify-center text-white text-base font-bold", style: {
          background: accent
        }, children: account.brand_title?.[0]?.toUpperCase() ?? "S" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-medium text-white leading-tight", style: {
          fontFamily: "var(--font-display)"
        }, children: account.brand_title })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-3 lg:col-span-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-stone-500", children: "Explorar" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2 text-sm", children: [
          explore.map((it) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: it.href, className: "hover:text-white transition", children: it.label }) }, it.href)),
          extras.map((it) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: it.href, className: "hover:text-white transition", children: it.label }) }, it.href))
        ] })
      ] }),
      participate.length > 0 && /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 lg:col-span-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-stone-500", children: "Participar" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2 text-sm", children: participate.map((it) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: it.href, className: "hover:text-white transition", children: it.label }) }, it.href)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-3 lg:col-span-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-stone-500", children: "Conecte-se" }),
        socials.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: socials.map((s, i) => /* @__PURE__ */ jsx("a", { href: s.href, target: "_blank", rel: "noopener", title: s.label, className: "h-10 w-10 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition", children: /* @__PURE__ */ jsx(s.Icon, { className: "h-4 w-4" }) }, i)) }),
        account.pix_key && /* @__PURE__ */ jsxs("p", { className: "mt-6 text-xs text-stone-500", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-stone-300", children: "Pix:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "break-all", children: account.pix_key })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-stone-800", children: [
      account.weekly_verse && /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto px-6 py-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-sm sm:text-base italic text-stone-400 leading-relaxed", style: {
        fontFamily: "var(--font-display)"
      }, children: [
        '"',
        account.weekly_verse,
        '"',
        account.weekly_verse_ref && /* @__PURE__ */ jsxs("span", { className: "block mt-1 not-italic text-xs font-medium", style: {
          color: accent
        }, children: [
          "— ",
          account.weekly_verse_ref
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " ",
          account.brand_title,
          ". Todos os direitos reservados."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5", children: [
          "Feito com ",
          /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 fill-current", style: {
            color: accent
          } }),
          " por",
          " ",
          /* @__PURE__ */ jsx("a", { href: "/", className: "underline underline-offset-2 hover:text-white", children: "suaigreja" })
        ] })
      ] })
    ] })
  ] });
}
function InlinePrayerForm({
  siteId,
  accent
}) {
  const submit = useServerFn(submitPrayerRequest);
  const [form, setForm] = useState({
    name: "",
    message: "",
    is_anonymous: false
  });
  const [sent, setSent] = useState(false);
  const mut = useMutation({
    mutationFn: () => submit({
      data: {
        siteId,
        name: form.name,
        message: form.message,
        is_anonymous: form.is_anonymous,
        email: "",
        phone: ""
      }
    }),
    onSuccess: () => {
      setSent(true);
      setForm({
        name: "",
        message: "",
        is_anonymous: false
      });
      toast.success("Pedido enviado. Será publicado após aprovação.");
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxs("div", { className: "h-full w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "pt-8 px-7 pb-2 text-center sm:text-left", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 items-center sm:items-start", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 shrink-0 rounded-full flex items-center justify-center", style: {
          background: `${accent}1a`
        }, children: /* @__PURE__ */ jsx(HandHeart, { className: "h-7 w-7", strokeWidth: 1.5, style: {
          color: accent
        } }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.2em] font-semibold", style: {
            color: accent
          }, children: "Intercessão" }),
          /* @__PURE__ */ jsxs("h3", { className: "text-[22px] leading-tight text-stone-800 mt-1", style: {
            fontFamily: "var(--font-display, 'Playfair Display', serif)"
          }, children: [
            "Envie seu ",
            /* @__PURE__ */ jsx("span", { className: "italic", children: "pedido de oração" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-stone-500 leading-relaxed", children: "Compartilhe sua intenção. Nossa comunidade vai orar por você." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-7 pb-7 pt-5 flex-1 flex flex-col", children: sent ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center py-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center mb-3", style: {
        background: `${accent}1a`,
        color: accent
      }, children: /* @__PURE__ */ jsx(Heart, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-600 max-w-xs", children: "Obrigado! Seu pedido foi recebido e será publicado após revisão." }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSent(false), className: "mt-4 text-xs uppercase tracking-widest font-semibold", style: {
        color: accent
      }, children: "Enviar outro pedido" })
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      if (!mut.isPending) mut.mutate();
    }, className: "space-y-3 flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "pr-name", className: "text-[11px] uppercase tracking-widest font-semibold text-stone-500", children: "Seu nome" }),
        /* @__PURE__ */ jsx(Input, { id: "pr-name", required: true, value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }), className: "mt-1.5 bg-stone-50 border-stone-200/60 rounded-xl h-11", placeholder: "Como devemos te chamar" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "pr-msg", className: "text-[11px] uppercase tracking-widest font-semibold text-stone-500", children: "Pedido" }),
        /* @__PURE__ */ jsx(Textarea, { id: "pr-msg", required: true, rows: 4, value: form.message, onChange: (e) => setForm({
          ...form,
          message: e.target.value
        }), className: "mt-1.5 bg-stone-50 border-stone-200/60 rounded-xl resize-none flex-1 min-h-[110px]", placeholder: "Pelo que devemos orar?" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Switch, { id: "pr-anon", checked: form.is_anonymous, onCheckedChange: (v) => setForm({
          ...form,
          is_anonymous: v
        }) }),
        /* @__PURE__ */ jsx(Label, { htmlFor: "pr-anon", className: "!m-0 cursor-pointer text-xs text-stone-600", children: "Enviar como anônimo" })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "submit", disabled: mut.isPending, className: "w-full text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer hover:opacity-95 disabled:opacity-60", style: {
        background: accent,
        boxShadow: `0 10px 25px -10px ${accent}66`
      }, children: [
        /* @__PURE__ */ jsx(HandHeart, { className: "h-[18px] w-[18px]" }),
        /* @__PURE__ */ jsx("span", { className: "text-[15px]", children: mut.isPending ? "Enviando..." : "Enviar pedido de oração" })
      ] })
    ] }) })
  ] });
}
function PixModule({
  pixKey,
  merchantName,
  accent
}) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const payload = useMemo(() => buildPixBrCode({
    pixKey,
    merchantName,
    merchantCity: "BRASIL"
  }), [pixKey, merchantName]);
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M"
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [payload]);
  const copy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    toast.success("Código Pix copiado");
    window.setTimeout(() => setCopied(false), 1800);
  };
  return /* @__PURE__ */ jsxs("div", { className: "h-full w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "pt-7 pb-3 px-6 flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center mb-3", style: {
        background: `${accent}1a`
      }, children: /* @__PURE__ */ jsx(Heart, { className: "h-6 w-6", strokeWidth: 1.5, style: {
        color: accent
      } }) }),
      /* @__PURE__ */ jsxs("h3", { className: "text-[20px] leading-tight text-stone-800 mb-1", style: {
        fontFamily: "var(--font-display, 'Playfair Display', serif)"
      }, children: [
        "Faça sua ",
        /* @__PURE__ */ jsx("span", { className: "italic", children: "contribuição" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[13px] text-stone-500 leading-relaxed px-1", children: "Aponte a câmera do seu banco e escolha o valor." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-5 pb-6 space-y-3 flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-center justify-center", children: qrDataUrl ? /* @__PURE__ */ jsx("img", { src: qrDataUrl, alt: "QR Code Pix", className: "w-44 h-44 sm:w-52 sm:h-52" }) : /* @__PURE__ */ jsx("div", { className: "w-44 h-44 sm:w-52 sm:h-52 animate-pulse bg-stone-200/70 rounded-lg" }) }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: copy, className: "w-full text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer hover:opacity-95", style: {
        background: copied ? "#16a34a" : accent,
        boxShadow: `0 10px 25px -10px ${copied ? "#16a34a" : accent}66`
      }, children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[14px]", children: "Código copiado!" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Copy, { className: "h-[18px] w-[18px]" }),
        /* @__PURE__ */ jsx("span", { className: "text-[14px]", children: "Copiar código Pix" })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-stone-400 font-medium uppercase tracking-tight", children: "Você escolhe o valor • Seguro • Direto" })
    ] })
  ] });
}
const HIGHLIGHT_ICON_MAP = {
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
  star: Star
};
function LightboxGallery({
  images,
  accent,
  previewCount = 8
}) {
  const [open, setOpen] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? images : images.slice(0, previewCount);
  const hasMore = images.length > previewCount;
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => i === null ? null : (i + 1) % images.length);
      if (e.key === "ArrowLeft") setOpen((i) => i === null ? null : (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, images.length]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3", children: visible.map((url, i) => /* @__PURE__ */ jsx(Reveal, { delay: i % 8 * 60, children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setOpen(i), className: `group relative w-full overflow-hidden rounded-md bg-stone-200 ${i % 5 === 0 ? "aspect-[3/4] sm:row-span-2 sm:aspect-auto sm:h-full" : "aspect-square"}`, "aria-label": "Abrir imagem", children: [
      /* @__PURE__ */ jsx("img", { src: url, alt: "", loading: "lazy", className: "w-full h-full object-cover transition duration-700 group-hover:scale-110" }),
      /* @__PURE__ */ jsx("span", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition", style: {
        background: `linear-gradient(180deg, transparent 55%, ${accent}80 100%)`
      } })
    ] }) }, i)) }),
    hasMore && /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowAll((v) => !v), className: "inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90", style: {
      background: accent
    }, children: showAll ? "Mostrar menos" : `Ver galeria completa (${images.length})` }) }),
    open !== null && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200", onClick: () => setOpen(null), children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
        e.stopPropagation();
        setOpen(null);
      }, className: "absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition", "aria-label": "Fechar", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) }),
      images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
          e.stopPropagation();
          setOpen((i) => (i - 1 + images.length) % images.length);
        }, className: "absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition", "aria-label": "Anterior", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
          e.stopPropagation();
          setOpen((i) => (i + 1) % images.length);
        }, className: "absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition", "aria-label": "Próximo", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-6 w-6" }) })
      ] }),
      /* @__PURE__ */ jsx("img", { src: images[open], alt: "", onClick: (e) => e.stopPropagation(), className: "max-w-[92vw] max-h-[88vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200" }),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70", children: [
        open + 1,
        " / ",
        images.length
      ] })
    ] })
  ] });
}
function HighlightsBar({
  items,
  accent
}) {
  const cols = items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return /* @__PURE__ */ jsx("section", { className: "rounded-2xl border border-stone-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden", style: {
    borderColor: `${accent}33`
  }, children: /* @__PURE__ */ jsx("div", { className: `grid grid-cols-1 sm:grid-cols-2 ${cols} divide-y sm:divide-y-0 sm:divide-x divide-stone-200`, children: items.map((h, i) => {
    const Icon = HIGHLIGHT_ICON_MAP[h.icon] || Church;
    const numeric = parseInt(String(h.value).replace(/\D/g, ""), 10);
    const hasNumber = Number.isFinite(numeric) && numeric > 0;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-5 py-6 sm:py-7", children: [
      /* @__PURE__ */ jsx("div", { className: "h-14 w-14 shrink-0 rounded-xl flex items-center justify-center", style: {
        background: `${accent}14`,
        color: accent
      }, children: /* @__PURE__ */ jsx(Icon, { className: "h-7 w-7", strokeWidth: 1.6 }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-2xl sm:text-3xl font-bold leading-none tracking-tight", style: {
          color: accent,
          fontFamily: "var(--font-display)"
        }, children: hasNumber ? /* @__PURE__ */ jsx(CountUp, { target: numeric, prefix: "+" }) : h.value }),
        /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm font-medium text-stone-800 leading-snug", children: h.label }),
        h.sublabel && /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 leading-snug", children: h.sublabel })
      ] })
    ] }, i);
  }) }) });
}
function CountUp({
  target,
  prefix = "",
  duration = 1600
}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) run();
      });
    }, {
      threshold: 0.3
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return /* @__PURE__ */ jsxs("span", { ref, children: [
    prefix,
    value.toLocaleString("pt-BR")
  ] });
}
function LocationCard({
  loc,
  accent,
  single
}) {
  const address = loc.address;
  const lat = loc.latitude != null ? Number(loc.latitude) : NaN;
  const lng = loc.longitude != null ? Number(loc.longitude) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const coords = hasCoords ? `${lat},${lng}` : null;
  const mapEmbedSrc = hasCoords ? `https://www.google.com/maps?q=${coords}&z=17&output=embed` : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapsHref = loc.maps_url || (loc.place_id ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${loc.place_id}` : hasCoords ? `https://www.google.com/maps/search/?api=1&query=${coords}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  const wazeHref = loc.waze_url || (hasCoords ? `https://www.waze.com/ul?ll=${coords}&navigate=yes` : `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`);
  const uberHref = loc.uber_url || (hasCoords ? `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[formatted_address]=${encodeURIComponent(address)}` : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(address)}`);
  const waLink = loc.whatsapp ? `https://wa.me/${String(loc.whatsapp).replace(/\D/g, "")}` : null;
  const telLink = loc.phone ? `tel:${String(loc.phone).replace(/\s/g, "")}` : null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition " + (single ? "grid grid-cols-1 md:grid-cols-[1.1fr_1fr] md:min-h-[460px]" : "flex flex-col"), children: [
    /* @__PURE__ */ jsxs("div", { className: "relative bg-stone-100 " + (single ? "aspect-[16/10] md:aspect-auto md:h-full" : ""), style: single ? void 0 : {
      aspectRatio: "4/3"
    }, children: [
      /* @__PURE__ */ jsx("iframe", { title: `Mapa ${loc.name}`, src: mapEmbedSrc, className: "absolute inset-0 w-full h-full border-0", loading: "lazy", referrerPolicy: "no-referrer-when-downgrade" }),
      !hasCoords && /* @__PURE__ */ jsx("span", { className: "absolute bottom-3 right-3 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded shadow", children: "Localização aproximada" }),
      loc.is_main && /* @__PURE__ */ jsx("span", { className: "absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow", style: {
        background: accent
      }, children: "Matriz" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 flex-1 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full flex items-center justify-center shrink-0", style: {
          background: `${accent}1f`,
          color: accent
        }, children: /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl tracking-tight text-stone-900 leading-tight", style: {
            fontFamily: "var(--font-display)"
          }, children: loc.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-stone-700 leading-relaxed", children: address })
        ] })
      ] }) }),
      (loc.office_hours || loc.transport_info || telLink || waLink) && /* @__PURE__ */ jsxs("div", { className: "space-y-2.5 text-sm border-t border-stone-100 pt-4", children: [
        loc.office_hours && /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 mt-0.5 w-20", children: "Secretaria" }),
          /* @__PURE__ */ jsx("p", { className: "text-stone-700 whitespace-pre-line", children: loc.office_hours })
        ] }),
        loc.transport_info && /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 mt-0.5 w-20", children: "Transporte" }),
          /* @__PURE__ */ jsx("p", { className: "text-stone-700 whitespace-pre-line", children: loc.transport_info })
        ] }),
        (telLink || waLink) && /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 mt-0.5 w-20", children: "Contato" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 text-stone-700", children: [
            telLink && /* @__PURE__ */ jsxs("a", { href: telLink, className: "inline-flex items-center gap-1.5 hover:underline", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              loc.phone
            ] }),
            waLink && /* @__PURE__ */ jsxs("a", { href: waLink, target: "_blank", rel: "noopener", className: "inline-flex items-center gap-1.5 text-emerald-700 hover:underline", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
              " WhatsApp"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-4 border-t border-stone-100", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2", children: "Como chegar" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs("a", { href: mapsHref, target: "_blank", rel: "noopener", className: "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: "🗺️" }),
            "Maps"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: wazeHref, target: "_blank", rel: "noopener", className: "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: "🚗" }),
            "Waze"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: uberHref, target: "_blank", rel: "noopener", className: "flex flex-col items-center gap-1 px-2 py-2.5 rounded-md border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition text-[11px] font-semibold text-stone-700", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: "🚕" }),
            "Uber"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function LiveCombinedSection({
  liveStatus,
  liveUrl,
  nextEvent,
  schedule,
  accent
}) {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const streamLive = liveStatus?.status === "live";
  const eventLive = !!(nextEvent?.is_live && nextEvent?.live_url);
  const isLive = streamLive || eventLive;
  const liveHref = streamLive ? liveStatus?.url ?? liveUrl : eventLive ? nextEvent.live_url : liveUrl;
  const liveTitle = streamLive ? liveStatus?.title || "Transmissão em andamento" : eventLive ? `${nextEvent.type_name} · transmissão em andamento` : "";
  const allUpcoming = (() => {
    if (!schedule.length) return [];
    const now = /* @__PURE__ */ new Date();
    const items = [];
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
        items.push({
          ...it,
          nextDate: d
        });
      }
    }
    items.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return items;
  })();
  const upcoming = allUpcoming.slice(0, 2);
  const hasMore = allUpcoming.length > upcoming.length;
  const [showAll, setShowAll] = useState(false);
  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long"
  });
  if (!isLive && upcoming.length === 0 && !liveUrl) return null;
  return /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden rounded-2xl mb-10 border bg-white/80 backdrop-blur shadow-sm", style: {
    borderColor: `${accent}33`
  }, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5", children: [
    /* @__PURE__ */ jsxs("div", { className: `relative md:col-span-2 p-5 sm:p-6 text-white overflow-hidden ${isLive ? "" : ""}`, style: {
      background: isLive ? `linear-gradient(120deg, #b91c1c 0%, ${accent} 100%)` : `linear-gradient(120deg, #1f2937 0%, #334155 100%)`
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-4 h-full", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur shrink-0", children: [
          isLive && /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-white/30 animate-ping" }),
          isLive ? /* @__PURE__ */ jsx("span", { className: "relative h-2.5 w-2.5 rounded-full bg-white" }) : /* @__PURE__ */ jsx(Radio, { className: "relative h-4 w-4 text-white/90" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: isLive ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.25em] font-semibold opacity-90", children: "Ao vivo agora" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-base sm:text-lg font-semibold truncate", children: liveTitle })
        ] }) : upcoming.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.25em] font-semibold opacity-80", children: "Próxima transmissão" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-base sm:text-lg font-semibold truncate", children: upcoming[0].title }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs opacity-80 mt-0.5", children: [
            days[upcoming[0].weekday],
            " · ",
            upcoming[0].start_time?.slice(0, 5)
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.25em] font-semibold opacity-80", children: "Transmissões" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-base sm:text-lg font-semibold", children: "Sem transmissão agora" })
        ] }) }),
        isLive && liveHref && /* @__PURE__ */ jsxs("a", { href: liveHref, target: "_blank", rel: "noopener noreferrer", className: "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition", children: [
          "Assistir ",
          /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
        ] })
      ] }),
      isLive && liveHref && /* @__PURE__ */ jsxs("a", { href: liveHref, target: "_blank", rel: "noopener noreferrer", className: "sm:hidden mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-bold uppercase tracking-wider shadow-md", children: [
        "Assistir ",
        /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "md:col-span-3 p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(Radio, { className: "h-4 w-4", style: {
          color: accent
        } }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold text-stone-500", children: "Próximas transmissões" })
      ] }),
      upcoming.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: upcoming.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col rounded-lg border border-stone-200 bg-white px-3 py-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase tracking-wider text-stone-500 font-semibold", children: [
          "Toda ",
          days[it.weekday] ?? ""
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-stone-900 truncate", children: it.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-stone-600", children: [
          "às ",
          it.start_time?.slice(0, 5)
        ] })
      ] }, i)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500", children: "Nenhuma transmissão agendada no momento." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-4 flex-wrap", children: [
        hasMore && /* @__PURE__ */ jsxs(Dialog, { open: showAll, onOpenChange: setShowAll, children: [
          /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { type: "button", className: "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:opacity-80", style: {
            color: accent
          }, children: [
            "Ver todas ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
          ] }) }),
          /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
            /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Próximas transmissões" }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 max-h-[60vh] overflow-y-auto divide-y divide-stone-200", children: allUpcoming.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase tracking-wider text-stone-500 font-semibold", children: [
                  days[it.weekday],
                  " · ",
                  dateFmt.format(it.nextDate)
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-stone-900 truncate", children: it.title })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-stone-600 shrink-0 ml-3", children: [
                "às ",
                it.start_time?.slice(0, 5)
              ] })
            ] }, i)) }),
            liveUrl && /* @__PURE__ */ jsxs("a", { href: liveUrl, target: "_blank", rel: "noopener noreferrer", className: "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", style: {
              color: accent
            }, children: [
              "Acessar canal ",
              /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
            ] })
          ] })
        ] }),
        liveUrl && /* @__PURE__ */ jsxs("a", { href: liveUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", style: {
          color: accent
        }, children: [
          "Acessar canal ",
          /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
        ] })
      ] })
    ] })
  ] }) }) });
}
function DonationsPreview({
  campaigns,
  slug,
  accent,
  fixedImageUrl
}) {
  const showFixed = !!fixedImageUrl;
  const scrollerRef = useRef(null);
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
    el.addEventListener("scroll", updateArrows, {
      passive: true
    });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [campaigns.length]);
  function scrollBy(dir) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({
      left: dir * step,
      behavior: "smooth"
    });
  }
  return /* @__PURE__ */ jsxs("section", { id: "doacoes", className: "mb-12 scroll-mt-24", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] font-semibold", style: {
          color: accent
        }, children: "Faça parte" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900", style: {
          fontFamily: "var(--font-display)"
        }, children: "Contribua com a obra" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/d/$slug", params: {
        slug
      }, className: "hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition hover:opacity-90", style: {
        background: accent
      }, children: [
        "Ver todas ",
        /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "block", children: /* @__PURE__ */ jsxs("div", { className: "relative min-w-0", children: [
      canPrev && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollBy(-1), "aria-label": "Anterior", className: "hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md border border-stone-200 hover:bg-white", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5 text-stone-700" }) }),
      canNext && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollBy(1), "aria-label": "Próxima", className: "hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md border border-stone-200 hover:bg-white", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-stone-700" }) }),
      /* @__PURE__ */ jsxs("div", { ref: scrollerRef, className: "flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: [
        showFixed && /* @__PURE__ */ jsx(Link, { to: "/d/$slug", params: {
          slug
        }, "aria-label": "Faça parte da obra", className: "group snap-start shrink-0 flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 hover:shadow-lg hover:-translate-y-0.5 transition w-[78%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]", children: /* @__PURE__ */ jsx("img", { src: fixedImageUrl, alt: "Faça parte da obra", loading: "lazy", className: "w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" }) }),
        campaigns.map((c) => /* @__PURE__ */ jsxs(Link, { to: "/d/$slug", params: {
          slug
        }, className: "group snap-start shrink-0 flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-white hover:shadow-lg hover:-translate-y-0.5 transition w-[78%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]", children: [
          c.image_url ? /* @__PURE__ */ jsx("div", { className: "aspect-[16/10] overflow-hidden bg-stone-100", children: /* @__PURE__ */ jsx("img", { src: c.image_url, alt: c.title, loading: "lazy", className: "w-full h-full object-cover group-hover:scale-105 transition duration-500" }) }) : /* @__PURE__ */ jsx("div", { className: "aspect-[16/10]", style: {
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
          }, children: /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(HandHeart, { className: "h-10 w-10", style: {
            color: accent
          } }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 flex-1 flex flex-col", children: [
            c.featured && /* @__PURE__ */ jsx("span", { className: "self-start text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mb-1", style: {
              background: `${accent}1a`,
              color: accent
            }, children: "Destaque" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-stone-900 line-clamp-2", children: c.title }),
            c.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-600 mt-1 line-clamp-2", children: c.description }),
            /* @__PURE__ */ jsxs("span", { className: "mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider", style: {
              color: accent
            }, children: [
              "Contribuir via Pix ",
              /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
            ] })
          ] })
        ] }, c.id))
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 sm:hidden", children: /* @__PURE__ */ jsxs(Link, { to: "/d/$slug", params: {
      slug
    }, className: "w-full inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-white", style: {
      background: accent
    }, children: [
      "Ver todas as campanhas ",
      /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
    ] }) })
  ] });
}
export {
  HubPage as component
};
