import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { b as Route, g as getPublicPrayers, c as submitPrayerRequest, p as prayForRequest } from "./router-BudgN2VI.js";
import { B as BackToSite, H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { HandHeart, Heart } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
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
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
function getFingerprint() {
  let fp = localStorage.getItem("prayer-fp");
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("prayer-fp", fp);
  }
  return fp;
}
function PublicPrayers() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  const submit = useServerFn(submitPrayerRequest);
  const pray = useServerFn(prayForRequest);
  const qc = useQueryClient();
  const {
    data: live
  } = useQuery({
    queryKey: ["public-prayers", params.siteId],
    queryFn: () => getPublicPrayers({
      data: {
        siteId: params.siteId
      }
    }),
    initialData: {
      account: data.account,
      accountId: data.accountId,
      prayers: data.prayers
    }
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    is_anonymous: false
  });
  const [sent, setSent] = useState(false);
  const sendMut = useMutation({
    mutationFn: () => submit({
      data: {
        siteId: params.siteId,
        ...form
      }
    }),
    onSuccess: () => {
      setSent(true);
      toast.success("Pedido enviado! Será publicado após aprovação.");
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        is_anonymous: false
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const prayMut = useMutation({
    mutationFn: (id) => pray({
      data: {
        prayerId: id,
        fingerprint: getFingerprint()
      }
    }),
    onSuccess: (r) => {
      if (r.alreadyPrayed) toast.info("Você já orou por este pedido 🙏");
      else toast.success("Que Deus abençoe 🙏");
      qc.invalidateQueries({
        queryKey: ["public-prayers", params.siteId]
      });
    }
  });
  const color = live.account.primary_color || "#467da5";
  const prayers = live.prayers;
  const body = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "w-full py-12", style: {
      background: `linear-gradient(135deg, ${color}, ${color}cc)`
    }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 text-white", children: [
      /* @__PURE__ */ jsx(BackToSite, { slug: params.siteId, className: "mb-4" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(HandHeart, { className: "h-10 w-10 mx-auto mb-2 opacity-90" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold", children: "Pedidos de Oração" }),
        /* @__PURE__ */ jsx("p", { className: "opacity-90 mt-1", children: live.account.brand_title })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8 space-y-8", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Compartilhe seu pedido" }),
        sent ? /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Obrigado! Seu pedido foi recebido e será publicado após revisão." }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4", onClick: () => setSent(false), children: "Enviar outro" })
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          sendMut.mutate();
        }, className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Seu nome" }),
            /* @__PURE__ */ jsx(Input, { id: "name", required: true, value: form.name, onChange: (e) => setForm({
              ...form,
              name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "E-mail (opcional)" }),
              /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: form.email, onChange: (e) => setForm({
                ...form,
                email: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "WhatsApp (opcional)" }),
              /* @__PURE__ */ jsx(Input, { id: "phone", value: form.phone, onChange: (e) => setForm({
                ...form,
                phone: e.target.value
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "msg", children: "Seu pedido" }),
            /* @__PURE__ */ jsx(Textarea, { id: "msg", required: true, rows: 4, value: form.message, onChange: (e) => setForm({
              ...form,
              message: e.target.value
            }), placeholder: "Pelo que devemos orar?" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Switch, { id: "anon", checked: form.is_anonymous, onCheckedChange: (v) => setForm({
              ...form,
              is_anonymous: v
            }) }),
            /* @__PURE__ */ jsx(Label, { htmlFor: "anon", className: "!m-0 cursor-pointer", children: "Enviar de forma anônima" })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full text-white", style: {
            backgroundColor: color
          }, disabled: sendMut.isPending, children: sendMut.isPending ? "Enviando..." : "Enviar pedido" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-3", children: "Mural de orações" }),
        prayers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Seja o primeiro a compartilhar um pedido." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: prayers.map((p) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: p.name }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(p.created_at).toLocaleDateString("pt-BR") })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm whitespace-pre-wrap", children: p.message })
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "shrink-0", onClick: () => prayMut.mutate(p.id), disabled: prayMut.isPending, children: [
            /* @__PURE__ */ jsx(Heart, { className: "h-3.5 w-3.5 mr-1", style: {
              color
            } }),
            "Orei · ",
            p.prayer_count
          ] })
        ] }) }, p.id)) })
      ] })
    ] })
  ] });
  if (data.chrome) return /* @__PURE__ */ jsx(HubChrome, { account: data.chrome, contained: false, children: body });
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: body });
}
export {
  PublicPrayers as component
};
