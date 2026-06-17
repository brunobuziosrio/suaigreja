import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { B as BackToSite, H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DOMPurify from "isomorphic-dompurify";
import { I as Route } from "./router-BudgN2VI.js";
import "@tanstack/react-query";
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
function NewsPostPage() {
  const {
    account,
    post,
    related,
    chrome
  } = Route.useLoaderData();
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id;
  const brand = account.brand_title || "Notícias";
  const [imgOpen, setImgOpen] = useState(false);
  const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.subtitle || "",
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado!");
      }
    } catch {
    }
  };
  const looksLikeHtml = typeof post.content === "string" && /<[a-z][\s\S]*>/i.test(post.content);
  const content = /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-stone-50", children: [
    /* @__PURE__ */ jsx("div", { className: "relative", style: {
      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`
    }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2 mb-6", children: [
        /* @__PURE__ */ jsx(BackToSite, { slug }),
        /* @__PURE__ */ jsxs(Link, { to: "/n/$slug", params: {
          slug
        }, className: "inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Todas as notícias"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-white/80 text-xs uppercase tracking-[0.3em] font-semibold inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
        " ",
        fmtDate(post.created_at)
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight", style: {
        fontFamily: "var(--font-display)"
      }, children: post.title }),
      post.subtitle && /* @__PURE__ */ jsx("p", { className: "mt-4 text-white/90 text-lg sm:text-xl leading-relaxed max-w-2xl", children: post.subtitle }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-white/85 text-sm", children: [
          "Publicado por ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: brand })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: share, className: "ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium backdrop-blur-sm transition", children: [
          /* @__PURE__ */ jsx(Share2, { className: "h-4 w-4" }),
          " Compartilhar"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14", children: [
      post.image_url && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setImgOpen(true), className: "block w-full mb-10 group", "aria-label": "Ampliar imagem", children: [
        /* @__PURE__ */ jsx("div", { className: "w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]", children: /* @__PURE__ */ jsx("img", { src: post.image_url, alt: post.title, className: "w-full h-auto object-contain max-h-[80vh] group-hover:opacity-95 transition" }) }),
        /* @__PURE__ */ jsx("span", { className: "block text-center text-xs text-stone-500 mt-2", children: "Toque na imagem para ampliar" })
      ] }),
      post.content && (looksLikeHtml ? /* @__PURE__ */ jsx("div", { className: "prose prose-stone max-w-none prose-headings:font-bold prose-a:underline text-stone-800 leading-relaxed text-[17px]", style: {
        fontFamily: "var(--font-body, inherit)"
      }, dangerouslySetInnerHTML: {
        __html: DOMPurify.sanitize(post.content)
      } }) : /* @__PURE__ */ jsx("div", { className: "text-stone-800 leading-relaxed text-[17px] sm:text-lg space-y-5 whitespace-pre-wrap", children: String(post.content).split(/\n{2,}/).map((p, i) => /* @__PURE__ */ jsx("p", { children: p }, i)) })),
      /* @__PURE__ */ jsxs("div", { className: "mt-14 pt-8 border-t border-stone-200 flex flex-wrap gap-3 items-center justify-between", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/n/$slug", params: {
          slug
        }, className: "inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Ver todas as notícias"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: share, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-sm hover:opacity-90 transition", style: {
          background: accent
        }, children: [
          /* @__PURE__ */ jsx(Share2, { className: "h-4 w-4" }),
          " Compartilhar"
        ] })
      ] }),
      related.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight mb-6", style: {
          fontFamily: "var(--font-display)",
          color: accent
        }, children: "Continue lendo" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-5", children: related.map((r) => /* @__PURE__ */ jsxs(Link, { to: "/n/$slug/$postId", params: {
          slug,
          postId: r.id
        }, className: "group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition", children: [
          /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] bg-stone-100 overflow-hidden", children: r.image_url ? /* @__PURE__ */ jsx("img", { src: r.image_url, alt: r.title, loading: "lazy", className: "w-full h-full object-cover group-hover:scale-105 transition duration-700" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full", style: {
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`
          } }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-stone-500", children: fmtDate(r.created_at) }),
            /* @__PURE__ */ jsx("h3", { className: "mt-1 font-bold leading-snug line-clamp-3", style: {
              fontFamily: "var(--font-display)",
              color: accent
            }, children: r.title })
          ] })
        ] }, r.id)) })
      ] })
    ] }),
    imgOpen && post.image_url && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out", onClick: () => setImgOpen(false), children: [
      /* @__PURE__ */ jsx("img", { src: post.image_url, alt: post.title, className: "max-w-full max-h-full object-contain rounded-lg shadow-2xl", onClick: (e) => e.stopPropagation() }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setImgOpen(false), className: "absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl flex items-center justify-center", "aria-label": "Fechar", children: "✕" })
    ] })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: content });
  return content;
}
export {
  NewsPostPage as component
};
