import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { MapPin, ListChecks, CalendarDays, Users, Cake, GraduationCap, HandCoins, Megaphone, Lightbulb, Loader2 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { g as getMyAccount } from "./account.functions-DK5H0Kdx.js";
import { g as getProfile } from "./religion-profiles-CyOvWaWi.js";
import { l as listLocations } from "./locations.functions-BuQu5la6.js";
import { l as listTypes } from "./types.functions-2SAYy8Gp.js";
import { l as listEvents } from "./events.functions-DvfwT8xH.js";
import { z as listMembers, H as listMyDonationCampaigns } from "./router-BAWvi9U-.js";
import { l as listSystemUpdates, c as createSuggestion } from "./feedback.functions-CBDL2JzI.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { T as Textarea } from "./textarea-DISb_imW.js";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import "./client-DVtn2Z4s.js";
import "@radix-ui/react-collapsible";
import "./billing-plans-Ce8xzhRW.js";
function DashboardPage() {
  const fetchAccount = useServerFn(getMyAccount);
  const fetchLocations = useServerFn(listLocations);
  const fetchTypes = useServerFn(listTypes);
  const fetchEvents = useServerFn(listEvents);
  const fetchMembers = useServerFn(listMembers);
  const fetchCampaigns = useServerFn(listMyDonationCampaigns);
  const {
    data: account
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount()
  });
  const {
    data: locations = []
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetchLocations()
  });
  const {
    data: types = []
  } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchTypes()
  });
  const {
    data: members = []
  } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers()
  });
  const {
    data: campaigns = []
  } = useQuery({
    queryKey: ["my-donations"],
    queryFn: () => fetchCampaigns()
  });
  const range = useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const first = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const lastDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const last = `${lastDate.getFullYear()}-${pad(lastDate.getMonth() + 1)}-${pad(lastDate.getDate())}`;
    return {
      from: first,
      to: last
    };
  }, []);
  const {
    data: events = []
  } = useQuery({
    queryKey: ["events", range.from, range.to],
    queryFn: () => fetchEvents({
      data: range
    })
  });
  const profile = account ? getProfile(account.religion_profile) : null;
  const fetchUpdates = useServerFn(listSystemUpdates);
  const {
    data: updates = []
  } = useQuery({
    queryKey: ["system-updates"],
    queryFn: () => fetchUpdates()
  });
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
  const birthdays = members.filter((m) => {
    if (!m.birth_date) return false;
    return (/* @__PURE__ */ new Date(m.birth_date + "T00:00:00")).getMonth() + 1 === currentMonth;
  });
  const activeMembers = members.filter((m) => m.status === "ativo").length;
  const activeCampaigns = campaigns.filter((c) => c.active).length;
  const trialDays = account?.trial_ends_at ? Math.max(0, Math.ceil((new Date(account.trial_ends_at).getTime() - Date.now()) / (1e3 * 60 * 60 * 24))) : 0;
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Visao geral" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [
        "Perfil: ",
        profile?.label,
        " - Plano trial (",
        trialDays,
        " dias restantes)"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/locations", children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Locais" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: locations.length })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Link, { to: "/types", children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(ListChecks, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Tipos" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: types.length })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Link, { to: "/agenda", children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(CalendarDays, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Eventos no mes" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: events.length })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-4 gap-4 mt-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/membros", children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Membros ativos" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: activeMembers })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Link, { to: "/membros", children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-pink-500/10 text-pink-600", children: /* @__PURE__ */ jsx(Cake, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aniversariantes do mês" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: birthdays.length })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Link, { to: "/ebd", children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-emerald-500/10 text-emerald-700", children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Escola Bíblica" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: "Frequência" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Link, { to: "/hub", search: {
        tab: "doacoes"
      }, children: /* @__PURE__ */ jsx(Card, { className: "p-5 hover:border-primary transition-colors h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-md bg-amber-500/10 text-amber-700", children: /* @__PURE__ */ jsx(HandCoins, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Campanhas Pix ativas" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: activeCampaigns })
        ] })
      ] }) }) })
    ] }),
    birthdays.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "mt-6 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(Cake, { className: "h-5 w-5 text-pink-600" }),
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Aniversariantes deste mês" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 md:grid-cols-3 gap-2", children: birthdays.sort((a, b) => new Date(a.birth_date).getDate() - new Date(b.birth_date).getDate()).map((m) => {
        const d = /* @__PURE__ */ new Date(m.birth_date + "T00:00:00");
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-2 rounded-md hover:bg-muted/40", children: [
          m.photo_url ? /* @__PURE__ */ jsx("img", { src: m.photo_url, alt: "", className: "h-9 w-9 rounded-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium", children: m.full_name[0] }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: m.full_name }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Dia ",
              d.getDate()
            ] })
          ] }),
          m.phone && /* @__PURE__ */ jsx("a", { href: `https://wa.me/55${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Feliz aniversário, ${m.full_name.split(" ")[0]}! 🎉 Que Deus continue te abençoando.`)}`, target: "_blank", rel: "noreferrer", className: "text-xs px-2 py-1 rounded bg-forest text-white hover:bg-forest-hover", children: "WhatsApp" })
        ] }, m.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4 mt-6", children: [
      /* @__PURE__ */ jsx(SystemUpdatesCard, { updates }),
      /* @__PURE__ */ jsx(SuggestionCard, {})
    ] })
  ] }) });
}
function SystemUpdatesCard({
  updates
}) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-6 h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsx(Megaphone, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Atualizações do sistema" })
    ] }),
    updates.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma novidade por aqui ainda. Quando publicarmos uma melhoria, ela aparece aqui." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-3 max-h-72 overflow-auto pr-1", children: updates.map((u) => /* @__PURE__ */ jsxs("li", { className: "border-l-2 border-primary/40 pl-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: u.title }),
        u.version && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5", children: [
          "v",
          u.version
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground whitespace-pre-line mt-0.5", children: u.content }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: new Date(u.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) })
    ] }, u.id)) })
  ] });
}
function SuggestionCard() {
  const qc = useQueryClient();
  const send = useServerFn(createSuggestion);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const mut = useMutation({
    mutationFn: () => send({
      data: {
        title: title.trim(),
        message: message.trim()
      }
    }),
    onSuccess: () => {
      toast.success("Sugestão enviada. Obrigado!");
      setTitle("");
      setMessage("");
      qc.invalidateQueries({
        queryKey: ["my-suggestions"]
      });
    },
    onError: (e) => toast.error(e?.message || "Não foi possível enviar.")
  });
  return /* @__PURE__ */ jsxs(Card, { className: "p-6 h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5 text-amber-500" }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Sugerir uma melhoria" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Sua ideia ajuda a guiar nossos próximos lançamentos. Conta o que faria seu dia a dia mais fácil." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Input, { placeholder: "Resumo da ideia (ex.: importar membros por planilha)", value: title, maxLength: 160, onChange: (e) => setTitle(e.target.value) }),
      /* @__PURE__ */ jsx(Textarea, { placeholder: "Descreva sua sugestão com o máximo de detalhes.", rows: 4, value: message, maxLength: 2e3, onChange: (e) => setMessage(e.target.value) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => mut.mutate(), disabled: mut.isPending || title.trim().length < 3 || message.trim().length < 5, children: [
        mut.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1.5" }),
        "Enviar sugestão"
      ] }) })
    ] })
  ] });
}
export {
  DashboardPage as component
};
