import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Instagram, Youtube, Facebook, MessageCircle, Globe, X, Menu, Heart, ArrowLeft } from "lucide-react";
function buildNav(account, slug) {
  const items = [
    { label: "Início", href: `/${slug}` }
  ];
  if (account.hub_show_agenda) items.push({ label: "Agenda", href: `/a/${slug}` });
  if (account.hub_show_events) items.push({ label: "Eventos", href: `/eventos/${slug}` });
  items.push({ label: "Notícias", href: `/n/${slug}` });
  items.push({ label: "Transmissões", href: `/${slug}#transmissoes` });
  if (account.hub_show_prayer) items.push({ label: "Oração", href: `/o/${slug}` });
  items.push({ label: "Doações", href: `/d/${slug}` });
  return items;
}
function socialsFrom(account) {
  const wa = (account.visitor_whatsapp || "").replace(/\D/g, "");
  return [
    account.social_instagram && { href: account.social_instagram, Icon: Instagram, label: "Instagram" },
    account.social_youtube && { href: account.social_youtube, Icon: Youtube, label: "YouTube" },
    account.social_facebook && { href: account.social_facebook, Icon: Facebook, label: "Facebook" },
    wa && { href: `https://wa.me/${wa}`, Icon: MessageCircle, label: "WhatsApp" },
    account.social_website && { href: account.social_website, Icon: Globe, label: "Site" }
  ].filter(Boolean);
}
function HubChrome({
  account,
  children,
  contained = true
}) {
  const accent = account.primary_color || "#7d9b76";
  const slug = account.custom_slug || account.site_id || "";
  const nav = buildNav(account, slug);
  const socials = socialsFrom(account);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "min-h-screen flex flex-col bg-[#faf8f5] text-stone-800",
      style: { ["--accent"]: accent },
      children: [
        /* @__PURE__ */ jsx(
          HubTopNav,
          {
            brandTitle: account.brand_title,
            logoUrl: account.brand_logo_url ?? null,
            logoHeight: account.brand_logo_height_px ?? 32,
            accent,
            items: nav,
            liveUrl: account.live_url ?? null,
            slug
          }
        ),
        /* @__PURE__ */ jsx("main", { className: "flex-1", children: contained ? /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden", children }) }) : children }),
        /* @__PURE__ */ jsx(HubFooter, { account, accent, nav, socials })
      ]
    }
  );
}
function HubTopNav({
  brandTitle,
  logoUrl,
  logoHeight,
  accent,
  items,
  liveUrl,
  slug
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxs("nav", { className: `sticky top-0 z-40 transition-colors ${scrolled ? "bg-white/95 backdrop-blur border-b border-stone-200" : "bg-white/85 backdrop-blur border-b border-transparent"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/$slug", params: { slug }, className: "flex items-center gap-2 min-w-0", children: logoUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: logoUrl,
          alt: brandTitle,
          style: { height: Math.min(Math.max(logoHeight, 16), 48) },
          className: "w-auto object-contain shrink-0"
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
            style: { background: accent },
            children: brandTitle?.[0]?.toUpperCase() ?? "S"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-stone-900 truncate", children: brandTitle })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-1", children: [
        items.map((it) => /* @__PURE__ */ jsx(
          "a",
          {
            href: it.href,
            className: "px-3 py-1.5 text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 rounded transition",
            children: it.label
          },
          it.href
        )),
        liveUrl && /* @__PURE__ */ jsxs(
          "a",
          {
            href: liveUrl,
            target: "_blank",
            rel: "noopener",
            className: "ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold transition hover:opacity-90",
            style: { background: accent },
            children: [
              /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-white animate-ping opacity-75" }),
                /* @__PURE__ */ jsx("span", { className: "relative rounded-full h-2 w-2 bg-white" })
              ] }),
              "Ao vivo"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setOpen((o) => !o),
          className: "md:hidden h-9 w-9 flex items-center justify-center rounded text-stone-700 hover:bg-stone-100",
          "aria-label": "Abrir menu",
          children: open ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
        }
      )
    ] }),
    open && /* @__PURE__ */ jsx("div", { className: "md:hidden border-t border-stone-200 bg-white", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-4 py-2 flex flex-col", children: items.map((it) => /* @__PURE__ */ jsx(
      "a",
      {
        href: it.href,
        onClick: () => setOpen(false),
        className: "py-3 text-sm text-stone-700 border-b border-stone-100 last:border-0",
        children: it.label
      },
      it.href
    )) }) })
  ] });
}
function HubFooter({
  account,
  accent,
  nav,
  socials
}) {
  return /* @__PURE__ */ jsxs("footer", { className: "mt-10 bg-stone-900 text-stone-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold",
              style: { background: accent },
              children: account.brand_title?.[0]?.toUpperCase() ?? "S"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-medium text-white", children: account.brand_title })
        ] }),
        account.hub_bio && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-stone-400 max-w-xs", children: account.hub_bio })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-stone-500", children: "Navegação" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2 text-sm", children: nav.map((it) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: it.href, className: "hover:text-white transition", children: it.label }) }, it.href)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-stone-500", children: "Conecte-se" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: socials.map((s, i) => /* @__PURE__ */ jsx(
          "a",
          {
            href: s.href,
            target: "_blank",
            rel: "noopener",
            title: s.label,
            className: "h-10 w-10 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition",
            children: /* @__PURE__ */ jsx(s.Icon, { className: "h-4 w-4" })
          },
          i
        )) }),
        account.pix_key && /* @__PURE__ */ jsxs("p", { className: "mt-6 text-xs text-stone-500", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-stone-300", children: "Pix:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "break-all", children: account.pix_key })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-stone-800", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        account.brand_title,
        ". Todos os direitos reservados."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5", children: [
        "Feito com ",
        /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 fill-current", style: { color: accent } }),
        " por",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/", className: "underline underline-offset-2 hover:text-white", children: "suaigreja" })
      ] })
    ] }) })
  ] });
}
function BackToSite({
  slug,
  variant = "light",
  className = ""
}) {
  const tone = variant === "light" ? "text-white/85 hover:text-white" : "text-stone-600 hover:text-stone-900";
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/$slug",
      params: { slug },
      className: `inline-flex items-center gap-2 text-sm font-medium ${tone} ${className}`,
      children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Voltar para o site"
      ]
    }
  );
}
export {
  BackToSite as B,
  HubChrome as H
};
