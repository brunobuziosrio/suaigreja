import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { g as getIsAdmin, A as AppShell } from "./app-shell-C3FK62C1.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BkzzJ5J4.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
import { ShieldCheck, Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { f as formatCentsBRL } from "./billing-plans-Ce8xzhRW.js";
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
import "./router-DXfKo2Q8.js";
import "./client.server-D5ro3rAQ.js";
import "@supabase/supabase-js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  name: z.string().min(1).max(160),
  tagline: z.string().max(240).default(""),
  description: z.string().max(5e3).default(""),
  price_cents: z.number().int().min(0).max(1e7),
  image_url: z.string().url().nullable().optional(),
  features: z.array(z.string().min(1).max(160)).max(20).default([]),
  external_url: z.string().url().nullable().optional(),
  badge: z.string().max(40).nullable().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(1e3).default(0)
});
const adminListProducts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("65386349d6700f5b00a7ee9ee7d31022ece5f340f6221a4ee6531310b6ddc01d"));
const adminSaveProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => productSchema.parse(i)).handler(createSsrRpc("c043c96ec360e9f56ad9697fd1e3104373e5a12cee2ad4eb5bc6073a8b10ba8f"));
const adminDeleteProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("7df71b07a4f1953c3a83b670761362b57ab987131317823f7e2c2b85c4524ea5"));
const RECOMMENDED_W = 1200;
const RECOMMENDED_H = 800;
function ImageUploadField({
  value,
  onChange
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  function readDimensions(file) {
    return new Promise((resolve, reject) => {
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
        reject(new Error("Falha ao ler imagem"));
      };
      img.src = url;
    });
  }
  async function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB.");
      return;
    }
    setUploading(true);
    try {
      const dims = await readDimensions(file).catch(() => null);
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const {
        error: upErr
      } = await supabase.storage.from("product-images").upload(path, file, {
        upsert: false,
        contentType: file.type
      });
      if (upErr) throw upErr;
      const {
        data: pub
      } = supabase.storage.from("product-images").getPublicUrl(path);
      const finalUrl = dims ? `${pub.publicUrl}?dim=${dims.w}x${dims.h}` : pub.publicUrl;
      onChange(finalUrl);
      toast.success(dims ? `Imagem enviada (${dims.w}×${dims.h}px)` : "Imagem enviada");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }
  const dimMatch = value.match(/[?&]dim=(\d+)x(\d+)/);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { value, onChange: (e) => onChange(e.target.value), placeholder: "https://… ou envie um arquivo" }),
      /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
        e.target.value = "";
      } }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => inputRef.current?.click(), disabled: uploading, children: uploading ? "Enviando…" : "Enviar" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Tamanho recomendado: ",
      /* @__PURE__ */ jsxs("strong", { children: [
        RECOMMENDED_W,
        "×",
        RECOMMENDED_H,
        "px"
      ] }),
      " (proporção 3:2, máx 5MB).",
      dimMatch && /* @__PURE__ */ jsxs(Fragment, { children: [
        " ",
        "Atual: ",
        /* @__PURE__ */ jsxs("strong", { children: [
          dimMatch[1],
          "×",
          dimMatch[2],
          "px"
        ] }),
        "."
      ] })
    ] }),
    value && !dimMatch && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Dica: anexe ",
      /* @__PURE__ */ jsx("code", { children: "?dim=LARGURAxALTURA" }),
      " ao final do link para registrar o tamanho."
    ] }),
    value && /* @__PURE__ */ jsx("img", { src: value, alt: "Pré-visualização", className: "mt-2 max-h-32 rounded-md border object-cover" })
  ] });
}
const empty = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price_brl: "0",
  image_url: "",
  features: "",
  external_url: "",
  badge: "",
  active: true,
  featured: false,
  sort_order: 0
};
function parsePriceToCents(v) {
  const cleaned = v.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}
function AdminProductsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const list = useServerFn(adminListProducts);
  const save = useServerFn(adminSaveProduct);
  const del = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();
  const {
    data: adminCheck,
    isLoading: checking
  } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin()
  });
  const isAdmin = !!adminCheck?.isAdmin;
  const {
    data: products = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => list(),
    enabled: isAdmin
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const saveMut = useMutation({
    mutationFn: (f) => save({
      data: {
        id: f.id,
        slug: f.slug,
        name: f.name,
        tagline: f.tagline,
        description: f.description,
        price_cents: parsePriceToCents(f.price_brl),
        image_url: f.image_url || null,
        features: f.features.split("\n").map((s) => s.trim()).filter(Boolean),
        external_url: f.external_url || null,
        badge: f.badge || null,
        active: f.active,
        featured: f.featured,
        sort_order: Number(f.sort_order) || 0
      }
    }),
    onSuccess: () => {
      toast.success("Produto salvo");
      setOpen(false);
      qc.invalidateQueries({
        queryKey: ["admin-products"]
      });
      qc.invalidateQueries({
        queryKey: ["marketplace-products"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const delMut = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Produto removido");
      qc.invalidateQueries({
        queryKey: ["admin-products"]
      });
      qc.invalidateQueries({
        queryKey: ["marketplace-products"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  function openNew() {
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p) {
    setForm({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      price_brl: (p.price_cents / 100).toFixed(2).replace(".", ","),
      image_url: p.image_url ?? "",
      features: Array.isArray(p.features) ? p.features.join("\n") : "",
      external_url: p.external_url ?? "",
      badge: p.badge ?? "",
      active: p.active,
      featured: p.featured,
      sort_order: p.sort_order
    });
    setOpen(true);
  }
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
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Package, { className: "h-6 w-6" }),
          " Produtos"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cadastre plugins e módulos extras que aparecerão no marketplace dos usuários." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: openNew, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Novo produto"
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Nome" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Slug" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Preço" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-[140px]" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        isLoading && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, className: "py-8 text-center text-sm text-muted-foreground", children: "Carregando…" }) }),
        !isLoading && products.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, className: "py-8 text-center text-sm text-muted-foreground", children: "Nenhum produto cadastrado." }) }),
        products.map((p) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxs(TableCell, { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: p.name }),
            p.tagline && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground line-clamp-1", children: p.tagline })
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs", children: p.slug }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right tabular-nums", children: formatCentsBRL(p.price_cents) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsx(Badge, { variant: p.active ? "default" : "outline", children: p.active ? "Ativo" : "Inativo" }),
            p.featured && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Destaque" })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1 justify-end", children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(p), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              if (confirm(`Excluir "${p.name}"?`)) delMut.mutate(p.id);
            }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) })
        ] }, p.id))
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar produto" : "Novo produto" }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Nome" }),
            /* @__PURE__ */ jsx(Input, { value: form.name, onChange: (e) => setForm({
              ...form,
              name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Slug (URL)" }),
            /* @__PURE__ */ jsx(Input, { value: form.slug, onChange: (e) => setForm({
              ...form,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
            }), placeholder: "plugin-liturgia" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Frase curta (tagline)" }),
          /* @__PURE__ */ jsx(Input, { value: form.tagline, onChange: (e) => setForm({
            ...form,
            tagline: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Descrição completa" }),
          /* @__PURE__ */ jsx(Textarea, { rows: 5, value: form.description, onChange: (e) => setForm({
            ...form,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Recursos (um por linha)" }),
          /* @__PURE__ */ jsx(Textarea, { rows: 4, value: form.features, onChange: (e) => setForm({
            ...form,
            features: e.target.value
          }), placeholder: "Liturgia do dia\nLeituras automáticas\nCompatível com WordPress" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Preço (R$)" }),
            /* @__PURE__ */ jsx(Input, { value: form.price_brl, onChange: (e) => setForm({
              ...form,
              price_brl: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Ordem" }),
            /* @__PURE__ */ jsx(Input, { type: "number", value: form.sort_order, onChange: (e) => setForm({
              ...form,
              sort_order: Number(e.target.value)
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "URL da imagem de capa" }),
          /* @__PURE__ */ jsx(ImageUploadField, { value: form.image_url, onChange: (url) => setForm({
            ...form,
            image_url: url
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Link externo (opcional)" }),
          /* @__PURE__ */ jsx(Input, { value: form.external_url, onChange: (e) => setForm({
            ...form,
            external_url: e.target.value
          }), placeholder: "https://…" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: 'Etiqueta (ex: "Novo")' }),
          /* @__PURE__ */ jsx(Input, { value: form.badge, onChange: (e) => setForm({
            ...form,
            badge: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx(Switch, { checked: form.active, onCheckedChange: (v) => setForm({
              ...form,
              active: v
            }) }),
            " Ativo"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx(Switch, { checked: form.featured, onCheckedChange: (v) => setForm({
              ...form,
              featured: v
            }) }),
            " Destaque"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancelar" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => saveMut.mutate(form), disabled: saveMut.isPending, children: saveMut.isPending ? "Salvando…" : "Salvar" })
      ] })
    ] }) })
  ] }) });
}
export {
  AdminProductsPage as component
};
