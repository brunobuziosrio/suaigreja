import { jsx, jsxs } from "react/jsx-runtime";
import { useParams } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { g as getPublicCheckinSession, p as publicCheckin } from "./checkin.functions-D0d-xXvw.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function PublicCheckin() {
  const {
    sessionId
  } = useParams({
    from: "/checkin/$sessionId"
  });
  const get = useServerFn(getPublicCheckinSession);
  const submit = useServerFn(publicCheckin);
  const {
    data
  } = useQuery({
    queryKey: ["pub-checkin", sessionId],
    queryFn: () => get({
      data: {
        id: sessionId
      }
    })
  });
  const [done, setDone] = useState(false);
  const mut = useMutation({
    mutationFn: (p) => submit({
      data: p
    }),
    onSuccess: () => {
      setDone(true);
      toast.success("Check-in registrado!");
    },
    onError: (e) => toast.error(e.message)
  });
  if (!data) return /* @__PURE__ */ jsx("div", { className: "p-6 text-center", children: "Carregando…" });
  if (!data.session?.active) return /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-muted-foreground", children: "Sessão encerrada." });
  const accent = data.account?.primary_color || "#467da5";
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-muted/30", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-6 space-y-4", children: [
    data.account?.brand_logo_url && /* @__PURE__ */ jsx("img", { src: data.account.brand_logo_url, alt: "", className: "h-12 mx-auto" }),
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: data.account?.brand_title }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: data.session.title })
    ] }),
    done ? /* @__PURE__ */ jsxs("div", { className: "text-center py-6 space-y-2", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-16 w-16 mx-auto", style: {
        color: accent
      } }),
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Check-in confirmado!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Seja bem-vindo(a) 🙏" })
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      mut.mutate({
        session_id: sessionId,
        visitor_name: f.get("name"),
        visitor_phone: f.get("phone") || null
      });
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Seu nome*" }),
        /* @__PURE__ */ jsx(Input, { name: "name", required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "WhatsApp (opcional)" }),
        /* @__PURE__ */ jsx(Input, { name: "phone", type: "tel" })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", style: {
        backgroundColor: accent
      }, disabled: mut.isPending, children: "Confirmar presença" })
    ] })
  ] }) });
}
export {
  PublicCheckin as component
};
