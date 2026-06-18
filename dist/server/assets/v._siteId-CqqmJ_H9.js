import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { R as Route, s as submitVisitor } from "./router-DXfKo2Q8.js";
import { B as BackToSite, H as HubChrome } from "./back-to-site-Dx7gp_s6.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { Heart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
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
import "./billing-plans-Ce8xzhRW.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-select";
const AGE_RANGES = ["Até 17", "18-25", "26-35", "36-50", "51-65", "65+"];
const HOW_FOUND = ["Convite de amigo", "Família", "Redes sociais", "Passando na rua", "YouTube/Live", "Outro"];
function VisitorPublic() {
  const {
    account,
    chrome
  } = Route.useLoaderData();
  const params = Route.useParams();
  const submit = useServerFn(submitVisitor);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    age_range: "",
    how_found: "",
    is_first_time: true,
    prayer_request: "",
    allow_contact: true
  });
  const [done, setDone] = useState(false);
  const mut = useMutation({
    mutationFn: () => submit({
      data: {
        siteId: params.siteId,
        name: form.name,
        phone: form.phone || void 0,
        email: form.email || void 0,
        age_range: form.age_range || void 0,
        how_found: form.how_found || void 0,
        is_first_time: form.is_first_time,
        prayer_request: form.prayer_request || void 0,
        allow_contact: form.allow_contact
      }
    }),
    onSuccess: () => setDone(true),
    onError: (e) => toast.error(e.message)
  });
  const color = account.primary_color || "#467da5";
  const body = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "w-full py-10", style: {
      background: `linear-gradient(135deg, ${color}, ${color}cc)`
    }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-4 text-white", children: [
      /* @__PURE__ */ jsx(BackToSite, { slug: params.siteId, className: "mb-4" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(Heart, { className: "h-10 w-10 mx-auto mb-2 opacity-90" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold", children: "Que bom ter você aqui!" }),
        /* @__PURE__ */ jsx("p", { className: "opacity-90 mt-1 text-sm", children: account.brand_title })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto px-4 py-8", children: done ? /* @__PURE__ */ jsxs(Card, { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-12 w-12 mx-auto mb-3", style: {
        color
      } }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Obrigado!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2 whitespace-pre-wrap", children: account.visitor_welcome_message || "Seja muito bem-vindo(a) à nossa igreja! Que alegria ter você aqui. 🙏" })
    ] }) : /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Conte pra gente um pouquinho sobre você (leva menos de 1 minuto)." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        mut.mutate();
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Seu nome *" }),
          /* @__PURE__ */ jsx(Input, { id: "name", required: true, value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "WhatsApp" }),
          /* @__PURE__ */ jsx(Input, { id: "phone", inputMode: "tel", placeholder: "(11) 99999-9999", value: form.phone, onChange: (e) => setForm({
            ...form,
            phone: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "E-mail (opcional)" }),
          /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: form.email, onChange: (e) => setForm({
            ...form,
            email: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Faixa etária" }),
            /* @__PURE__ */ jsxs(Select, { value: form.age_range, onValueChange: (v) => setForm({
              ...form,
              age_range: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Selecione" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: AGE_RANGES.map((a) => /* @__PURE__ */ jsx(SelectItem, { value: a, children: a }, a)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Como conheceu?" }),
            /* @__PURE__ */ jsxs(Select, { value: form.how_found, onValueChange: (v) => setForm({
              ...form,
              how_found: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Selecione" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: HOW_FOUND.map((a) => /* @__PURE__ */ jsx(SelectItem, { value: a, children: a }, a)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsx(Switch, { id: "first", checked: form.is_first_time, onCheckedChange: (v) => setForm({
            ...form,
            is_first_time: v
          }) }),
          /* @__PURE__ */ jsx(Label, { htmlFor: "first", className: "!m-0 cursor-pointer", children: "É minha primeira vez aqui" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "pr", children: "Pedido de oração (opcional)" }),
          /* @__PURE__ */ jsx(Textarea, { id: "pr", rows: 3, value: form.prayer_request, onChange: (e) => setForm({
            ...form,
            prayer_request: e.target.value
          }), placeholder: "Pelo que podemos orar por você?" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Switch, { id: "contact", checked: form.allow_contact, onCheckedChange: (v) => setForm({
            ...form,
            allow_contact: v
          }) }),
          /* @__PURE__ */ jsx(Label, { htmlFor: "contact", className: "!m-0 cursor-pointer text-sm", children: "Autorizo a equipe a entrar em contato comigo" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full text-white", style: {
          backgroundColor: color
        }, disabled: mut.isPending, children: mut.isPending ? "Enviando..." : "Enviar" })
      ] })
    ] }) })
  ] });
  if (chrome) return /* @__PURE__ */ jsx(HubChrome, { account: chrome, contained: false, children: body });
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: body });
}
export {
  VisitorPublic as component
};
