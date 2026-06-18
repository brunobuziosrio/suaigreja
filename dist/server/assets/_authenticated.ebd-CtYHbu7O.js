import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-C3FK62C1.js";
import * as React from "react";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z as listMembers } from "./router-DXfKo2Q8.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, GraduationCap, Plus, Loader2, CheckSquare, Pencil, Trash2, Users } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7RhCdYH.js";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
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
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
const listEbdClasses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ef72a764d07151b7316b4ae331c9166ebe913dab38a63095ca0c4726f0b1d6a9"));
const classSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  teacher_name: z.string().max(120).optional().nullable(),
  weekday: z.number().int().min(0).max(6).nullable().optional(),
  start_time: z.string().optional().nullable(),
  age_range: z.string().max(40).optional().nullable(),
  active: z.boolean().optional()
});
const upsertEbdClass = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => classSchema.parse(i)).handler(createSsrRpc("4743b930ba36aad65ce5e1b70840d533085e526195d6d6b8083d6a25cc4034a4"));
const deleteEbdClass = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("04faf4c4a0e2edce2f423d8c9636b5c5557cba2527599165ce84be309e6080ba"));
const listEnrollments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid()
}).parse(i)).handler(createSsrRpc("3381839750ac935343d825f770b53a5a03071fd4f8e93d4065288be7bd4d760a"));
const setEnrollment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid(),
  member_id: z.string().uuid(),
  enroll: z.boolean()
}).parse(i)).handler(createSsrRpc("d0ac6a5d4a4bf41fc45a95f8d623b1b88943f5e2a7254fa6edbb28aa4b1b5885"));
const recordAttendance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string(),
  entries: z.array(z.object({
    member_id: z.string().uuid(),
    present: z.boolean()
  })).min(1).max(500)
}).parse(i)).handler(createSsrRpc("79466d9522d15e0e14302d89f5751b254d3cc241575ad94fb88282f8a3ac55db"));
const getAttendanceStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2911d88f499536c6a19e67e77c05c26360f3441e7e72d5d701aefe7bfd50feee"));
const getAttendanceForDate = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string()
}).parse(i)).handler(createSsrRpc("4e5f16d0674dc70e7ec7c65599f37d638f882ede958c5f416c025b6597243571"));
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
function EbdPage() {
  const qc = useQueryClient();
  const fetchClasses = useServerFn(listEbdClasses);
  const fetchMembers = useServerFn(listMembers);
  const fetchStats = useServerFn(getAttendanceStats);
  const saveClass = useServerFn(upsertEbdClass);
  const removeClass = useServerFn(deleteEbdClass);
  const {
    data: classes = [],
    isLoading
  } = useQuery({
    queryKey: ["ebd-classes"],
    queryFn: () => fetchClasses()
  });
  const {
    data: members = []
  } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers()
  });
  const {
    data: stats
  } = useQuery({
    queryKey: ["ebd-stats"],
    queryFn: () => fetchStats()
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    teacher_name: "",
    weekday: 0,
    start_time: "09:00",
    age_range: "adultos",
    active: true
  });
  const [rosterClass, setRosterClass] = useState(null);
  const saveMut = useMutation({
    mutationFn: () => saveClass({
      data: form
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["ebd-classes"]
      });
      toast.success("Turma salva");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-6 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(GraduationCap, { className: "h-6 w-6" }),
          "Escola Bíblica"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Turmas, matrículas e chamada semanal." })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (!o) setForm({
          name: "",
          teacher_name: "",
          weekday: 0,
          start_time: "09:00",
          age_range: "adultos",
          active: true
        });
      }, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Nova turma"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Editar turma" : "Nova turma" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Nome da turma" }),
              /* @__PURE__ */ jsx(Input, { value: form.name, onChange: (e) => setForm({
                ...form,
                name: e.target.value
              }), placeholder: "Ex: Jovens, Adultos, Infantil" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Professor(a)" }),
              /* @__PURE__ */ jsx(Input, { value: form.teacher_name ?? "", onChange: (e) => setForm({
                ...form,
                teacher_name: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Dia" }),
                /* @__PURE__ */ jsxs(Select, { value: String(form.weekday), onValueChange: (v) => setForm({
                  ...form,
                  weekday: Number(v)
                }), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: WEEKDAYS.map((d, i) => /* @__PURE__ */ jsx(SelectItem, { value: String(i), children: d }, i)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Horário" }),
                /* @__PURE__ */ jsx(Input, { type: "time", value: form.start_time ?? "", onChange: (e) => setForm({
                  ...form,
                  start_time: e.target.value
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Faixa etária" }),
              /* @__PURE__ */ jsxs(Select, { value: form.age_range ?? "adultos", onValueChange: (v) => setForm({
                ...form,
                age_range: v
              }), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "criancas", children: "Crianças" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "adolescentes", children: "Adolescentes" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "jovens", children: "Jovens" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "adultos", children: "Adultos" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "terceira_idade", children: "Terceira idade" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxs(Button, { disabled: !form.name?.trim() || saveMut.isPending, onClick: () => saveMut.mutate(), children: [
              saveMut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
              "Salvar"
            ] })
          ] })
        ] })
      ] })
    ] }),
    stats && /* @__PURE__ */ jsxs(Card, { className: "p-5 mb-6 flex items-center gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "p-3 rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(CheckSquare, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Frequência (últimos 60 dias)" }),
        /* @__PURE__ */ jsxs("p", { className: "text-3xl font-semibold", children: [
          stats.rate,
          "%"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          stats.present,
          " presenças de ",
          stats.total,
          " chamadas"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : classes.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(GraduationCap, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Nenhuma turma ainda" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cadastre a primeira turma da EBD." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: classes.map((c) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: c.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            c.teacher_name && `Prof. ${c.teacher_name} · `,
            c.weekday != null && WEEKDAYS[c.weekday],
            " ",
            c.start_time?.slice(0, 5)
          ] }),
          c.age_range && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground capitalize mt-0.5", children: c.age_range.replace("_", " ") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
            setForm(c);
            setOpen(true);
          }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
            if (confirm(`Remover "${c.name}"?`)) removeClass({
              data: {
                id: c.id
              }
            }).then(() => qc.invalidateQueries({
              queryKey: ["ebd-classes"]
            }));
          }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "w-full mt-3", onClick: () => setRosterClass(c), children: [
        /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5 mr-1" }),
        "Chamada & Matrícula"
      ] })
    ] }, c.id)) }),
    rosterClass && /* @__PURE__ */ jsx(RosterDialog, { classRow: rosterClass, members, onClose: () => {
      setRosterClass(null);
      qc.invalidateQueries({
        queryKey: ["ebd-stats"]
      });
    } })
  ] }) });
}
function RosterDialog({
  classRow,
  members,
  onClose
}) {
  const fetchEnroll = useServerFn(listEnrollments);
  const toggleEnroll = useServerFn(setEnrollment);
  const fetchAtt = useServerFn(getAttendanceForDate);
  const saveAtt = useServerFn(recordAttendance);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const enrolledQ = useQuery({
    queryKey: ["ebd-enrollments", classRow.id],
    queryFn: () => fetchEnroll({
      data: {
        class_id: classRow.id
      }
    })
  });
  const attQ = useQuery({
    queryKey: ["ebd-att", classRow.id, date],
    queryFn: () => fetchAtt({
      data: {
        class_id: classRow.id,
        attendance_date: date
      }
    })
  });
  const enrolled = enrolledQ.data ?? [];
  const attendance = new Map((attQ.data ?? []).map((r) => [r.member_id, r.present]));
  async function toggle(memberId, enroll) {
    await toggleEnroll({
      data: {
        class_id: classRow.id,
        member_id: memberId,
        enroll
      }
    });
    enrolledQ.refetch();
  }
  async function setPresent(memberId, present) {
    attendance.set(memberId, present);
    await saveAtt({
      data: {
        class_id: classRow.id,
        attendance_date: date,
        entries: [{
          member_id: memberId,
          present
        }]
      }
    });
    attQ.refetch();
  }
  return /* @__PURE__ */ jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: classRow.name }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm", children: "Data da chamada:" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-44" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border rounded-md divide-y", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground grid grid-cols-[1fr_80px_80px] gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "Membro" }),
          /* @__PURE__ */ jsx("span", { className: "text-center", children: "Matriculado" }),
          /* @__PURE__ */ jsx("span", { className: "text-center", children: "Presente" })
        ] }),
        members.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "Cadastre membros primeiro." }),
        members.map((m) => {
          const isEnrolled = enrolled.some((e) => e.member_id === m.id);
          const isPresent = attendance.get(m.id) === true;
          return /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 grid grid-cols-[1fr_80px_80px] gap-2 items-center text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate", children: m.full_name }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(Checkbox, { checked: isEnrolled, onCheckedChange: (v) => toggle(m.id, !!v) }) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(Checkbox, { checked: isPresent, disabled: !isEnrolled, onCheckedChange: (v) => setPresent(m.id, !!v) }) })
          ] }, m.id);
        })
      ] })
    ] }),
    /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { onClick: onClose, children: "Fechar" }) })
  ] }) });
}
export {
  EbdPage as component
};
