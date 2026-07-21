import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { getMyAccount } from "@/lib/account.functions";
import { listMembers } from "@/lib/members.functions";
import { listEventPages } from "@/lib/event-pages.functions";
import { getTeamAndPermissions } from "@/lib/team.functions";
import { getWhatsappData } from "@/lib/whatsapp.functions";
import { CheckCircle2, Circle, Rocket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ativacao")({ component: ActivationPage });

function ActivationPage() {
  const accountFn = useServerFn(getMyAccount); const membersFn = useServerFn(listMembers); const eventsFn = useServerFn(listEventPages); const teamFn = useServerFn(getTeamAndPermissions); const whatsappFn = useServerFn(getWhatsappData);
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => accountFn() }); const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => membersFn() }); const { data: events = [] } = useQuery({ queryKey: ["event-pages"], queryFn: () => eventsFn() }); const { data: team } = useQuery({ queryKey: ["team-activation"], queryFn: () => teamFn(), retry: false }); const { data: whatsapp } = useQuery({ queryKey: ["whatsapp-activation"], queryFn: () => whatsappFn(), retry: false });
  const steps = [{ label: "Configurar identidade e dados da comunidade", to: "/settings", done: Boolean(account?.brand_title && account?.custom_slug) }, { label: "Cadastrar os primeiros participantes", to: "/membros", done: members.length > 0 }, { label: "Publicar uma página ou evento", to: "/eventos", done: events.length > 0 }, { label: "Preparar comunicação via WhatsApp", to: "/whatsapp", done: Boolean(whatsapp?.settings?.enabled) }, { label: "Convidar a equipe de operação", to: "/equipe", done: (team?.members?.filter(member => member.status === "active").length ?? 0) > 1 }]; const completed = steps.filter(step => step.done).length;
  return <AppShell><div className="mx-auto w-full max-w-3xl space-y-6"><header className="rounded-xl border bg-gradient-to-br from-indigo-500/10 via-background to-background p-6"><div className="flex gap-3"><span className="rounded-lg bg-indigo-600 p-2.5 text-white"><Rocket className="h-6 w-6"/></span><div><h1 className="text-2xl font-semibold">Ativação da comunidade</h1><p className="mt-1 text-sm text-muted-foreground">{completed} de {steps.length} fundamentos concluídos para começar a operar.</p></div></div></header><Card className="p-5"><div className="mb-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${(completed / steps.length) * 100}%` }}/></div><div className="space-y-2">{steps.map((step, index)=><Link key={step.to} to={step.to} className="flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40"><div className="flex items-center gap-3">{step.done?<CheckCircle2 className="h-5 w-5 text-emerald-600"/>:<Circle className="h-5 w-5 text-muted-foreground"/>}<div><p className="font-medium">{index + 1}. {step.label}</p><p className="text-xs text-muted-foreground">{step.done ? "Concluído" : "Abrir para configurar"}</p></div></div><span className="text-sm text-primary">Abrir</span></Link>)}</div></Card></div></AppShell>;
}
