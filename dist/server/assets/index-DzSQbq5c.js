import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useAuth } from "./router-BAWvi9U-.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { MessageCircle, Sparkles, ArrowRight, Check, Bell, HandHeart, Calendar, Globe, QrCode, CreditCard, Radio, ShieldCheck, Users, TrendingUp, Quote, Star, Smartphone, BookOpen, X, Heart } from "lucide-react";
import "@tanstack/react-query";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "sonner";
import "./admin-payment-settings.functions-DPCtUTO2.js";
import "./server-aNfUBU9s.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CuIHMyp3.js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const heroBg = "/assets/landing-hero-cathedral-BfwJfV5p.jpg";
const appMockup = "/assets/landing-app-mockup-DCunizaG.jpg";
const community = "/assets/landing-community-BEDG2Mod.jpg";
const MARKETING_TIERS = [
  {
    id: "embed",
    name: "Embed",
    tagline: "Para igrejas que já têm site",
    priceLabel: "R$ 29/mês",
    amountCents: 2900,
    features: [
      "Agenda de celebrações",
      "Código para colar no site existente",
      "Atualizações em tempo real",
      "Suporte por WhatsApp"
    ]
  },
  {
    id: "presenca",
    name: "Presença",
    tagline: "Tenha sua presença digital completa",
    priceLabel: "R$ 49/mês",
    amountCents: 4900,
    highlight: true,
    features: [
      "Tudo do plano Embed",
      "Hub público suaigreja.top/sua-igreja",
      "Página de eventos com inscrição e Pix",
      "Pedidos de oração",
      "Lista de visitantes (QR Code)",
      "Links sociais e Pix integrados"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Domínio próprio e site personalizado",
    priceLabel: "R$ 99/mês",
    amountCents: 9900,
    features: [
      "Tudo do plano Presença",
      "Domínio próprio (paroquiasaojose.com.br)",
      "Landing page personalizada",
      "Suporte prioritário",
      "Acesso antecipado aos novos módulos"
    ]
  }
];
function WhatsAppFab({
  phone = "5522999090989",
  message = "Olá! Quero conhecer a plataforma suaigreja."
}) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Falar no WhatsApp",
      className: "fixed bottom-5 left-5 z-50 group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-8px_rgba(37,211,102,0.55)] transition-all hover:scale-[1.03] hover:shadow-[0_18px_50px_-8px_rgba(37,211,102,0.7)] sm:w-auto sm:gap-3 sm:pl-4 sm:pr-5",
      children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-6 w-6 items-center justify-center", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-white/30 animate-ping" }),
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5", strokeWidth: 2.5 })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "hidden text-sm font-medium tracking-tight sm:inline", children: "Falar no WhatsApp" })
      ]
    }
  );
}
function Index() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [exitDismissed, setExitDismissed] = useState(false);
  useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (exitDismissed) return;
    const onLeave = (e) => {
      if (e.clientY <= 0) setShowExitOffer(true);
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, [exitDismissed]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[oklch(0.98_0.012_85)] text-ink font-sans antialiased overflow-x-hidden selection:bg-gold/30 selection:text-foreground", children: [
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] rounded-full bg-gold/10 blur-[140px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-[40%] -left-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.85_0.08_85)]/40 blur-[120px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" })
    ] }),
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 backdrop-blur-xl bg-[oklch(0.98_0.012_85)]/80 border-b border-ink/8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl flex items-center justify-between px-6 h-16", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 font-display text-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-[0_4px_20px_-4px_oklch(0.82_0.13_82_/_0.5)]", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-ink", strokeWidth: 2.5 }) }),
        /* @__PURE__ */ jsx("span", { className: "tracking-tight", children: "suaigreja" })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex items-center gap-1 text-sm text-ink/60", children: [
        /* @__PURE__ */ jsx("a", { href: "#funcionalidades", className: "px-3 py-2 hover:text-ink transition", children: "Recursos" }),
        /* @__PURE__ */ jsx("a", { href: "#beneficios", className: "px-3 py-2 hover:text-ink transition", children: "Benefícios" }),
        /* @__PURE__ */ jsx("a", { href: "#planos", className: "px-3 py-2 hover:text-ink transition", children: "Planos" }),
        /* @__PURE__ */ jsx("a", { href: "#depoimentos", className: "px-3 py-2 hover:text-ink transition", children: "Comunidade" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "text-ink/70 hover:text-ink hover:bg-ink/5", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Entrar" }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", style: {
          backgroundColor: "#C4A747",
          color: "#2D2D2D"
        }, className: "hover:bg-gold-soft shadow-[0_4px_20px_-4px_oklch(0.82_0.13_82_/_0.5)]", children: /* @__PURE__ */ jsxs(Link, { to: "/login", children: [
          "Começar 7 dias grátis ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10", children: [
        /* @__PURE__ */ jsx("img", { src: heroBg, alt: "", width: 1920, height: 1280, className: "h-full w-full object-cover opacity-40" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[oklch(0.98_0.012_85)]/30 via-[oklch(0.98_0.012_85)]/70 to-[oklch(0.98_0.012_85)]" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-32 lg:pb-32 grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 backdrop-blur px-3.5 py-1.5 text-xs text-gold-soft mb-8", children: [
            /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-gold animate-pulse" }),
            "Nova era da sua comunidade começa aqui"
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "font-display text-[2.75rem] sm:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.02] text-ink", children: [
            "A plataforma que ",
            /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "conecta" }),
            /* @__PURE__ */ jsx("br", {}),
            "sua comunidade ",
            /* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
            /* @__PURE__ */ jsx("span", { className: "text-ink/70", children: "em um só lugar." })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-7 text-lg sm:text-xl text-ink/65 max-w-xl leading-relaxed font-light", children: "Agenda, eventos, pedidos de oração, visitantes e um site próprio — tudo pronto em minutos. Organize, evangelize e veja sua igreja crescer com uma plataforma feita com fé e cuidado." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", style: {
              backgroundColor: "#C4A747",
              color: "#2D2D2D"
            }, className: "h-12 px-7 text-base hover:bg-gold-soft shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82_/_0.6)] transition-all hover:translate-y-[-1px]", children: /* @__PURE__ */ jsxs(Link, { to: "/login", children: [
              "Começar 7 dias grátis ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ] }) }),
            /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "h-12 px-7 text-base border-ink/15 bg-ink/5 text-ink hover:bg-ink/10 hover:text-ink backdrop-blur", children: /* @__PURE__ */ jsx("a", { href: "#funcionalidades", children: "Ver como funciona" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-xs text-ink/55", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gold" }),
              " Sem cartão de crédito"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gold" }),
              " Cancele quando quiser"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gold" }),
              " Suporte humano"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute -inset-8 bg-gradient-to-br from-gold/20 via-transparent to-[oklch(0.85_0.08_85)]/30 rounded-[2rem] blur-3xl", "aria-hidden": true }),
          /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl border border-ink/10 bg-ink/[0.03] backdrop-blur-xl p-3 shadow-[0_30px_80px_-20px_oklch(0_0_0/0.6)]", children: [
            /* @__PURE__ */ jsx("img", { src: appMockup, alt: "Painel suaigreja com agenda, eventos e comunidade", width: 1600, height: 1200, className: "rounded-xl w-full" }),
            /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex absolute -left-6 top-1/3 items-center gap-3 rounded-2xl border border-ink/10 bg-white/80 backdrop-blur-xl px-4 py-3 shadow-2xl", children: [
              /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-gold/15 flex items-center justify-center", children: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4 text-gold" }) }),
              /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-ink/55", children: "Missa de domingo" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-ink font-medium", children: "+ 248 inscritos" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex absolute -right-4 bottom-8 items-center gap-3 rounded-2xl border border-ink/10 bg-white/80 backdrop-blur-xl px-4 py-3 shadow-2xl", children: [
              /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-gold/15 flex items-center justify-center", children: /* @__PURE__ */ jsx(HandHeart, { className: "h-4 w-4 text-gold" }) }),
              /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-ink/55", children: "Pedidos hoje" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-ink font-medium", children: "37 orações recebidas" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-y border-ink/8 bg-ink/[0.02]", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-[0.2em] text-ink/45", children: [
        /* @__PURE__ */ jsx("span", { children: "+ de 1.200 comunidades" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "•" }),
        /* @__PURE__ */ jsx("span", { children: "Católica · Evangélica · Adventista" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "•" }),
        /* @__PURE__ */ jsx("span", { children: "100% em português" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "•" }),
        /* @__PURE__ */ jsx("span", { children: "Dados seguros no Brasil" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "border-b border-ink/8 bg-ink/[0.015] overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "flex gap-12 py-5 whitespace-nowrap animate-[marquee_40s_linear_infinite] text-sm font-light text-ink/50", children: Array.from({
        length: 2
      }).map((_, dup) => /* @__PURE__ */ jsx("div", { className: "flex gap-12 shrink-0", children: ["Agenda inteligente", "Site próprio", "Pedidos de oração", "Visitantes com QR Code", "Inscrições com Pix", "Transmissões ao vivo", "WhatsApp integrado", "Notícias e galeria", "Doações e campanhas", "Multi-congregação", "Notificações automáticas", "LGPD e backup diário"].map((m) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-gold" }),
        m
      ] }, m)) }, dup)) }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-5xl px-6 py-28 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-6", children: "o problema" }),
      /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]", children: [
        "Sua igreja ainda organiza tudo ",
        /* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
        /* @__PURE__ */ jsx("span", { className: "italic text-ink/55", children: "em grupos de WhatsApp?" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-ink/60 max-w-2xl mx-auto font-light leading-relaxed", children: "Avisos perdidos, eventos esquecidos, pedidos de oração espalhados em mensagens, visitantes que vêm uma vez e não voltam. A sua missão é grande demais para depender de planilhas, papel e mensagens soltas." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "funcionalidades", className: "mx-auto max-w-7xl px-6 py-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-16", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "a solução" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]", children: [
          "Tudo o que sua comunidade ",
          /* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
          "precisa, ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "com simplicidade" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-ink/60 font-light text-lg", children: "Uma plataforma única para organizar a vida da igreja e aproximar o fiel." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [{
        icon: Calendar,
        title: "Agenda inteligente",
        desc: "Calendário mensal com missas, cultos e celebrações. Editou, todo mundo vê."
      }, {
        icon: Globe,
        title: "Site próprio (Hub)",
        desc: "Endereço público suaigreja.top/sua-igreja com tudo agregado automaticamente."
      }, {
        icon: HandHeart,
        title: "Pedidos de oração",
        desc: "Receba pedidos, modere e ore pela sua comunidade. Tudo organizado."
      }, {
        icon: QrCode,
        title: "Visitantes por QR Code",
        desc: "Crie laços com quem chega pela primeira vez e acompanhe o crescimento."
      }, {
        icon: CreditCard,
        title: "Inscrições com Pix",
        desc: "Eventos pagos? Receba inscrições e pagamentos sem complicação."
      }, {
        icon: Radio,
        title: "Transmissões ao vivo",
        desc: "Integre YouTube e Facebook Live diretamente no site da sua igreja."
      }, {
        icon: MessageCircle,
        title: "WhatsApp integrado",
        desc: "Lembretes e compartilhamento em um clique. Conecte com o canal da sua gente."
      }, {
        icon: Bell,
        title: "Notificações automáticas",
        desc: "Avise da próxima celebração sem precisar copiar e colar."
      }, {
        icon: ShieldCheck,
        title: "Seguro e privado",
        desc: "Backup automático, infraestrutura na nuvem, dados sempre seus."
      }].map((f, i) => /* @__PURE__ */ jsxs("div", { className: "group relative rounded-2xl border border-ink/10 bg-ink/[0.02] p-7 hover:bg-ink/[0.04] hover:border-gold/20 transition-all duration-300", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mb-5", children: /* @__PURE__ */ jsx(f.icon, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-ink font-medium text-base", children: f.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink/60 leading-relaxed font-light", children: f.desc })
        ] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "beneficios", className: "relative py-28 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10", children: [
        /* @__PURE__ */ jsx("img", { src: community, alt: "", width: 1600, height: 1e3, loading: "lazy", className: "h-full w-full object-cover opacity-25" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[oklch(0.98_0.012_85)] via-[oklch(0.98_0.012_85)]/80 to-transparent" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "por que importa" }),
          /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]", children: [
            "Não é sobre tecnologia. ",
            /* @__PURE__ */ jsx("br", {}),
            "É sobre ",
            /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "presença" }),
            "."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-6 text-ink/65 text-lg font-light leading-relaxed", children: "Cada minuto que sua equipe gasta organizando é um minuto a menos servindo. A gente cuida da estrutura para que vocês cuidem das pessoas." }),
          /* @__PURE__ */ jsx("ul", { className: "mt-8 space-y-4", children: ["Mais presença nas celebrações", "Mais participação da comunidade", "Menos trabalho manual da equipe", "Mais vínculo com novos fiéis", "Mais tempo para o que importa"].map((b) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-ink/80", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-gold" }) }),
            /* @__PURE__ */ jsx("span", { className: "font-light text-lg", children: b })
          ] }, b)) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden lg:block" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-7xl px-6 py-28", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "simples assim" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink", children: [
          "Em 3 passos, no ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "ar" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx("ol", { className: "grid md:grid-cols-3 gap-5", children: [{
        n: "01",
        t: "Crie sua conta",
        d: "Em 1 minuto seu painel está pronto, já com os tipos de celebração da sua tradição."
      }, {
        n: "02",
        t: "Monte a agenda",
        d: "Cadastre locais, eventos e o pedacinho da identidade da sua comunidade."
      }, {
        n: "03",
        t: "Compartilhe com todos",
        d: "Use o site pronto ou cole o código no seu existente. A comunidade encontra tudo."
      }].map((s) => /* @__PURE__ */ jsxs("li", { className: "relative rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 hover:border-gold/20 transition", children: [
        /* @__PURE__ */ jsx("div", { className: "font-display text-5xl font-light text-gold/40", children: s.n }),
        /* @__PURE__ */ jsx("h3", { className: "mt-6 text-xl text-ink font-medium", children: s.t }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink/60 font-light leading-relaxed", children: s.d })
      ] }, s.n)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "relative py-24 border-y border-ink/8 bg-gradient-to-b from-ink/[0.02] to-transparent", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto mb-14", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "prova visual" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink leading-[1.1]", children: [
          "Decida com ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "dados" }),
          ", não com achismo."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-ink/60 font-light text-lg", children: "Indicadores claros, em tempo real, para acompanhar a vida da sua comunidade." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [{
        icon: Users,
        v: "1.247",
        l: "Membros ativos",
        d: "Famílias e ministérios organizados."
      }, {
        icon: HandHeart,
        v: "+ 320",
        l: "Orações respondidas no mês",
        d: "Pedidos acompanhados pela liderança."
      }, {
        icon: TrendingUp,
        v: "R$ 48,2K",
        l: "Entradas do mês",
        d: "Dízimos, ofertas e campanhas."
      }, {
        icon: Calendar,
        v: "32",
        l: "Eventos ativos",
        d: "Cultos, conferências e encontros."
      }, {
        icon: QrCode,
        v: "164",
        l: "Visitantes no mês",
        d: "Acolhidos via QR Code na entrada."
      }, {
        icon: Radio,
        v: "12",
        l: "Transmissões ao vivo",
        d: "Cultos e celebrações online."
      }].map((k) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-ink/10 bg-white/60 backdrop-blur p-6 hover:border-gold/30 transition", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(k.icon, { className: "h-4 w-4 text-gold" }) }),
          /* @__PURE__ */ jsx("div", { className: "font-display text-3xl text-ink font-light tracking-tight", children: k.v })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-ink text-sm font-medium", children: k.l }),
        /* @__PURE__ */ jsx("div", { className: "text-ink/55 text-xs mt-1 font-light", children: k.d })
      ] }, k.l)) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { id: "depoimentos", className: "mx-auto max-w-7xl px-6 py-28", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "comunidade" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink", children: [
          "Líderes que já ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "transformaram" }),
          " suas comunidades."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-5", children: [{
        q: "Em duas semanas tínhamos toda a paróquia conectada. A agenda no site mudou completamente a participação nas missas de semana.",
        n: "Pe. Marcos Almeida",
        r: "Paróquia São José — Belo Horizonte / MG"
      }, {
        q: "Os pedidos de oração nos aproximaram dos fiéis. Hoje conheço pelo nome quem antes era um visitante esporádico.",
        n: "Pra. Daniela Souza",
        r: "Comunidade Cristã Vida — Campos dos Goytacazes / RJ"
      }, {
        q: "Tudo numa única plataforma, com cara profissional. Era exatamente o que faltava para a nossa igreja crescer com organização.",
        n: "Diác. Roberto Lima",
        r: "Igreja Batista Central — Salvador / BA"
      }].map((t) => /* @__PURE__ */ jsxs("figure", { className: "relative rounded-2xl border border-ink/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8", children: [
        /* @__PURE__ */ jsx(Quote, { className: "h-7 w-7 text-gold/40" }),
        /* @__PURE__ */ jsxs("blockquote", { className: "mt-4 text-ink/80 font-light leading-relaxed text-[1.02rem]", children: [
          '"',
          t.q,
          '"'
        ] }),
        /* @__PURE__ */ jsxs("figcaption", { className: "mt-7 pt-5 border-t border-ink/10", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 text-gold mb-2", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 fill-current" }, i)) }),
          /* @__PURE__ */ jsx("div", { className: "text-ink text-sm font-medium", children: t.n }),
          /* @__PURE__ */ jsx("div", { className: "text-ink/55 text-xs mt-0.5", children: t.r })
        ] })
      ] }, t.n)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "planos", className: "mx-auto max-w-7xl px-6 py-28", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "planos" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink", children: [
          "Escolha como sua igreja ",
          /* @__PURE__ */ jsx("br", {}),
          "quer estar ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "presente" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-ink/60 font-light text-lg", children: "7 dias grátis. Sem cartão. Sem compromisso." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-5 max-w-6xl mx-auto", children: MARKETING_TIERS.map((tier) => {
        const isHi = !!tier.highlight;
        return /* @__PURE__ */ jsxs("div", { className: isHi ? "relative rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/[0.08] to-ink/[0.02] p-8 shadow-[0_30px_80px_-20px_oklch(0.82_0.13_82_/_0.25)] flex flex-col" : "relative rounded-3xl border border-ink/10 bg-ink/[0.02] p-8 flex flex-col", children: [
          isHi && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] bg-gold text-ink px-3 py-1 rounded-full font-medium", children: "Mais escolhido" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.2em] text-ink/55", children: tier.name }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 font-display text-2xl text-ink font-normal", children: tier.tagline }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-display text-5xl font-light text-ink", children: tier.priceLabel.split("/")[0] }),
            /* @__PURE__ */ jsxs("span", { className: "text-ink/55 text-sm", children: [
              "/",
              tier.priceLabel.split("/")[1]
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-px bg-ink/8 my-6" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-sm flex-1", children: tier.features.map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2.5 text-ink/75 font-light", children: [
            /* @__PURE__ */ jsx(Check, { className: `h-4 w-4 shrink-0 mt-0.5 ${isHi ? "text-gold" : "text-ink/45"}` }),
            f
          ] }, f)) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, className: isHi ? "mt-7 h-11 bg-gold text-ink hover:bg-gold-soft shadow-[0_8px_30px_-8px_oklch(0.82_0.13_82_/_0.5)]" : "mt-7 h-11 bg-ink/10 text-ink hover:bg-ink/15 border border-ink/10", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Começar 7 dias grátis" }) })
        ] }, tier.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-4xl px-6 py-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-14", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: "dúvidas frequentes" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-5xl font-light tracking-tight text-ink", children: [
          "Tudo o que você precisa ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "saber" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [{
        q: "Funciona para igrejas católicas e evangélicas?",
        a: "Sim. No primeiro acesso você escolhe a tradição (Católica, Evangélica, Adventista, Batista, Pentecostal ou Comunidade) e o painel é configurado com os tipos de celebração da sua identidade."
      }, {
        q: "Preciso saber programar para usar?",
        a: "Não. Tudo é feito por menus simples. Em poucos minutos sua agenda e seu site público estão no ar — sem instalar nada, sem código."
      }, {
        q: "Posso cancelar quando quiser?",
        a: "Pode. Sem multa, sem fidelidade. Você usa enquanto fizer sentido para a sua comunidade."
      }, {
        q: "Como funciona o site da minha igreja?",
        a: "Você ganha um endereço público (ex: suaigreja.top/sua-paroquia) que reúne agenda, eventos, pedidos de oração, visitantes, redes sociais e Pix — pronto para compartilhar."
      }, {
        q: "Recebo doações por Pix?",
        a: "Sim. Basta cadastrar sua chave Pix nas configurações e ela aparece no site com botão de copiar."
      }, {
        q: "Meus dados ficam seguros?",
        a: "Sim. Toda a estrutura é hospedada em servidores brasileiros, com backup automático e em conformidade com a LGPD."
      }].map((item, i) => /* @__PURE__ */ jsxs("details", { className: "group rounded-2xl border border-ink/10 bg-ink/[0.02] p-6 hover:border-gold/30 transition open:border-gold/30 open:bg-ink/[0.04]", children: [
        /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between cursor-pointer list-none font-medium text-ink text-base", children: [
          /* @__PURE__ */ jsx("span", { children: item.q }),
          /* @__PURE__ */ jsx("span", { className: "ml-4 h-7 w-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-lg leading-none transition group-open:rotate-45", children: "+" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink/65 font-light leading-relaxed", children: item.a })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-6xl px-6 pb-28", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 rounded-[2rem] border border-ink/10 bg-ink/[0.02] p-10 sm:p-14 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 mb-5", children: [
            /* @__PURE__ */ jsx(Smartphone, { className: "h-3.5 w-3.5" }),
            " aplicativo"
          ] }),
          /* @__PURE__ */ jsxs("h3", { className: "font-display text-3xl sm:text-4xl font-light tracking-tight text-ink leading-[1.1]", children: [
            "Instale no celular e acesse ",
            /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "com um toque" }),
            "."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 text-ink/65 font-light leading-relaxed", children: 'A plataforma funciona como aplicativo: abra no navegador do celular, toque em "Adicionar à tela inicial" e pronto — acesso direto, sem loja, sem download pesado, sempre atualizado.' }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/55", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gold" }),
              " iPhone e Android"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gold" }),
              " Sempre atualizado"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-gold" }),
              " Funciona offline básico"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative h-56 sm:h-72", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/20 via-transparent to-gold/10 blur-2xl" }),
          /* @__PURE__ */ jsx("div", { className: "relative h-full flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "rounded-[2rem] border border-ink/10 bg-white shadow-2xl p-3 w-44 sm:w-52", children: /* @__PURE__ */ jsx("img", { src: "/icon-512.png", alt: "Ícone do app suaigreja", width: 512, height: 512, loading: "lazy", className: "rounded-2xl w-full" }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-br from-[oklch(0.96_0.02_85)] via-[oklch(0.94_0.025_82)] to-[oklch(0.92_0.03_80)] p-12 sm:p-20 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10", children: /* @__PURE__ */ jsx("div", { className: "absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gold/15 blur-[120px]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1.5 text-xs text-gold-soft mb-7", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
          " Comece hoje"
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl sm:text-6xl font-light tracking-tight text-ink leading-[1.05]", children: [
          "Sua comunidade no ar ",
          /* @__PURE__ */ jsx("br", {}),
          "em ",
          /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "menos de 5 minutos" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-ink/65 max-w-xl mx-auto font-light text-lg", children: "Tecnologia com propósito. Beleza com fé. A plataforma que sua igreja merece." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-9 flex flex-wrap items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", style: {
            backgroundColor: "#C4A747",
            color: "#2D2D2D"
          }, className: "h-12 px-8 text-base hover:bg-gold-soft shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82_/_0.6)]", children: /* @__PURE__ */ jsxs(Link, { to: "/login", children: [
            "Criar minha conta grátis ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "h-12 px-8 text-base border-ink/15 bg-ink/5 text-ink hover:bg-ink/10 hover:text-ink", children: /* @__PURE__ */ jsx("a", { href: "#planos", children: "Ver planos" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "border-t border-ink/8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-6 py-14 text-center", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5 text-gold/70 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "font-display text-xl sm:text-2xl text-ink/75 font-light italic leading-relaxed", children: '"Tudo o que fizerdes, fazei-o de todo o coração, como para o Senhor."' }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs uppercase tracking-[0.25em] text-ink/45", children: "Colossenses 3:23" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink/45", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-md bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-ink", strokeWidth: 2.5 }) }),
          /* @__PURE__ */ jsx("span", { className: "font-display text-ink/70", children: "suaigreja" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "© ",
            (/* @__PURE__ */ new Date()).getFullYear()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "hover:text-ink transition", children: "Entrar" }),
          /* @__PURE__ */ jsx("a", { href: "#planos", className: "hover:text-ink transition", children: "Planos" }),
          /* @__PURE__ */ jsx("a", { href: "#funcionalidades", className: "hover:text-ink transition", children: "Recursos" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(WhatsAppFab, {}),
    showExitOffer && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center px-4 bg-ink/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-md w-full rounded-3xl border border-gold/30 bg-[oklch(0.98_0.012_85)] p-8 sm:p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)]", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => {
        setShowExitOffer(false);
        setExitDismissed(true);
      }, className: "absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink/55 hover:text-ink hover:bg-ink/5 transition", "aria-label": "Fechar", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold-soft mb-5", children: [
        /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
        " espere um momento"
      ] }),
      /* @__PURE__ */ jsxs("h3", { className: "font-display text-2xl sm:text-3xl font-light text-ink leading-tight", children: [
        "Antes de sair, ",
        /* @__PURE__ */ jsx("span", { className: "italic text-gold", children: "experimente 7 dias grátis" }),
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink/65 font-light text-sm leading-relaxed", children: "Sem cartão, sem compromisso. Veja em minutos como sua igreja pode ficar mais organizada, presente e conectada." }),
      /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", className: "mt-7 w-full h-12 bg-gold text-ink hover:bg-gold-soft shadow-[0_10px_40px_-10px_oklch(0.82_0.13_82_/_0.6)]", onClick: () => {
        setShowExitOffer(false);
        setExitDismissed(true);
      }, children: /* @__PURE__ */ jsxs(Link, { to: "/login", children: [
        "Quero meus 7 dias grátis ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
      ] }) }),
      /* @__PURE__ */ jsx("button", { onClick: () => {
        setShowExitOffer(false);
        setExitDismissed(true);
      }, className: "mt-4 text-xs text-ink/45 hover:text-ink/70 transition", children: "Não, obrigado" })
    ] }) })
  ] });
}
export {
  Index as component
};
