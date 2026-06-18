import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { m as listVisitors, n as updateVisitorStatus, o as updateVisitorNotes, q as deleteVisitor, t as getVisitorSettings, v as saveVisitorSettings } from "./router-DXfKo2Q8.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { UserPlus, QrCode, Phone, Mail, MessageCircle, Check, Archive, Trash2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
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
import "./client-DVtn2Z4s.js";
import "@radix-ui/react-collapsible";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
function VisitantesPage() {
  const list = useServerFn(listVisitors);
  const upd = useServerFn(updateVisitorStatus);
  const updNotes = useServerFn(updateVisitorNotes);
  const del = useServerFn(deleteVisitor);
  const getCfg = useServerFn(getVisitorSettings);
  const saveCfg = useServerFn(saveVisitorSettings);
  const qc = useQueryClient();
  const {
    data: visitors = [],
    isLoading
  } = useQuery({
    queryKey: ["visitors"],
    queryFn: () => list()
  });
  const {
    data: cfg
  } = useQuery({
    queryKey: ["visitor-cfg"],
    queryFn: () => getCfg()
  });
  const [tab, setTab] = useState("new");
  const [qrOpen, setQrOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false);
  const updMut = useMutation({
    mutationFn: (v) => upd({
      data: v
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["visitors"]
    })
  });
  const delMut = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({
        queryKey: ["visitors"]
      });
    }
  });
  const filtered = visitors.filter((v) => v.status === tab);
  const counts = {
    new: visitors.filter((v) => v.status === "new").length,
    contacted: visitors.filter((v) => v.status === "contacted").length,
    member: visitors.filter((v) => v.status === "member").length,
    archived: visitors.filter((v) => v.status === "archived").length
  };
  const siteSlug = cfg?.custom_slug || cfg?.site_id || "";
  const publicUrl = siteSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/v/${siteSlug}` : "";
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(UserPlus, { className: "h-6 w-6" }),
            " Visitantes"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Imprima o QR Code e coloque na entrada da igreja. Os visitantes preenchem em segundos." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setCfgOpen(true), children: "Configurações" }),
          /* @__PURE__ */ jsxs(Button, { onClick: () => setQrOpen(true), disabled: !publicUrl, children: [
            /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4 mr-2" }),
            " Gerar QR Code"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
        /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxs(TabsTrigger, { value: "new", children: [
            "Novos (",
            counts.new,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(TabsTrigger, { value: "contacted", children: [
            "Contatados (",
            counts.contacted,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(TabsTrigger, { value: "member", children: [
            "Membros (",
            counts.member,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(TabsTrigger, { value: "archived", children: [
            "Arquivados (",
            counts.archived,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(TabsContent, { value: tab, className: "mt-4 space-y-3", children: [
          isLoading && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }),
          !isLoading && filtered.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-8 text-center text-sm text-muted-foreground", children: "Nenhum visitante nesta caixa." }),
          filtered.map((v) => /* @__PURE__ */ jsx(VisitorCard, { v, onStatus: (s) => updMut.mutate({
            id: v.id,
            status: s
          }), onDelete: () => confirm("Excluir definitivamente?") && delMut.mutate(v.id), onSaveNotes: async (notes) => {
            await updNotes({
              data: {
                id: v.id,
                notes
              }
            });
            toast.success("Anotação salva");
            qc.invalidateQueries({
              queryKey: ["visitors"]
            });
          } }, v.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(QrDialog, { open: qrOpen, url: publicUrl, title: cfg?.brand_title ?? "Visitantes", onClose: () => setQrOpen(false) }),
    /* @__PURE__ */ jsx(SettingsDialog, { open: cfgOpen, initial: {
      visitor_whatsapp: cfg?.visitor_whatsapp ?? "",
      visitor_welcome_message: cfg?.visitor_welcome_message ?? ""
    }, onSave: async (v) => {
      await saveCfg({
        data: v
      });
      toast.success("Salvo");
      qc.invalidateQueries({
        queryKey: ["visitor-cfg"]
      });
      setCfgOpen(false);
    }, onClose: () => setCfgOpen(false) })
  ] });
}
function VisitorCard({
  v,
  onStatus,
  onDelete,
  onSaveNotes
}) {
  const [notes, setNotes] = useState(v.notes ?? "");
  const waLink = v.phone ? `https://wa.me/55${v.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${v.name.split(" ")[0]}! Que alegria conhecer você na nossa igreja. 🙏`)}` : null;
  return /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: v.name }),
          v.is_first_time && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "1ª vez" }),
          v.age_range && /* @__PURE__ */ jsx(Badge, { variant: "outline", children: v.age_range }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(v.created_at).toLocaleString("pt-BR") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1 flex flex-wrap gap-3", children: [
          v.phone && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
            " ",
            v.phone
          ] }),
          v.email && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }),
            " ",
            v.email
          ] }),
          v.how_found && /* @__PURE__ */ jsxs("span", { children: [
            "· Conheceu por: ",
            v.how_found
          ] })
        ] }),
        v.prayer_request && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm bg-muted/40 rounded p-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Pedido" }),
          /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap", children: v.prayer_request })
        ] }),
        !v.allow_contact && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-600 mt-1", children: "⚠ Não autorizou contato" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 shrink-0", children: [
        waLink && v.allow_contact && /* @__PURE__ */ jsx("a", { href: waLink, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "w-full", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 mr-1" }),
          " WhatsApp"
        ] }) }),
        v.status !== "contacted" && v.status !== "member" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => onStatus("contacted"), children: [
          /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mr-1" }),
          " Contatado"
        ] }),
        v.status !== "member" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => onStatus("member"), children: [
          /* @__PURE__ */ jsx(UserPlus, { className: "h-3.5 w-3.5 mr-1" }),
          " Tornou membro"
        ] }),
        v.status !== "archived" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => onStatus("archived"), children: [
          /* @__PURE__ */ jsx(Archive, { className: "h-3.5 w-3.5 mr-1" }),
          " Arquivar"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: onDelete, children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
          " Excluir"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
      /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Anotações internas (visitas, follow-up...)", value: notes, onChange: (e) => setNotes(e.target.value) }),
      notes !== (v.notes ?? "") && /* @__PURE__ */ jsx(Button, { size: "sm", className: "mt-2", onClick: () => onSaveNotes(notes), children: "Salvar anotação" })
    ] })
  ] });
}
function QrDialog({
  open,
  url,
  title,
  onClose
}) {
  const [dataUrl, setDataUrl] = useState("");
  const canvasRef = useRef(null);
  useEffect(() => {
    if (open && url) {
      QRCode.toDataURL(url, {
        width: 600,
        margin: 2
      }).then(setDataUrl);
    }
  }, [open, url]);
  const download = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-visitantes-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };
  const printIt = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`
      <html><head><title>QR Visitantes · ${title}</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 60px 20px; }
        h1 { font-size: 28px; margin: 0 0 8px; }
        h2 { font-size: 18px; color: #555; margin: 0 0 32px; font-weight: 500; }
        img { width: 360px; height: 360px; }
        p { font-size: 14px; color: #888; margin-top: 24px; }
        .url { font-family: monospace; font-size: 12px; word-break: break-all; }
      </style></head><body>
        <h1>Bem-vindo(a) à ${title}! 🙏</h1>
        <h2>Aponte sua câmera para o QR Code abaixo</h2>
        <img src="${dataUrl}" />
        <p>Conte pra gente um pouquinho sobre você</p>
        <p class="url">${url}</p>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "QR Code de Visitantes" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 py-2", ref: canvasRef, children: [
      dataUrl ? /* @__PURE__ */ jsx("img", { src: dataUrl, alt: "QR Code", className: "w-64 h-64 border rounded" }) : /* @__PURE__ */ jsx("div", { className: "w-64 h-64 bg-muted animate-pulse rounded" }),
      /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Link público" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
          /* @__PURE__ */ jsx(Input, { readOnly: true, value: url, className: "text-xs" }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => {
            navigator.clipboard.writeText(url);
            toast.success("Copiado!");
          }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: download, className: "flex-1", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
        " Baixar PNG"
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: printIt, className: "flex-1", children: "Imprimir cartaz" })
    ] })
  ] }) });
}
function SettingsDialog({
  open,
  initial,
  onSave,
  onClose
}) {
  const [form, setForm] = useState(initial);
  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);
  useEffect(() => setForm(initial), [initialKey]);
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Configurações de visitantes" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "WhatsApp do pastor / recepção (opcional)" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "(11) 99999-9999", value: form.visitor_whatsapp, onChange: (e) => setForm({
          ...form,
          visitor_whatsapp: e.target.value
        }) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Será usado para mensagens rápidas via WhatsApp." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Mensagem de boas-vindas exibida no final do formulário" }),
        /* @__PURE__ */ jsx(Textarea, { rows: 3, value: form.visitor_welcome_message, onChange: (e) => setForm({
          ...form,
          visitor_welcome_message: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => onSave(form), children: "Salvar" })
    ] })
  ] }) });
}
export {
  VisitantesPage as component
};
