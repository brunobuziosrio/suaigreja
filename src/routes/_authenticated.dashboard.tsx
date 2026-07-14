import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import {
  CalendarDays,
  CalendarClock,
  Landmark,
  MapPin,
  ListChecks,
  Users,
  Cake,
  GraduationCap,
  HandCoins,
  Megaphone,
  Lightbulb,
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  UserCheck,
  TrendingDown,
  UserX,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccount } from "@/lib/account.functions";
import { canAccessPath, resolvePlanTier } from "@/lib/plan-access";
import { getProfile, getReligionTerms } from "@/lib/religion-profiles";
import { listLocations } from "@/lib/locations.functions";
import { listTypes } from "@/lib/types.functions";
import { listEvents } from "@/lib/events.functions";
import { listMembers } from "@/lib/members.functions";
import { listMyDonationCampaigns } from "@/lib/donations.functions";
import { listFinancialEntries, type FinancialEntryRow } from "@/lib/financial-entries.functions";
import { listSystemUpdates, createSuggestion } from "@/lib/feedback.functions";
import { listUpcomingUnconfirmedShifts } from "@/lib/volunteer-shifts.functions";
import { listCampaigns } from "@/lib/campaigns.functions";
import { listAbsentMembers } from "@/lib/event-attendance.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { Database } from "@/integrations/supabase/types";

