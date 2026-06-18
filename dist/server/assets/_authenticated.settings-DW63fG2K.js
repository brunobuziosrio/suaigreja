import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { R as RELIGION_PROFILES } from "./religion-profiles-CyOvWaWi.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { Copy, Loader2, Check, X, RotateCcw } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { g as getMyAccount, u as updateAccountSettings, a as checkSlugAvailability, b as updateCustomSlug } from "./account.functions-Bj1OS5Ft.js";
import { l as listEvents } from "./events.functions-i3rW84a3.js";
import { l as listTypes } from "./types.functions-B2BX9DPC.js";
import { P as PublicAgendaView } from "./public-agenda-view-Cj58QWoJ.js";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { M as MemberCard } from "./member-card-EXst8LE0.js";
import { M as uploadHubAsset } from "./router-DXfKo2Q8.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
import "@supabase/supabase-js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "qrcode";
import "./billing-plans-Ce8xzhRW.js";
const getMyMercadoPagoConnection = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ea0be6f95eae3c15c134dd79ab6d09364bcb0137854f5a29830b5362471dc0c3"));
const saveSchema = z.object({
  accessToken: z.string().min(10).max(500),
  publicKey: z.string().max(500).nullable().optional()
});
const saveMercadoPagoConnection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => saveSchema.parse(input)).handler(createSsrRpc("477f098ee3444a24ea9390245fb4dc46f7f2891ee1547f7ae3387f83324856fb"));
const disconnectMercadoPago = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ec0044e223e528d03347901e50c43c6e7a054e820cbcdc7c126f309279bd463e"));
const DEFAULT_COLOR = "#467da5";
function SettingsPage() {
  const getAccount = useServerFn(getMyAccount);
  const updateSettings = useServerFn(updateAccountSettings);
  const checkSlug = useServerFn(checkSlugAvailability);
  const saveSlug = useServerFn(updateCustomSlug);
  const fetchEvents = useServerFn(listEvents);
  const fetchTypes = useServerFn(listTypes);
  useServerFn(uploadHubAsset);
  const qc = useQueryClient();
  const logoInputRef = useRef(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const {
    data: account,
    isLoading
  } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getAccount()
  });
  const {
    data: previewEvents
  } = useQuery({
    queryKey: ["settings-preview-events"],
    queryFn: () => {
      const pad = (n) => String(n).padStart(2, "0");
      const today = /* @__PURE__ */ new Date();
      const end = /* @__PURE__ */ new Date();
      end.setDate(end.getDate() + 30);
      const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return fetchEvents({
        data: {
          from: fmt(today),
          to: fmt(end)
        }
      });
    }
  });
  const {
    data: previewTypes = []
  } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchTypes()
  });
  const [form, setForm] = useState({
    brand_title: "",
    brand_today_title: "",
    brand_subtitle: "",
    brand_empty_message: "",
    primary_color: DEFAULT_COLOR,
    brand_logo_url: "",
    brand_logo_height_px: 32,
    brand_footer_logo_url: "",
    card_logo_url: "",
    card_logo_height_px: 72,
    card_accent_color: "#c8102e",
    card_footer_text: "É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva. Art 5º, VII, Constituição Federal.",
    card_title_size_px: 36,
    card_footer_size_px: 12,
    card_field_size_px: 15,
    card_label_size_px: 13,
    show_end_time: false,
    show_live_fields: true,
    force_show_type: false,
    religion_profile: "catolico"
  });
  useEffect(() => {
    if (account) {
      setForm({
        brand_title: account.brand_title ?? "",
        brand_today_title: account.brand_today_title ?? "Celebrações de hoje",
        brand_subtitle: account.brand_subtitle ?? "",
        brand_empty_message: account.brand_empty_message ?? "",
        primary_color: account.primary_color ?? DEFAULT_COLOR,
        brand_logo_url: account.brand_logo_url ?? "",
        brand_logo_height_px: account.brand_logo_height_px ?? 32,
        brand_footer_logo_url: account.brand_footer_logo_url ?? "",
        card_logo_url: account.card_logo_url ?? "",
        card_logo_height_px: account.card_logo_height_px ?? 72,
        card_accent_color: account.card_accent_color ?? "#c8102e",
        card_footer_text: account.card_footer_text ?? "É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva. Art 5º, VII, Constituição Federal.",
        card_title_size_px: account.card_title_size_px ?? 36,
        card_footer_size_px: account.card_footer_size_px ?? 12,
        card_field_size_px: account.card_field_size_px ?? 15,
        card_label_size_px: account.card_label_size_px ?? 13,
        show_end_time: account.show_end_time ?? false,
        show_live_fields: account.show_live_fields ?? true,
        force_show_type: account.force_show_type ?? false,
        religion_profile: account.religion_profile ?? "catolico"
      });
    }
  }, [account]);
  const mut = useMutation({
    mutationFn: () => updateSettings({
      data: {
        ...form,
        brand_logo_url: form.brand_logo_url || null,
        brand_logo_height_px: Number(form.brand_logo_height_px) || 32,
        brand_footer_logo_url: form.brand_footer_logo_url || null,
        card_logo_url: form.card_logo_url || null,
        card_logo_height_px: Number(form.card_logo_height_px) || 72,
        card_accent_color: form.card_accent_color,
        card_footer_text: form.card_footer_text,
        card_title_size_px: Number(form.card_title_size_px) || 36,
        card_footer_size_px: Number(form.card_footer_size_px) || 12,
        card_field_size_px: Number(form.card_field_size_px) || 15,
        card_label_size_px: Number(form.card_label_size_px) || 13
      }
    }),
    onSuccess: () => {
      toast.success("Configurações salvas");
      qc.invalidateQueries({
        queryKey: ["my-account"]
      });
      qc.invalidateQueries({
        queryKey: ["account"]
      });
    },
    onError: (e) => toast.error(e.message ?? "Erro ao salvar")
  });
  const [slugInput, setSlugInput] = useState("");
  const [slugStatus, setSlugStatus] = useState({
    kind: "idle"
  });
  useEffect(() => {
    setSlugInput(account?.custom_slug ?? "");
  }, [account?.custom_slug]);
  const currentSlug = account?.custom_slug ?? "";
  const normalizedInput = slugInput.trim().toLowerCase();
  useEffect(() => {
    if (!normalizedInput || normalizedInput === currentSlug) {
      setSlugStatus({
        kind: "idle"
      });
      return;
    }
    if (!/^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/.test(normalizedInput)) {
      setSlugStatus({
        kind: "invalid",
        reason: "3-40 letras minúsculas, números ou hífen"
      });
      return;
    }
    setSlugStatus({
      kind: "checking"
    });
    const handle = setTimeout(async () => {
      try {
        const res = await checkSlug({
          data: {
            slug: normalizedInput
          }
        });
        if (res.available) setSlugStatus({
          kind: "available"
        });
        else setSlugStatus({
          kind: "taken",
          reason: res.reason
        });
      } catch (e) {
        setSlugStatus({
          kind: "invalid",
          reason: e.message ?? "Erro ao verificar"
        });
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [normalizedInput, currentSlug, checkSlug]);
  const slugMut = useMutation({
    mutationFn: (slug) => saveSlug({
      data: {
        slug
      }
    }),
    onSuccess: (res) => {
      toast.success(res.slug ? "Nome curto atualizado. Links antigos com o nome anterior pararam de funcionar." : "Nome curto removido. Apenas o código fixo funciona agora.");
      qc.invalidateQueries({
        queryKey: ["my-account"]
      });
      qc.invalidateQueries({
        queryKey: ["account"]
      });
    },
    onError: (e) => toast.error(e.message ?? "Erro ao salvar")
  });
  const publicOrigin = "https://suaigreja.top";
  const fixedUrl = account ? `${publicOrigin}/a/${account.site_id}` : "";
  const slugUrl = currentSlug ? `${publicOrigin}/a/${currentSlug}` : "";
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado");
  };
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "p-6 max-w-4xl space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Configurações" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Perfil, campos do formulário, textos e aparência da sua agenda pública." }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Endereço público" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "O endereço onde sua agenda fica disponível na internet." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Código fixo (sempre funciona)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Input, { readOnly: true, value: fixedUrl, className: "font-mono text-sm" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", type: "button", onClick: () => copy(fixedUrl), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2 border-t", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "custom_slug", children: "Nome curto da igreja (opcional)" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Crie um endereço mais bonito, ex:",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
            publicOrigin,
            "/a/matriz-sp"
          ] }),
          ". Use de 3 a 40 letras minúsculas, números ou hífen."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center rounded-md border bg-muted/40 pl-3 pr-1 flex-1 focus-within:ring-1 focus-within:ring-ring", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground font-mono whitespace-nowrap", children: [
              publicOrigin,
              "/a/"
            ] }),
            /* @__PURE__ */ jsx(Input, { id: "custom_slug", value: slugInput, onChange: (e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, "-")), placeholder: "minha-igreja", maxLength: 40, className: "border-0 shadow-none focus-visible:ring-0 font-mono text-sm bg-transparent" }),
            /* @__PURE__ */ jsxs("div", { className: "pr-2", children: [
              slugStatus.kind === "checking" && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
              slugStatus.kind === "available" && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600" }),
              (slugStatus.kind === "taken" || slugStatus.kind === "invalid") && /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-destructive" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => slugMut.mutate(normalizedInput || null), disabled: slugMut.isPending || normalizedInput === currentSlug || normalizedInput !== "" && slugStatus.kind !== "available", children: slugMut.isPending ? "Salvando..." : "Salvar" }),
          currentSlug && /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setSlugInput("");
            slugMut.mutate(null);
          }, disabled: slugMut.isPending, children: "Remover" })
        ] }),
        (slugStatus.kind === "taken" || slugStatus.kind === "invalid") && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: slugStatus.reason }),
        slugStatus.kind === "available" && /* @__PURE__ */ jsx("p", { className: "text-xs text-green-600", children: "Disponível" }),
        currentSlug && /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Endereço atual" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Input, { readOnly: true, value: slugUrl, className: "font-mono text-sm" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", type: "button", onClick: () => copy(slugUrl), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md p-2 mt-2", children: [
          "⚠️ Atenção: ao alterar ou remover o nome curto, links antigos compartilhados com o nome anterior ",
          /* @__PURE__ */ jsx("strong", { children: "param de funcionar" }),
          ". O código fixo acima continua funcionando sempre."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ChurchIdentityCard, { form, setForm, isLoading, uploading: logoUploading, setUploading: setLogoUploading, inputRef: logoInputRef }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Perfil da instituição" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "O perfil define o vocabulário usado no sistema (ex: missa, culto, reunião)." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: RELIGION_PROFILES.map((p) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setForm({
        ...form,
        religion_profile: p.id
      }), className: cn("text-left rounded-md border p-3 transition-colors", form.religion_profile === p.id ? "border-primary bg-primary/5" : "hover:border-primary/50"), children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: p.label }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: p.description })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Campos do formulário" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Ative ou desative campos do painel de cadastro de eventos." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-t", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "show_end_time", className: "text-sm", children: "Hora de término" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Exibe um campo de hora de término no cadastro." })
          ] }),
          /* @__PURE__ */ jsx(Switch, { id: "show_end_time", checked: form.show_end_time, onCheckedChange: (v) => setForm({
            ...form,
            show_end_time: v
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-t", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "show_live_fields", className: "text-sm", children: "Transmissão ao vivo" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Exibe os campos de live e link de transmissão em cada evento." })
          ] }),
          /* @__PURE__ */ jsx(Switch, { id: "show_live_fields", checked: form.show_live_fields, onCheckedChange: (v) => setForm({
            ...form,
            show_live_fields: v
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-t", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "force_show_type", className: "text-sm", children: "Mostrar tipo em todos os eventos" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: 'Exibe o badge do tipo (ex: "Missa") em todos os eventos da agenda pública, mesmo nos que não marcaram "Mostrar tipo" individualmente.' })
          ] }),
          /* @__PURE__ */ jsx(Switch, { id: "force_show_type", checked: form.force_show_type, onCheckedChange: (v) => setForm({
            ...form,
            force_show_type: v
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Textos da agenda no site" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "Defina os títulos exibidos na agenda pública. O nome da igreja é editado no card ",
          /* @__PURE__ */ jsx("strong", { children: "Identidade da igreja" }),
          " acima."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "brand_today_title", children: "Título na agenda somente de hoje" }),
        /* @__PURE__ */ jsx(Input, { id: "brand_today_title", value: form.brand_today_title, onChange: (e) => setForm({
          ...form,
          brand_today_title: e.target.value
        }), placeholder: "Celebrações de hoje", disabled: isLoading })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "brand_subtitle", children: "Subtítulo (opcional)" }),
        /* @__PURE__ */ jsx(Input, { id: "brand_subtitle", value: form.brand_subtitle, onChange: (e) => setForm({
          ...form,
          brand_subtitle: e.target.value
        }), placeholder: "Confira os próximos horários da nossa comunidade", disabled: isLoading })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "brand_empty_message", children: "Mensagem quando não houver celebrações" }),
        /* @__PURE__ */ jsx(Textarea, { id: "brand_empty_message", value: form.brand_empty_message, onChange: (e) => setForm({
          ...form,
          brand_empty_message: e.target.value
        }), rows: 3, disabled: isLoading })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Aparência" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Cor principal usada nos destaques da agenda pública." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-md border p-2", children: [
          /* @__PURE__ */ jsx("input", { id: "primary_color", type: "color", value: form.primary_color, onChange: (e) => setForm({
            ...form,
            primary_color: e.target.value
          }), className: "h-9 w-12 rounded border cursor-pointer", disabled: isLoading }),
          /* @__PURE__ */ jsx(Input, { value: form.primary_color, onChange: (e) => setForm({
            ...form,
            primary_color: e.target.value
          }), className: "w-28 font-mono text-sm", disabled: isLoading })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", type: "button", onClick: () => setForm({
          ...form,
          primary_color: DEFAULT_COLOR
        }), disabled: isLoading || form.primary_color === DEFAULT_COLOR, children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4 mr-2" }),
          "Restaurar cor padrão"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || isLoading, children: mut.isPending ? "Salvando..." : "Salvar alterações" }) }) }),
    /* @__PURE__ */ jsx(MercadoPagoSection, {}),
    /* @__PURE__ */ jsx(MemberCardSettingsCard, { form, setForm }),
    /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || isLoading, children: mut.isPending ? "Salvando..." : "Salvar alterações" }) }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Prévia do site" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Renderização exata da agenda pública. O que você vê aqui é o que será exibido no shortcode, iframe ou link compartilhado." }),
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(PublicAgendaView, { account: {
        brand_title: form.brand_title || "Agenda de Celebrações",
        brand_subtitle: form.brand_subtitle,
        brand_empty_message: form.brand_empty_message || "Nenhuma celebração programada.",
        brand_today_title: form.brand_today_title,
        primary_color: form.primary_color,
        force_show_type: form.force_show_type
      }, events: (previewEvents ?? []).map((e) => ({
        id: e.id,
        event_date: e.event_date,
        start_time: e.start_time,
        end_time: e.end_time,
        location_name: e.location_name,
        type_name: e.type_name,
        type_id: e.type_id,
        description: e.description,
        show_type: e.show_type,
        is_live: e.is_live,
        live_url: e.live_url
      })), types: previewTypes.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color ?? "#467da5",
        icon: t.icon ?? ""
      })), view: "full" }) })
    ] })
  ] }) });
}
function ChurchIdentityCard({
  form,
  setForm,
  isLoading,
  uploading,
  setUploading,
  inputRef
}) {
  const footerInputRef = useRef(null);
  const [footerUploading, setFooterUploading] = useState(false);
  async function uploadLogoFile(file, field, setBusy) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) {
      toast.error("Use PNG (transparente), JPG ou WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem maior que 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result;
          resolve(res.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const {
        url
      } = await uploadAsset({
        data: {
          folder: "product-images",
          filename: file.name,
          contentType: file.type,
          base64
        }
      });
      setForm((f) => ({
        ...f,
        [field]: url
      }));
      toast.success("Logo enviado. Não esqueça de salvar.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  const [removingBg, setRemovingBg] = useState(null);
  async function handleRemoveBackground(field) {
    const url = form[field];
    if (!url) return;
    setRemovingBg(field);
    const tId = toast.loading("Removendo fundo… isso pode levar alguns segundos.");
    try {
      const {
        removeBackground
      } = await import("@imgly/background-removal");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Não foi possível baixar a logo atual.");
      const inputBlob = await res.blob();
      const outBlob = await removeBackground(inputBlob, {
        output: {
          format: "image/png"
        }
      });
      const file = new File([outBlob], `logo-${Date.now()}.png`, {
        type: "image/png"
      });
      const path = `church-logo/${crypto.randomUUID()}.png`;
      const {
        error
      } = await supabase.storage.from("product-images").upload(path, file, {
        upsert: false,
        contentType: "image/png"
      });
      if (error) throw error;
      const {
        data: pub
      } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({
        ...f,
        [field]: pub.publicUrl
      }));
      toast.success("Fundo removido! Não esqueça de salvar.", {
        id: tId
      });
    } catch (e) {
      toast.error("Falha ao remover fundo: " + e.message, {
        id: tId
      });
    } finally {
      setRemovingBg(null);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Identidade da igreja" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Nome e logo usados em toda a página pública da igreja (topo, rodapé, link compartilhado e agenda)." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "brand_title", children: "Nome da igreja" }),
      /* @__PURE__ */ jsx(Input, { id: "brand_title", value: form.brand_title, onChange: (e) => setForm({
        ...form,
        brand_title: e.target.value
      }), placeholder: "Ex: Paróquia Nossa Senhora Aparecida", disabled: isLoading, maxLength: 120 }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Aparece no topo da página, no rodapé e como título da agenda quando não houver logo enviado." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t pt-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Logo do topo do site" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "Recomendado: ",
          /* @__PURE__ */ jsx("strong", { children: "400×120 px" }),
          " (proporção horizontal). Formatos: ",
          /* @__PURE__ */ jsx("strong", { children: "PNG transparente" }),
          ", JPG ou WEBP. Tamanho máx.: 3 MB. Quando enviado, substitui o nome no topo do site."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsx(Input, { value: form.brand_logo_url, onChange: (e) => setForm({
          ...form,
          brand_logo_url: e.target.value
        }), placeholder: "https://… ou envie um arquivo", className: "flex-1 min-w-[220px]" }),
        /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", accept: "image/png,image/jpeg,image/webp", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) uploadLogoFile(f, "brand_logo_url", setUploading);
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => inputRef.current?.click(), disabled: uploading, children: uploading ? "Enviando…" : "Enviar arquivo" }),
        form.brand_logo_url && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setForm({
          ...form,
          brand_logo_url: ""
        }), children: "Remover" })
      ] }),
      form.brand_logo_url && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => handleRemoveBackground("brand_logo_url"), disabled: removingBg !== null || uploading, children: removingBg === "brand_logo_url" ? "Processando…" : "✨ Remover fundo da logo (IA)" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Gratuito — processa no seu navegador, sem enviar para servidor." })
      ] }),
      form.brand_logo_url && /* @__PURE__ */ jsx("div", { className: "rounded-md border bg-muted/40 p-3 inline-block", children: /* @__PURE__ */ jsx("img", { src: form.brand_logo_url, alt: "Logo da igreja", style: {
        height: form.brand_logo_height_px
      }, className: "w-auto object-contain" }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[160px_1fr] gap-3 items-start pt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "brand_logo_height_px", children: "Altura exibida (px)" }),
          /* @__PURE__ */ jsx(Input, { id: "brand_logo_height_px", type: "number", min: 16, max: 64, value: form.brand_logo_height_px, onChange: (e) => setForm({
            ...form,
            brand_logo_height_px: Number(e.target.value) || 32
          }) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground sm:pt-7", children: "Entre 16 e 64 px. Mantém a proporção e evita logos gigantes no topo do site." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t pt-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Logo do rodapé (opcional)" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "Use uma versão diferente da logo no rodapé (que tem fundo escuro). Se não enviar, usamos a logo do topo. Ideal: ",
          /* @__PURE__ */ jsx("strong", { children: "PNG com fundo transparente" }),
          " ",
          "e a arte em tons claros."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsx(Input, { value: form.brand_footer_logo_url, onChange: (e) => setForm({
          ...form,
          brand_footer_logo_url: e.target.value
        }), placeholder: "https://… ou envie um arquivo", className: "flex-1 min-w-[220px]" }),
        /* @__PURE__ */ jsx("input", { ref: footerInputRef, type: "file", accept: "image/png,image/jpeg,image/webp", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) uploadLogoFile(f, "brand_footer_logo_url", setFooterUploading);
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => footerInputRef.current?.click(), disabled: footerUploading, children: footerUploading ? "Enviando…" : "Enviar arquivo" }),
        form.brand_footer_logo_url && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setForm({
          ...form,
          brand_footer_logo_url: ""
        }), children: "Remover" })
      ] }),
      form.brand_footer_logo_url && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => handleRemoveBackground("brand_footer_logo_url"), disabled: removingBg !== null || footerUploading, children: removingBg === "brand_footer_logo_url" ? "Processando…" : "✨ Remover fundo da logo (IA)" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Gratuito — processa no seu navegador, sem enviar para servidor." })
      ] }),
      form.brand_footer_logo_url && /* @__PURE__ */ jsx("div", { className: "rounded-md border bg-stone-900 p-3 inline-block", children: /* @__PURE__ */ jsx("img", { src: form.brand_footer_logo_url, alt: "Logo do rodapé", style: {
        height: 48
      }, className: "w-auto object-contain" }) })
    ] })
  ] });
}
function MercadoPagoSection() {
  const fetchConnection = useServerFn(getMyMercadoPagoConnection);
  const saveConnection = useServerFn(saveMercadoPagoConnection);
  const removeConnection = useServerFn(disconnectMercadoPago);
  const qc = useQueryClient();
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const {
    data: connection,
    isLoading
  } = useQuery({
    queryKey: ["mercadopago-connection"],
    queryFn: () => fetchConnection()
  });
  const saveMut = useMutation({
    mutationFn: () => saveConnection({
      data: {
        accessToken,
        publicKey: publicKey || null
      }
    }),
    onSuccess: () => {
      toast.success("Mercado Pago conectado! As doações agora vão direto para sua conta.");
      setAccessToken("");
      setPublicKey("");
      qc.invalidateQueries({
        queryKey: ["mercadopago-connection"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const removeMut = useMutation({
    mutationFn: () => removeConnection(),
    onSuccess: () => {
      toast.success("Mercado Pago desconectado. As doações voltam a usar o Pix simples.");
      qc.invalidateQueries({
        queryKey: ["mercadopago-connection"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Mercado Pago (doações)" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Conecte sua própria conta do Mercado Pago para que as doações dos fiéis caiam direto na conta da sua igreja, com confirmação automática de pagamento. Sem conectar, as doações continuam usando o Pix simples (copia e cola), sem rastreio de pagamento." })
    ] }),
    !isLoading && connection?.connected ? /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/40 p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600" }),
        "Conectado"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => removeMut.mutate(), disabled: removeMut.isPending, children: removeMut.isPending ? "Desconectando…" : "Desconectar" })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Access Token" }),
        /* @__PURE__ */ jsx(Input, { type: "password", value: accessToken, onChange: (e) => setAccessToken(e.target.value), placeholder: "APP_USR-..." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Public Key (opcional)" }),
        /* @__PURE__ */ jsx(Input, { value: publicKey, onChange: (e) => setPublicKey(e.target.value), placeholder: "APP_USR-..." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "sm:col-span-2 flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending || accessToken.trim().length < 10, children: saveMut.isPending ? "Conectando…" : "Conectar Mercado Pago" }) })
    ] })
  ] });
}
function MemberCardSettingsCard({
  form,
  setForm
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  async function uploadLogo(file) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) {
      toast.error("Use PNG (transparente), JPG ou WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem maior que 3 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `card-logo/${crypto.randomUUID()}.${ext}`;
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
      setForm((f) => ({
        ...f,
        card_logo_url: pub.publicUrl
      }));
      toast.success("Logo enviada. Não esqueça de salvar.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }
  async function removeBg() {
    if (!form.card_logo_url) return;
    setRemovingBg(true);
    const tId = toast.loading("Removendo fundo… isso pode levar alguns segundos.");
    try {
      const {
        removeBackground
      } = await import("@imgly/background-removal");
      const res = await fetch(form.card_logo_url);
      if (!res.ok) throw new Error("Não foi possível baixar a logo.");
      const inputBlob = await res.blob();
      const outBlob = await removeBackground(inputBlob, {
        output: {
          format: "image/png"
        }
      });
      const file = new File([outBlob], `card-${Date.now()}.png`, {
        type: "image/png"
      });
      const path = `card-logo/${crypto.randomUUID()}.png`;
      const {
        error
      } = await supabase.storage.from("product-images").upload(path, file, {
        upsert: false,
        contentType: "image/png"
      });
      if (error) throw error;
      const {
        data: pub
      } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({
        ...f,
        card_logo_url: pub.publicUrl
      }));
      toast.success("Fundo removido! Não esqueça de salvar.", {
        id: tId
      });
    } catch (e) {
      toast.error("Falha ao remover fundo: " + e.message, {
        id: tId
      });
    } finally {
      setRemovingBg(false);
    }
  }
  const sampleMember = {
    id: "preview00-0000-0000-0000-000000000000",
    full_name: "João da Silva Exemplo",
    photo_url: null,
    role: "Membro",
    status: "ativo",
    member_since: "2020-03-15",
    birth_date: "1990-07-22",
    cpf: "000.000.000-00",
    congregation: form.brand_title || "Sede"
  };
  return /* @__PURE__ */ jsxs(Card, { className: "p-6 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Carteirinha de membro" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        "Modelo padrão do sistema. Os dados (foto, nome, CPF, datas, QR) são puxados automaticamente do cadastro do membro. Você personaliza apenas a ",
        /* @__PURE__ */ jsx("strong", { children: "logo" }),
        ", as ",
        /* @__PURE__ */ jsx("strong", { children: "cores" }),
        " e o",
        /* @__PURE__ */ jsx("strong", { children: " texto legal do rodapé" }),
        ". A cor principal vem do bloco",
        /* @__PURE__ */ jsx("em", { children: " Aparência" }),
        " acima."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Logo da carteirinha" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Recomendado: ",
            /* @__PURE__ */ jsx("strong", { children: "400×400 px" }),
            ", PNG com fundo transparente. Tamanho máx.: 3 MB."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
            /* @__PURE__ */ jsx(Input, { value: form.card_logo_url, onChange: (e) => setForm({
              ...form,
              card_logo_url: e.target.value
            }), placeholder: "https://… ou envie um arquivo", className: "flex-1 min-w-[220px]" }),
            /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", accept: "image/png,image/jpeg,image/webp", className: "hidden", onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) uploadLogo(f);
              e.target.value = "";
            } }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => inputRef.current?.click(), disabled: uploading, children: uploading ? "Enviando…" : "Enviar arquivo" }),
            form.card_logo_url && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setForm({
              ...form,
              card_logo_url: ""
            }), children: "Remover" })
          ] }),
          form.card_logo_url && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-1", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: removeBg, disabled: removingBg || uploading, children: removingBg ? "Processando…" : "✨ Remover fundo (IA)" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Gratuito — processa no seu navegador." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[160px_1fr] gap-3 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { children: "Altura da logo (px)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 24, max: 160, value: form.card_logo_height_px, onChange: (e) => setForm({
              ...form,
              card_logo_height_px: Number(e.target.value) || 72
            }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground sm:pt-7", children: "Entre 24 e 160 px. Dica: para uma logo quadrada, comece em 72 px." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Cor da faixa de destaque (vermelha por padrão)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-md border p-2 w-fit", children: [
            /* @__PURE__ */ jsx("input", { type: "color", value: form.card_accent_color, onChange: (e) => setForm({
              ...form,
              card_accent_color: e.target.value
            }), className: "h-9 w-12 rounded border cursor-pointer" }),
            /* @__PURE__ */ jsx(Input, { value: form.card_accent_color, onChange: (e) => setForm({
              ...form,
              card_accent_color: e.target.value
            }), className: "w-28 font-mono text-sm" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "A cor azul/principal da carteirinha vem do bloco ",
            /* @__PURE__ */ jsx("em", { children: "Aparência" }),
            " acima."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Texto legal do rodapé" }),
          /* @__PURE__ */ jsx(Textarea, { rows: 3, value: form.card_footer_text, onChange: (e) => setForm({
            ...form,
            card_footer_text: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: 'Tamanho do título "CARTEIRA DE MEMBRO" (px)' }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 18, max: 60, value: form.card_title_size_px, onChange: (e) => setForm({
              ...form,
              card_title_size_px: Number(e.target.value) || 36
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Tamanho do texto legal (px)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 8, max: 20, value: form.card_footer_size_px, onChange: (e) => setForm({
              ...form,
              card_footer_size_px: Number(e.target.value) || 12
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Tamanho do texto do membro (px)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 10, max: 28, value: form.card_field_size_px, onChange: (e) => setForm({
              ...form,
              card_field_size_px: Number(e.target.value) || 15
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Tamanho dos rótulos (NOME, CPF...) (px)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 9, max: 20, value: form.card_label_size_px, onChange: (e) => setForm({
              ...form,
              card_label_size_px: Number(e.target.value) || 13
            }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Prévia" }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border bg-muted/30 p-4", children: /* @__PURE__ */ jsx(MemberCard, { member: sampleMember, church: {
          brand_title: form.brand_title,
          card_logo_url: form.card_logo_url || null,
          card_logo_height_px: form.card_logo_height_px,
          primary_color: form.primary_color,
          card_accent_color: form.card_accent_color,
          card_footer_text: form.card_footer_text,
          card_title_size_px: form.card_title_size_px,
          card_footer_size_px: form.card_footer_size_px,
          card_field_size_px: form.card_field_size_px,
          card_label_size_px: form.card_label_size_px
        }, qrValue: "https://suaigreja.top/c/preview" }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "A prévia usa um membro fictício. Cada carteirinha real é gerada na página ",
          /* @__PURE__ */ jsx("code", { children: "/c/<id-do-membro>" }),
          " com os dados reais."
        ] })
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
