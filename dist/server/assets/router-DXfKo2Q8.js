import { useQueryClient, QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouterState, createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, notFound, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from "react";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { Toaster as Toaster$1 } from "sonner";
import { c as createSsrRpc, a as resolveAtivoPayWebhookSecret } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { B as BILLING_PLANS } from "./billing-plans-Ce8xzhRW.js";
const appCss = "/assets/styles-okc36tfu.css";
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const value = {
    user: session?.user ?? null,
    session,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    }
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const DEFAULT_BASE_URL = "https://chatwoot.digitallagos.top";
const DEFAULT_WEBSITE_TOKEN = "psP8qad1WdWFFMJGWwu9DGgr";
function ChatwootWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicHub = (() => {
    const p = pathname || "/";
    if (p === "/") return false;
    const internalPrefixes = [
      "/login",
      "/onboarding",
      "/dashboard",
      "/agenda",
      "/hub",
      "/billing",
      "/settings",
      "/admin",
      "/embed",
      "/marketplace",
      "/eventos",
      "/oracoes",
      "/visitantes",
      "/locations",
      "/types",
      "/api"
    ];
    if (internalPrefixes.some((pre) => p === pre || p.startsWith(pre + "/"))) return false;
    return true;
  })();
  const baseUrl = DEFAULT_BASE_URL;
  const websiteToken = DEFAULT_WEBSITE_TOKEN;
  const { user } = useAuth();
  const qc = useQueryClient();
  const account = qc.getQueryData(["account", user?.id]);
  useEffect(() => {
    if (isPublicHub) {
      const existing2 = document.querySelector(".woot-widget-holder, .woot--bubble-holder");
      if (existing2) existing2.style.display = "none";
      return;
    }
    const existing = document.querySelector(".woot-widget-holder, .woot--bubble-holder");
    if (existing) existing.style.display = "";
    if (typeof window === "undefined") return;
    window.chatwootSettings = {
      position: "right",
      type: "standard",
      launcherTitle: "Fale com o suporte"
    };
    const scriptId = "chatwoot-sdk";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      window.chatwootSDK?.run({ websiteToken, baseUrl });
    };
    document.body.appendChild(script);
  }, [baseUrl, websiteToken, isPublicHub]);
  useEffect(() => {
    if (!user || isPublicHub) return;
    const handler = () => {
      window.$chatwoot?.setUser(user.id, {
        email: user.email ?? void 0,
        name: user.user_metadata?.name ?? user.email ?? void 0
      });
      if (account) {
        window.$chatwoot?.setCustomAttributes({
          plano: account.current_plan ?? "trial",
          status_assinatura: account.subscription_status ?? "",
          site_id: account.site_id ?? "",
          igreja: account.brand_title ?? "",
          perfil_religioso: account.religion_profile ?? "",
          onboarded: !!account.onboarded,
          trial_termina_em: account.trial_ends_at ?? "",
          assinatura_termina_em: account.subscription_ends_at ?? ""
        });
      }
    };
    if (window.$chatwoot) {
      handler();
    } else {
      window.addEventListener("chatwoot:ready", handler);
      return () => window.removeEventListener("chatwoot:ready", handler);
    }
  }, [user, account]);
  return null;
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$Q = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sua Igreja" },
      { name: "description", content: "Transforme a comunicação e a organização da sua igreja com uma plataforma simples, moderna e completa. Nosso sistema foi criado especialmente para igrejas, par" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Sua Igreja" },
      { property: "og:description", content: "Transforme a comunicação e a organização da sua igreja com uma plataforma simples, moderna e completa. Nosso sistema foi criado especialmente para igrejas, par" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Sua Igreja" },
      { name: "twitter:description", content: "Transforme a comunicação e a organização da sua igreja com uma plataforma simples, moderna e completa. Nosso sistema foi criado especialmente para igrejas, par" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/5bKYe9yckEd4kEEz0TGyWnag8T13/social-images/social-1779454175506-ChatGPT_Image_22_de_mai._de_2026,_09_49_26.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/5bKYe9yckEd4kEEz0TGyWnag8T13/social-images/social-1779454175506-ChatGPT_Image_22_de_mai._de_2026,_09_49_26.webp" },
      { name: "theme-color", content: "#d4a84a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "suaigreja" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-512.png" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$Q.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" }),
    /* @__PURE__ */ jsx(ChatwootWidget, {})
  ] }) });
}
const $$splitComponentImporter$J = () => import("./update-password-CB0htnTW.js");
const Route$P = createFileRoute("/update-password")({
  component: lazyRouteComponent($$splitComponentImporter$J, "component")
});
const $$splitComponentImporter$I = () => import("./login-BYzUacBQ.js");
const Route$O = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$I, "component")
});
const $$splitComponentImporter$H = () => import("./_authenticated-LsrJAlw6.js");
const Route$N = createFileRoute("/_authenticated")({
  component: lazyRouteComponent($$splitComponentImporter$H, "component")
});
const getPublicHub = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(createSsrRpc("bed65d7c2e6ff2d5aec73e1397bfd52cb63c48bd55870a35e52d1e6ab51e1135"));
const SlideSchema = z.object({
  image_url: z.string().url().max(500),
  title: z.string().max(120).nullable(),
  subtitle: z.string().max(200).nullable(),
  cta_label: z.string().max(40).nullable(),
  cta_url: z.string().max(500).nullable(),
  title_size: z.enum(["sm", "md", "lg", "xl"]).nullable().optional()
});
const HighlightSchema = z.object({
  icon: z.string().min(1).max(40),
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  sublabel: z.string().max(120).nullable()
});
const HubSettingsInput = z.object({
  hub_enabled: z.boolean(),
  hub_bio: z.string().max(500).nullable(),
  hub_cover_url: z.string().url().max(500).nullable(),
  hub_show_agenda: z.boolean(),
  hub_show_events: z.boolean(),
  hub_show_prayer: z.boolean(),
  hub_show_visitor: z.boolean(),
  hub_show_all_locations: z.boolean().optional(),
  social_instagram: z.string().max(200).nullable(),
  social_youtube: z.string().max(200).nullable(),
  social_facebook: z.string().max(200).nullable(),
  social_website: z.string().max(200).nullable(),
  pix_key: z.string().max(200).nullable().optional(),
  live_url: z.string().max(300).nullable(),
  hub_whatsapp: z.string().max(30).nullable(),
  hub_show_whatsapp: z.boolean(),
  weekly_message: z.string().max(1e3).nullable(),
  weekly_verse: z.string().max(500).nullable(),
  weekly_verse_ref: z.string().max(100).nullable(),
  gallery_urls: z.array(z.string().url().max(500)).max(12),
  hub_slides: z.array(SlideSchema).max(8),
  hub_highlights: z.array(HighlightSchema).max(6),
  media_youtube_url: z.string().max(300).nullable().optional(),
  media_audio_url: z.string().max(500).nullable().optional(),
  media_show_youtube: z.boolean().optional(),
  media_show_audio: z.boolean().optional(),
  instagram_post_count: z.number().int().min(3).max(30).optional(),
  instagram_columns: z.number().int().min(2).max(6).optional()
});
const updateHubSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => HubSettingsInput.parse(input)).handler(createSsrRpc("520e2a8e6553eb7091205dfb29f8c13213d4452935c7a2bf94c68581db130295"));
const listMyNews = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("24bfad6b7472d3c53d57aa03340c5619c3f6925ec5e9858cb82b656426a6458b"));
const NewsInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300),
  content: z.string().max(1e4),
  image_url: z.string().url().max(500).nullable(),
  published: z.boolean(),
  sort_order: z.number().int().min(0).max(9999)
});
const upsertNews = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => NewsInput.parse(input)).handler(createSsrRpc("8894fe714735b86f9977ddbbfdeb47120917d0b9dd5dffe09b5eb5357e078811"));
const deleteNews = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("d9251c9c8094c3d38d24a7bf28685b4c34dda89aad058492f87927f8bb625494"));
const ALLOWED_IMAGE_MIME = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]);
const UploadInput = z.object({
  folder: z.enum(["hub-cover", "gallery", "slide", "news", "product-images"]),
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(100).refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
    message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO."
  }),
  // base64-encoded file bytes (no data: prefix), max ~8MB encoded
  base64: z.string().min(1).max(12e6)
});
const uploadHubAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => UploadInput.parse(input)).handler(createSsrRpc("0dbcdb0249b0ffe1d46fbc680a516566217d1c4a5c2133c629b7a3c1b48ad9e6"));
const SignInput = z.object({
  folder: z.enum(["hub-cover", "gallery", "slide", "news"]),
  filename: z.string().min(1).max(120)
});
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => SignInput.parse(input)).handler(createSsrRpc("ed8b645863bbaa87458bf6c7cde61e9312766091e8e4a2ec1d7647143d578de6"));
const getHubChrome = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const siteId = String(input?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site_id");
  return {
    siteId
  };
}).handler(createSsrRpc("1b7e5b400025e5852038477f99f170afd92d610e72dd959a007bc8e05fc4c8dc"));
const getPublicNews = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(createSsrRpc("e3624534a8e6bdbe76d11b9606a441f4bbf0bd35ed1fd5e67f0a8ac8cd677ace"));
const getPublicNewsPost = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  const postId = String(input?.postId || "");
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  if (!/^[0-9a-f-]{36}$/i.test(postId)) throw new Error("invalid post id");
  return {
    slug,
    postId
  };
}).handler(createSsrRpc("b34310bca8f55380afd281a367603f74bd557965a485e99a788adf1bfae73afe"));
const $$splitNotFoundComponentImporter$c = () => import("./_slug-DNgdnzZw.js");
const $$splitComponentImporter$G = () => import("./_slug-BdVLwNA5.js");
const Route$M = createFileRoute("/$slug")({
  loader: async ({
    params
  }) => {
    const slug = String(params.slug || "").toLowerCase();
    if (!/^[a-z0-9_-]{1,64}$/.test(slug)) throw notFound();
    const data = await getPublicHub({
      data: {
        slug
      }
    });
    if (!data) throw notFound();
    return data;
  },
  component: lazyRouteComponent($$splitComponentImporter$G, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$c, "notFoundComponent"),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: loaderData?.account.brand_title ?? "Hub"
    }, {
      name: "description",
      content: loaderData?.account.hub_bio || loaderData?.account.brand_subtitle || "Página oficial da igreja."
    }, ...loaderData?.account.hub_cover_url ? [{
      property: "og:image",
      content: loaderData.account.hub_cover_url
    }] : []]
  })
});
const $$splitComponentImporter$F = () => import("./index-C8Bu_tXI.js");
const Route$L = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "suaigreja — a plataforma que conecta sua comunidade"
    }, {
      name: "description",
      content: "Agenda, eventos, pedidos de oração, visitantes e site próprio para a sua igreja. Tudo em um só lugar, em minutos. 7 dias grátis, sem cartão."
    }, {
      property: "og:title",
      content: "suaigreja — a plataforma da sua comunidade"
    }, {
      property: "og:description",
      content: "Organização, evangelização e crescimento em uma plataforma elegante e simples."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$F, "component")
});
const listVisitors = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("45c12f7920aed087d41dc046b2ec0085f1afab9a74d2d597a5b01f5f36be9324"));
const updateVisitorStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "member", "archived"])
}).parse(i)).handler(createSsrRpc("e8667fe4ae82af20010a57282b0dda0b4a0eb5420974889f867ec1ba2d6da0ad"));
const updateVisitorNotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid(),
  notes: z.string().max(2e3)
}).parse(i)).handler(createSsrRpc("187b9e6107ae08a9b0ce45cfa5fa508d245e655a2016371d706a5d287c92feac"));
const deleteVisitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("986c5863971bf59042ca406d64258ef5b6a01d4d667995955ed161324d966e88"));
const getVisitorSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a7d67100242bef50c701aa6353f07dc0ac44d0d1c6f6c78075922f2fd2a617a6"));
const saveVisitorSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  visitor_whatsapp: z.string().max(40).optional(),
  visitor_welcome_message: z.string().max(500).optional()
}).parse(i)).handler(createSsrRpc("98f25de12fe735399d11024af4f494ba9e05d00785e09eaea3b80c9bfeb5525e"));
const getPublicVisitorForm = createServerFn({
  method: "GET"
}).inputValidator((i) => {
  const siteId = String(i?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
  return {
    siteId
  };
}).handler(createSsrRpc("f768ca88e70c2310e647afcadbb91c5a509aa6bb78740c1ad3cf3e8730efb934"));
const VisitorInput = z.object({
  siteId: z.string().min(1).max(64),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30).optional().or(z.literal("")),
  email: z.string().email().max(160).optional().or(z.literal("")),
  age_range: z.string().max(20).optional(),
  how_found: z.string().max(80).optional(),
  is_first_time: z.boolean().default(true),
  prayer_request: z.string().max(1e3).optional(),
  allow_contact: z.boolean().default(true)
});
const submitVisitor = createServerFn({
  method: "POST"
}).inputValidator((i) => VisitorInput.parse(i)).handler(createSsrRpc("4b5430ce98b070199c8632b0738b0a720cd9e7fc1b0ef1c7e5c6ece951710c5a"));
const $$splitComponentImporter$E = () => import("./v._siteId-CqqmJ_H9.js");
const $$splitNotFoundComponentImporter$b = () => import("./v._siteId-TP0xUotZ.js");
const Route$K = createFileRoute("/v/$siteId")({
  loader: async ({
    params
  }) => {
    const [d, chrome] = await Promise.all([getPublicVisitorForm({
      data: {
        siteId: params.siteId
      }
    }), getHubChrome({
      data: {
        siteId: params.siteId
      }
    })]);
    if (!d) throw notFound();
    return {
      account: d,
      chrome
    };
  },
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Bem-vindo(a) à ${loaderData?.account.brand_title ?? "nossa igreja"}`
    }, {
      name: "description",
      content: "Conte pra gente um pouquinho sobre você."
    }]
  }),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$b, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$E, "component")
});
const slugValidator = (input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
};
const getPublicDonations = createServerFn({
  method: "GET"
}).inputValidator(slugValidator).handler(createSsrRpc("4f1c301f3b19a78b2343eee91833dc4c887022b1d9f4ccc774e4507bbbd44c8d"));
createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  const id = String(input?.id || "");
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("invalid id");
  return {
    slug,
    id
  };
}).handler(createSsrRpc("f43ae3e8e95bc60889280aab911f8b6d73cd1c07ce6099b68d26295c7f87e2c5"));
const PixGenInput = z.object({
  slug: z.string().min(1).max(64),
  id: z.string().uuid(),
  amountCents: z.number().int().min(0).max(1e8).optional(),
  donorName: z.string().max(120).optional(),
  donorEmail: z.string().email().max(160).optional(),
  donorPhone: z.string().max(40).optional()
});
const generateDonationPix = createServerFn({
  method: "POST"
}).inputValidator((input) => PixGenInput.parse(input)).handler(createSsrRpc("b5609fa6a5a6f88d2940311e39206a2b95e960f8bc229ac06ff3944be0bb2055"));
const getPublicDonationReceipt = createServerFn({
  method: "GET"
}).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("65d3fee73cb0dda3526224a34503a0a57990817b3d1a080677a33e8d08c85364"));
const listMyDonationCampaigns = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("057df525a4aa1f7cda5c1a39650071f2e55e7a828f2712cec7d214cd5fb17af7"));
const PIX_KEY_TYPES = ["cpf", "cnpj", "email", "telefone", "aleatoria"];
const CampaignInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(2e3).default(""),
  image_url: z.string().url().max(500).nullable(),
  pix_key: z.string().min(1).max(200),
  pix_key_type: z.enum(PIX_KEY_TYPES),
  recipient_name: z.string().min(1).max(80),
  recipient_city: z.string().min(1).max(40).default("BRASIL"),
  suggested_amounts_cents: z.array(z.number().int().min(100).max(1e8)).max(6),
  goal_cents: z.number().int().min(0).nullable(),
  active: z.boolean(),
  featured: z.boolean(),
  sort_order: z.number().int().min(0).max(9999)
});
const upsertDonationCampaign = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => CampaignInput.parse(input)).handler(createSsrRpc("256d42016a62e72319c16cb2bc0fe7510a00007df272863e03d9cdfc74c09e77"));
const deleteDonationCampaign = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("7992fad4d1a022c081642c3ff7dfc32be00f28f417d8f5d1697ebc5191f9a91c"));
const getDonationCampaignStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("87037d8d19c6b09f69d9449c01a01a46c3dbaec3cad2f15eda70218bfc3c962d"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  campaignId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("079ea5a3a43f69a92f2de925a8e096166a63d6c04eadbd6c11f1f686ea4f9c05"));
const getDonationsMonthlyReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  year: z.number().int().min(2020).max(2100)
}).parse(input)).handler(createSsrRpc("2eefd65801379873095e5cce02aafd1864a0c52547e6048bb1dd5f4c53bc011e"));
const $$splitNotFoundComponentImporter$a = () => import("./recibo._donationId-CW4Y2SN7.js");
const $$splitComponentImporter$D = () => import("./recibo._donationId-bbbgWzrW.js");
const Route$J = createFileRoute("/recibo/$donationId")({
  loader: async ({
    params
  }) => {
    const data = await getPublicDonationReceipt({
      data: {
        id: params.donationId
      }
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Comprovante de doação — ${loaderData?.church?.brand_title ?? "Igreja"}`
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$D, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$a, "notFoundComponent")
});
const listPrayerRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("51146209d2403523b2b68e3d85efa07b33e76f5d66cbcee49d08388de46ef61b"));
const updatePrayerStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "archived"])
}).parse(i)).handler(createSsrRpc("41d78a2a8bf3c02d62aab24813f733f15cc4f9b75694f8667141f3ad02073782"));
const deletePrayerRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("f5da85c9863c52e1c7998124b2cb7314aec7d4bed4fa6e3acaf98f2a146255c4"));
const getPublicPrayers = createServerFn({
  method: "GET"
}).inputValidator((i) => {
  const siteId = String(i?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
  return {
    siteId
  };
}).handler(createSsrRpc("081a0291789d3968e51cab4f4411c5bab8332e0154a83745f0dcf0f0012c5a15"));
const SubmitInput = z.object({
  siteId: z.string().min(1).max(64),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  message: z.string().min(5).max(2e3),
  is_anonymous: z.boolean().default(false)
});
const submitPrayerRequest = createServerFn({
  method: "POST"
}).inputValidator((i) => SubmitInput.parse(i)).handler(createSsrRpc("2e1a0d48676dbc5fcec2496b5698e80e49ebe4b6de796512c8430840cb15ae7b"));
const prayForRequest = createServerFn({
  method: "POST"
}).inputValidator((i) => z.object({
  prayerId: z.string().uuid(),
  fingerprint: z.string().min(4).max(80)
}).parse(i)).handler(createSsrRpc("1f96c94754b775e930ea8c210109676d5239082be7fdfd0e0a356d0dfdff44eb"));
const $$splitComponentImporter$C = () => import("./o._siteId-CXNOK0Aj.js");
const $$splitNotFoundComponentImporter$9 = () => import("./o._siteId-T40YZ7n_.js");
const Route$I = createFileRoute("/o/$siteId")({
  loader: async ({
    params
  }) => {
    const [d, chrome] = await Promise.all([getPublicPrayers({
      data: {
        siteId: params.siteId
      }
    }), getHubChrome({
      data: {
        siteId: params.siteId
      }
    })]);
    if (!d) throw notFound();
    return {
      ...d,
      chrome
    };
  },
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Pedidos de Oração · ${loaderData?.account.brand_title ?? "Comunidade"}`
    }, {
      name: "description",
      content: "Envie seu pedido de oração e ore por outros irmãos."
    }]
  }),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$9, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
const $$splitNotFoundComponentImporter$8 = () => import("./n._slug-CpmJ3uzm.js");
const $$splitComponentImporter$B = () => import("./n._slug-tjpdlihI.js");
const Route$H = createFileRoute("/n/$slug")({
  loader: async ({
    params
  }) => {
    const [data, chrome] = await Promise.all([getPublicNews({
      data: {
        slug: params.slug
      }
    }), getHubChrome({
      data: {
        siteId: params.slug
      }
    })]);
    if (!data) throw notFound();
    return {
      ...data,
      chrome
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$B, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$8, "notFoundComponent"),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Notícias — ${loaderData?.account.brand_title ?? ""}`
    }, {
      name: "description",
      content: `Todas as notícias e artigos de ${loaderData?.account.brand_title ?? "nossa comunidade"}.`
    }]
  })
});
const EventPageInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(5e3).default(""),
  cover_image_url: z.string().url().nullable().optional(),
  event_date: z.string().min(10).max(10),
  start_time: z.string().min(5).max(8),
  end_time: z.string().min(5).max(8).nullable().optional(),
  location_name: z.string().max(200).default(""),
  location_address: z.string().max(300).nullable().optional(),
  price_cents: z.number().int().min(0).max(1e6),
  max_attendees: z.number().int().min(0).nullable().optional(),
  allow_free: z.boolean().default(true),
  active: z.boolean().default(true),
  primary_color: z.string().max(20).default("#467da5"),
  whatsapp_contact: z.string().max(40).nullable().optional(),
  slug: z.string().max(80).optional()
});
const listEventPages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("18f75a4b6606747bfe37901a1d64507e9d468b34c5dfc4992c6bb7beefd72ae5"));
const saveEventPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventPageInput.parse(input)).handler(createSsrRpc("3c88e63965157bf211fa6180dfade4e139ed6da899205b0d9c33ee9f5dd531f2"));
const deleteEventPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("ea23eec6d66b416a2e273b490a2fb8f07c8eb2a9c1d5d1665d1f060bb377c931"));
const listEventRegistrations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventPageId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("129f9f8bed05d7e2261e8327f43116d10056f5d3e550267d5fee438d14323f19"));
const getRegistrationPayment = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  registrationId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("351ffc6fd93f5e4fceb008f915473d11e5ed1acc4570a9726ee7cc26e5fefcbd"));
const getPublicEventPage = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").slice(0, 80).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(createSsrRpc("65cb4918752aab1517a2ca65b68dd3b02e470fb48c5d92a5dbedb52e4be449b3"));
const listPublicEventsBySite = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").slice(0, 120).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(createSsrRpc("e5a23320874be81a91206b2972b53c0677757ddab1fe8a51dab375881a4ea6d1"));
const RegisterInput = z.object({
  slug: z.string().max(80),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional()
});
const registerForEvent = createServerFn({
  method: "POST"
}).inputValidator((input) => RegisterInput.parse(input)).handler(createSsrRpc("d4b21eceb526d8f801cb53277218b45973ec8daf63e13809efbfe42a1143a8a9"));
const $$splitNotFoundComponentImporter$7 = () => import("./eventos._slug-BvOMtZih.js");
const $$splitComponentImporter$A = () => import("./eventos._slug-gRXuLQpo.js");
const Route$G = createFileRoute("/eventos/$slug")({
  loader: async ({
    params
  }) => {
    const [data, chrome] = await Promise.all([listPublicEventsBySite({
      data: {
        slug: params.slug
      }
    }), getHubChrome({
      data: {
        siteId: params.slug
      }
    })]);
    if (!data) throw notFound();
    return {
      ...data,
      chrome
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$A, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$7, "notFoundComponent"),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Eventos — ${loaderData?.account.brand_title ?? ""}`
    }, {
      name: "description",
      content: `Próximos eventos de ${loaderData?.account.brand_title ?? "nossa comunidade"}.`
    }]
  })
});
const $$splitNotFoundComponentImporter$6 = () => import("./enderecos._slug-WTjVFYfD.js");
const $$splitComponentImporter$z = () => import("./enderecos._slug-D2n8a1FK.js");
const Route$F = createFileRoute("/enderecos/$slug")({
  loader: async ({
    params
  }) => {
    const [data, chrome] = await Promise.all([getPublicHub({
      data: {
        slug: params.slug
      }
    }), getHubChrome({
      data: {
        siteId: params.slug
      }
    })]);
    if (!data) throw notFound();
    return {
      ...data,
      chrome
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$z, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$6, "notFoundComponent"),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Nossos endereços — ${loaderData?.account?.brand_title ?? ""}`
    }, {
      name: "description",
      content: `Todas as unidades, capelas e endereços de ${loaderData?.account?.brand_title ?? "nossa comunidade"}.`
    }]
  })
});
const $$splitComponentImporter$y = () => import("./e._slug-d-hRlY8l.js");
const $$splitNotFoundComponentImporter$5 = () => import("./e._slug-BYs5YQ2g.js");
const Route$E = createFileRoute("/e/$slug")({
  loader: async ({
    params
  }) => {
    const page = await getPublicEventPage({
      data: {
        slug: params.slug
      }
    });
    if (!page) throw notFound();
    const accountSlug = page.account_slug;
    const chrome = accountSlug ? await getHubChrome({
      data: {
        siteId: accountSlug
      }
    }) : null;
    return {
      ...page,
      chrome
    };
  },
  head: ({
    loaderData
  }) => ({
    meta: loaderData ? [{
      title: `${loaderData.title} | Inscreva-se`
    }, {
      name: "description",
      content: loaderData.description.slice(0, 155) || `Inscrição aberta para ${loaderData.title}`
    }, {
      property: "og:title",
      content: loaderData.title
    }, {
      property: "og:description",
      content: loaderData.description.slice(0, 155)
    }, ...loaderData.cover_image_url ? [{
      property: "og:image",
      content: loaderData.cover_image_url
    }] : []] : [{
      title: "Evento"
    }]
  }),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$5, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitErrorComponentImporter$4 = () => import("./d._slug-CaGgHoON.js");
const $$splitNotFoundComponentImporter$4 = () => import("./d._slug-B2rKgY8q.js");
const $$splitComponentImporter$x = () => import("./d._slug-CmR4NB-J.js");
const Route$D = createFileRoute("/d/$slug")({
  loader: async ({
    params
  }) => {
    const [data, chrome] = await Promise.all([getPublicDonations({
      data: {
        slug: params.slug
      }
    }), getHubChrome({
      data: {
        siteId: params.slug
      }
    })]);
    if (!data) throw notFound();
    return {
      ...data,
      chrome
    };
  },
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Doações — ${loaderData?.account?.brand_title ?? "Igreja"}`
    }, {
      name: "description",
      content: `Contribua com ${loaderData?.account?.brand_title ?? "nossa igreja"} via Pix.`
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$x, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$4, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$4, "errorComponent")
});
const $$splitComponentImporter$w = () => import("./checkin._sessionId-CP4I1Dw0.js");
const Route$C = createFileRoute("/checkin/$sessionId")({
  component: lazyRouteComponent($$splitComponentImporter$w, "component"),
  head: () => ({
    meta: [{
      title: "Check-in"
    }]
  })
});
const listMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b7f69ca8c31846e3e8e27a7ded678ada2faeaaaa74d025348bd7d70d7e81d0f1"));
const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(1).max(160),
  photo_url: z.string().max(800).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  marital_status: z.string().max(30).optional().nullable(),
  role: z.string().max(40),
  member_since: z.string().optional().nullable(),
  status: z.string().max(20),
  address_street: z.string().max(200).optional().nullable(),
  address_number: z.string().max(20).optional().nullable(),
  address_city: z.string().max(100).optional().nullable(),
  address_state: z.string().max(40).optional().nullable(),
  notes: z.string().max(2e3).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  congregation: z.string().max(160).optional().nullable(),
  is_tither: z.boolean().optional().default(false)
});
const upsertMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => upsertSchema.parse(i)).handler(createSsrRpc("bdf01295617cad23066a31e82f26251fbdfa906f69f952b1315d95f1f6d98f86"));
const deleteMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("880b26f143e8525de3dd9db731e9ee5f5934f9412a6d8c0ee6ef3ec51205fa29"));
const getPublicMemberCard = createServerFn({
  method: "GET"
}).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("64c86fc6bb4f1706a4fdab294f6568b13c13fc880f3638afcd805f16ee683451"));
const $$splitErrorComponentImporter$3 = () => import("./c._memberId-BbtyrXEL.js");
const $$splitNotFoundComponentImporter$3 = () => import("./c._memberId-CSM9HFcM.js");
const $$splitComponentImporter$v = () => import("./c._memberId-BkDOvmYe.js");
const Route$B = createFileRoute("/c/$memberId")({
  loader: async ({
    params
  }) => {
    const data = await getPublicMemberCard({
      data: {
        id: params.memberId
      }
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Carteirinha — ${loaderData?.member.full_name ?? "Membro"}`
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$3, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$3, "errorComponent")
});
const getPublicAgenda = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const siteId = String(input?.siteId || "").slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site_id");
  return {
    siteId
  };
}).handler(createSsrRpc("2f1869deef1bc6f11b155c519b403c469617c676c441ba10c2a6da5fcd75bc0b"));
const $$splitErrorComponentImporter$2 = () => import("./a._siteId-Bt5axjVp.js");
const $$splitNotFoundComponentImporter$2 = () => import("./a._siteId-DasfVAZ5.js");
const $$splitComponentImporter$u = () => import("./a._siteId-keEyzjJq.js");
const searchSchema = z.object({
  view: z.enum(["full", "summary"]).optional()
});
const Route$A = createFileRoute("/a/$siteId")({
  validateSearch: searchSchema,
  loader: async ({
    params
  }) => {
    const [data, chrome] = await Promise.all([getPublicAgenda({
      data: {
        siteId: params.siteId
      }
    }), getHubChrome({
      data: {
        siteId: params.siteId
      }
    })]);
    if (!data) throw notFound();
    return {
      ...data,
      chrome
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$u, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$2, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent"),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: loaderData?.account.brand_title ?? "Agenda"
    }, {
      name: "description",
      content: loaderData?.account.brand_subtitle || "Próximas celebrações e horários."
    }]
  })
});
const $$splitNotFoundComponentImporter$1 = () => import("./_authenticated.whatsapp-DAx0aqp1.js");
const $$splitErrorComponentImporter$1 = () => import("./_authenticated.whatsapp-B8ULRG7g.js");
const $$splitComponentImporter$t = () => import("./_authenticated.whatsapp-CBuPoGOY.js");
const Route$z = createFileRoute("/_authenticated/whatsapp")({
  component: lazyRouteComponent($$splitComponentImporter$t, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
const $$splitComponentImporter$s = () => import("./_authenticated.visitantes-C8jg-gk5.js");
const Route$y = createFileRoute("/_authenticated/visitantes")({
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./_authenticated.types-BhaVWB-C.js");
const Route$x = createFileRoute("/_authenticated/types")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./_authenticated.transmissoes-BzV63Gb-.js");
const Route$w = createFileRoute("/_authenticated/transmissoes")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./_authenticated.settings-DW63fG2K.js");
const Route$v = createFileRoute("/_authenticated/settings")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitErrorComponentImporter = () => import("./_authenticated.relatorios-D5P2WYVp.js");
const $$splitComponentImporter$o = () => import("./_authenticated.relatorios-VCgG-gBO.js");
const Route$u = createFileRoute("/_authenticated/relatorios")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
const $$splitComponentImporter$n = () => import("./_authenticated.oracoes-17N6R1Nx.js");
const Route$t = createFileRoute("/_authenticated/oracoes")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./_authenticated.onboarding-FBf-qqJ5.js");
const Route$s = createFileRoute("/_authenticated/onboarding")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./_authenticated.membros-BnIHCHJE.js");
const Route$r = createFileRoute("/_authenticated/membros")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./_authenticated.marketplace-CAsidmaq.js");
const Route$q = createFileRoute("/_authenticated/marketplace")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./_authenticated.locations-CJ2kSzYL.js");
const Route$p = createFileRoute("/_authenticated/locations")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./_authenticated.hub-Dop8_xQx.js");
const HUB_TABS = ["geral", "aparencia", "slides", "destaques", "mensagem", "secoes", "noticias", "midia", "contatos", "doacoes"];
const Route$o = createFileRoute("/_authenticated/hub")({
  validateSearch: z.object({
    tab: z.enum(HUB_TABS).optional()
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./_authenticated.finances-Bh1-EXkj.js");
const Route$n = createFileRoute("/_authenticated/finances")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fbb6aec214bfb13393d699e05a4618af3adb13eaf54267bc2306cad764023ec6"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("bdf06463391e0f38ffb2f7cbe5a89e8154db435190f58dbc561b9d635966daad"));
const $$splitComponentImporter$g = () => import("./_authenticated.eventos-Cevwna0H.js");
const Route$m = createFileRoute("/_authenticated/eventos")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./_authenticated.embed-C2AlC8zJ.js");
const Route$l = createFileRoute("/_authenticated/embed")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./_authenticated.ebd-CtYHbu7O.js");
const Route$k = createFileRoute("/_authenticated/ebd")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./_authenticated.documentos-B3C0vIiw.js");
const Route$j = createFileRoute("/_authenticated/documentos")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_authenticated.devocional-BP8HvMck.js");
const Route$i = createFileRoute("/_authenticated/devocional")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component"),
  head: () => ({
    meta: [{
      title: "Devocional Diário"
    }]
  })
});
const $$splitComponentImporter$b = () => import("./_authenticated.dashboard-CDyK6GQ6.js");
const Route$h = createFileRoute("/_authenticated/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./_authenticated.checkin-h71sf3t9.js");
const Route$g = createFileRoute("/_authenticated/checkin")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component"),
  head: () => ({
    meta: [{
      title: "Check-in de Cultos"
    }]
  })
});
const $$splitComponentImporter$9 = () => import("./_authenticated.celulas-Db6Co7Lz.js");
const Route$f = createFileRoute("/_authenticated/celulas")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
  head: () => ({
    meta: [{
      title: "Pequenos Grupos / Células"
    }]
  })
});
const $$splitComponentImporter$8 = () => import("./_authenticated.billing-Deqw_e9w.js");
const Route$e = createFileRoute("/_authenticated/billing")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_authenticated.agenda-CR8rCk7j.js");
const Route$d = createFileRoute("/_authenticated/agenda")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_authenticated.admin.index-DrjuBTSX.js");
const Route$c = createFileRoute("/_authenticated/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitNotFoundComponentImporter = () => import("./n._slug._postId-CfY_msNu.js");
const $$splitComponentImporter$5 = () => import("./n._slug._postId-BjrOL6x-.js");
const Route$b = createFileRoute("/n/$slug/$postId")({
  loader: async ({
    params
  }) => {
    const [data, chrome] = await Promise.all([getPublicNewsPost({
      data: {
        slug: params.slug,
        postId: params.postId
      }
    }), getHubChrome({
      data: {
        siteId: params.slug
      }
    })]);
    if (!data) throw notFound();
    return {
      ...data,
      chrome
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `${loaderData?.post.title ?? "Notícia"} — ${loaderData?.account.brand_title ?? ""}`
    }, {
      name: "description",
      content: loaderData?.post.subtitle || loaderData?.post.title || ""
    }, ...loaderData?.post.image_url ? [{
      property: "og:image",
      content: loaderData.post.image_url
    }] : []]
  })
});
const CORS$2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function json$1(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS$2 }
  });
}
const Route$a = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS$2 }),
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const accountId = url.searchParams.get("account_id");
        if (!accountId) return json$1({ error: "missing account_id" }, 400);
        const payload = await request.json().catch(() => null);
        const paymentId = payload?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
        if (!paymentId) return json$1({ error: "missing payment id" }, 400);
        const { data: connection, error: connError } = await supabaseAdmin.from("mercadopago_connections").select("access_token").eq("account_id", accountId).maybeSingle();
        if (connError) throw new Error(connError.message);
        if (!connection) return json$1({ error: "unknown account" }, 404);
        const verifyResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${connection.access_token}` }
        });
        const verified = await verifyResponse.json().catch(() => null);
        if (!verifyResponse.ok || !verified) return json$1({ error: "could not verify payment" }, 400);
        const status = String(verified.status ?? "pending");
        const dateApproved = verified.date_approved;
        const { data: donation, error: donationError } = await supabaseAdmin.from("donations").select("id, status").eq("mercadopago_payment_id", String(paymentId)).eq("account_id", accountId).maybeSingle();
        if (donationError) throw new Error(donationError.message);
        if (!donation) return json$1({ ok: true, ignored: true });
        const newStatus = status === "approved" ? "paid" : status === "rejected" || status === "cancelled" ? "failed" : "pending";
        const { error: updateError } = await supabaseAdmin.from("donations").update({
          status: newStatus,
          paid_at: newStatus === "paid" ? dateApproved ?? (/* @__PURE__ */ new Date()).toISOString() : null,
          webhook_payload: payload ?? {}
        }).eq("id", donation.id);
        if (updateError) throw new Error(updateError.message);
        return json$1({ ok: true });
      }
    }
  }
});
const CORS$1 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret"
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS$1 }
  });
}
function readData(payload) {
  return payload.data && typeof payload.data === "object" ? payload.data : payload;
}
function normalizeStatus(status) {
  return String(status ?? "pending").toLowerCase();
}
function isPaidStatus(status) {
  return ["paid", "authorized"].includes(status.toLowerCase());
}
function readMetadata(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}
async function activateSubscription(accountId, plan, paidAt) {
  const base = paidAt ? new Date(paidAt) : /* @__PURE__ */ new Date();
  const endsAt = new Date(base);
  endsAt.setDate(endsAt.getDate() + BILLING_PLANS[plan].durationDays);
  const { error } = await supabaseAdmin.from("accounts").update({
    current_plan: plan,
    subscription_status: "active",
    subscription_ends_at: endsAt.toISOString()
  }).eq("id", accountId);
  if (error) throw new Error(error.message);
}
async function markProductPurchasePaid(transactionDbId, paidAt) {
  const { error } = await supabaseAdmin.from("product_purchases").update({ status: "paid", purchased_at: paidAt ?? (/* @__PURE__ */ new Date()).toISOString() }).eq("transaction_id", transactionDbId);
  if (error) throw new Error(error.message);
}
async function markEventRegistrationPaid(transactionDbId, paidAt) {
  const { error } = await supabaseAdmin.from("event_registrations").update({ status: "paid", paid_at: paidAt ?? (/* @__PURE__ */ new Date()).toISOString() }).eq("transaction_id", transactionDbId);
  if (error) throw new Error(error.message);
}
const Route$9 = createFileRoute("/api/public/ativopay-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS$1 }),
      POST: async ({ request }) => {
        const expectedSecret = await resolveAtivoPayWebhookSecret();
        if (!expectedSecret) return json({ error: "webhook not configured" }, 500);
        const received = request.headers.get("x-webhook-secret");
        if (received !== expectedSecret) return json({ error: "unauthorized" }, 401);
        const payload = await request.json().catch(() => null);
        if (!payload || typeof payload !== "object") return json({ error: "invalid payload" }, 400);
        const data = readData(payload);
        const transactionId = typeof data.id === "string" ? data.id : typeof payload.objectId === "string" ? payload.objectId : null;
        if (!transactionId) return json({ error: "missing transaction id" }, 400);
        const status = normalizeStatus(data.status);
        const paidAt = typeof data.paidAt === "string" ? data.paidAt : null;
        const metadata = readMetadata(data.metadata);
        typeof metadata?.accountId === "string" ? metadata.accountId : null;
        const metadataPlan = metadata?.plan === "annual" || metadata?.plan === "monthly" ? metadata.plan : null;
        const metadataKind = metadata?.kind === "product" ? "product" : metadata?.kind === "event_registration" ? "event_registration" : "subscription";
        const { data: tx, error: txError } = await supabaseAdmin.from("payment_transactions").select("id, account_id, plan, kind, product_id").eq("ativopay_transaction_id", transactionId).maybeSingle();
        if (txError) throw new Error(txError.message);
        if (!tx) return json({ error: "unknown transaction" }, 404);
        const accountId = tx.account_id;
        const kind = tx.kind ?? metadataKind;
        if (!accountId) return json({ ok: true, ignored: true });
        const { error: updateError } = await supabaseAdmin.from("payment_transactions").update({ status, paid_at: paidAt, webhook_payload: payload }).eq("ativopay_transaction_id", transactionId);
        if (updateError) throw new Error(updateError.message);
        if (isPaidStatus(status)) {
          if (kind === "product" && tx?.id) {
            await markProductPurchasePaid(tx.id, paidAt);
          } else if (kind === "event_registration" && tx?.id) {
            await markEventRegistrationPaid(tx.id, paidAt);
          } else {
            const plan = tx?.plan ?? metadataPlan;
            if (plan) await activateSubscription(accountId, plan, paidAt);
          }
        }
        return json({ ok: true });
      }
    }
  }
});
const $$splitComponentImporter$4 = () => import("./_authenticated.marketplace._slug-BhP2Ho1z.js");
const Route$8 = createFileRoute("/_authenticated/marketplace/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_authenticated.admin.test-data-kIy2UW0Q.js");
const Route$7 = createFileRoute("/_authenticated/admin/test-data")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_authenticated.admin.products-DV6_4ilv.js");
const Route$6 = createFileRoute("/_authenticated/admin/products")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_authenticated.admin.payments-D-sK00hY.js");
const Route$5 = createFileRoute("/_authenticated/admin/payments")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_authenticated.admin.feedback-Bz64Ce7I.js");
const Route$4 = createFileRoute("/_authenticated/admin/feedback")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const REDIRECT_URI = "https://suaigreja.top/api/public/instagram/callback";
async function verifyState(state) {
  const {
    createHmac
  } = await import("node:crypto");
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [accountId, nonce, sig] = parts;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
  const expected = createHmac("sha256", secret).update(`${accountId}.${nonce}`).digest("hex").slice(0, 32);
  return expected === sig ? accountId : null;
}
const startInstagramConnect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c811fd7db0f106c9d94cb23fd4e3eab5b55f4e7f7cde516bebac94e470fb740a"));
const getInstagramConnection = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2b3a6d41dc6818c4d642f5d8f52b3d02a593df6588ab61399b6e78011731dd4b"));
const disconnectInstagram = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("995253a1c82ea2f98b207984482cb910589d1e85398f12c28f7833c9546e5525"));
const getPublicInstagramPosts = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(createSsrRpc("6ba7348804860fe1130a990c092d065448a312d9d53003d73c190e393af98848"));
async function completeInstagramOAuth(params) {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-D5ro3rAQ.js");
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) throw new Error("Instagram app credentials missing");
  const form = new URLSearchParams();
  form.set("client_id", appId);
  form.set("client_secret", appSecret);
  form.set("grant_type", "authorization_code");
  form.set("redirect_uri", REDIRECT_URI);
  form.set("code", params.code);
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });
  if (!shortRes.ok) {
    const t = await shortRes.text();
    throw new Error(`Short token exchange failed: ${shortRes.status} ${t}`);
  }
  const shortBody = await shortRes.json();
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("access_token", shortBody.access_token);
  const longRes = await fetch(longUrl.toString());
  if (!longRes.ok) {
    const t = await longRes.text();
    throw new Error(`Long token exchange failed: ${longRes.status} ${t}`);
  }
  const longBody = await longRes.json();
  const meUrl = new URL("https://graph.instagram.com/v21.0/me");
  meUrl.searchParams.set("fields", "id,username");
  meUrl.searchParams.set("access_token", longBody.access_token);
  const meRes = await fetch(meUrl.toString());
  const me = meRes.ok ? await meRes.json() : {
    id: String(shortBody.user_id),
    username: ""
  };
  const expiresAt = new Date(Date.now() + longBody.expires_in * 1e3).toISOString();
  const {
    error
  } = await supabaseAdmin2.from("instagram_connections").upsert({
    account_id: params.accountId,
    ig_user_id: me.id,
    username: me.username || null,
    access_token: longBody.access_token,
    token_expires_at: expiresAt
  }, {
    onConflict: "account_id"
  });
  if (error) throw new Error(`Persist connection failed: ${error.message}`);
}
const Route$3 = createFileRoute("/api/public/instagram/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");
        const redirectTo = (status, message) => {
          const dest = new URL("https://suaigreja.top/hub");
          dest.searchParams.set("ig", status);
          if (message) dest.searchParams.set("ig_msg", message);
          return Response.redirect(dest.toString(), 302);
        };
        if (error) {
          return redirectTo("error", errorDescription || error);
        }
        if (!code || !state) {
          return redirectTo("error", "missing_code_or_state");
        }
        const accountId = await verifyState(state);
        if (!accountId) {
          return redirectTo("error", "invalid_state");
        }
        try {
          await completeInstagramOAuth({ accountId, code });
          return redirectTo("success");
        } catch (e) {
          console.error("[instagram callback]", e);
          return redirectTo("error", e instanceof Error ? e.message : "unknown_error");
        }
      }
    }
  }
});
const Route$2 = createFileRoute("/api/public/cron/whatsapp-birthdays")({
  server: {
    handlers: {
      POST: async () => {
        const now = /* @__PURE__ */ new Date();
        const brt = new Date(now.getTime() - 3 * 60 * 60 * 1e3);
        const month = brt.getUTCMonth() + 1;
        const day = brt.getUTCDate();
        const brtDate = brt.toISOString().slice(0, 10);
        const { data: settingsRows, error: settingsErr } = await supabaseAdmin.from("whatsapp_settings").select("account_id, birthday_enabled, birthday_template, credits_balance, sender_name").eq("enabled", true).eq("birthday_enabled", true);
        if (settingsErr) {
          return Response.json({ ok: false, error: settingsErr.message }, { status: 500 });
        }
        let enqueued = 0;
        let skippedNoPhone = 0;
        let skippedNoCredit = 0;
        const processedAccounts = settingsRows?.length ?? 0;
        for (const s of settingsRows ?? []) {
          const { data: accRow } = await supabaseAdmin.from("accounts").select("brand_title").eq("id", s.account_id).maybeSingle();
          const churchName = accRow?.brand_title ?? "nossa igreja";
          const { data: members } = await supabaseAdmin.from("members").select("id, full_name, phone, birth_date").eq("account_id", s.account_id).eq("status", "ativo").not("birth_date", "is", null);
          const birthdayMembers = (members ?? []).filter((m) => {
            if (!m.birth_date) return false;
            const d = /* @__PURE__ */ new Date(m.birth_date + "T00:00:00Z");
            return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
          });
          let availableCredits = s.credits_balance ?? 0;
          for (const m of birthdayMembers) {
            if (!m.phone || m.phone.trim().length < 8) {
              skippedNoPhone++;
              continue;
            }
            if (availableCredits <= 0) {
              skippedNoCredit++;
              continue;
            }
            const firstName = (m.full_name ?? "").split(" ")[0] || "amigo(a)";
            const content = (s.birthday_template ?? "").replaceAll("{nome}", firstName).replaceAll("{nome_completo}", m.full_name ?? firstName).replaceAll("{igreja}", churchName);
            const { error: insErr } = await supabaseAdmin.from("whatsapp_messages").insert({
              account_id: s.account_id,
              member_id: m.id,
              kind: "birthday",
              phone: m.phone,
              recipient_name: m.full_name,
              content,
              status: "queued",
              scheduled_for: now.toISOString(),
              scheduled_date: brtDate,
              cost_credits: 1
            });
            if (!insErr) {
              enqueued++;
              availableCredits--;
            }
          }
        }
        return Response.json({
          ok: true,
          date: brtDate,
          processedAccounts,
          enqueued,
          skippedNoPhone,
          skippedNoCredit
        });
      }
    }
  }
});
const REMINDER_DAY_OF_MONTH = 5;
const Route$1 = createFileRoute("/api/public/cron/tithe-reminder")({
  server: {
    handlers: {
      POST: async () => {
        const now = /* @__PURE__ */ new Date();
        const brt = new Date(now.getTime() - 3 * 60 * 60 * 1e3);
        const brtDate = brt.toISOString().slice(0, 10);
        if (brt.getUTCDate() !== REMINDER_DAY_OF_MONTH) {
          return Response.json({ ok: true, skipped: true, reason: "not_reminder_day", date: brtDate });
        }
        const { data: settingsRows, error: settingsErr } = await supabaseAdmin.from("whatsapp_settings").select("account_id, tithe_reminder_enabled, tithe_reminder_template, credits_balance").eq("enabled", true).eq("tithe_reminder_enabled", true);
        if (settingsErr) {
          return Response.json({ ok: false, error: settingsErr.message }, { status: 500 });
        }
        let enqueued = 0;
        let skippedNoPhone = 0;
        let skippedNoCredit = 0;
        const processedAccounts = settingsRows?.length ?? 0;
        for (const s of settingsRows ?? []) {
          const { data: accRow } = await supabaseAdmin.from("accounts").select("brand_title").eq("id", s.account_id).maybeSingle();
          const churchName = accRow?.brand_title ?? "nossa igreja";
          const { data: members } = await supabaseAdmin.from("members").select("id, full_name, phone").eq("account_id", s.account_id).eq("status", "ativo").eq("is_tither", true);
          let availableCredits = s.credits_balance ?? 0;
          for (const m of members ?? []) {
            if (!m.phone || m.phone.trim().length < 8) {
              skippedNoPhone++;
              continue;
            }
            if (availableCredits <= 0) {
              skippedNoCredit++;
              continue;
            }
            const firstName = (m.full_name ?? "").split(" ")[0] || "amigo(a)";
            const content = (s.tithe_reminder_template ?? "").replaceAll("{nome}", firstName).replaceAll("{nome_completo}", m.full_name ?? firstName).replaceAll("{igreja}", churchName);
            const { error: insErr } = await supabaseAdmin.from("whatsapp_messages").insert({
              account_id: s.account_id,
              member_id: m.id,
              kind: "tithe_reminder",
              phone: m.phone,
              recipient_name: m.full_name,
              content,
              status: "queued",
              scheduled_for: now.toISOString(),
              scheduled_date: brtDate,
              cost_credits: 1
            });
            if (!insErr) {
              enqueued++;
              availableCredits--;
            }
          }
        }
        return Response.json({
          ok: true,
          date: brtDate,
          processedAccounts,
          enqueued,
          skippedNoPhone,
          skippedNoCredit
        });
      }
    }
  }
});
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const Route = createFileRoute("/api/public/agenda/$siteId")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params }) => {
        const siteId = String(params.siteId || "").slice(0, 64);
        if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) {
          return new Response(JSON.stringify({ error: "invalid site_id" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS }
          });
        }
        const lookup = siteId.toLowerCase();
        let { data: account, error: accErr } = await supabaseAdmin.from("accounts").select(
          "id, site_id, brand_title, brand_subtitle, brand_empty_message, primary_color, force_show_type"
        ).eq("custom_slug", lookup).maybeSingle();
        if (!accErr && !account) {
          const fb = await supabaseAdmin.from("accounts").select(
            "id, site_id, brand_title, brand_subtitle, brand_empty_message, primary_color, force_show_type"
          ).eq("site_id", siteId).maybeSingle();
          account = fb.data;
          accErr = fb.error;
        }
        if (accErr || !account) {
          return new Response(JSON.stringify({ error: "not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...CORS }
          });
        }
        const today = /* @__PURE__ */ new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const horizon = new Date(today);
        horizon.setDate(horizon.getDate() + 90);
        const to = `${horizon.getFullYear()}-${pad(horizon.getMonth() + 1)}-${pad(horizon.getDate())}`;
        const { data: events, error: evErr } = await supabaseAdmin.from("events").select(
          "id, event_date, start_time, end_time, location_name, type_name, type_id, description, show_type, is_live, live_url"
        ).eq("account_id", account.id).gte("event_date", from).lte("event_date", to).order("event_date", { ascending: true }).order("start_time", { ascending: true });
        if (evErr) {
          return new Response(JSON.stringify({ error: evErr.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...CORS }
          });
        }
        const { data: types } = await supabaseAdmin.from("celebration_types").select("id, name, color, icon").eq("account_id", account.id);
        return new Response(
          JSON.stringify({
            account: {
              brand_title: account.brand_title,
              brand_subtitle: account.brand_subtitle,
              brand_empty_message: account.brand_empty_message,
              primary_color: account.primary_color,
              force_show_type: account.force_show_type
            },
            events: events ?? [],
            types: types ?? []
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=60",
              ...CORS
            }
          }
        );
      }
    }
  }
});
const UpdatePasswordRoute = Route$P.update({
  id: "/update-password",
  path: "/update-password",
  getParentRoute: () => Route$Q
});
const LoginRoute = Route$O.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$Q
});
const AuthenticatedRoute = Route$N.update({
  id: "/_authenticated",
  getParentRoute: () => Route$Q
});
const SlugRoute = Route$M.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => Route$Q
});
const IndexRoute = Route$L.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$Q
});
const VSiteIdRoute = Route$K.update({
  id: "/v/$siteId",
  path: "/v/$siteId",
  getParentRoute: () => Route$Q
});
const ReciboDonationIdRoute = Route$J.update({
  id: "/recibo/$donationId",
  path: "/recibo/$donationId",
  getParentRoute: () => Route$Q
});
const OSiteIdRoute = Route$I.update({
  id: "/o/$siteId",
  path: "/o/$siteId",
  getParentRoute: () => Route$Q
});
const NSlugRoute = Route$H.update({
  id: "/n/$slug",
  path: "/n/$slug",
  getParentRoute: () => Route$Q
});
const EventosSlugRoute = Route$G.update({
  id: "/eventos/$slug",
  path: "/eventos/$slug",
  getParentRoute: () => Route$Q
});
const EnderecosSlugRoute = Route$F.update({
  id: "/enderecos/$slug",
  path: "/enderecos/$slug",
  getParentRoute: () => Route$Q
});
const ESlugRoute = Route$E.update({
  id: "/e/$slug",
  path: "/e/$slug",
  getParentRoute: () => Route$Q
});
const DSlugRoute = Route$D.update({
  id: "/d/$slug",
  path: "/d/$slug",
  getParentRoute: () => Route$Q
});
const CheckinSessionIdRoute = Route$C.update({
  id: "/checkin/$sessionId",
  path: "/checkin/$sessionId",
  getParentRoute: () => Route$Q
});
const CMemberIdRoute = Route$B.update({
  id: "/c/$memberId",
  path: "/c/$memberId",
  getParentRoute: () => Route$Q
});
const ASiteIdRoute = Route$A.update({
  id: "/a/$siteId",
  path: "/a/$siteId",
  getParentRoute: () => Route$Q
});
const AuthenticatedWhatsappRoute = Route$z.update({
  id: "/whatsapp",
  path: "/whatsapp",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedVisitantesRoute = Route$y.update({
  id: "/visitantes",
  path: "/visitantes",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedTypesRoute = Route$x.update({
  id: "/types",
  path: "/types",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedTransmissoesRoute = Route$w.update({
  id: "/transmissoes",
  path: "/transmissoes",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedSettingsRoute = Route$v.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedRelatoriosRoute = Route$u.update({
  id: "/relatorios",
  path: "/relatorios",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedOracoesRoute = Route$t.update({
  id: "/oracoes",
  path: "/oracoes",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedOnboardingRoute = Route$s.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedMembrosRoute = Route$r.update({
  id: "/membros",
  path: "/membros",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedMarketplaceRoute = Route$q.update({
  id: "/marketplace",
  path: "/marketplace",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedLocationsRoute = Route$p.update({
  id: "/locations",
  path: "/locations",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedHubRoute = Route$o.update({
  id: "/hub",
  path: "/hub",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedFinancesRoute = Route$n.update({
  id: "/finances",
  path: "/finances",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedEventosRoute = Route$m.update({
  id: "/eventos",
  path: "/eventos",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedEmbedRoute = Route$l.update({
  id: "/embed",
  path: "/embed",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedEbdRoute = Route$k.update({
  id: "/ebd",
  path: "/ebd",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDocumentosRoute = Route$j.update({
  id: "/documentos",
  path: "/documentos",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDevocionalRoute = Route$i.update({
  id: "/devocional",
  path: "/devocional",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDashboardRoute = Route$h.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedCheckinRoute = Route$g.update({
  id: "/checkin",
  path: "/checkin",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedCelulasRoute = Route$f.update({
  id: "/celulas",
  path: "/celulas",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedBillingRoute = Route$e.update({
  id: "/billing",
  path: "/billing",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAgendaRoute = Route$d.update({
  id: "/agenda",
  path: "/agenda",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAdminIndexRoute = Route$c.update({
  id: "/admin/",
  path: "/admin/",
  getParentRoute: () => AuthenticatedRoute
});
const NSlugPostIdRoute = Route$b.update({
  id: "/$postId",
  path: "/$postId",
  getParentRoute: () => NSlugRoute
});
const ApiPublicMercadopagoWebhookRoute = Route$a.update({
  id: "/api/public/mercadopago-webhook",
  path: "/api/public/mercadopago-webhook",
  getParentRoute: () => Route$Q
});
const ApiPublicAtivopayWebhookRoute = Route$9.update({
  id: "/api/public/ativopay-webhook",
  path: "/api/public/ativopay-webhook",
  getParentRoute: () => Route$Q
});
const AuthenticatedMarketplaceSlugRoute = Route$8.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => AuthenticatedMarketplaceRoute
});
const AuthenticatedAdminTestDataRoute = Route$7.update({
  id: "/admin/test-data",
  path: "/admin/test-data",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAdminProductsRoute = Route$6.update({
  id: "/admin/products",
  path: "/admin/products",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAdminPaymentsRoute = Route$5.update({
  id: "/admin/payments",
  path: "/admin/payments",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAdminFeedbackRoute = Route$4.update({
  id: "/admin/feedback",
  path: "/admin/feedback",
  getParentRoute: () => AuthenticatedRoute
});
const ApiPublicInstagramCallbackRoute = Route$3.update({
  id: "/api/public/instagram/callback",
  path: "/api/public/instagram/callback",
  getParentRoute: () => Route$Q
});
const ApiPublicCronWhatsappBirthdaysRoute = Route$2.update({
  id: "/api/public/cron/whatsapp-birthdays",
  path: "/api/public/cron/whatsapp-birthdays",
  getParentRoute: () => Route$Q
});
const ApiPublicCronTitheReminderRoute = Route$1.update({
  id: "/api/public/cron/tithe-reminder",
  path: "/api/public/cron/tithe-reminder",
  getParentRoute: () => Route$Q
});
const ApiPublicAgendaSiteIdRoute = Route.update({
  id: "/api/public/agenda/$siteId",
  path: "/api/public/agenda/$siteId",
  getParentRoute: () => Route$Q
});
const AuthenticatedMarketplaceRouteChildren = {
  AuthenticatedMarketplaceSlugRoute
};
const AuthenticatedMarketplaceRouteWithChildren = AuthenticatedMarketplaceRoute._addFileChildren(
  AuthenticatedMarketplaceRouteChildren
);
const AuthenticatedRouteChildren = {
  AuthenticatedAgendaRoute,
  AuthenticatedBillingRoute,
  AuthenticatedCelulasRoute,
  AuthenticatedCheckinRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedDevocionalRoute,
  AuthenticatedDocumentosRoute,
  AuthenticatedEbdRoute,
  AuthenticatedEmbedRoute,
  AuthenticatedEventosRoute,
  AuthenticatedFinancesRoute,
  AuthenticatedHubRoute,
  AuthenticatedLocationsRoute,
  AuthenticatedMarketplaceRoute: AuthenticatedMarketplaceRouteWithChildren,
  AuthenticatedMembrosRoute,
  AuthenticatedOnboardingRoute,
  AuthenticatedOracoesRoute,
  AuthenticatedRelatoriosRoute,
  AuthenticatedSettingsRoute,
  AuthenticatedTransmissoesRoute,
  AuthenticatedTypesRoute,
  AuthenticatedVisitantesRoute,
  AuthenticatedWhatsappRoute,
  AuthenticatedAdminFeedbackRoute,
  AuthenticatedAdminPaymentsRoute,
  AuthenticatedAdminProductsRoute,
  AuthenticatedAdminTestDataRoute,
  AuthenticatedAdminIndexRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const NSlugRouteChildren = {
  NSlugPostIdRoute
};
const NSlugRouteWithChildren = NSlugRoute._addFileChildren(NSlugRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  SlugRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  LoginRoute,
  UpdatePasswordRoute,
  ASiteIdRoute,
  CMemberIdRoute,
  CheckinSessionIdRoute,
  DSlugRoute,
  ESlugRoute,
  EnderecosSlugRoute,
  EventosSlugRoute,
  NSlugRoute: NSlugRouteWithChildren,
  OSiteIdRoute,
  ReciboDonationIdRoute,
  VSiteIdRoute,
  ApiPublicAtivopayWebhookRoute,
  ApiPublicMercadopagoWebhookRoute,
  ApiPublicAgendaSiteIdRoute,
  ApiPublicCronTitheReminderRoute,
  ApiPublicCronWhatsappBirthdaysRoute,
  ApiPublicInstagramCallbackRoute
};
const routeTree = Route$Q._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  upsertMember as A,
  deleteMember as B,
  listEventPages as C,
  saveEventPage as D,
  deleteEventPage as E,
  listEventRegistrations as F,
  getRegistrationPayment as G,
  listMyDonationCampaigns as H,
  Route$b as I,
  Route$8 as J,
  Route$M as K,
  getPublicInstagramPosts as L,
  uploadHubAsset as M,
  getDonationsMonthlyReport as N,
  upsertDonationCampaign as O,
  deleteDonationCampaign as P,
  getDonationCampaignStats as Q,
  Route$K as R,
  updateHubSettings as S,
  listMyNews as T,
  upsertNews as U,
  deleteNews as V,
  startInstagramConnect as W,
  getInstagramConnection as X,
  disconnectInstagram as Y,
  router as Z,
  Route$J as a,
  Route$I as b,
  submitPrayerRequest as c,
  Route$H as d,
  Route$G as e,
  Route$F as f,
  getPublicPrayers as g,
  Route$E as h,
  Route$D as i,
  generateDonationPix as j,
  Route$B as k,
  Route$A as l,
  listVisitors as m,
  updateVisitorStatus as n,
  updateVisitorNotes as o,
  prayForRequest as p,
  deleteVisitor as q,
  registerForEvent as r,
  submitVisitor as s,
  getVisitorSettings as t,
  useAuth as u,
  saveVisitorSettings as v,
  listPrayerRequests as w,
  updatePrayerStatus as x,
  deletePrayerRequest as y,
  listMembers as z
};
