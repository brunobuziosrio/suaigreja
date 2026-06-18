import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z as listMembers } from "./router-DXfKo2Q8.js";
import { g as getMyAccount } from "./account.functions-Bj1OS5Ft.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { Plus, Loader2, FileText, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "@radix-ui/react-collapsible";
import "./client.server-D5ro3rAQ.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
const listDocumentTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("efa320aa986ffda6055cc767266f5037639f55c6e8656b7adda87bd9abdd9523"));
const listMemberDocuments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cf9dc24cd8709d1b7e869e41282d21a3d35b9a81ee128142a78e931b606c4754"));
const issueSchema = z.object({
  id: z.string().uuid().optional(),
  template_id: z.string().uuid().nullable().optional(),
  member_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1e4),
  issued_at: z.string().optional()
});
const upsertMemberDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => issueSchema.parse(i)).handler(createSsrRpc("2ea37dbf5f02b1cc4bb63189b76a5fcc02ad4305f527ac76edf77953726625cd"));
const deleteMemberDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("7d82a60efe5bf0af48533cb674c02701532d3f0f452109a357478871ae420b25"));
function renderTemplate(body, vars) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v == null ? "" : String(v);
  });
}
function DocsPage() {
  const qc = useQueryClient();
  const fetchTpl = useServerFn(listDocumentTemplates);
  const fetchDocs = useServerFn(listMemberDocuments);
  const fetchMembers = useServerFn(listMembers);
  const fetchAccount = useServerFn(getMyAccount);
  const save = useServerFn(upsertMemberDocument);
  const remove = useServerFn(deleteMemberDocument);
  const {
    data: templates = []
  } = useQuery({
    queryKey: ["doc-templates"],
    queryFn: () => fetchTpl()
  });
  const {
    data: docs = [],
    isLoading
  } = useQuery({
    queryKey: ["member-docs"],
    queryFn: () => fetchDocs()
  });
  const {
    data: members = []
  } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers()
  });
  const {
    data: account
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount()
  });
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [issuedAt, setIssuedAt] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const selectedMember = members.find((m) => m.id === memberId);
  const selectedTpl = templates.find((t) => t.id === templateId);
  function applyTemplate(tplId) {
    setTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setTitle(tpl.title);
    const vars = {
      nome: selectedMember?.full_name ?? "",
      igreja: account?.brand_title ?? "",
      data: new Date(issuedAt).toLocaleDateString("pt-BR"),
      data_membresia: selectedMember?.member_since ? new Date(selectedMember.member_since).toLocaleDateString("pt-BR") : ""
    };
    setBody(renderTemplate(tpl.body, vars));
  }
  const upsertMut = useMutation({
    mutationFn: () => save({
      data: {
        template_id: templateId || null,
        member_id: memberId || null,
        title,
        body,
        issued_at: issuedAt
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["member-docs"]
      });
      toast.success("Documento emitido");
      setOpen(false);
      setTemplateId("");
      setMemberId("");
      setTitle("");
      setBody("");
    },
    onError: (e) => toast.error(e.message)
  });
  function printDoc(d) {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${d.title}</title>
      <style>body{font-family:Georgia,serif;max-width:680px;margin:60px auto;padding:0 40px;color:#222;line-height:1.7}
      h1{font-size:22px;text-align:center;margin-bottom:8px} .meta{text-align:center;color:#777;font-size:13px;margin-bottom:40px}
      .body{white-space:pre-wrap;font-size:15px} .sig{margin-top:80px;text-align:center;border-top:1px solid #333;padding-top:8px;width:60%;margin-left:auto;margin-right:auto;font-size:13px}
      @media print{body{margin:20px}}</style></head><body>
      <h1>${d.title}</h1>
      <div class="meta">${account?.brand_title ?? "Igreja"} · ${new Date(d.issued_at).toLocaleDateString("pt-BR")}</div>
      <div class="body">${d.body.replace(/</g, "&lt;")}</div>
      <div class="sig">Assinatura e carimbo</div>
      <script>window.print()<\/script></body></html>`);
    w.document.close();
  }
  const tplGroups = useMemo(() => {
    const globals = templates.filter((t) => t.is_global);
    const mine = templates.filter((t) => !t.is_global);
    return {
      globals,
      mine
    };
  }, [templates]);
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Documentos" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Declarações, certificados, ofícios e cartas com modelos prontos da plataforma." })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Emitir documento"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Emitir documento" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Modelo" }),
                /* @__PURE__ */ jsxs(Select, { value: templateId, onValueChange: applyTemplate, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Escolher modelo…" }) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    tplGroups.globals.map((t) => /* @__PURE__ */ jsxs(SelectItem, { value: t.id, children: [
                      "★ ",
                      t.title
                    ] }, t.id)),
                    tplGroups.mine.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.id, children: t.title }, t.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Membro" }),
                /* @__PURE__ */ jsxs(Select, { value: memberId, onValueChange: (v) => {
                  setMemberId(v);
                  if (templateId) applyTemplate(templateId);
                }, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Selecione…" }) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: members.map((m) => /* @__PURE__ */ jsx(SelectItem, { value: m.id, children: m.full_name }, m.id)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Título" }),
              /* @__PURE__ */ jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Data de emissão" }),
              /* @__PURE__ */ jsx(Input, { type: "date", value: issuedAt, onChange: (e) => setIssuedAt(e.target.value), className: "w-48" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Conteúdo" }),
              /* @__PURE__ */ jsx(Textarea, { rows: 10, value: body, onChange: (e) => setBody(e.target.value) }),
              selectedTpl && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Variáveis: ",
                `{{nome}} {{igreja}} {{data}} {{data_membresia}}`
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxs(Button, { disabled: !title.trim() || !body.trim() || upsertMut.isPending, onClick: () => upsertMut.mutate(), children: [
              upsertMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
              "Emitir"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4 mb-6 bg-muted/30", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2", children: "Modelos disponíveis" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: templates.map((t) => /* @__PURE__ */ jsxs(Badge, { variant: t.is_global ? "secondary" : "outline", className: "text-xs", children: [
        t.is_global && "★ ",
        t.title
      ] }, t.id)) })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : docs.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Nenhum documento emitido" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Use os modelos acima pra emitir o primeiro." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: docs.map((d) => /* @__PURE__ */ jsxs(Card, { className: "p-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: d.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
          d.members?.full_name ?? "Sem membro vinculado",
          " · ",
          new Date(d.issued_at).toLocaleDateString("pt-BR")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => printDoc(d), children: /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          if (confirm("Remover este documento?")) remove({
            data: {
              id: d.id
            }
          }).then(() => qc.invalidateQueries({
            queryKey: ["member-docs"]
          }));
        }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] })
    ] }, d.id)) })
  ] }) });
}
export {
  DocsPage as component
};