type Member = Database["public"]["Tables"]["members"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];
type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type SystemUpdate = Database["public"]["Tables"]["system_updates"]["Row"];
type DashboardDestination =
  | "/agenda"
  | "/ausencias"
  | "/billing"
  | "/campanhas"
  | "/escalas"
  | "/hub"
  | "/locations"
  | "/membros"
  | "/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchAccount = useServerFn(getMyAccount);
  const fetchLocations = useServerFn(listLocations);
  const fetchTypes = useServerFn(listTypes);
  const fetchEvents = useServerFn(listEvents);
  const fetchMembers = useServerFn(listMembers);
  const fetchCampaigns = useServerFn(listMyDonationCampaigns);
  const fetchUnconfirmedShifts = useServerFn(listUpcomingUnconfirmedShifts);
  const fetchContributionCampaigns = useServerFn(listCampaigns);
  const fetchAbsentMembers = useServerFn(listAbsentMembers);
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount() });
  const planTier = resolvePlanTier(account);
  const canUseMembers = !!account && canAccessPath(planTier, "/membros");
  const canUseEbd = !!account && canAccessPath(planTier, "/ebd");
  const canUseShifts = !!account && canAccessPath(planTier, "/escalas");
  const canUseContribCampaigns = !!account && canAccessPath(planTier, "/campanhas");
  const canUseFinances = !!account && canAccessPath(planTier, "/livro-caixa");
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetchLocations(),
  });
  const { data: types = [] } = useQuery({ queryKey: ["types"], queryFn: () => fetchTypes() });
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => await fetchMembers() as Member[],
    enabled: canUseMembers,
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["my-donations"],
    queryFn: () => fetchCampaigns(),
  });
  const { data: unconfirmedShifts = [] } = useQuery({
    queryKey: ["unconfirmed-shifts"],
    queryFn: () => fetchUnconfirmedShifts(),
    enabled: canUseShifts,
  });
  const { data: contribCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["contribution-campaigns"],
    queryFn: async () => await fetchContributionCampaigns() as Campaign[],
    enabled: canUseContribCampaigns,
  });
  const { data: absentData } = useQuery({
    queryKey: ["absent-members"],
    queryFn: () => fetchAbsentMembers(),
    enabled: canUseMembers,
  });
  const range = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const first = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const lastDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const last = `${lastDate.getFullYear()}-${pad(lastDate.getMonth() + 1)}-${pad(lastDate.getDate())}`;
    return { from: first, to: last };
  }, []);
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["events", range.from, range.to],
    queryFn: async () => await fetchEvents({ data: range }) as Event[],
  });
  const profile = account ? getProfile(account.religion_profile) : null;
  const terms = getReligionTerms(account?.religion_profile);

  const fetchUpdates = useServerFn(listSystemUpdates);
  const { data: updates = [] } = useQuery<SystemUpdate[]>({
    queryKey: ["system-updates"],
    queryFn: async () => await fetchUpdates() as SystemUpdate[],
  });
  const fetchFinancialEntries = useServerFn(listFinancialEntries);
  const { data: financialEntries = [] } = useQuery({
    queryKey: ["financial-entries"],
    queryFn: () => fetchFinancialEntries(),
    enabled: canUseFinances,
  });

  const currentMonth = new Date().getMonth() + 1;
  const birthdays = members.filter((m) => {
    if (!m.birth_date) return false;
    return new Date(m.birth_date + "T00:00:00").getMonth() + 1 === currentMonth;
  });
  const activeMembers = canUseMembers
    ? members.filter((m) => m.status === "ativo").length
    : "Pro";
  const activeCampaigns = campaigns.filter((campaign) => campaign.active).length;

  const todayKey = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const birthdaysToday = useMemo(() => {
    const now = new Date();
    return birthdays.filter((m) => {
      const d = new Date(m.birth_date + "T00:00:00");
      return d.getDate() === now.getDate();
    });
  }, [birthdays]);

  const upcomingEvents = useMemo(
    () => events.filter((e) => (e.event_date ?? "") >= todayKey).slice(0, 5),
    [events, todayKey],
  );

  const incompleteMembers = useMemo(() => {
    if (!canUseMembers) return 0;
    return members.filter((m) => memberCompleteness(m) < 80).length;
  }, [canUseMembers, members]);

  // Campanha "atrasada": já passou mais tempo do prazo do que arrecadou
  // proporcionalmente da meta (com folga de 15 pontos pra não alarmar à toa
  // logo no início da campanha).
  const campaignsBehindPace = useMemo(() => {
    if (!canUseContribCampaigns) return [];
    const now = Date.now();
    return contribCampaigns.filter((c) => {
      if (!c.is_active || !c.start_date || !c.end_date || !c.goal_amount_cents) return false;
      const start = new Date(`${c.start_date}T00:00:00`).getTime();
      const end = new Date(`${c.end_date}T23:59:59`).getTime();
      if (end <= start || now < start) return false;
      const timeElapsedPct = Math.min(100, ((now - start) / (end - start)) * 100);
      const raisedPct = ((c.current_amount_cents ?? 0) / c.goal_amount_cents) * 100;
      return timeElapsedPct - raisedPct > 15;
    });
  }, [canUseContribCampaigns, contribCampaigns]);

  const alerts = useMemo(() => {
    const list: Array<{
      key: string;
      icon: typeof Cake;
      tone: string;
      title: string;
      description: string;
      href: DashboardDestination;
    }> = [];
    if (birthdaysToday.length > 0) {
      list.push({
        key: "birthdays-today",
        icon: Cake,
        tone: "text-pink-600 bg-pink-500/10",
        title: `${birthdaysToday.length} aniversariante(s) hoje`,
        description: "Envie uma mensagem de carinho pelo WhatsApp.",
        href: canUseMembers ? "/membros" : "/billing",
      });
    }
    if (upcomingEvents.length > 0) {
      const next = upcomingEvents[0];
      list.push({
        key: "next-event",
        icon: CalendarClock,
        tone: "text-primary bg-primary/10",
        title: next.event_date === todayKey ? "Evento hoje" : "Próximo evento",
        description: `${next.type_name ?? "Evento"} - ${formatEventDate(next.event_date, next.start_time)}`,
        href: "/agenda",
      });
    }
    if (canUseMembers && incompleteMembers > 0) {
      list.push({
        key: "incomplete-members",
        icon: AlertTriangle,
        tone: "text-amber-600 bg-amber-500/10",
        title: `${incompleteMembers} ficha(s) incompleta(s)`,
        description: "Complete os cadastros para carteirinha e comunicação.",
        href: "/membros",
      });
    }
    if (activeCampaigns === 0) {
      list.push({
        key: "no-campaign",
        icon: HandCoins,
        tone: "text-emerald-700 bg-emerald-500/10",
        title: "Nenhuma campanha Pix ativa",
        description: "Ative uma campanha para organizar a arrecadação.",
        href: "/hub",
      });
    }
    if (canUseShifts && unconfirmedShifts.length > 0) {
      list.push({
        key: "unconfirmed-shifts",
        icon: UserCheck,
        tone: "text-amber-600 bg-amber-500/10",
        title: `${unconfirmedShifts.length} turno(s) sem confirmação`,
        description: "Voluntários escalados nos próximos 7 dias ainda não confirmaram presença.",
        href: "/escalas",
      });
    }
    if (canUseContribCampaigns && campaignsBehindPace.length > 0) {
      list.push({
        key: "campaigns-behind-pace",
        icon: TrendingDown,
        tone: "text-red-600 bg-red-500/10",
        title: `${campaignsBehindPace.length} campanha(s) abaixo do ritmo da meta`,
        description: "A arrecadação está atrasada em relação ao prazo. Vale reforçar a divulgação.",
        href: "/campanhas",
      });
    }
    if (canUseMembers && absentData?.trackingActive && absentData.members.length > 0) {
      list.push({
        key: "absent-members",
        icon: UserX,
        tone: "text-amber-600 bg-amber-500/10",
        title: `${absentData.members.length} membro(s) sumido(s)`,
        description: "Sem presença registrada há 21+ dias. Vale uma visita ou ligação pastoral.",
        href: "/ausencias",
      });
    }
    return list;
  }, [
    absentData,
    activeCampaigns,
    birthdaysToday,
    campaignsBehindPace,
    canUseContribCampaigns,
    canUseMembers,
    canUseShifts,
    incompleteMembers,
    todayKey,
    unconfirmedShifts,
    upcomingEvents,
  ]);
  const setupTasks = useMemo(
    () => [
      {
        label: `Cadastrar o primeiro ${terms.person}`,
        description: "Base para carteirinha, aniversarios, relatorios e comunicacao.",
        done: canUseMembers && members.length > 0,
        href: canUseMembers ? "/membros" : "/billing",
      },
      {
        label: `Cadastrar um local da ${terms.institution}`,
        description: "Ajuda no site publico, agenda, eventos e organizacao por unidade.",
        done: locations.length > 0,
        href: "/locations",
      },
      {
        label: "Criar um tipo de evento",
        description: "Padroniza cultos, reunioes, cursos, encontros e atividades.",
        done: types.length > 0,
        href: "/types",
      },
      {
        label: "Publicar o primeiro evento",
        description: "A agenda mostra movimento e facilita inscricoes e divulgacao.",
        done: events.length > 0,
        href: "/agenda",
      },
      {
        label: "Ativar uma campanha Pix",
        description: "Libera arrecadacao por campanha e melhora a leitura financeira.",
        done: activeCampaigns > 0,
        href: "/hub",
      },
    ],
    [
      activeCampaigns,
      canUseMembers,
      events,
      locations.length,
      members,
      terms.institution,
      terms.person,
      types.length,
    ],
  );
  const completedSetupTasks = setupTasks.filter((task) => task.done).length;
  const setupProgress = Math.round((completedSetupTasks / setupTasks.length) * 100);
  const financialSnapshot = useMemo(() => {
    if (!canUseFinances) return null;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthEntries = (financialEntries as FinancialEntryRow[]).filter((entry) =>
      entry.entry_date?.startsWith(monthKey),
    );
    const income = monthEntries
      .filter((entry) => entry.entry_type === "income")
      .reduce((sum, entry) => sum + entry.amount_cents, 0);
    const expense = monthEntries
      .filter((entry) => entry.entry_type === "expense")
      .reduce((sum, entry) => sum + entry.amount_cents, 0);
    const balance = income - expense;
    const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : null;
    const categoryTotals = new Map<string, number>();
    for (const entry of monthEntries) {
      if (entry.entry_type !== "expense") continue;
      const key = entry.category?.trim() || "Outro";
      categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + entry.amount_cents);
    }
    const topExpenseCategory = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
    return { monthEntries, income, expense, balance, expenseRatio, topExpenseCategory };
  }, [canUseFinances, financialEntries]);

  const trialDays = account?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil((new Date(account.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return (
    <AppShell>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Visao geral</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Perfil: {profile?.label} - Plano trial ({trialDays} dias restantes)
          </p>
        </div>

        <Card className="mb-6 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">O que fazer hoje</h2>
          </div>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md bg-muted/40 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-muted-foreground">
                Tudo em dia por aqui. Sua {terms.institution} nao tem pendencias urgentes agora.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {alerts.map((alert) => (
                <DashboardLink key={alert.key} to={alert.href}>
                  <div className="group flex h-full items-start gap-3 rounded-md border bg-card p-3 transition-colors hover:border-primary/60 hover:bg-muted/30">
                    <span className={`rounded-md p-2 ${alert.tone}`}>
                      <alert.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-5">{alert.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </DashboardLink>
              ))}
            </div>
          )}
        </Card>

        <Card className="mb-6 overflow-hidden border-primary/20">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Configure sua {terms.institution}</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {setupProgress}% concluido - {setupTasks.length - completedSetupTasks} passo(s)
                restante(s)
              </p>
            </div>
            <div className="min-w-32 rounded-md bg-primary/10 px-3 py-2 text-right">
              <p className="text-xs font-medium text-primary">Implantacao</p>
              <p className="text-2xl font-semibold">{setupProgress}%</p>
            </div>
          </div>
          <div className="h-2 bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${setupProgress}%` }}
            />
          </div>
          <div className="grid gap-2 p-5 pt-4 md:grid-cols-2">
            {setupTasks.map((task) => (
              <DashboardLink key={task.label} to={task.href}>
                <div className="group flex h-full items-start gap-3 rounded-md border bg-card p-3 transition-colors hover:border-primary/60 hover:bg-muted/30">
                  {task.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5">{task.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </DashboardLink>
            ))}
          </div>
        </Card>

        <Card className="mb-6 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Resumo financeiro do mês</h2>
                <p className="text-xs text-muted-foreground">
                  Leitura rápida para acompanhar entradas, saídas e saldo sem abrir relatórios
                  completos.
                </p>
              </div>
            </div>
            <Link to="/livro-caixa" className="text-xs font-medium text-primary hover:underline">
              Abrir Livro Caixa
            </Link>
          </div>

          {financialSnapshot ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Entradas</p>
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-xl font-semibold">
                  {formatCurrency(financialSnapshot.income)}
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Saídas</p>
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                </div>
                <p className="mt-2 text-xl font-semibold">
                  {formatCurrency(financialSnapshot.expense)}
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Saldo do mês</p>
                <p
                  className={`mt-2 text-xl font-semibold ${
                    financialSnapshot.balance >= 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(financialSnapshot.balance)}
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Lançamentos</p>
                <p className="mt-2 text-xl font-semibold">
                  {financialSnapshot.monthEntries.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {financialSnapshot.expenseRatio !== null
                    ? `Despesas consomem ${financialSnapshot.expenseRatio}% das entradas`
                    : "Sem entradas suficientes para calcular o ritmo das despesas"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
              O resumo financeiro aparece para quem tem acesso ao Livro Caixa premium.
            </div>
          )}

          {financialSnapshot && financialSnapshot.topExpenseCategory && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">
                Maior despesa: {financialSnapshot.topExpenseCategory[0]}{" "}
                {formatCurrency(financialSnapshot.topExpenseCategory[1])}
              </span>
              <span className="rounded-full bg-muted px-2 py-1">
                {financialSnapshot.monthEntries.length} lançamento(s) no recorte atual
              </span>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/locations">
            <Card className="p-5 hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Locais</p>
                  <p className="text-2xl font-semibold">{locations.length}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/types">
            <Card className="p-5 hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipos</p>
                  <p className="text-2xl font-semibold">{types.length}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/agenda">
            <Card className="p-5 hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eventos no mes</p>
                  <p className="text-2xl font-semibold">{events.length}</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <Link to={canUseMembers ? "/membros" : "/billing"}>
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{terms.people} ativos</p>
                  <p className="text-2xl font-semibold">{activeMembers}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to={canUseMembers ? "/membros" : "/billing"}>
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-pink-500/10 text-pink-600">
                  <Cake className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aniversariantes do mês</p>
                  <p className="text-2xl font-semibold">{birthdays.length}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to={canUseEbd ? "/ebd" : "/billing"}>
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Escola Bíblica</p>
                  <p className="text-2xl font-semibold">{canUseEbd ? "Frequência" : "Premium"}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/hub" search={{ tab: "doacoes" }}>
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-700">
                  <HandCoins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Campanhas Pix ativas</p>
                  <p className="text-2xl font-semibold">{activeCampaigns}</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {birthdays.length > 0 && (
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Cake className="h-5 w-5 text-pink-600" />
              <h2 className="font-semibold">Aniversariantes deste mês</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {birthdays
                .sort((a, b) => new Date(a.birth_date).getDate() - new Date(b.birth_date).getDate())
                .map((m) => {
                  const d = new Date(m.birth_date + "T00:00:00");
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40"
                    >
                      {m.photo_url ? (
                        <img
                          src={m.photo_url}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {m.full_name[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{m.full_name}</p>
                        <p className="text-xs text-muted-foreground">Dia {d.getDate()}</p>
                      </div>
                      {m.phone && (
                        <a
                          href={`https://wa.me/55${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Feliz aniversário, ${m.full_name.split(" ")[0]}! 🎉 Que Deus continue te abençoando.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 rounded bg-forest text-white hover:bg-forest-hover"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        <Card className="mt-6 p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Proximos eventos</h2>
            </div>
            <Link to="/agenda" className="text-xs font-medium text-primary hover:underline">
              Ver agenda
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-start gap-2 rounded-md bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Nenhum evento agendado para os proximos dias deste mes.
              </p>
              <Link to="/agenda" className="text-xs font-medium text-primary hover:underline">
                Publicar um evento
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {upcomingEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                    <span className="text-sm font-semibold leading-none">
                      {new Date(`${e.event_date}T00:00:00`).getDate()}
                    </span>
                    <span className="text-[10px] uppercase leading-none mt-0.5">
                      {new Date(`${e.event_date}T00:00:00`).toLocaleDateString("pt-BR", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.type_name ?? "Evento"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.location_name ?? "Local a definir"}
                      {e.start_time ? ` - ${e.start_time}` : ""}
                    </p>
                  </div>
                  {e.event_date === todayKey && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Hoje
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <SystemUpdatesCard updates={updates} />
          <SuggestionCard />
        </div>
      </div>
    </AppShell>
  );
}

function DashboardLink({ to, children }: { to: DashboardDestination; children: ReactNode }) {
  if (to === "/hub") {
    return (
      <Link to="/hub" search={{ tab: "doacoes" }}>
        {children}
      </Link>
    );
  }

  return <Link to={to}>{children}</Link>;
}

function SystemUpdatesCard({ updates }: { updates: SystemUpdate[] }) {
  return (
    <Card className="p-6 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Atualizações do sistema</h2>
      </div>
      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma novidade por aqui ainda. Quando publicarmos uma melhoria, ela aparece aqui.
        </p>
      ) : (
        <ul className="space-y-3 max-h-72 overflow-auto pr-1">
          {updates.map((u) => (
            <li key={u.id} className="border-l-2 border-primary/40 pl-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{u.title}</p>
                {u.version && (
                  <span className="text-[10px] font-mono uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    v{u.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">
                {u.content}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(u.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SuggestionCard() {
  const qc = useQueryClient();
  const send = useServerFn(createSuggestion);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const mut = useMutation({
    mutationFn: () => send({ data: { title: title.trim(), message: message.trim() } }),
    onSuccess: () => {
      toast.success("Sugestão enviada. Obrigado!");
      setTitle("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["my-suggestions"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar."),
  });

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold">Sugerir uma melhoria</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Sua ideia ajuda a guiar nossos próximos lançamentos. Conta o que faria seu dia a dia mais
        fácil.
      </p>
      <div className="space-y-2">
        <Input
          placeholder="Resumo da ideia (ex.: importar membros por planilha)"
          value={title}
          maxLength={160}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Descreva sua sugestão com o máximo de detalhes."
          rows={4}
          value={message}
          maxLength={2000}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => mut.mutate()}
            disabled={mut.isPending || title.trim().length < 3 || message.trim().length < 5}
          >
            {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Enviar sugestão
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Campos relevantes para carteirinha, relatorios e comunicacao. Mantido em sincronia
// com o indicador de completude exibido na tela de Membros.
function memberCompleteness(member: Member): number {
  const fields = [
    member.full_name,
    member.phone,
    member.birth_date,
    member.cpf,
    member.photo_url,
    member.address_city,
    member.address_state,
    member.member_since,
    member.congregation,
    member.role,
  ];
  const filled = fields.filter((value) => value != null && String(value).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function formatEventDate(dateStr?: string | null, startTime?: string | null): string {
  if (!dateStr) return "Data a definir";
  const d = new Date(`${dateStr}T00:00:00`);
  const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return startTime ? `${label}, ${startTime}` : label;
}

function formatCurrency(valueCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(valueCents / 100);
}
