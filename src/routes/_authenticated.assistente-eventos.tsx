import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listEventPages } from "@/lib/event-pages.functions";
import { CalendarHeart, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assistente-eventos")({ component: EventAssistantPage });
type EventPage = Awaited<ReturnType<typeof listEventPages>>[number];
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

function EventAssistantPage() {
  const list = useServerFn(listEventPages); const { data: events = [] } = useQuery({ queryKey: ["event-pages"], queryFn: () => list() }); const [eventId, setEventId] = useState("");
  const event = useMemo(() => (events as EventPage[]).find(item => item.id === eventId) ?? (events as EventPage[])[0], [events, eventId]);
  const materials = event ? [{ title: "Convite para WhatsApp", text: `✨ ${event.title}\n\n${event.description?.slice(0, 260) || "Você é nosso convidado!"}\n\n📅 ${dateLabel(event.event_date)} às ${event.start_time.slice(0, 5)}\n📍 ${event.location_name || "Local a confirmar"}\n\nParticipe: /e/${event.slug}` }, { title: "Legenda para redes sociais", text: `Anote na agenda: ${event.title}!\n\n${dateLabel(event.event_date)} • ${event.start_time.slice(0, 5)}\n${event.location_name ? `📍 ${event.location_name}\n` : ""}\nEsperamos você. #Comunidade #Evento` }] : [];
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); toast.success("Texto copiado"); };
  return <AppShell><div className="mx-auto w-full max-w-5xl space-y-6"><header className="rounded-xl border bg-gradient-to-br from-sky-500/10 via-background to-background p-6"><div className="flex gap-3"><span className="rounded-lg bg-sky-600 p-2.5 text-white"><Sparkles className="h-6 w-6"/></span><div><h1 className="text-2xl font-semibold">Assistente de Eventos</h1><p className="mt-1 text-sm text-muted-foreground">Transforme um evento cadastrado em comunicação e operação pronta para a equipe.</p></div></div></header>{events.length===0?<Card className="p-12 text-center"><CalendarHeart className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-3 text-sm text-muted-foreground">Cadastre uma página de evento para usar o assistente.</p></Card>:<><Card className="p-5"><label className="text-sm font-medium">Evento</label><select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={event?.id ?? ""} onChange={e=>setEventId(e.target.value)}>{(events as EventPage[]).map(item=><option key={item.id} value={item.id}>{item.title} · {item.event_date}</option>)}</select></Card><div className="grid gap-5 md:grid-cols-2">{materials.map(material=><Card key={material.title} className="p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">{material.title}</h2><Button variant="ghost" size="icon" onClick={()=>copy(material.text)}><Copy className="h-4 w-4"/></Button></div><pre className="mt-4 whitespace-pre-wrap rounded-md bg-muted/40 p-3 font-sans text-sm leading-6">{material.text}</pre></Card>)}</div><Card className="p-5"><h2 className="font-semibold">Checklist operacional</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{["Página pública revisada", "Divulgação enviada", "Equipe e escalas confirmadas", "Check-in preparado", "Lembrete para participantes", "Lista de presença e pós-evento"].map(item=><label key={item} className="flex items-center gap-2 rounded-md border p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-sky-600"/>{item}</label>)}</div></Card></>}</div></AppShell>;
}
