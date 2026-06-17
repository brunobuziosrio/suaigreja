import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQueryClient } from "@tanstack/react-query";
import { c as completeOnboarding } from "./account.functions-DK5H0Kdx.js";
import { R as RELIGION_PROFILES } from "./religion-profiles-CyOvWaWi.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
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
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function OnboardingPage() {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(completeOnboarding);
  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await submit({
        data: {
          religion_profile: selected
        }
      });
      await queryClient.invalidateQueries({
        queryKey: ["account"]
      });
      toast.success("Tudo pronto! Vamos comecar.");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-muted/30 py-12 px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "Bem-vindo!" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Escolha o perfil que mais combina com a sua comunidade. Isso ajuda a configurar tudo automaticamente." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: RELIGION_PROFILES.map((p) => /* @__PURE__ */ jsxs(Card, { onClick: () => setSelected(p.id), className: cn("p-5 cursor-pointer transition-all hover:border-primary", selected === p.id && "border-primary ring-2 ring-primary/20"), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: p.label }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: p.description })
        ] }),
        selected === p.id && /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-primary shrink-0" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
        "Tipos padrao: ",
        p.defaultTypes.slice(0, 3).join(", "),
        "..."
      ] })
    ] }, p.id)) }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-end", children: /* @__PURE__ */ jsxs(Button, { onClick: handleConfirm, disabled: !selected || submitting, size: "lg", children: [
      submitting && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
      "Continuar"
    ] }) })
  ] }) });
}
export {
  OnboardingPage as component
};
