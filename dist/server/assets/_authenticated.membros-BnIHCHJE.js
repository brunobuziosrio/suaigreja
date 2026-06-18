import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import { useState, useRef } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { z as listMembers, A as upsertMember, B as deleteMember } from "./router-DXfKo2Q8.js";
import { s as supabase } from "./client-DVtn2Z4s.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { B as Badge } from "./badge-Dtggr29e.js";
import { S as Switch } from "./switch-CQ4rbtn8.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { Plus, Users, Loader2, Upload, Search, QrCode, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import "@radix-ui/react-collapsible";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-select";
import "react-easy-crop";
import "@radix-ui/react-slider";
const empty = {
  full_name: "",
  photo_url: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  marital_status: "",
  role: "membro",
  member_since: "",
  status: "ativo",
  address_city: "",
  address_state: "",
  notes: "",
  cpf: "",
  congregation: "",
  is_tither: false
};
const ROLES = ["membro", "visitante", "lider", "diacono", "obreiro", "pastor"];
const STATUS = ["ativo", "inativo", "transferido", "falecido"];
function MembersPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listMembers);
  const save = useServerFn(upsertMember);
  const remove = useServerFn(deleteMember);
  const {
    data: items = [],
    isLoading
  } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchList()
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);
  const upsertMut = useMutation({
    mutationFn: (input) => save({
      data: {
        id: input.id,
        full_name: input.full_name.trim(),
        photo_url: input.photo_url || null,
        email: input.email.trim() || null,
        phone: input.phone.trim() || null,
        birth_date: input.birth_date || null,
        gender: input.gender || null,
        marital_status: input.marital_status || null,
        role: input.role,
        member_since: input.member_since || null,
        status: input.status,
        address_city: input.address_city.trim() || null,
        address_state: input.address_state.trim() || null,
        notes: input.notes.trim() || null,
        cpf: input.cpf.trim() || null,
        congregation: input.congregation.trim() || null,
        is_tither: input.is_tither
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["members"]
      });
      toast.success("Membro salvo");
      setOpen(false);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["members"]
      });
      toast.success("Removido");
    },
    onError: (e) => toast.error(e.message)
  });
  async function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.readAsDataURL(file);
  }
  async function uploadBlob(blob) {
    setUploading(true);
    try {
      const path = `members/${crypto.randomUUID()}.jpg`;
      const {
        error
      } = await supabase.storage.from("member-photos").upload(path, blob, {
        contentType: "image/jpeg"
      });
      if (error) throw error;
      const {
        data: pub
      } = supabase.storage.from("member-photos").getPublicUrl(path);
      setForm((f) => ({
        ...f,
        photo_url: pub.publicUrl
      }));
      toast.success("Foto enviada");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }
  const filtered = items.filter((m) => !search.trim() || m.full_name.toLowerCase().includes(search.toLowerCase()));
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Membros" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cadastro de membros, líderes e visitantes. Base para carteirinhas, documentos e EBD." })
        ] }),
        /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (o) => {
          setOpen(o);
          if (!o) setForm(empty);
        }, children: [
          /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Novo membro"
          ] }) }),
          /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
            /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar membro" : "Novo membro" }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
                  form.photo_url ? /* @__PURE__ */ jsx("img", { src: form.photo_url, alt: "", className: "h-32 w-24 rounded-md object-cover border-2 border-border" }) : /* @__PURE__ */ jsx("div", { className: "h-32 w-24 rounded-md bg-muted flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsx(Users, { className: "h-8 w-8" }) }),
                  /* @__PURE__ */ jsx("input", { ref: fileInput, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  } }),
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "outline", className: "mt-2 w-24", onClick: () => fileInput.current?.click(), disabled: uploading, children: uploading ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3 mr-1" }),
                    "Foto"
                  ] }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx(Label, { children: "Nome completo" }),
                    /* @__PURE__ */ jsx(Input, { value: form.full_name, onChange: (e) => setForm({
                      ...form,
                      full_name: e.target.value
                    }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx(Label, { children: "Telefone" }),
                      /* @__PURE__ */ jsx(Input, { value: form.phone, onChange: (e) => setForm({
                        ...form,
                        phone: e.target.value
                      }), placeholder: "(00) 90000-0000" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx(Label, { children: "E-mail" }),
                      /* @__PURE__ */ jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm({
                        ...form,
                        email: e.target.value
                      }) })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Função" }),
                  /* @__PURE__ */ jsxs(Select, { value: form.role, onValueChange: (v) => setForm({
                    ...form,
                    role: v
                  }), children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, r)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Status" }),
                  /* @__PURE__ */ jsxs(Select, { value: form.status, onValueChange: (v) => setForm({
                    ...form,
                    status: v
                  }), children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: STATUS.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Membro desde" }),
                  /* @__PURE__ */ jsx(Input, { type: "date", value: form.member_since, onChange: (e) => setForm({
                    ...form,
                    member_since: e.target.value
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Nascimento" }),
                  /* @__PURE__ */ jsx(Input, { type: "date", value: form.birth_date, onChange: (e) => setForm({
                    ...form,
                    birth_date: e.target.value
                  }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Sexo" }),
                  /* @__PURE__ */ jsxs(Select, { value: form.gender || "_", onValueChange: (v) => setForm({
                    ...form,
                    gender: v === "_" ? "" : v
                  }), children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "—" }) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "_", children: "—" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "masculino", children: "Masculino" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "feminino", children: "Feminino" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Estado civil" }),
                  /* @__PURE__ */ jsx(Input, { value: form.marital_status, onChange: (e) => setForm({
                    ...form,
                    marital_status: e.target.value
                  }), placeholder: "Solteiro(a), Casado(a)…" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "CPF" }),
                  /* @__PURE__ */ jsx(Input, { value: form.cpf, onChange: (e) => setForm({
                    ...form,
                    cpf: e.target.value
                  }), placeholder: "000.000.000-00" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Igreja / Congregação" }),
                  /* @__PURE__ */ jsx(Input, { value: form.congregation, onChange: (e) => setForm({
                    ...form,
                    congregation: e.target.value
                  }), placeholder: "Ex: Sede / Filial Centro" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border p-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { children: "Dizimista" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Recebe lembrete mensal de contribuição via WhatsApp" })
                ] }),
                /* @__PURE__ */ jsx(Switch, { checked: form.is_tither, onCheckedChange: (v) => setForm({
                  ...form,
                  is_tither: v
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Cidade" }),
                  /* @__PURE__ */ jsx(Input, { value: form.address_city, onChange: (e) => setForm({
                    ...form,
                    address_city: e.target.value
                  }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Estado" }),
                  /* @__PURE__ */ jsx(Input, { value: form.address_state, onChange: (e) => setForm({
                    ...form,
                    address_state: e.target.value
                  }), maxLength: 2, placeholder: "RJ" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Observações" }),
                /* @__PURE__ */ jsx(Textarea, { rows: 3, value: form.notes, onChange: (e) => setForm({
                  ...form,
                  notes: e.target.value
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
              /* @__PURE__ */ jsxs(Button, { disabled: !form.full_name.trim() || upsertMut.isPending, onClick: () => upsertMut.mutate(form), children: [
                upsertMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
                "Salvar"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative mb-4", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Buscar por nome…", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })
      ] }),
      isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Nenhum membro ainda" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cadastre seu primeiro membro pra começar." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: filtered.map((m) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          m.photo_url ? /* @__PURE__ */ jsx("img", { src: m.photo_url, alt: "", className: "h-14 w-14 rounded-full object-cover shrink-0" }) : /* @__PURE__ */ jsx("div", { className: "h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: m.full_name }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1 mt-1", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px] capitalize", children: m.role }),
              m.status !== "ativo" && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] capitalize", children: m.status })
            ] }),
            m.phone && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 truncate", children: m.phone })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 mt-3 pt-3 border-t", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "flex-1", children: /* @__PURE__ */ jsxs("a", { href: `/c/${m.id}`, target: "_blank", rel: "noopener noreferrer", children: [
            /* @__PURE__ */ jsx(QrCode, { className: "h-3.5 w-3.5 mr-1" }),
            "Carteirinha"
          ] }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
            setForm({
              id: m.id,
              full_name: m.full_name,
              photo_url: m.photo_url ?? "",
              email: m.email ?? "",
              phone: m.phone ?? "",
              birth_date: m.birth_date ?? "",
              gender: m.gender ?? "",
              marital_status: m.marital_status ?? "",
              role: m.role,
              member_since: m.member_since ?? "",
              status: m.status,
              address_city: m.address_city ?? "",
              address_state: m.address_state ?? "",
              notes: m.notes ?? "",
              cpf: m.cpf ?? "",
              congregation: m.congregation ?? "",
              is_tither: m.is_tither ?? false
            });
            setOpen(true);
          }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
            if (confirm(`Remover ${m.full_name}?`)) deleteMut.mutate(m.id);
          }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }, m.id)) })
    ] }),
    /* @__PURE__ */ jsx(ImageCropDialog, { open: !!cropSrc, imageSrc: cropSrc, aspect: 3 / 4, onCancel: () => setCropSrc(null), onConfirm: async (blob) => {
      setCropSrc(null);
      await uploadBlob(blob);
    } })
  ] });
}
export {
  MembersPage as component
};
