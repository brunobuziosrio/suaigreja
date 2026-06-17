import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { i as Route, j as generateDonationPix } from "./router-BAWvi9U-.js";
import { H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { Heart, HandCoins, Loader2, Check, Copy } from "lucide-react";
import { P as PublicHero } from "./public-hero-DP67X3-I.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
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
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
function fmtBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function PublicDonationsPage() {
  const {
    account,
    campaigns,
    chrome
  } = Route.useLoaderData();
  const {
    slug
  } = Route.useParams();
  const primary = account?.primary_color || "#467da5";
  const [active, setActive] = useState(null);
  const body = /* @__PURE__ */ jsxs("div", { className: "pb-16 bg-background", children: [
    /* @__PURE__ */ jsx(PublicHero, { color: primary, title: "Doações", subtitle: account?.brand_title, icon: /* @__PURE__ */ jsx(Heart, { className: "h-10 w-10" }), slug }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-3xl mx-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-semibold", children: "Sua oferta transforma vidas" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-xl mx-auto", children: "Contribua de forma rápida e segura via Pix. O valor cai direto na conta da igreja, sem taxas." })
      ] }),
      campaigns.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-10 text-center", children: [
        /* @__PURE__ */ jsx(HandCoins, { className: "h-10 w-10 mx-auto text-muted-foreground mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma campanha ativa no momento." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: campaigns.map((c) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden cursor-pointer hover:shadow-lg transition-shadow", onClick: () => setActive(c), children: [
        c.image_url && /* @__PURE__ */ jsx("img", { src: c.image_url, alt: "", className: "w-full h-40 object-cover" }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          c.featured && /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full", style: {
            background: `${primary}20`,
            color: primary
          }, children: "Destaque" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mt-1", children: c.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-3 mt-1", children: c.description }),
          c.goal_cents > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs mt-2 text-muted-foreground", children: [
            "Meta: ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: fmtBRL(c.goal_cents) })
          ] }),
          /* @__PURE__ */ jsxs(Button, { className: "w-full mt-3", style: {
            background: primary
          }, children: [
            /* @__PURE__ */ jsx(HandCoins, { className: "h-4 w-4 mr-2" }),
            " Contribuir agora"
          ] })
        ] })
      ] }, c.id)) }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-muted-foreground mt-10", children: '"Cada um dê conforme determinou em seu coração, não com tristeza ou por obrigação, pois Deus ama quem dá com alegria." — 2 Coríntios 9:7' })
    ] }),
    active && /* @__PURE__ */ jsx(PixDialog, { campaign: active, slug, primary, onClose: () => setActive(null) })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: body });
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: body });
}
function PixDialog({
  campaign,
  slug,
  primary,
  onClose
}) {
  const gen = useServerFn(generateDonationPix);
  const [amountBRL, setAmountBRL] = useState("");
  const [pix, setPix] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const mut = useMutation({
    mutationFn: async (cents) => gen({
      data: {
        slug,
        id: campaign.id,
        amountCents: cents
      }
    }),
    onSuccess: (d) => setPix(d),
    onError: (e) => toast.error(e?.message || "Erro ao gerar Pix")
  });
  function generate(presetCents) {
    let cents = presetCents;
    if (!cents && amountBRL) cents = Math.round(parseFloat(amountBRL.replace(",", ".")) * 100);
    mut.mutate(cents);
  }
  function copyPayload() {
    if (!pix) return;
    navigator.clipboard.writeText(pix.payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
      toast.success("Código Pix copiado");
    });
  }
  const suggested = campaign.suggested_amounts_cents ?? [];
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm", onClick: onClose, children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-background w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-auto", onClick: (e) => e.stopPropagation(), children: [
      campaign.image_url && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setLightbox(true), className: "block w-full group", "aria-label": "Ampliar imagem da campanha", children: /* @__PURE__ */ jsx("img", { src: campaign.image_url, alt: campaign.title, className: "w-full max-h-56 object-cover group-hover:opacity-95 transition" }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 border-b", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: campaign.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Doação via Pix",
          campaign.image_url ? " · toque na imagem para ampliar" : ""
        ] }),
        campaign.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2 whitespace-pre-line", children: campaign.description })
      ] }),
      !pix ? /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
        suggested.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium mb-2", children: "Valor sugerido" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: suggested.map((c) => /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => generate(c), disabled: mut.isPending, children: fmtBRL(c) }, c)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium mb-2", children: "Outro valor (R$)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Input, { type: "number", min: 1, step: "0.01", placeholder: "50,00", value: amountBRL, onChange: (e) => setAmountBRL(e.target.value) }),
            /* @__PURE__ */ jsx(Button, { onClick: () => generate(), disabled: mut.isPending || !amountBRL, style: {
              background: primary
            }, children: mut.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Gerar Pix" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full", onClick: () => generate(), disabled: mut.isPending, children: "Doar valor livre (você digita no banco)" })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-3 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aponte a câmera do seu banco para o QR Code abaixo" }),
        /* @__PURE__ */ jsx("img", { src: pix.qrDataUrl, alt: "QR Pix", className: "w-56 h-56 mx-auto rounded-lg border" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-muted/40 border rounded-lg p-3 text-left", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1", children: "Pix Copia e Cola" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-mono break-all", children: pix.payload })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "w-full", style: {
          background: primary
        }, onClick: copyPayload, children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 mr-2" }),
          "Copiado!"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
          "Copiar código Pix"
        ] }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full", onClick: () => {
          setPix(null);
        }, children: "Doar outro valor" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 border-t flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "Fechar" }) })
    ] }),
    lightbox && campaign.image_url && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4", onClick: (e) => {
      e.stopPropagation();
      setLightbox(false);
    }, children: [
      /* @__PURE__ */ jsx("img", { src: campaign.image_url, alt: campaign.title, className: "max-w-full max-h-full object-contain rounded-lg shadow-2xl" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
        e.stopPropagation();
        setLightbox(false);
      }, className: "absolute top-4 right-4 text-white/90 hover:text-white text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2", children: "Fechar" })
    ] })
  ] });
}
export {
  PublicDonationsPage as component
};
