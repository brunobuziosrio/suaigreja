import { jsx, jsxs } from "react/jsx-runtime";
import { g as getIsAdmin, A as AppShell, h as useBranding } from "./app-shell-CIsAgqhg.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { ShieldCheck, WalletCards } from "lucide-react";
import { c as createSsrRpc, g as getPlatformPaymentSettings, u as updatePlatformPaymentSettings } from "./admin-payment-settings.functions-Buvk9CeQ.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
import { z } from "zod";
import { s as supabase } from "./client-DVtn2Z4s.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./router-BudgN2VI.js";
import "./client.server-D5ro3rAQ.js";
import "@supabase/supabase-js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const brandingSchema = z.object({
  brand_text: z.string().min(1).max(60),
  subtitle: z.string().max(40).default(""),
  icon_text: z.string().min(1).max(3),
  icon_url: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  logo_height_px: z.number().int().min(16).max(96)
});
const adminUpdateBranding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => brandingSchema.parse(i)).handler(createSsrRpc("80a20e7e47c16b99b16baeaea94307b0f4e0551d5dec78930ca3d0e4ce2f2bdb"));
function AdminPaymentsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const {
    data: adminCheck,
    isLoading: checking
  } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin()
  });
  const isAdmin = !!adminCheck?.isAdmin;
  if (checking) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "w-full text-sm text-muted-foreground", children: "Verificando permissões…" }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Área restrita" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(WalletCards, { className: "h-6 w-6" }),
        " Pagamentos da plataforma"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Identidade visual exibida pra todos os clientes e gateways de pagamento da assinatura SaaS. Visível só pra administradores da plataforma." })
    ] }),
    /* @__PURE__ */ jsx(PlatformBrandingSection, {})
  ] }) });
}
function PlatformBrandingSection() {
  const updateBranding = useServerFn(adminUpdateBranding);
  const fetchPaymentSettings = useServerFn(getPlatformPaymentSettings);
  const savePaymentSettings = useServerFn(updatePlatformPaymentSettings);
  const {
    data: branding
  } = useBranding();
  const qc = useQueryClient();
  const iconInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [uploading, setUploading] = useState(null);
  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const {
    data: paymentSettings
  } = useQuery({
    queryKey: ["platform-payment-settings"],
    queryFn: () => fetchPaymentSettings()
  });
  const [paymentForm, setPaymentForm] = useState({
    ativopayApiKey: "",
    ativopayWebhookSecret: "",
    mercadopagoAccessToken: ""
  });
  useEffect(() => {
    if (paymentSettings) {
      setPaymentForm({
        ativopayApiKey: paymentSettings.ativopayApiKey,
        ativopayWebhookSecret: paymentSettings.ativopayWebhookSecret,
        mercadopagoAccessToken: paymentSettings.mercadopagoAccessToken
      });
    }
  }, [paymentSettings]);
  const savePaymentMut = useMutation({
    mutationFn: () => savePaymentSettings({
      data: paymentForm
    }),
    onSuccess: () => {
      toast.success("Configurações de pagamento atualizadas");
      qc.invalidateQueries({
        queryKey: ["platform-payment-settings"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const [form, setForm] = useState({
    brand_text: "",
    subtitle: "",
    icon_text: "",
    icon_url: "",
    logo_url: "",
    logo_height_px: 32
  });
  useEffect(() => {
    if (branding) {
      setForm({
        brand_text: branding.brand_text,
        subtitle: branding.subtitle,
        icon_text: branding.icon_text,
        icon_url: branding.icon_url ?? "",
        logo_url: branding.logo_url ?? "",
        logo_height_px: branding.logo_height_px
      });
    }
  }, [branding]);
  const saveMut = useMutation({
    mutationFn: () => updateBranding({
      data: {
        brand_text: form.brand_text,
        subtitle: form.subtitle,
        icon_text: form.icon_text,
        icon_url: form.icon_url || null,
        logo_url: form.logo_url || null,
        logo_height_px: Number(form.logo_height_px) || 32
      }
    }),
    onSuccess: () => {
      toast.success("Identidade visual atualizada");
      qc.invalidateQueries({
        queryKey: ["platform-branding"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  async function uploadFile(file, kind) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB.");
      return;
    }
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `branding/${kind}-${crypto.randomUUID()}.${ext}`;
      const {
        error
      } = await supabase.storage.from("product-images").upload(path, file, {
        upsert: false,
        contentType: file.type
      });
      if (error) throw error;
      const {
        data: pub
      } = supabase.storage.from("product-images").getPublicUrl(path);
      const dims = await new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          resolve({
            w: img.naturalWidth,
            h: img.naturalHeight
          });
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
      const finalUrl = dims ? `${pub.publicUrl}?dim=${dims.w}x${dims.h}` : pub.publicUrl;
      if (kind === "icon") setForm((f) => ({
        ...f,
        icon_url: finalUrl
      }));
      else setForm((f) => ({
        ...f,
        logo_url: finalUrl
      }));
      toast.success(dims ? `Enviada (${dims.w}×${dims.h}px)` : "Enviada");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(null);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Identidade da plataforma" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        "Logo, ícone e textos exibidos no menu lateral para ",
        /* @__PURE__ */ jsx("strong", { children: "todos os clientes" }),
        ". A imagem tem prioridade; o texto/letra só aparece quando não houver imagem enviada."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-md border p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Logo expandida" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Aparece no menu lateral quando aberto. Envie uma imagem (PNG transparente, ~200×64) — se não houver, mostramos o texto abaixo." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Input, { value: form.logo_url, onChange: (e) => setForm({
          ...form,
          logo_url: e.target.value
        }), placeholder: "https://… ou envie um arquivo" }),
        /* @__PURE__ */ jsx("input", { ref: logoInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) uploadFile(f, "logo");
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => logoInputRef.current?.click(), disabled: uploading === "logo", children: uploading === "logo" ? "Enviando…" : "Enviar imagem" }),
        form.logo_url && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setForm({
          ...form,
          logo_url: ""
        }), children: "Remover" })
      ] }),
      form.logo_url && !logoError && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-md border bg-muted/40 p-3 inline-block", children: /* @__PURE__ */ jsx("img", { src: form.logo_url, alt: "Logo", style: {
          height: form.logo_height_px
        }, className: "w-auto object-contain", onError: () => setLogoError(true) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Altura (px)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", min: 16, max: 96, value: form.logo_height_px, onChange: (e) => setForm({
            ...form,
            logo_height_px: Number(e.target.value) || 32
          }), className: "w-24" })
        ] })
      ] }),
      logoError && form.logo_url && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Erro ao carregar a logo. Verifique o link." }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3 border-t pt-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Texto da marca (fallback)" }),
          /* @__PURE__ */ jsx(Input, { value: form.brand_text, onChange: (e) => setForm({
            ...form,
            brand_text: e.target.value
          }), placeholder: "suaigreja" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Subtítulo" }),
          /* @__PURE__ */ jsx(Input, { value: form.subtitle, onChange: (e) => setForm({
            ...form,
            subtitle: e.target.value
          }), placeholder: "painel" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-md border p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Ícone compacto" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Aparece no menu lateral quando recolhido e na aba do navegador. Envie uma imagem (64×64)." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Input, { value: form.icon_url, onChange: (e) => setForm({
          ...form,
          icon_url: e.target.value
        }), placeholder: "https://… ou envie um arquivo" }),
        /* @__PURE__ */ jsx("input", { ref: iconInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) uploadFile(f, "icon");
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => iconInputRef.current?.click(), disabled: uploading === "icon", children: uploading === "icon" ? "Enviando…" : "Enviar imagem" }),
        form.icon_url && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setForm({
          ...form,
          icon_url: ""
        }), children: "Remover" })
      ] }),
      form.icon_url && !iconError && /* @__PURE__ */ jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsx("img", { src: form.icon_url, alt: "", className: "h-12 w-12 rounded-md border object-cover", onError: () => setIconError(true) }) }),
      iconError && form.icon_url && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Erro ao carregar o ícone. Verifique o link." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end border-t pt-4", children: /* @__PURE__ */ jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending, children: saveMut.isPending ? "Salvando…" : "Salvar identidade" }) }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-md border p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Gateways de pagamento (assinatura)" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "AtivoPay recebe o pagamento das assinaturas das igrejas. O campo de Mercado Pago da plataforma fica reservado para uma futura migração — ainda não está em uso na cobrança." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "AtivoPay — API Key" }),
          /* @__PURE__ */ jsx(Input, { type: "password", value: paymentForm.ativopayApiKey, onChange: (e) => setPaymentForm({
            ...paymentForm,
            ativopayApiKey: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "AtivoPay — Webhook Secret" }),
          /* @__PURE__ */ jsx(Input, { type: "password", value: paymentForm.ativopayWebhookSecret, onChange: (e) => setPaymentForm({
            ...paymentForm,
            ativopayWebhookSecret: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Mercado Pago da plataforma — Access Token (reservado)" }),
          /* @__PURE__ */ jsx(Input, { type: "password", value: paymentForm.mercadopagoAccessToken, onChange: (e) => setPaymentForm({
            ...paymentForm,
            mercadopagoAccessToken: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end border-t pt-3", children: /* @__PURE__ */ jsx(Button, { onClick: () => savePaymentMut.mutate(), disabled: savePaymentMut.isPending, children: savePaymentMut.isPending ? "Salvando…" : "Salvar gateways" }) })
    ] })
  ] });
}
export {
  AdminPaymentsPage as component
};
