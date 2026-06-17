import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useSearch, useNavigate, Link } from "@tanstack/react-router";
import { S as Separator, A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C9ggp6nn.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { g as getMyAccount, u as updateAccountSettings, d as uploadAccountAsset } from "./account.functions-DK5H0Kdx.js";
import { H as listMyDonationCampaigns, N as upsertDonationCampaign, O as deleteDonationCampaign, P as getDonationCampaignStats, Q as updateHubSettings, S as listMyNews, T as upsertNews, U as deleteNews, V as uploadHubAsset, W as startInstagramConnect, X as getInstagramConnection, Y as disconnectInstagram } from "./router-BAWvi9U-.js";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { HandCoins, ExternalLink, Plus, Loader2, Star, Pencil, Trash2, Image, Church, Users, HeartHandshake, CalendarHeart, Share2, Youtube, Newspaper, Eye, MessageSquareQuote, Sparkle, LayoutTemplate, Settings, Copy, Headphones, Instagram, CheckCircle2, Unlink, Link2, ImagePlus, X, GripVertical, Upload, Cross, Sparkles, Heart, CalendarDays, HandHeart, BookOpen, Music, Globe, Baby, Home, Flame } from "lucide-react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
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
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-select";
import "./billing-plans-Ce8xzhRW.js";
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
const EMPTY = {
  title: "",
  description: "",
  image_url: null,
  pix_key: "",
  pix_key_type: "aleatoria",
  recipient_name: "",
  recipient_city: "BRASIL",
  suggested_amounts_cents: [1e3, 2500, 5e3, 1e4],
  goal_cents: null,
  active: true,
  featured: false,
  sort_order: 0
};
function fmtBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function DonationsManager({ slug }) {
  const qc = useQueryClient();
  const list = useServerFn(listMyDonationCampaigns);
  const save = useServerFn(upsertDonationCampaign);
  const remove = useServerFn(deleteDonationCampaign);
  const fetchStats = useServerFn(getDonationCampaignStats);
  const { data: items = [], isLoading } = useQuery({ queryKey: ["my-donations"], queryFn: () => list() });
  const { data: stats = [] } = useQuery({ queryKey: ["donation-campaign-stats"], queryFn: () => fetchStats() });
  const statsByCampaign = new Map(stats.map((s) => [s.campaignId, s]));
  const [editing, setEditing] = useState(null);
  const saveMut = useMutation({
    mutationFn: (c) => save({ data: c }),
    onSuccess: () => {
      toast.success("Campanha salva");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["my-donations"] });
    },
    onError: (e) => toast.error(e?.message || "Erro ao salvar")
  });
  const delMut = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Campanha removida");
      qc.invalidateQueries({ queryKey: ["my-donations"] });
    }
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(HandCoins, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Campanhas de doação (Pix)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "O valor cai direto na conta da igreja. Geramos QR Code Pix válido no padrão Banco Central." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        slug && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: `/d/${slug}`, target: "_blank", rel: "noopener", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4 mr-1" }),
          "Ver página /d/",
          slug
        ] }) }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => setEditing({ ...EMPTY }), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Nova campanha"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(PixKeyCard, {}),
    /* @__PURE__ */ jsx(FixedImageCard, {}),
    isLoading ? /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground p-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin inline mr-2" }),
      "Carregando…"
    ] }) : items.length === 0 && !editing ? /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(HandCoins, { className: "h-10 w-10 mx-auto text-muted-foreground mb-2" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma campanha. Crie a primeira pra começar a receber doações." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: items.map((c) => /* @__PURE__ */ jsxs(Card, { className: "p-4 flex gap-3", children: [
      c.image_url && /* @__PURE__ */ jsx("img", { src: c.image_url, alt: "", className: "h-16 w-16 rounded object-cover" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          c.featured && /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 text-amber-500 fill-amber-500" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: c.title })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: c.description }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
          c.pix_key_type,
          " · ",
          c.recipient_name
        ] }),
        (() => {
          const s = statsByCampaign.get(c.id);
          const raised = s?.raisedCents ?? 0;
          if (!c.goal_cents && raised === 0) return null;
          const pct = c.goal_cents ? Math.min(100, Math.round(raised / c.goal_cents * 100)) : null;
          return /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
              "Arrecadado: ",
              /* @__PURE__ */ jsx("strong", { children: fmtBRL(raised) }),
              c.goal_cents ? /* @__PURE__ */ jsxs(Fragment, { children: [
                " de ",
                fmtBRL(c.goal_cents),
                " (",
                pct,
                "%)"
              ] }) : null
            ] }),
            pct !== null && /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary", style: { width: `${pct}%` } }) })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(c), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
          if (confirm("Remover campanha?")) delMut.mutate(c.id);
        }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] })
    ] }, c.id)) }),
    editing && /* @__PURE__ */ jsx(CampaignForm, { initial: editing, onCancel: () => setEditing(null), onSave: (c) => saveMut.mutate(c), saving: saveMut.isPending })
  ] });
}
function CampaignForm({
  initial,
  onCancel,
  onSave,
  saving
}) {
  const [f, setF] = useState(initial);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setAmount = (i, brl) => {
    const cents = Math.round(parseFloat(brl.replace(",", ".") || "0") * 100);
    setF((p) => {
      const arr = [...p.suggested_amounts_cents];
      arr[i] = cents;
      return { ...p, suggested_amounts_cents: arr.filter((n) => n > 0) };
    });
  };
  function submit() {
    if (!f.title.trim()) return toast.error("Informe o título");
    if (!f.pix_key.trim()) return toast.error("Informe a chave Pix");
    if (!f.recipient_name.trim()) return toast.error("Informe o nome do recebedor");
    onSave({
      ...f,
      image_url: f.image_url?.trim() && /^https?:\/\//i.test(f.image_url.trim()) ? f.image_url.trim() : null,
      suggested_amounts_cents: f.suggested_amounts_cents.filter((n) => n > 0)
    });
  }
  async function uploadCampaignImage(file) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) return toast.error("Use PNG, JPG ou WEBP.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5 MB.");
    setUploadingImg(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `donation-campaigns/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      set("image_url", pub.publicUrl);
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploadingImg(false);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4 border-primary/40", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-medium", children: f.id ? "Editar campanha" : "Nova campanha" }),
    /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Título *" }),
        /* @__PURE__ */ jsx(Input, { value: f.title, onChange: (e) => set("title", e.target.value), placeholder: "Campanha de Natal" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Imagem da campanha" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              value: f.image_url ?? "",
              onChange: (e) => set("image_url", e.target.value),
              placeholder: "https://… ou envie um arquivo",
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: imgInputRef,
              type: "file",
              accept: "image/png,image/jpeg,image/webp",
              className: "hidden",
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) uploadCampaignImage(file);
                e.target.value = "";
              }
            }
          ),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => imgInputRef.current?.click(), disabled: uploadingImg, children: uploadingImg ? "Enviando…" : "Enviar" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground mt-1", children: [
          "Recomendado: ",
          /* @__PURE__ */ jsx("strong", { children: "1200×750 px" }),
          " (proporção 16:10). Máx. 5 MB. Evite textos colados nas bordas — a miniatura é recortada e a imagem cheia abre ao clicar."
        ] }),
        f.image_url && /* @__PURE__ */ jsx("div", { className: "mt-2 rounded-md border bg-muted/40 p-2 inline-block", children: /* @__PURE__ */ jsx("img", { src: f.image_url, alt: "Prévia", className: "max-h-28 w-auto rounded object-contain" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Descrição" }),
      /* @__PURE__ */ jsx(Textarea, { value: f.description, onChange: (e) => set("description", e.target.value), rows: 3, placeholder: "Por que esta campanha existe e o que será feito com o valor." })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Dados Pix (vão para o QR Code)" }),
    /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Tipo" }),
        /* @__PURE__ */ jsxs(Select, { value: f.pix_key_type, onValueChange: (v) => set("pix_key_type", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "aleatoria", children: "Aleatória" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "cpf", children: "CPF" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "cnpj", children: "CNPJ" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "email", children: "E-mail" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "telefone", children: "Telefone" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Chave Pix *" }),
        /* @__PURE__ */ jsx(Input, { value: f.pix_key, onChange: (e) => set("pix_key", e.target.value), placeholder: "chave Pix da igreja" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Nome do recebedor *" }),
        /* @__PURE__ */ jsx(Input, { value: f.recipient_name, onChange: (e) => set("recipient_name", e.target.value), maxLength: 25, placeholder: "IGREJA EXEMPLO" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Máx 25 caracteres (padrão Pix)." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Cidade" }),
        /* @__PURE__ */ jsx(Input, { value: f.recipient_city, onChange: (e) => set("recipient_city", e.target.value.toUpperCase()), maxLength: 15 })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Meta (R$) — opcional" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "number",
            min: 0,
            step: "0.01",
            value: f.goal_cents ? (f.goal_cents / 100).toString() : "",
            onChange: (e) => set("goal_cents", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null),
            placeholder: "5000,00"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Valores sugeridos (R$)" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2 mt-1", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsx(
        Input,
        {
          type: "number",
          min: 0,
          step: "1",
          defaultValue: f.suggested_amounts_cents[i] ? (f.suggested_amounts_cents[i] / 100).toString() : "",
          onChange: (e) => setAmount(i, e.target.value),
          placeholder: ["10", "25", "50", "100"][i]
        },
        i
      )) }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "O doador também pode digitar um valor livre." })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Switch, { checked: f.active, onCheckedChange: (v) => set("active", v) }),
        " Ativa"
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Switch, { checked: f.featured, onCheckedChange: (v) => set("featured", v) }),
        " Destacar no topo"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end pt-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsxs(Button, { onClick: submit, disabled: saving, children: [
        saving && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
        "Salvar campanha"
      ] })
    ] })
  ] });
}
function PixKeyCard() {
  const qc = useQueryClient();
  const getAccount = useServerFn(getMyAccount);
  const saveSettings = useServerFn(updateAccountSettings);
  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getAccount() });
  const [pixKey, setPixKey] = useState("");
  useEffect(() => {
    setPixKey(account?.pix_key ?? "");
  }, [account]);
  const saveMut = useMutation({
    mutationFn: () => saveSettings({
      data: {
        brand_title: account?.brand_title ?? "Igreja",
        brand_empty_message: account?.brand_empty_message ?? "Sem celebrações.",
        primary_color: account?.primary_color ?? "#467da5",
        pix_key: pixKey.trim() || null
      }
    }),
    onSuccess: () => {
      toast.success("Chave Pix salva");
      qc.invalidateQueries({ queryKey: ["my-account"] });
    },
    onError: (e) => toast.error(e?.message || "Erro ao salvar")
  });
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(HandCoins, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Chave Pix principal" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Usada nas contribuições gerais da página pública. Cada campanha também pode ter sua própria chave." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(Label, { children: "Chave para recebimento" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            value: pixKey,
            onChange: (e) => setPixKey(e.target.value),
            placeholder: "CNPJ, CPF, telefone, e-mail ou chave aleatória",
            maxLength: 200
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending || !account, children: [
        saveMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
        "Salvar chave Pix"
      ] })
    ] })
  ] });
}
function FixedImageCard() {
  const qc = useQueryClient();
  const getAccount = useServerFn(getMyAccount);
  const saveSettings = useServerFn(updateAccountSettings);
  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => getAccount() });
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    setUrl(account?.donations_fixed_image_url ?? "");
  }, [account]);
  const saveMut = useMutation({
    mutationFn: (newUrl) => saveSettings({
      data: {
        brand_title: account?.brand_title ?? "Igreja",
        brand_empty_message: account?.brand_empty_message ?? "Sem celebrações.",
        primary_color: account?.primary_color ?? "#467da5",
        donations_fixed_image_url: newUrl
      }
    }),
    onSuccess: () => {
      toast.success("Imagem fixa salva");
      qc.invalidateQueries({ queryKey: ["my-account"] });
    },
    onError: (e) => toast.error(e?.message || "Erro ao salvar")
  });
  async function uploadFile(file) {
    if (!/\.(png|jpg|jpeg|webp|ico)$/i.test(file.name)) {
      toast.error("Use PNG, JPG, WEBP ou ICO.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await uploadAccountAsset({
        data: {
          folder: "donations-image",
          filename: file.name,
          contentType: file.type,
          base64
        }
      });
      setUrl(res.url);
      saveMut.mutate(res.url);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Image, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium", children: 'Imagem fixa de "Faça parte"' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Aparece como ",
          /* @__PURE__ */ jsx("strong", { children: "primeiro card fixo" }),
          ' do carrossel de "Faça parte" na home pública, antes das campanhas. As demais campanhas deslizam ao lado usando as setas do carrossel. Recomendado: ',
          /* @__PURE__ */ jsx("strong", { children: "800×500 px" }),
          " (proporção 16:10). Máx. 5 MB."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          value: url,
          onChange: (e) => setUrl(e.target.value),
          placeholder: "https://… ou envie um arquivo",
          className: "flex-1 min-w-[220px]"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          accept: "image/png,image/jpeg,image/webp",
          className: "hidden",
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => inputRef.current?.click(), disabled: uploading, children: uploading ? "Enviando…" : "Enviar arquivo" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: () => saveMut.mutate(url || null),
          disabled: saveMut.isPending || uploading,
          children: saveMut.isPending ? "Salvando…" : "Salvar"
        }
      ),
      url && /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          onClick: () => {
            setUrl("");
            saveMut.mutate(null);
          },
          disabled: saveMut.isPending,
          children: "Remover"
        }
      )
    ] }),
    url && /* @__PURE__ */ jsx("div", { className: "rounded-md border bg-muted/40 p-3 inline-block", children: /* @__PURE__ */ jsx("img", { src: url, alt: "Imagem fixa", className: "max-h-44 w-auto object-contain rounded" }) })
  ] });
}
const HIGHLIGHT_SLOTS = [{
  icon: "church",
  IconCmp: Church,
  defaultLabel: "Anos de caminhada",
  defaultSublabel: "evangelizando com fé e amor",
  placeholder: "35"
}, {
  icon: "users",
  IconCmp: Users,
  defaultLabel: "Famílias acolhidas",
  defaultSublabel: "em comunidade",
  placeholder: "2000"
}, {
  icon: "heart-handshake",
  IconCmp: HeartHandshake,
  defaultLabel: "Celebrações",
  defaultSublabel: "vividas em fé",
  placeholder: "5000"
}, {
  icon: "calendar-heart",
  IconCmp: CalendarHeart,
  defaultLabel: "Eventos realizados",
  defaultSublabel: "ao longo do ano",
  placeholder: "410"
}];
const HIGHLIGHT_ICON_OPTIONS = [{
  value: "church",
  label: "Igreja",
  Icon: Church
}, {
  value: "users",
  label: "Pessoas",
  Icon: Users
}, {
  value: "heart-handshake",
  label: "Comunhão",
  Icon: HeartHandshake
}, {
  value: "cross",
  label: "Cruz",
  Icon: Cross
}, {
  value: "sparkles",
  label: "Brilho",
  Icon: Sparkles
}, {
  value: "heart",
  label: "Coração",
  Icon: Heart
}, {
  value: "calendar-heart",
  label: "Calendário especial",
  Icon: CalendarHeart
}, {
  value: "calendar-days",
  label: "Calendário",
  Icon: CalendarDays
}, {
  value: "hand-heart",
  label: "Oração e cuidado",
  Icon: HandHeart
}, {
  value: "book-open",
  label: "Bíblia",
  Icon: BookOpen
}, {
  value: "music",
  label: "Música",
  Icon: Music
}, {
  value: "globe",
  label: "Missões",
  Icon: Globe
}, {
  value: "baby",
  label: "Família",
  Icon: Baby
}, {
  value: "home",
  label: "Casa",
  Icon: Home
}, {
  value: "flame",
  label: "Chama",
  Icon: Flame
}, {
  value: "star",
  label: "Estrela",
  Icon: Star
}];
const HIGHLIGHT_ICON_MAP = Object.fromEntries(HIGHLIGHT_ICON_OPTIONS.map((option) => [option.value, option.Icon]));
const TAB_META = {
  geral: {
    label: "Geral",
    Icon: Settings,
    desc: "Endereço público, status da página e WhatsApp."
  },
  aparencia: {
    label: "Galeria",
    Icon: Image,
    desc: "Fotos da comunidade."
  },
  slides: {
    label: "Slides",
    Icon: LayoutTemplate,
    desc: "Carrossel grande logo abaixo do menu."
  },
  destaques: {
    label: "Destaques Visuais",
    Icon: Sparkle,
    desc: "Números da comunidade com contador animado."
  },
  mensagem: {
    label: "Mensagem da semana",
    Icon: MessageSquareQuote,
    desc: "Palavra pastoral e versículo."
  },
  secoes: {
    label: "Seções visíveis",
    Icon: Eye,
    desc: "Ative ou desative módulos do site público."
  },
  noticias: {
    label: "Notícias",
    Icon: Newspaper,
    desc: "Postagens com foto, título e matéria."
  },
  midia: {
    label: "Mídia",
    Icon: Youtube,
    desc: "Vídeos do YouTube e player de áudio (SoundCloud/Spotify)."
  },
  contatos: {
    label: "Contatos & Redes",
    Icon: Share2,
    desc: "Instagram, YouTube, live, Pix e site."
  },
  doacoes: {
    label: "Doações (Pix)",
    Icon: HandCoins,
    desc: "Campanhas de doação via Pix da igreja."
  }
};
function HubEditor() {
  const getAccount = useServerFn(getMyAccount);
  const saveHub = useServerFn(updateHubSettings);
  const fetchNews = useServerFn(listMyNews);
  const saveNews = useServerFn(upsertNews);
  const removeNews = useServerFn(deleteNews);
  const signUpload = useServerFn(uploadHubAsset);
  const startIgConnect = useServerFn(startInstagramConnect);
  const fetchIgConnection = useServerFn(getInstagramConnection);
  const disconnectIg = useServerFn(disconnectInstagram);
  const qc = useQueryClient();
  useRef(null);
  const [uploading, setUploading] = useState(false);
  const galleryRef = useRef(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  useRef(null);
  const [uploadingSlide, setUploadingSlide] = useState(null);
  useRef(null);
  const [uploadingNewsImg, setUploadingNewsImg] = useState(false);
  const {
    data: account
  } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getAccount()
  });
  const {
    data: igConnection,
    refetch: refetchIg
  } = useQuery({
    queryKey: ["ig-connection"],
    queryFn: () => fetchIgConnection()
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ig = params.get("ig");
    if (!ig) return;
    if (ig === "success") {
      toast.success("Instagram conectado com sucesso!");
      refetchIg();
    } else {
      toast.error("Falha ao conectar Instagram: " + (params.get("ig_msg") || "tente novamente"));
    }
    params.delete("ig");
    params.delete("ig_msg");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
  }, []);
  const [form, setForm] = useState({
    hub_enabled: true,
    hub_bio: "",
    hub_cover_url: "",
    hub_show_agenda: true,
    hub_show_events: true,
    hub_show_prayer: true,
    hub_show_visitor: true,
    hub_show_all_locations: false,
    hub_whatsapp: "",
    hub_show_whatsapp: true,
    social_instagram: "",
    social_youtube: "",
    social_facebook: "",
    social_website: "",
    live_url: "",
    weekly_message: "",
    weekly_verse: "",
    weekly_verse_ref: "",
    gallery_urls: [],
    hub_slides: [],
    hub_highlights: [],
    media_youtube_url: "",
    media_audio_url: "",
    media_show_youtube: true,
    media_show_audio: true,
    instagram_post_count: 9,
    instagram_columns: 3
  });
  useEffect(() => {
    if (!account) return;
    setForm({
      hub_enabled: account.hub_enabled ?? true,
      hub_bio: account.hub_bio ?? "",
      hub_cover_url: account.hub_cover_url ?? "",
      hub_show_agenda: account.hub_show_agenda ?? true,
      hub_show_events: account.hub_show_events ?? true,
      hub_show_prayer: account.hub_show_prayer ?? true,
      hub_show_visitor: account.hub_show_visitor ?? true,
      hub_show_all_locations: account.hub_show_all_locations ?? false,
      hub_whatsapp: account.hub_whatsapp ?? account.visitor_whatsapp ?? "",
      hub_show_whatsapp: account.hub_show_whatsapp ?? true,
      social_instagram: account.social_instagram ?? "",
      social_youtube: account.social_youtube ?? "",
      social_facebook: account.social_facebook ?? "",
      social_website: account.social_website ?? "",
      live_url: account.live_url ?? "",
      weekly_message: account.weekly_message ?? "",
      weekly_verse: account.weekly_verse ?? "",
      weekly_verse_ref: account.weekly_verse_ref ?? "",
      gallery_urls: Array.isArray(account.gallery_urls) ? account.gallery_urls : [],
      hub_slides: Array.isArray(account.hub_slides) ? account.hub_slides.map((s) => ({
        image_url: s.image_url ?? "",
        title: s.title ?? "",
        subtitle: s.subtitle ?? "",
        cta_label: s.cta_label ?? "",
        cta_url: s.cta_url ?? "",
        title_size: ["sm", "md", "lg", "xl"].includes(s.title_size) ? s.title_size : "lg"
      })) : [],
      hub_highlights: Array.isArray(account.hub_highlights) ? account.hub_highlights.map((h) => ({
        icon: h.icon ?? "church",
        value: h.value ?? "",
        label: h.label ?? "",
        sublabel: h.sublabel ?? ""
      })) : [],
      media_youtube_url: account.media_youtube_url ?? "",
      media_audio_url: account.media_audio_url ?? "",
      media_show_youtube: account.media_show_youtube ?? true,
      media_show_audio: account.media_show_audio ?? true,
      instagram_post_count: account.instagram_post_count ?? 9,
      instagram_columns: account.instagram_columns ?? 3
    });
  }, [account]);
  const save = useMutation({
    mutationFn: () => saveHub({
      data: {
        hub_enabled: form.hub_enabled,
        hub_bio: form.hub_bio || null,
        hub_cover_url: form.hub_cover_url || null,
        hub_show_agenda: form.hub_show_agenda,
        hub_show_events: form.hub_show_events,
        hub_show_prayer: form.hub_show_prayer,
        hub_show_visitor: form.hub_show_visitor,
        hub_show_all_locations: form.hub_show_all_locations,
        social_instagram: form.social_instagram || null,
        social_youtube: form.social_youtube || null,
        social_facebook: form.social_facebook || null,
        social_website: form.social_website || null,
        live_url: form.live_url || null,
        hub_whatsapp: form.hub_whatsapp.trim() || null,
        hub_show_whatsapp: form.hub_show_whatsapp,
        weekly_message: form.weekly_message || null,
        weekly_verse: form.weekly_verse || null,
        weekly_verse_ref: form.weekly_verse_ref || null,
        gallery_urls: form.gallery_urls,
        hub_slides: form.hub_slides.filter((s) => s.image_url).map((s) => ({
          image_url: s.image_url,
          title: s.title || null,
          subtitle: s.subtitle || null,
          cta_label: s.cta_label || null,
          cta_url: s.cta_url || null,
          title_size: s.title_size || "lg"
        })),
        hub_highlights: HIGHLIGHT_SLOTS.map((slot, idx) => {
          const h = form.hub_highlights[idx];
          const num = (h?.value ?? "").trim();
          if (!num) return null;
          return {
            icon: h?.icon || slot.icon,
            value: num,
            label: (h?.label ?? "").trim() || slot.defaultLabel,
            sublabel: (h?.sublabel ?? "").trim() || slot.defaultSublabel || null
          };
        }).filter((x) => x !== null),
        media_youtube_url: form.media_youtube_url.trim() || null,
        media_audio_url: form.media_audio_url.trim() || null,
        media_show_youtube: form.media_show_youtube,
        media_show_audio: form.media_show_audio,
        instagram_post_count: form.instagram_post_count,
        instagram_columns: form.instagram_columns
      }
    }),
    onSuccess: () => {
      toast.success("Página atualizada");
      qc.invalidateQueries({
        queryKey: ["my-account"]
      });
      window.dispatchEvent(new Event("hub:refresh-preview"));
    },
    onError: (e) => toast.error(e.message)
  });
  async function uploadGallery(files) {
    if (!account) return;
    if (form.gallery_urls.length + files.length > 12) {
      toast.error("Máximo 12 fotos na galeria");
      return;
    }
    setUploadingGallery(true);
    const newUrls = [];
    const errors = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadViaServer(file, "gallery");
        newUrls.push(url);
      } catch (e) {
        console.error("uploadGallery failed for", file.name, e);
        errors.push(`${file.name}: ${e?.message || "falha"}`);
      }
    }
    if (newUrls.length) {
      setForm((f) => ({
        ...f,
        gallery_urls: [...f.gallery_urls, ...newUrls]
      }));
      toast.success(`${newUrls.length} foto(s) adicionada(s). Não esqueça de salvar.`);
    }
    if (errors.length) toast.error(errors.join(" · "));
    setUploadingGallery(false);
  }
  async function uploadSlideImage(idx, file) {
    if (!account) return;
    setUploadingSlide(idx);
    try {
      const url = await uploadViaServer(file, "slide");
      setForm((f) => ({
        ...f,
        hub_slides: f.hub_slides.map((s, i) => i === idx ? {
          ...s,
          image_url: url
        } : s)
      }));
      toast.success("Imagem do slide enviada");
    } catch (e) {
      console.error("uploadSlideImage failed", e);
      toast.error(e?.message || "Falha no upload");
    } finally {
      setUploadingSlide(null);
    }
  }
  async function uploadViaServer(file, folder) {
    if (file.size > 20 * 1024 * 1024) throw new Error("Arquivo maior que 20MB");
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result2 = String(reader.result || "");
        resolve(result2.includes(",") ? result2.split(",")[1] : result2);
      };
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });
    const result = await signUpload({
      data: {
        folder,
        filename: file.name || "upload.jpg",
        contentType: file.type || "image/jpeg",
        base64
      }
    });
    return result.url;
  }
  function addSlide() {
    if (form.hub_slides.length >= 8) {
      toast.error("Máximo 8 slides");
      return;
    }
    setForm((f) => ({
      ...f,
      hub_slides: [...f.hub_slides, {
        image_url: "",
        title: "",
        subtitle: "",
        cta_label: "",
        cta_url: "",
        title_size: "lg"
      }]
    }));
  }
  function updateSlide(i, patch) {
    setForm((f) => ({
      ...f,
      hub_slides: f.hub_slides.map((s, idx) => idx === i ? {
        ...s,
        ...patch
      } : s)
    }));
  }
  function moveSlide(i, dir) {
    setForm((f) => {
      const arr = [...f.hub_slides];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return {
        ...f,
        hub_slides: arr
      };
    });
  }
  function removeSlide(i) {
    setForm((f) => ({
      ...f,
      hub_slides: f.hub_slides.filter((_, idx) => idx !== i)
    }));
  }
  const slug = account?.custom_slug || account?.site_id;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const hubUrl = slug ? `${origin}/${slug}` : "";
  const search = useSearch({
    strict: false
  });
  useNavigate();
  const tab = search.tab || "geral";
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
        (() => {
          const M = TAB_META[tab].Icon;
          return /* @__PURE__ */ jsx(M, { className: "h-5 w-5 text-muted-foreground" });
        })(),
        TAB_META[tab].label
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: TAB_META[tab].desc })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      slug && tab === "geral" && /* @__PURE__ */ jsxs(Card, { className: "p-4 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Seu endereço público" }),
          /* @__PURE__ */ jsx("code", { className: "text-sm font-medium truncate block", children: hubUrl })
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
          navigator.clipboard.writeText(hubUrl);
          toast.success("Link copiado");
        }, children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }) }),
        /* @__PURE__ */ jsx("a", { href: hubUrl, target: "_blank", rel: "noopener", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" }) }) })
      ] }),
      tab === "geral" && /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-base", children: "Página ativa" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Quando desligado, a página retorna 404" })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: form.hub_enabled, onCheckedChange: (v) => setForm({
            ...form,
            hub_enabled: v
          }) })
        ] }),
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "WhatsApp de contato" }),
          /* @__PURE__ */ jsx(Input, { value: form.hub_whatsapp, onChange: (e) => setForm({
            ...form,
            hub_whatsapp: e.target.value
          }), placeholder: "(11) 99999-9999" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Aparece como botão flutuante verde na página da igreja." }),
          form.hub_show_whatsapp && !form.hub_whatsapp.trim() && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-600 mt-1", children: "⚠ Digite um número (com DDD) e clique em Salvar para o botão aparecer no site." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-base", children: "Mostrar botão do WhatsApp" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Exibe o ícone flutuante na página pública" })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: form.hub_show_whatsapp, onCheckedChange: (v) => setForm({
            ...form,
            hub_show_whatsapp: v
          }) })
        ] })
      ] }),
      tab === "secoes" && /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Seções visíveis na página" }),
        [["hub_show_agenda", "Agenda de celebrações"], ["hub_show_events", "Eventos com inscrição"], ["hub_show_prayer", "Pedidos de oração"], ["hub_show_visitor", "Formulário de visitantes"], ["hub_show_all_locations", "Mostrar todos os endereços na página inicial"]].map(([key, label]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { children: label }),
          /* @__PURE__ */ jsx(Switch, { checked: form[key], onCheckedChange: (v) => setForm({
            ...form,
            [key]: v
          }) })
        ] }, key))
      ] }),
      tab === "midia" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Youtube, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Últimos vídeos do YouTube" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Cole o link do seu canal. Vamos exibir os 5 vídeos mais recentes automaticamente." })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: form.media_show_youtube, onCheckedChange: (v) => setForm({
              ...form,
              media_show_youtube: v
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Link do canal" }),
            /* @__PURE__ */ jsx(Input, { value: form.media_youtube_url, onChange: (e) => setForm({
              ...form,
              media_youtube_url: e.target.value
            }), placeholder: "https://www.youtube.com/@suaigreja" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              "Aceita formatos: ",
              /* @__PURE__ */ jsx("code", { children: "youtube.com/@handle" }),
              ", ",
              /* @__PURE__ */ jsx("code", { children: "youtube.com/channel/UC..." }),
              " ou ",
              /* @__PURE__ */ jsx("code", { children: "youtube.com/c/nome" }),
              ". A lista atualiza sozinha a cada 1 hora."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Headphones, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Player de áudio" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Cole o link de um perfil/playlist do SoundCloud ou de um podcast do Spotify." })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: form.media_show_audio, onCheckedChange: (v) => setForm({
              ...form,
              media_show_audio: v
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Link do SoundCloud ou Spotify" }),
            /* @__PURE__ */ jsx(Input, { value: form.media_audio_url, onChange: (e) => setForm({
              ...form,
              media_audio_url: e.target.value
            }), placeholder: "https://soundcloud.com/suaigreja  ou  https://open.spotify.com/show/..." }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: 'Aparecerá como bloco "Nossos canais de áudio" na página pública.' })
          ] })
        ] })
      ] }),
      tab === "contatos" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-gradient-to-br from-sand to-ocean text-white", children: /* @__PURE__ */ jsx(Instagram, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Conectar Instagram" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Conecte a conta Business/Creator do Instagram da sua igreja para exibir os posts automaticamente na sua página pública." })
            ] })
          ] }),
          igConnection ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-green-600 shrink-0" }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium truncate", children: [
                  "@",
                  igConnection.username || igConnection.ig_user_id
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "Conectado · token expira em ",
                  igConnection.token_expires_at ? new Date(igConnection.token_expires_at).toLocaleDateString("pt-BR") : "—"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: async () => {
              if (!confirm("Desconectar o Instagram? Os posts deixarão de aparecer no site.")) return;
              await disconnectIg();
              toast.success("Instagram desconectado");
              refetchIg();
            }, children: [
              /* @__PURE__ */ jsx(Unlink, { className: "h-4 w-4 mr-1" }),
              " Desconectar"
            ] })
          ] }) : /* @__PURE__ */ jsxs(Button, { onClick: async () => {
            try {
              const {
                authorizationUrl
              } = await startIgConnect();
              window.location.href = authorizationUrl;
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Falha ao iniciar conexão");
            }
          }, className: "bg-gradient-to-r from-sand to-ocean hover:opacity-90 text-white", children: [
            /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4 mr-2" }),
            " Conectar Instagram"
          ] }),
          igConnection && /* @__PURE__ */ jsxs("div", { className: "mt-2 grid sm:grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Quantidade de posts" }),
              /* @__PURE__ */ jsx("select", { className: "mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm", value: form.instagram_post_count, onChange: (e) => setForm({
                ...form,
                instagram_post_count: Number(e.target.value)
              }), children: [3, 4, 6, 8, 9, 12, 15, 18, 24, 30].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                n,
                " posts"
              ] }, n)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Colunas (desktop)" }),
              /* @__PURE__ */ jsx("select", { className: "mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm", value: form.instagram_columns, onChange: (e) => setForm({
                ...form,
                instagram_columns: Number(e.target.value)
              }), children: [2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                n,
                " colunas"
              ] }, n)) }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "No celular sempre 2 colunas. Salve para aplicar." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Share2, { className: "h-4.5 w-4.5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Redes sociais e links" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Informe os endereços que serão exibidos na página pública da igreja." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Instagram" }),
              /* @__PURE__ */ jsx(Input, { value: form.social_instagram, onChange: (e) => setForm({
                ...form,
                social_instagram: e.target.value
              }), placeholder: "https://instagram.com/..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "YouTube" }),
              /* @__PURE__ */ jsx(Input, { value: form.social_youtube, onChange: (e) => setForm({
                ...form,
                social_youtube: e.target.value
              }), placeholder: "https://youtube.com/..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Facebook" }),
              /* @__PURE__ */ jsx(Input, { value: form.social_facebook, onChange: (e) => setForm({
                ...form,
                social_facebook: e.target.value
              }), placeholder: "https://facebook.com/..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Site próprio" }),
              /* @__PURE__ */ jsx(Input, { value: form.social_website, onChange: (e) => setForm({
                ...form,
                social_website: e.target.value
              }), placeholder: "https://..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Transmissão ao vivo" }),
              /* @__PURE__ */ jsx(Input, { value: form.live_url, onChange: (e) => setForm({
                ...form,
                live_url: e.target.value
              }), placeholder: "https://youtube.com/live/..." })
            ] })
          ] })
        ] })
      ] }),
      tab === "mensagem" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Versículo da semana" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Exibido em uma faixa de destaque no topo da página." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[1fr_160px] gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Versículo" }),
              /* @__PURE__ */ jsx(Textarea, { value: form.weekly_verse, onChange: (e) => setForm({
                ...form,
                weekly_verse: e.target.value
              }), placeholder: "Porque Deus amou o mundo de tal maneira...", maxLength: 500, rows: 2 })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Referência" }),
              /* @__PURE__ */ jsx(Input, { value: form.weekly_verse_ref, onChange: (e) => setForm({
                ...form,
                weekly_verse_ref: e.target.value
              }), placeholder: "João 3:16", maxLength: 100 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Palavra da semana" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Mensagem pastoral exibida em um card separado, após a galeria." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Mensagem pastoral" }),
            /* @__PURE__ */ jsx(Textarea, { value: form.weekly_message, onChange: (e) => setForm({
              ...form,
              weekly_message: e.target.value
            }), placeholder: "Uma palavra de incentivo para esta semana...", maxLength: 1e3, rows: 4 })
          ] })
        ] })
      ] }),
      tab === "aparencia" && /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Galeria de momentos" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Até 12 fotos da sua comunidade" })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => galleryRef.current?.click(), disabled: uploadingGallery || form.gallery_urls.length >= 12, children: [
            uploadingGallery ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4" }),
            "Adicionar fotos"
          ] }),
          /* @__PURE__ */ jsx("input", { ref: galleryRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => {
            const files = e.target.files;
            if (files?.length) uploadGallery(files);
            e.target.value = "";
          } })
        ] }),
        form.gallery_urls.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-6 text-center border border-dashed rounded", children: "Nenhuma foto ainda" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2", children: form.gallery_urls.map((url, i) => /* @__PURE__ */ jsxs("div", { className: "relative group aspect-square rounded overflow-hidden border", children: [
          /* @__PURE__ */ jsx("img", { src: url, alt: "", className: "w-full h-full object-cover" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setForm({
            ...form,
            gallery_urls: form.gallery_urls.filter((_, idx) => idx !== i)
          }), className: "absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
        ] }, i)) })
      ] }),
      tab === "slides" && /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Slides do topo" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Carrossel grande abaixo do menu. Até 8 imagens." })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addSlide, disabled: form.hub_slides.length >= 8, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Novo slide"
          ] })
        ] }),
        form.hub_slides.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-6 text-center border border-dashed rounded", children: "Nenhum slide. Sem slides, o hub usa a imagem de capa única." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: form.hub_slides.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "border rounded p-3 sm:p-4 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(GripVertical, { className: "h-3 w-3" }),
              " Slide ",
              i + 1
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => moveSlide(i, -1), disabled: i === 0, children: "↑" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => moveSlide(i, 1), disabled: i === form.hub_slides.length - 1, children: "↓" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeSlide(i), className: "text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[200px_1fr] gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              s.image_url ? /* @__PURE__ */ jsx("img", { src: s.image_url, alt: "", className: "w-full aspect-[16/9] object-cover rounded border" }) : /* @__PURE__ */ jsx("div", { className: "w-full aspect-[16/9] rounded border border-dashed flex items-center justify-center text-xs text-muted-foreground", children: "Sem imagem" }),
              /* @__PURE__ */ jsxs("label", { className: "mt-2 flex", children: [
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "w-full", disabled: uploadingSlide === i, asChild: true, children: /* @__PURE__ */ jsxs("span", { children: [
                  uploadingSlide === i ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                  "Enviar imagem"
                ] }) }),
                /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => e.target.files?.[0] && uploadSlideImage(i, e.target.files[0]) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Título (opcional)" }),
                /* @__PURE__ */ jsx(Input, { value: s.title, maxLength: 120, onChange: (e) => updateSlide(i, {
                  title: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Tamanho do título" }),
                /* @__PURE__ */ jsxs("select", { value: s.title_size, onChange: (e) => updateSlide(i, {
                  title_size: e.target.value
                }), className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm", children: [
                  /* @__PURE__ */ jsx("option", { value: "sm", children: "Pequeno (textos longos)" }),
                  /* @__PURE__ */ jsx("option", { value: "md", children: "Médio" }),
                  /* @__PURE__ */ jsx("option", { value: "lg", children: "Grande (padrão)" }),
                  /* @__PURE__ */ jsx("option", { value: "xl", children: "Extra grande" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Subtítulo (opcional)" }),
                /* @__PURE__ */ jsx(Input, { value: s.subtitle, maxLength: 200, onChange: (e) => updateSlide(i, {
                  subtitle: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Texto do botão" }),
                  /* @__PURE__ */ jsx(Input, { value: s.cta_label, maxLength: 40, onChange: (e) => updateSlide(i, {
                    cta_label: e.target.value
                  }), placeholder: "Saiba mais" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Link do botão" }),
                  /* @__PURE__ */ jsx(Input, { value: s.cta_url, maxLength: 500, onChange: (e) => updateSlide(i, {
                    cta_url: e.target.value
                  }), placeholder: "https://..." })
                ] })
              ] })
            ] })
          ] })
        ] }, i)) })
      ] }),
      tab === "destaques" && /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Destaques Visuais" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "4 cards fixos que aparecem no topo da página pública, com contador animado. Preencha apenas o ",
            /* @__PURE__ */ jsx("strong", { children: "número" }),
            " (ex.: ",
            /* @__PURE__ */ jsx("code", { children: "35" }),
            ", ",
            /* @__PURE__ */ jsx("code", { children: "2000" }),
            "). Se quiser, ajuste o texto. Deixe o número em branco para esconder o card."
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: HIGHLIGHT_SLOTS.map((slot, i) => {
          const h = form.hub_highlights[i] ?? {
            icon: slot.icon,
            value: "",
            label: "",
            sublabel: ""
          };
          const update = (patch) => setForm((f) => {
            const next = HIGHLIGHT_SLOTS.map((s, idx) => {
              const cur = f.hub_highlights[idx] ?? {
                icon: s.icon,
                value: "",
                label: "",
                sublabel: ""
              };
              return idx === i ? {
                ...cur,
                ...patch
              } : cur;
            });
            return {
              ...f,
              hub_highlights: next
            };
          });
          const Icon = HIGHLIGHT_ICON_MAP[h.icon] ?? slot.IconCmp;
          return /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-3 space-y-2 bg-muted/20", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", strokeWidth: 1.6 }) }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "Destaque #",
                i + 1
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Número" }),
              /* @__PURE__ */ jsx(Input, { inputMode: "numeric", value: h.value, maxLength: 10, placeholder: slot.placeholder, onChange: (e) => update({
                value: e.target.value.replace(/[^\d]/g, "").slice(0, 9)
              }) }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: 'Só números. O "+" e o contador aparecem automaticamente.' })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Ícone" }),
              /* @__PURE__ */ jsxs(Select, { value: h.icon, onValueChange: (icon) => update({
                icon
              }), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Escolha um ícone" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: HIGHLIGHT_ICON_OPTIONS.map((option) => /* @__PURE__ */ jsx(SelectItem, { value: option.value, children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(option.Icon, { className: "h-4 w-4" }),
                  option.label
                ] }) }, option.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Título" }),
              /* @__PURE__ */ jsx(Input, { value: h.label, maxLength: 60, placeholder: slot.defaultLabel, onChange: (e) => update({
                label: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Subtítulo (opcional)" }),
              /* @__PURE__ */ jsx(Input, { value: h.sublabel, maxLength: 80, placeholder: slot.defaultSublabel, onChange: (e) => update({
                sublabel: e.target.value
              }) })
            ] })
          ] }, `highlight-${i}`);
        }) })
      ] }),
      tab !== "noticias" && tab !== "doacoes" && /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 sticky bottom-4 z-10", children: [
        /* @__PURE__ */ jsx(Link, { to: "/settings", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Configurações" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "shadow-lg", children: save.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Salvar alterações" })
      ] }),
      tab === "noticias" && /* @__PURE__ */ jsx(NewsManager, { accountId: account?.id, fetchNews, saveNews, removeNews, uploadFile: uploadViaServer }),
      tab === "doacoes" && /* @__PURE__ */ jsx(DonationsManager, { slug })
    ] })
  ] }) });
}
function NewsManager({
  accountId,
  fetchNews,
  saveNews,
  removeNews,
  uploadFile
}) {
  const qc = useQueryClient();
  const {
    data: list = []
  } = useQuery({
    queryKey: ["my-news"],
    queryFn: () => fetchNews(),
    enabled: !!accountId
  });
  const empty = {
    title: "",
    subtitle: "",
    content: "",
    image_url: null,
    published: true,
    sort_order: 0
  };
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const save = useMutation({
    mutationFn: (row) => saveNews({
      data: row
    }),
    onSuccess: () => {
      toast.success("Notícia salva");
      setEditing(null);
      qc.invalidateQueries({
        queryKey: ["my-news"]
      });
      window.dispatchEvent(new Event("hub:refresh-preview"));
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: (id) => removeNews({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Notícia removida");
      qc.invalidateQueries({
        queryKey: ["my-news"]
      });
      window.dispatchEvent(new Event("hub:refresh-preview"));
    },
    onError: (e) => toast.error(e.message)
  });
  async function uploadNewsImage(file) {
    if (!accountId || !editing) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "news");
      setEditing({
        ...editing,
        image_url: url
      });
    } catch (e) {
      console.error("uploadNewsImage failed", e);
      toast.error(e?.message || "Falha no upload");
    } finally {
      setUploading(false);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-medium", children: "Notícias" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Postagens simples que aparecem no hub: foto, título, subtítulo e texto." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setEditing({
        ...empty,
        sort_order: list.length
      }), children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Nova notícia"
      ] })
    ] }),
    list.length === 0 && !editing && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-6 text-center border border-dashed rounded", children: "Nenhuma notícia ainda" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: list.map((n) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border rounded p-2", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-12 rounded bg-stone-100 overflow-hidden shrink-0", children: n.image_url && /* @__PURE__ */ jsx("img", { src: n.image_url, alt: "", className: "w-full h-full object-cover" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: n.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
          n.published ? "Publicada" : "Rascunho",
          " · ",
          n.subtitle || "—"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setEditing({
        ...n
      }), children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" }) }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", title: "Duplicar", onClick: () => setEditing({
        title: `${n.title} (cópia)`,
        subtitle: n.subtitle ?? "",
        content: n.content ?? "",
        image_url: n.image_url ?? null,
        published: false,
        sort_order: n.sort_order ?? 0
      }), children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }) }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "text-destructive", onClick: () => n.id && del.mutate(n.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
    ] }, n.id)) }),
    editing && /* @__PURE__ */ jsxs("div", { className: "border rounded p-4 space-y-3 bg-muted/30", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Imagem" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
          /* @__PURE__ */ jsx(Input, { value: editing.image_url ?? "", onChange: (e) => setEditing({
            ...editing,
            image_url: e.target.value || null
          }), placeholder: "URL da imagem" }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", disabled: uploading, onClick: () => document.getElementById("news-img-input")?.click(), children: uploading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("input", { id: "news-img-input", type: "file", accept: "image/*", className: "hidden", onChange: (e) => e.target.files?.[0] && uploadNewsImage(e.target.files[0]) })
        ] }),
        editing.image_url && /* @__PURE__ */ jsx("img", { src: editing.image_url, alt: "", className: "mt-2 w-full h-40 object-cover rounded" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Título" }),
        /* @__PURE__ */ jsx(Input, { value: editing.title, maxLength: 200, onChange: (e) => setEditing({
          ...editing,
          title: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Subtítulo" }),
        /* @__PURE__ */ jsx(Input, { value: editing.subtitle, maxLength: 300, onChange: (e) => setEditing({
          ...editing,
          subtitle: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Matéria" }),
        /* @__PURE__ */ jsx(Textarea, { value: editing.content, maxLength: 1e4, rows: 5, onChange: (e) => setEditing({
          ...editing,
          content: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Switch, { checked: editing.published, onCheckedChange: (v) => setEditing({
            ...editing,
            published: v
          }) }),
          /* @__PURE__ */ jsx(Label, { className: "text-sm", children: "Publicada" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => setEditing(null), children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { type: "button", disabled: save.isPending || !editing.title, onClick: () => save.mutate(editing), children: save.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Salvar notícia" })
        ] })
      ] })
    ] })
  ] });
}
export {
  HubEditor as component
};
