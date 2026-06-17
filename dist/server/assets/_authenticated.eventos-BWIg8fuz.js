import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CIsAgqhg.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { C as listEventPages, D as saveEventPage, E as deleteEventPage, u as useAuth, F as listEventRegistrations, G as getRegistrationPayment } from "./router-BudgN2VI.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BkzzJ5J4.js";
import { CalendarHeart, Plus, ChevronDown, ChevronRight, Users, Copy, ExternalLink, Pencil, Trash2, QrCode } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { f as formatCentsBRL } from "./billing-plans-Ce8xzhRW.js";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { I as ImageCropDialog } from "./image-crop-dialog-BkYSBCaV.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
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
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "react-easy-crop";
import "@radix-ui/react-slider";
const EMPTY_FORM = {
  id: void 0,
  title: "",
  description: "",
  cover_image_url: "",
  event_date: "",
  start_time: "19:00",
  end_time: "",
  location_name: "",
  location_address: "",
  price_cents: 0,
  max_attendees: "",
  allow_free: true,
  active: true,
  primary_color: "#467da5",
  whatsapp_contact: "",
  slug: ""
};
function CoverUpload({
  value,
  onChange,
  userId
}) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  function onPick(file) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 10MB");
      return;
    }
    const r = new FileReader();
    r.onload = () => setCropSrc(r.result);
    r.readAsDataURL(file);
  }
  async function uploadBlob(blob) {
    if (!userId) {
      toast.error("Sessão expirada. Recarregue a página.");
      return;
    }
    setUploading(true);
    const path = `${userId}/${Date.now()}.jpg`;
    const {
      error
    } = await supabase.storage.from("event-covers").upload(path, blob, {
      upsert: false,
      contentType: "image/jpeg"
    });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const {
      data
    } = supabase.storage.from("event-covers").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    setCropSrc(null);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(Label, { children: "Imagem de capa (proporção 4:5 - retrato, recomendado 1080×1350)" }),
    value && /* @__PURE__ */ jsx("img", { src: value, alt: "", className: "w-full max-w-xs aspect-[4/5] object-cover rounded border" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx("input", { ref, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
        const f = e.target.files?.[0];
        if (f) onPick(f);
        e.target.value = "";
      } }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => ref.current?.click(), disabled: uploading, children: uploading ? "Enviando..." : value ? "Trocar imagem" : "Enviar imagem" }),
      value && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => onChange(""), children: "Remover" })
    ] }),
    /* @__PURE__ */ jsx(ImageCropDialog, { open: !!cropSrc, imageSrc: cropSrc, aspect: 4 / 5, onCancel: () => setCropSrc(null), onConfirm: uploadBlob })
  ] });
}
function EventosPage() {
  const list = useServerFn(listEventPages);
  const save = useServerFn(saveEventPage);
  const remove = useServerFn(deleteEventPage);
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const {
    data: events = [],
    isLoading
  } = useQuery({
    queryKey: ["event-pages"],
    queryFn: () => list()
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState(null);
  const saveMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        title: form.title,
        description: form.description,
        cover_image_url: form.cover_image_url || null,
        event_date: form.event_date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        location_name: form.location_name,
        location_address: form.location_address || null,
        price_cents: Number(form.price_cents) || 0,
        max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
        allow_free: form.allow_free,
        active: form.active,
        primary_color: form.primary_color || "#467da5",
        whatsapp_contact: form.whatsapp_contact || null,
        slug: form.slug || void 0
      }
    }),
    onSuccess: () => {
      toast.success(form.id ? "Evento atualizado" : "Evento criado");
      setOpen(false);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({
        queryKey: ["event-pages"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const delMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Evento excluído");
      qc.invalidateQueries({
        queryKey: ["event-pages"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  function openCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }
  function openEdit(e) {
    setForm({
      id: e.id,
      title: e.title,
      description: e.description,
      cover_image_url: e.cover_image_url ?? "",
      event_date: e.event_date,
      start_time: e.start_time,
      end_time: e.end_time ?? "",
      location_name: e.location_name,
      location_address: e.location_address ?? "",
      price_cents: e.price_cents,
      max_attendees: e.max_attendees ? String(e.max_attendees) : "",
      allow_free: e.allow_free,
      active: e.active,
      primary_color: e.primary_color,
      whatsapp_contact: e.whatsapp_contact ?? "",
      slug: e.slug
    });
    setOpen(true);
  }
  const userId = user?.id ?? "";
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CalendarHeart, { className: "h-6 w-6" }),
            "Páginas de Eventos"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Crie landings públicas para retiros, festas e celebrações com inscrição online e pagamento por PIX." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          " Novo evento"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Evento" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Data" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Preço" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Inscritos" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          isLoading && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "Carregando..." }) }),
          !isLoading && events.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: 'Nenhum evento ainda. Clique em "Novo evento" para começar.' }) }),
          events.map((e) => {
            const url = `${window.location.origin}/e/${e.slug}`;
            const isOpen = expanded === e.id;
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setExpanded(isOpen ? null : e.id), className: "mt-0.5 text-muted-foreground hover:text-foreground", title: isOpen ? "Recolher" : "Ver inscritos", children: isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium", children: e.title }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                      "/",
                      e.slug
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: e.event_date }),
                /* @__PURE__ */ jsx(TableCell, { children: e.price_cents > 0 ? formatCentsBRL(e.price_cents) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Grátis" }) }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("button", { className: "text-sm underline-offset-2 hover:underline flex items-center gap-1", onClick: () => setExpanded(isOpen ? null : e.id), children: [
                  /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
                  e._counts.paid,
                  " pagos / ",
                  e._counts.total,
                  " total"
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { children: e.active ? /* @__PURE__ */ jsx(Badge, { children: "Ativo" }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Inativo" }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
                  /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                    navigator.clipboard.writeText(url);
                    toast.success("Link copiado!");
                  }, title: "Copiar link", children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsx("a", { href: `/e/${e.slug}`, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", title: "Abrir", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }) }),
                  /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(e), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                    if (confirm(`Excluir "${e.title}"? Isso remove também os inscritos.`)) delMut.mutate(e.id);
                  }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
                ] }) })
              ] }, e.id),
              isOpen && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "bg-muted/30", children: /* @__PURE__ */ jsx(RegistrationsList, { eventPageId: e.id }) }) }, e.id + "-exp")
            ] });
          })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar evento" : "Novo evento" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Título" }),
          /* @__PURE__ */ jsx(Input, { value: form.title, onChange: (e) => setForm({
            ...form,
            title: e.target.value
          }), placeholder: "Festa da Padroeira 2026" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Descrição" }),
          /* @__PURE__ */ jsx(Textarea, { rows: 4, value: form.description, onChange: (e) => setForm({
            ...form,
            description: e.target.value
          }), placeholder: "O que vai acontecer, programação, o que levar..." })
        ] }),
        /* @__PURE__ */ jsx(CoverUpload, { value: form.cover_image_url, onChange: (url) => setForm({
          ...form,
          cover_image_url: url
        }), userId }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Data" }),
            /* @__PURE__ */ jsx(Input, { type: "date", value: form.event_date, onChange: (e) => setForm({
              ...form,
              event_date: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Início" }),
            /* @__PURE__ */ jsx(Input, { type: "time", value: form.start_time, onChange: (e) => setForm({
              ...form,
              start_time: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Fim (opcional)" }),
            /* @__PURE__ */ jsx(Input, { type: "time", value: form.end_time, onChange: (e) => setForm({
              ...form,
              end_time: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Local" }),
            /* @__PURE__ */ jsx(Input, { value: form.location_name, onChange: (e) => setForm({
              ...form,
              location_name: e.target.value
            }), placeholder: "Igreja Matriz" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Endereço" }),
            /* @__PURE__ */ jsx(Input, { value: form.location_address, onChange: (e) => setForm({
              ...form,
              location_address: e.target.value
            }), placeholder: "Rua X, 100" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Preço (R$)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: "0.01", value: (form.price_cents / 100).toString(), onChange: (e) => setForm({
              ...form,
              price_cents: Math.round(Number(e.target.value) * 100)
            }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "0 = gratuito" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Vagas máx." }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 0, value: form.max_attendees, onChange: (e) => setForm({
              ...form,
              max_attendees: e.target.value
            }), placeholder: "Ilimitado" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Cor" }),
            /* @__PURE__ */ jsx(Input, { type: "color", value: form.primary_color, onChange: (e) => setForm({
              ...form,
              primary_color: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "WhatsApp de contato (opcional)" }),
          /* @__PURE__ */ jsx(Input, { value: form.whatsapp_contact, onChange: (e) => setForm({
            ...form,
            whatsapp_contact: e.target.value
          }), placeholder: "(11) 99999-9999" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Slug (URL)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "/e/" }),
            /* @__PURE__ */ jsx(Input, { value: form.slug, onChange: (e) => setForm({
              ...form,
              slug: e.target.value
            }), placeholder: "auto a partir do título" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Switch, { checked: form.active, onCheckedChange: (v) => setForm({
            ...form,
            active: v
          }) }),
          /* @__PURE__ */ jsx(Label, { className: "!m-0", children: "Página pública ativa" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending || !form.title || !form.event_date, children: saveMut.isPending ? "Salvando..." : "Salvar" })
      ] })
    ] }) })
  ] });
}
function RegistrationsList({
  eventPageId
}) {
  const list = useServerFn(listEventRegistrations);
  const getPay = useServerFn(getRegistrationPayment);
  const {
    data: regs = [],
    isLoading
  } = useQuery({
    queryKey: ["event-regs", eventPageId],
    queryFn: () => list({
      data: {
        eventPageId
      }
    })
  });
  const [payOpen, setPayOpen] = useState(null);
  const {
    data: pay
  } = useQuery({
    queryKey: ["reg-pay", payOpen?.id],
    queryFn: () => getPay({
      data: {
        registrationId: payOpen.id
      }
    }),
    enabled: !!payOpen
  });
  if (isLoading) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." });
  if (regs.length === 0) return /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum inscrito ainda." });
  return /* @__PURE__ */ jsxs("div", { className: "max-h-[60vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Nome" }),
        /* @__PURE__ */ jsx(TableHead, { children: "E-mail" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Telefone" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Valor" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: regs.map((r) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: r.name }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: r.email }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: r.phone ?? "—" }),
        /* @__PURE__ */ jsx(TableCell, { children: r.status === "paid" || r.status === "confirmed" ? /* @__PURE__ */ jsx(Badge, { children: "Confirmado" }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: r.status }) }),
        /* @__PURE__ */ jsx(TableCell, { children: r.amount_cents > 0 ? formatCentsBRL(r.amount_cents) : "—" }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: r.amount_cents > 0 && r.status !== "paid" && r.status !== "confirmed" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setPayOpen({
          id: r.id,
          name: r.name
        }), children: [
          /* @__PURE__ */ jsx(QrCode, { className: "h-3.5 w-3.5 mr-1" }),
          " Enviar PIX"
        ] }) })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!payOpen, onOpenChange: (v) => !v && setPayOpen(null), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
        "PIX · ",
        payOpen?.name
      ] }) }),
      !pay ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }) : !pay.copyPaste ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Não há PIX gerado para esta inscrição. Peça ao inscrito que refaça a inscrição na página pública." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        pay.qrCodeImage && /* @__PURE__ */ jsx("img", { src: pay.qrCodeImage, alt: "QR", className: "w-56 h-56 mx-auto" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Copia e cola" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
            /* @__PURE__ */ jsx(Input, { readOnly: true, value: pay.copyPaste, className: "font-mono text-xs" }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => {
              navigator.clipboard.writeText(pay.copyPaste);
              toast.success("Copiado!");
            }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
          ] })
        ] }),
        pay.payUrl && /* @__PURE__ */ jsx("a", { href: pay.payUrl, target: "_blank", rel: "noreferrer", className: "text-sm underline text-primary", children: "Abrir página de pagamento ↗" })
      ] })
    ] }) })
  ] });
}
export {
  EventosPage as component
};
