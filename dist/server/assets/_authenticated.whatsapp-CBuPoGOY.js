import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { MessageCircle, Wallet, Info, Settings, Bell, Send, Filter, Cake, UserPlus, Building2, Users2, Heart, Coins, Newspaper, Trash2 } from "lucide-react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./router-DXfKo2Q8.js";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-tabs";
const MSG_KINDS = ["birthday", "event_reminder", "welcome", "manual", "culto_reminder", "celula_reminder", "prayer_request", "tithe_reminder", "newsletter"];
const SettingsInput = z.object({
  enabled: z.boolean(),
  send_hour_brt: z.number().int().min(0).max(23),
  sender_name: z.string().max(80).nullable(),
  birthday_enabled: z.boolean(),
  birthday_template: z.string().min(10).max(800),
  welcome_enabled: z.boolean(),
  welcome_template: z.string().min(10).max(800),
  culto_reminder_enabled: z.boolean(),
  culto_reminder_template: z.string().min(10).max(800),
  celula_reminder_enabled: z.boolean(),
  celula_reminder_template: z.string().min(10).max(800),
  prayer_request_enabled: z.boolean(),
  prayer_request_template: z.string().min(10).max(800),
  tithe_reminder_enabled: z.boolean(),
  tithe_reminder_template: z.string().min(10).max(800),
  newsletter_enabled: z.boolean(),
  newsletter_template: z.string().min(10).max(800)
});
const getWhatsappData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0b1a7d021059e2e95a4ad3e2dbce72fb3f3a072ad3df6f9c01224a304c931196"));
const upsertWhatsappSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => SettingsInput.parse(input)).handler(createSsrRpc("f586cf011e79c5a8c2f07c0bd19a231ed27fc6f2f5633d074eab036d0e528f51"));
const deleteQueuedWhatsappMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("91d42bc5cae84af8af0f00717f09022218898f7aa48732459ea5f2ee39896736"));
const enqueueWhatsappMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  phone: z.string().min(10).max(20),
  recipient_name: z.string().max(200).nullable().optional(),
  content: z.string().min(1).max(800),
  kind: z.enum(MSG_KINDS),
  member_id: z.string().uuid().nullable().optional()
}).parse(input)).handler(createSsrRpc("8defb47fa5aefe3f234948ee19ff962e347b3cad06bdf60069fb494c624a03dc"));
const STATUS_COLORS = {
  queued: "bg-amber-100 text-amber-800",
  sending: "bg-blue-100 text-blue-800",
  sent: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  skipped: "bg-zinc-200 text-zinc-700"
};
const KIND_LABELS = {
  birthday: "Aniversário",
  welcome: "Boas-vindas",
  culto_reminder: "Lembrete de culto",
  celula_reminder: "Lembrete de célula",
  prayer_request: "Pedido de oração",
  tithe_reminder: "Lembrete de contribuição",
  newsletter: "Boletim semanal",
  event_reminder: "Aviso de evento",
  manual: "Envio avulso"
};
const DEFAULTS = {
  enabled: false,
  send_hour_brt: 9,
  sender_name: "",
  birthday_enabled: false,
  birthday_template: "Feliz aniversário, {nome}! 🎉 Que Deus abençoe seu novo ciclo de vida. Equipe {igreja}.",
  welcome_enabled: false,
  welcome_template: "Olá, {nome}! Ficamos felizes com sua visita à {igreja}. Que Deus abençoe você! 🙏",
  culto_reminder_enabled: false,
  culto_reminder_template: "Olá, {nome}! Lembramos que temos culto hoje. Te esperamos na {igreja}! 🙌",
  celula_reminder_enabled: false,
  celula_reminder_template: "Olá, {nome}! Hoje tem encontro da célula *{celula}* com {lider}. Te esperamos! 🏠",
  prayer_request_enabled: false,
  prayer_request_template: "Olá, {nome}! Recebemos seu pedido de oração. Nossa equipe está intercedendo por você. 🙏 Equipe {igreja}.",
  tithe_reminder_enabled: false,
  tithe_reminder_template: "Olá, {nome}! Passamos para lembrar sobre a sua contribuição deste mês. Que Deus multiplique! Equipe {igreja}.",
  newsletter_enabled: false,
  newsletter_template: "Olá, {nome}! Confira as novidades desta semana na {igreja}: {conteudo}"
};
function settingsFromData(data) {
  const s = data?.settings;
  if (!s) return DEFAULTS;
  return {
    enabled: s.enabled ?? false,
    send_hour_brt: s.send_hour_brt ?? 9,
    sender_name: s.sender_name ?? "",
    birthday_enabled: s.birthday_enabled ?? false,
    birthday_template: s.birthday_template ?? DEFAULTS.birthday_template,
    welcome_enabled: s.welcome_enabled ?? false,
    welcome_template: s.welcome_template ?? DEFAULTS.welcome_template,
    culto_reminder_enabled: s.culto_reminder_enabled ?? false,
    culto_reminder_template: s.culto_reminder_template ?? DEFAULTS.culto_reminder_template,
    celula_reminder_enabled: s.celula_reminder_enabled ?? false,
    celula_reminder_template: s.celula_reminder_template ?? DEFAULTS.celula_reminder_template,
    prayer_request_enabled: s.prayer_request_enabled ?? false,
    prayer_request_template: s.prayer_request_template ?? DEFAULTS.prayer_request_template,
    tithe_reminder_enabled: s.tithe_reminder_enabled ?? false,
    tithe_reminder_template: s.tithe_reminder_template ?? DEFAULTS.tithe_reminder_template,
    newsletter_enabled: s.newsletter_enabled ?? false,
    newsletter_template: s.newsletter_template ?? DEFAULTS.newsletter_template
  };
}
function WhatsappPage() {
  const fetchData = useServerFn(getWhatsappData);
  const saveSettings = useServerFn(upsertWhatsappSettings);
  const deleteMsg = useServerFn(deleteQueuedWhatsappMessage);
  const enqueue = useServerFn(enqueueWhatsappMessage);
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["whatsapp-data"],
    queryFn: () => fetchData()
  });
  const [cfg, setCfg] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [histKind, setHistKind] = useState("all");
  useEffect(() => {
    if (data) setCfg(settingsFromData(data));
  }, [data]);
  function set(key, value) {
    setCfg((prev) => ({
      ...prev,
      [key]: value
    }));
  }
  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings({
        data: cfg
      });
      toast.success("Configurações salvas");
      refetch();
    } catch (e) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id) {
    try {
      await deleteMsg({
        data: {
          id
        }
      });
      toast.success("Mensagem removida da fila");
      refetch();
    } catch (e) {
      toast.error(e?.message ?? "Erro");
    }
  }
  const credits = data?.settings?.credits_balance ?? 0;
  const totals = data?.totals ?? {};
  const recent = data?.recent ?? [];
  const filtered = histKind === "all" ? recent : recent.filter((m) => m.kind === histKind);
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(MessageCircle, { className: "h-7 w-7 text-emerald-600" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Mensagens WhatsApp" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Configure e monitore todos os tipos de mensagem automática." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 grid-cols-2 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }), label: "Créditos", value: credits }),
      /* @__PURE__ */ jsx(StatCard, { label: "Enviadas", value: totals.sent ?? 0 }),
      /* @__PURE__ */ jsx(StatCard, { label: "Na fila", value: totals.queued ?? 0 }),
      /* @__PURE__ */ jsx(StatCard, { label: "Total", value: totals.total ?? 0 })
    ] }),
    !cfg.enabled && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200", children: [
      /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "WhatsApp está ",
        /* @__PURE__ */ jsx("strong", { children: "desativado" }),
        ". Ative na aba",
        " ",
        /* @__PURE__ */ jsx("strong", { children: "Configurações Gerais" }),
        " para começar a usar."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "geral", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "geral", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5" }),
          " Geral"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "tipos", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-3.5 w-3.5" }),
          " Tipos de mensagem"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "manual", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
          " Envio manual"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "historico", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-3.5 w-3.5" }),
          " Histórico"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "geral", className: "mt-4", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Configurações gerais" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Controles globais que afetam todas as mensagens." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base", children: "WhatsApp ativado" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Chave mestre — desativar suspende todos os envios." })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: cfg.enabled, onCheckedChange: (v) => set("enabled", v) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "hour", children: "Horário padrão de envio (BRT)" }),
              /* @__PURE__ */ jsx(Input, { id: "hour", type: "number", min: 0, max: 23, value: cfg.send_hour_brt, onChange: (e) => set("send_hour_brt", Number(e.target.value)) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Hora do dia (0–23) para mensagens automáticas agendadas." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "sender", children: "Nome do remetente (opcional)" }),
              /* @__PURE__ */ jsx(Input, { id: "sender", maxLength: 80, value: cfg.sender_name, onChange: (e) => set("sender_name", e.target.value), placeholder: "Ex: Igreja Renovação" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900 border border-blue-200", children: [
            /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsx("div", { children: "A integração com o provider WhatsApp (Meta Business API) ainda será ativada. As mensagens já são enfileiradas; o envio efetivo começa assim que o provider for conectado." })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: saving || isLoading, children: saving ? "Salvando..." : "Salvar configurações" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "tipos", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: Cake, title: "Aniversário", description: "Disparada automaticamente no dia do aniversário dos membros com telefone cadastrado.", trigger: "Automático · diário", variables: "{nome}, {nome_completo}, {igreja}", enabledKey: "birthday_enabled", templateKey: "birthday_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: UserPlus, title: "Boas-vindas ao visitante", description: "Enviada quando um visitante novo é cadastrado com permissão de contato.", trigger: "Automático · ao cadastrar visitante", variables: "{nome}, {igreja}", enabledKey: "welcome_enabled", templateKey: "welcome_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: Building2, title: "Lembrete de culto", description: "Lembrete enviado no dia do culto para membros cadastrados com telefone.", trigger: "Manual · via página de Check-in", variables: "{nome}, {igreja}", enabledKey: "culto_reminder_enabled", templateKey: "culto_reminder_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: Users2, title: "Lembrete de célula", description: "Lembrete enviado no dia da reunião semanal de cada célula para seus membros.", trigger: "Automático · semanal conforme dia da célula", variables: "{nome}, {celula}, {lider}, {igreja}", enabledKey: "celula_reminder_enabled", templateKey: "celula_reminder_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: Heart, title: "Pedido de oração", description: "Confirmação enviada quando alguém registra um pedido de oração pelo site ou hub.", trigger: "Automático · ao receber pedido de oração", variables: "{nome}, {igreja}", enabledKey: "prayer_request_enabled", templateKey: "prayer_request_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: Coins, title: "Lembrete de contribuição", description: "Lembrete mensal para dizimistas e contribuintes regulares.", trigger: "Manual · mensal", variables: "{nome}, {igreja}", enabledKey: "tithe_reminder_enabled", templateKey: "tithe_reminder_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx(MsgTypeCard, { icon: Newspaper, title: "Boletim semanal", description: "Boletim de avisos enviado manualmente com conteúdo personalizado para todos os membros.", trigger: "Manual · semanal", variables: "{nome}, {igreja}, {conteudo}", enabledKey: "newsletter_enabled", templateKey: "newsletter_template", cfg, onChange: set }),
        /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: saving || isLoading, children: saving ? "Salvando..." : "Salvar todos os templates" }) })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "manual", className: "mt-4", children: /* @__PURE__ */ jsx(ManualSendForm, { enqueue, refetch, globalEnabled: cfg.enabled }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "historico", className: "mt-4", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Histórico de mensagens" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Últimas 100 mensagens de todos os tipos." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Filtrar por tipo:" }),
            /* @__PURE__ */ jsxs("select", { className: "h-9 rounded-md border bg-background px-2 text-sm", value: histKind, onChange: (e) => setHistKind(e.target.value), children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                "Todos (",
                recent.length,
                ")"
              ] }),
              Object.entries(KIND_LABELS).map(([v, label]) => {
                const count = recent.filter((m) => m.kind === v).length;
                return count > 0 ? /* @__PURE__ */ jsxs("option", { value: v, children: [
                  label,
                  " (",
                  count,
                  ")"
                ] }, v) : null;
              })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }) : filtered.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma mensagem ainda." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: filtered.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-md border p-3 text-sm", children: [
          /* @__PURE__ */ jsx(Badge, { className: `shrink-0 ${STATUS_COLORS[m.status] ?? ""}`, children: m.status }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
              m.recipient_name ?? m.phone,
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
                "· ",
                KIND_LABELS[m.kind] ?? m.kind
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-muted-foreground truncate", children: m.content }),
            m.error_message && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600 mt-1", children: m.error_message }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: new Date(m.created_at).toLocaleString("pt-BR") })
          ] }),
          m.status === "queued" && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleDelete(m.id), title: "Remover da fila", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, m.id)) }) })
      ] }) })
    ] })
  ] }) });
}
function StatCard({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: value })
  ] }) });
}
function MsgTypeCard({
  icon: Icon,
  title,
  description,
  trigger,
  variables,
  enabledKey,
  templateKey,
  cfg,
  onChange
}) {
  const enabled = cfg[enabledKey];
  const template = cfg[templateKey];
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 flex-1", children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-emerald-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: title }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs mt-0.5", children: description }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs mt-1.5", children: trigger })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Switch, { checked: enabled, onCheckedChange: (v) => onChange(enabledKey, v), disabled: !cfg.enabled })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Textarea, { rows: 3, value: template, onChange: (e) => onChange(templateKey, e.target.value), maxLength: 800, disabled: !enabled || !cfg.enabled, placeholder: "Template da mensagem..." }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Variáveis: ",
        /* @__PURE__ */ jsx("code", { children: variables }),
        " · ",
        template.length,
        "/800"
      ] })
    ] })
  ] });
}
function ManualSendForm({
  enqueue,
  refetch,
  globalEnabled
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [kind, setKind] = useState("manual");
  const [sending, setSending] = useState(false);
  async function handleSend() {
    if (!phone.trim() || !content.trim()) return;
    setSending(true);
    try {
      await enqueue({
        data: {
          phone: phone.trim(),
          recipient_name: name.trim() || null,
          content: content.trim(),
          kind,
          member_id: null
        }
      });
      toast.success("Mensagem adicionada à fila de envio");
      setPhone("");
      setName("");
      setContent("");
      refetch();
    } catch (e) {
      toast.error(e?.message ?? "Erro ao enfileirar mensagem");
    } finally {
      setSending(false);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" }),
        " Envio avulso"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Enfileira uma mensagem para um número específico. O envio ocorre quando o provider for ativado." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      !globalEnabled && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Ative o WhatsApp nas ",
          /* @__PURE__ */ jsx("strong", { children: "Configurações Gerais" }),
          " e certifique-se de ter créditos disponíveis antes de enfileirar mensagens."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Telefone com DDD*" }),
          /* @__PURE__ */ jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "11987654321", maxLength: 20 })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Nome do destinatário" }),
          /* @__PURE__ */ jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Maria da Silva", maxLength: 200 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Categoria da mensagem" }),
        /* @__PURE__ */ jsxs("select", { className: "w-full h-10 rounded-md border bg-background px-3 text-sm", value: kind, onChange: (e) => setKind(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "manual", children: "Avulso (sem categoria)" }),
          /* @__PURE__ */ jsx("option", { value: "birthday", children: "Aniversário" }),
          /* @__PURE__ */ jsx("option", { value: "welcome", children: "Boas-vindas" }),
          /* @__PURE__ */ jsx("option", { value: "culto_reminder", children: "Lembrete de culto" }),
          /* @__PURE__ */ jsx("option", { value: "celula_reminder", children: "Lembrete de célula" }),
          /* @__PURE__ */ jsx("option", { value: "prayer_request", children: "Pedido de oração" }),
          /* @__PURE__ */ jsx("option", { value: "tithe_reminder", children: "Lembrete de contribuição" }),
          /* @__PURE__ */ jsx("option", { value: "newsletter", children: "Boletim semanal" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Mensagem*" }),
        /* @__PURE__ */ jsx(Textarea, { value: content, onChange: (e) => setContent(e.target.value), rows: 5, maxLength: 800, placeholder: "Digite a mensagem que será enviada..." }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          content.length,
          "/800 caracteres"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: handleSend, disabled: sending || !phone.trim() || !content.trim(), children: sending ? "Enfileirando..." : "Enfileirar mensagem" })
    ] })
  ] });
}
export {
  WhatsappPage as component
};
