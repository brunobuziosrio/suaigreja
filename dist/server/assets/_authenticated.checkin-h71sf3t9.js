import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { l as listCheckinSessions, u as upsertCheckinSession, d as deleteCheckinSession, a as listCheckinEntries } from "./checkin.functions-D0d-xXvw.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { QrCode, Plus, Users, Pencil, Trash2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
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
import "./router-DXfKo2Q8.js";
import "./client-DVtn2Z4s.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
function CheckinPage() {
  const list = useServerFn(listCheckinSessions);
  const upsert = useServerFn(upsertCheckinSession);
  const del = useServerFn(deleteCheckinSession);
  const listEntries = useServerFn(listCheckinEntries);
  const qc = useQueryClient();
  const {
    data: sessions = []
  } = useQuery({
    queryKey: ["checkin_sessions"],
    queryFn: () => list()
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [qrFor, setQrFor] = useState(null);
  const [qrData, setQrData] = useState("");
  const [entriesFor, setEntriesFor] = useState(null);
  const {
    data: entries = []
  } = useQuery({
    queryKey: ["checkin_entries", entriesFor?.id],
    queryFn: () => listEntries({
      data: {
        session_id: entriesFor.id
      }
    }),
    enabled: !!entriesFor
  });
  const save = useMutation({
    mutationFn: (p) => upsert({
      data: p
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["checkin_sessions"]
      });
      setOpen(false);
      toast.success("Salvo");
    },
    onError: (e) => toast.error(e.message)
  });
  const remove = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["checkin_sessions"]
      });
      toast.success("Removido");
    }
  });
  async function showQr(s) {
    const url = `${window.location.origin}/checkin/${s.id}`;
    const data = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2
    });
    setQrData(data);
    setQrFor({
      ...s,
      url
    });
  }
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(QrCode, { className: "h-6 w-6" }),
          " Check-in de Cultos"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Crie uma sessão por culto e mostre o QR Code na entrada para registrar presenças." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        " Nova sessão"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      sessions.map((s) => /* @__PURE__ */ jsxs(Card, { className: "p-4 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: s.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              (/* @__PURE__ */ new Date(s.session_date + "T00:00:00")).toLocaleDateString("pt-BR"),
              " ",
              s.start_time?.slice(0, 5)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => showQr(s), children: /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEntriesFor(s), children: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              setEditing(s);
              setOpen(true);
            }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => confirm("Remover?") && remove.mutate(s.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }),
        !s.active && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Encerrada" })
      ] }, s.id)),
      sessions.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma sessão criada." })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Editar sessão" : "Nova sessão de check-in" }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        save.mutate({
          id: editing?.id,
          title: f.get("title"),
          session_date: f.get("session_date"),
          start_time: f.get("start_time") || null,
          notes: f.get("notes") || null,
          active: f.get("active") === "on"
        });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Título*" }),
          /* @__PURE__ */ jsx(Input, { name: "title", required: true, defaultValue: editing?.title, placeholder: "Culto de Domingo" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Data*" }),
            /* @__PURE__ */ jsx(Input, { name: "session_date", type: "date", required: true, defaultValue: editing?.session_date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Horário" }),
            /* @__PURE__ */ jsx(Input, { name: "start_time", type: "time", defaultValue: editing?.start_time?.slice(0, 5) ?? "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Observações" }),
          /* @__PURE__ */ jsx(Input, { name: "notes", defaultValue: editing?.notes ?? "" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Switch, { name: "active", defaultChecked: editing ? editing.active : true }),
          " ",
          /* @__PURE__ */ jsx(Label, { children: "Ativa (aceita check-ins)" })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: save.isPending, children: "Salvar" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!qrFor, onOpenChange: (o) => !o && setQrFor(null), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
        qrFor?.title,
        " — QR Code"
      ] }) }),
      qrData && /* @__PURE__ */ jsx("img", { src: qrData, alt: "QR", className: "mx-auto" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Input, { readOnly: true, value: qrFor?.url ?? "" }),
        /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => {
          navigator.clipboard.writeText(qrFor?.url ?? "");
          toast.success("Copiado");
        }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", asChild: true, children: /* @__PURE__ */ jsx("a", { href: qrFor?.url, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }) })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => window.print(), children: "Imprimir" })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!entriesFor, onOpenChange: (o) => !o && setEntriesFor(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
        entriesFor?.title,
        " — Presenças (",
        entries.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "max-h-[60vh] overflow-y-auto space-y-2", children: [
        entries.map((e) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-2 border rounded", children: [
          e.members?.photo_url && /* @__PURE__ */ jsx("img", { src: e.members.photo_url, className: "h-8 w-8 rounded-full object-cover" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: e.members?.full_name ?? e.visitor_name ?? "Visitante" }),
            e.visitor_phone && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: e.visitor_phone })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(e.checked_in_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          }) })
        ] }, e.id)),
        entries.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma presença ainda." })
      ] })
    ] }) })
  ] }) });
}
export {
  CheckinPage as component
};
