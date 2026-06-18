import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { h as Route, r as registerForEvent } from "./router-DXfKo2Q8.js";
import { B as BackToSite, H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { ArrowLeft, Calendar, Share2, Clock, MapPin, Users, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { f as formatCentsBRL } from "./billing-plans-Ce8xzhRW.js";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "./admin-payment-settings.functions-DESQQOGp.js";
import "./server-D1UATaaE.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DAGjxCX9.js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function formatDate(d) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
function EventPage() {
  const page = Route.useLoaderData();
  const register = useServerFn(registerForEvent);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [imgOpen, setImgOpen] = useState(false);
  const [result, setResult] = useState(null);
  const mutation = useMutation({
    mutationFn: () => register({
      data: {
        slug: page.slug,
        name: form.name,
        email: form.email,
        phone: form.phone || void 0,
        notes: form.notes || void 0
      }
    }),
    onSuccess: (data) => {
      setResult(data);
      if (data.status === "confirmed") toast.success("Inscrição confirmada!");
      else toast.success("Inscrição registrada!");
    },
    onError: (e) => toast.error(e.message)
  });
  const isPaid = page.price_cents > 0;
  const color = page.primary_color || "#467da5";
  const slug = page.account_slug || page.site_id || "";
  const brand = page.brand_title || "Evento";
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: page.title,
          text: page.description?.slice(0, 140) || "",
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado!");
      }
    } catch {
    }
  };
  const chrome = page.chrome;
  const body = /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-stone-50", children: [
    /* @__PURE__ */ jsx("div", { className: "relative", style: {
      background: `linear-gradient(135deg, ${color}, ${color}cc)`
    }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16", children: [
      slug && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2 mb-6", children: [
        /* @__PURE__ */ jsx(BackToSite, { slug }),
        /* @__PURE__ */ jsxs(Link, { to: "/eventos/$slug", params: {
          slug
        }, className: "inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Todos os eventos"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-white/80 text-xs uppercase tracking-[0.3em] font-semibold inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "capitalize", children: formatDate(page.event_date) })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight", style: {
        fontFamily: "var(--font-display)"
      }, children: page.title }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 flex flex-wrap items-center gap-2", children: isPaid ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/15 text-white backdrop-blur-sm", children: formatCentsBRL(page.price_cents) }) : /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/15 text-white backdrop-blur-sm", children: "Gratuito" }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-white/85 text-sm", children: [
          "Organizado por ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: brand })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: share, className: "ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium backdrop-blur-sm transition", children: [
          /* @__PURE__ */ jsx(Share2, { className: "h-4 w-4" }),
          " Compartilhar"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14", children: [
      page.cover_image_url && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setImgOpen(true), className: "block w-full mb-10 group", "aria-label": "Ampliar imagem", children: [
        /* @__PURE__ */ jsx("div", { className: "w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]", children: /* @__PURE__ */ jsx("img", { src: page.cover_image_url, alt: page.title, className: "w-full h-auto object-contain max-h-[80vh] group-hover:opacity-95 transition" }) }),
        /* @__PURE__ */ jsx("span", { className: "block text-center text-xs text-stone-500 mt-2", children: "Toque na imagem para ampliar" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-stone-800 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 mt-0.5 text-stone-500" }),
          /* @__PURE__ */ jsx("span", { className: "capitalize", children: formatDate(page.event_date) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 mt-0.5 text-stone-500" }),
          /* @__PURE__ */ jsxs("span", { children: [
            page.start_time.slice(0, 5),
            page.end_time ? ` – ${page.end_time.slice(0, 5)}` : ""
          ] })
        ] }),
        page.location_name && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 mt-0.5 text-stone-500" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { children: page.location_name }),
            page.location_address && /* @__PURE__ */ jsx("div", { className: "text-stone-500 text-xs", children: page.location_address })
          ] })
        ] }),
        page.max_attendees ? /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mt-0.5 text-stone-500" }),
          /* @__PURE__ */ jsxs("span", { children: [
            page.confirmed_count,
            " / ",
            page.max_attendees,
            " inscritos"
          ] })
        ] }) : null
      ] }),
      page.description && /* @__PURE__ */ jsx("div", { className: "text-stone-800 leading-relaxed text-[17px] sm:text-lg space-y-5 whitespace-pre-wrap mb-10", children: String(page.description).split(/\n{2,}/).map((p, i) => /* @__PURE__ */ jsx("p", { children: p }, i)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: result ? /* @__PURE__ */ jsx(Card, { className: "p-6 border-2", style: {
        borderColor: color
      }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6 mt-0.5", style: {
          color
        } }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: result.status === "confirmed" ? "Inscrição confirmada!" : "Quase lá!" }),
          result.status === "confirmed" ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Te esperamos no evento. Em breve você receberá mais detalhes por e-mail." }) : result.payment ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Pague o PIX abaixo para confirmar sua inscrição:" }),
            result.payment.qrCodeImage && /* @__PURE__ */ jsx("img", { src: result.payment.qrCodeImage, alt: "QR Code PIX", className: "mt-4 w-56 h-56 mx-auto" }),
            result.payment.copyPaste && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "PIX Copia e Cola" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
                /* @__PURE__ */ jsx(Input, { readOnly: true, value: result.payment.copyPaste, className: "font-mono text-xs" }),
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: () => {
                  navigator.clipboard.writeText(result.payment.copyPaste);
                  toast.success("Copiado!");
                }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Sua inscrição foi registrada. O organizador entrará em contato." })
        ] })
      ] }) }) : /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Faça sua inscrição" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          mutation.mutate();
        }, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Nome completo" }),
            /* @__PURE__ */ jsx(Input, { id: "name", required: true, value: form.name, onChange: (e) => setForm({
              ...form,
              name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "E-mail" }),
              /* @__PURE__ */ jsx(Input, { id: "email", type: "email", required: true, value: form.email, onChange: (e) => setForm({
                ...form,
                email: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "WhatsApp / Telefone" }),
              /* @__PURE__ */ jsx(Input, { id: "phone", value: form.phone, onChange: (e) => setForm({
                ...form,
                phone: e.target.value
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "notes", children: "Observação (opcional)" }),
            /* @__PURE__ */ jsx(Textarea, { id: "notes", rows: 2, value: form.notes, onChange: (e) => setForm({
              ...form,
              notes: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full text-white", style: {
            backgroundColor: color
          }, disabled: mutation.isPending, children: mutation.isPending ? "Enviando..." : isPaid ? `Inscrever-se · ${formatCentsBRL(page.price_cents)}` : "Confirmar inscrição" })
        ] })
      ] }) })
    ] }),
    imgOpen && page.cover_image_url && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out", onClick: () => setImgOpen(false), children: [
      /* @__PURE__ */ jsx("img", { src: page.cover_image_url, alt: page.title, className: "max-w-full max-h-full object-contain rounded-lg shadow-2xl", onClick: (e) => e.stopPropagation() }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setImgOpen(false), className: "absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl flex items-center justify-center", "aria-label": "Fechar", children: "✕" })
    ] })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: body });
  return body;
}
export {
  EventPage as component
};
