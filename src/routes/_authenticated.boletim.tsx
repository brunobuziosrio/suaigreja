import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWeeklyBulletin } from "@/lib/bulletin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Printer, Copy, CalendarDays, Cake, HandHeart, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/boletim")({
  component: BoletimPage,
});

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function buildWhatsappText(data: NonNullable<ReturnType<typeof useBulletinData>["data"]>) {
  const lines: string[] = [];
  lines.push(`📰 *Boletim da Semana — ${data.churchName}*`);
  lines.push(`${fmtDate(data.periodFrom)} a ${fmtDate(data.periodTo)}`);
  lines.push("");
  if (data.weeklyVerse) {
    lines.push(`📖 _${data.weeklyVerse}_${data.weeklyVerseRef ? ` (${data.weeklyVerseRef})` : ""}`);
    lines.push("");
  }
  if (data.weeklyMessage) {
    lines.push(data.weeklyMessage);
    lines.push("");
  }
  if (data.events.length > 0) {
    lines.push("🗓️ *Agenda da semana*");
    for (const e of data.events) {
      lines.push(`• ${fmtDate(e.event_date)} ${e.start_time?.slice(0, 5) ?? ""} — ${e.type_name}${e.location_name ? ` (${e.location_name})` : ""}`);
    }
    lines.push("");
  }
  if (data.birthdays.length > 0) {
    lines.push("🎂 *Aniversariantes*");
    for (const b of data.birthdays) {
      lines.push(`• ${b.full_name} — ${new Date(`${b.birth_date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`);
    }
    lines.push("");
  }
  if (data.news.length > 0) {
    lines.push("📢 *Avisos*");
    for (const n of data.news) lines.push(`• ${n.title}`);
    lines.push("");
  }
  if (data.prayers.length > 0) {
    lines.push(`🙏 ${data.prayers.length} pedido(s) de oração novo(s) esta semana`);
  }
  return lines.join("\n").trim();
}

function useBulletinData() {
  const fetch = useServerFn(getWeeklyBulletin);
  return useQuery({ queryKey: ["weekly-bulletin"], queryFn: () => fetch() });
}

function BoletimPage() {
  const { data, isLoading } = useBulletinData();

  function copyToWhatsapp() {
    if (!data) return;
    navigator.clipboard.writeText(buildWhatsappText(data));
    toast.success("Texto copiado — cole no WhatsApp");
  }

  if (isLoading || !data) {
    return (
      <AppShell>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 16mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .boletim-print { box-shadow: none !important; border: none !important; }
        }
      `}</style>
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-6 no-print">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Newspaper className="h-6 w-6" /> Boletim Semanal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Resumo automático da semana — agenda, aniversariantes, avisos e oração.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToWhatsapp}>
              <Copy className="h-4 w-4 mr-2" />Copiar para WhatsApp
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />Imprimir
            </Button>
          </div>
        </div>

        <Card className="boletim-print p-6 space-y-6">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-semibold">{data.churchName}</h2>
            <p className="text-sm text-muted-foreground">
              Boletim de {fmtDate(data.periodFrom)} a {fmtDate(data.periodTo)}
            </p>
          </div>

          {(data.weeklyVerse || data.weeklyMessage) && (
            <div className="text-center">
              {data.weeklyVerse && (
                <p className="italic text-sm">
                  “{data.weeklyVerse}”{data.weeklyVerseRef && <span className="text-muted-foreground"> — {data.weeklyVerseRef}</span>}
                </p>
              )}
              {data.weeklyMessage && <p className="text-sm mt-2 whitespace-pre-wrap">{data.weeklyMessage}</p>}
            </div>
          )}

          <section>
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <CalendarDays className="h-4 w-4" /> Agenda da semana
            </h3>
            {data.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento programado para os próximos 7 dias.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {data.events.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span>{e.type_name}{e.location_name ? ` · ${e.location_name}` : ""}</span>
                    <span className="text-muted-foreground shrink-0">{fmtDate(e.event_date)} {e.start_time?.slice(0, 5)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Cake className="h-4 w-4" /> Aniversariantes
            </h3>
            {data.birthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aniversariante nos próximos 7 dias.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {data.birthdays.map((b) => (
                  <li key={b.id} className="flex justify-between gap-3">
                    <span>{b.full_name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(`${b.birth_date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {data.news.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <Newspaper className="h-4 w-4" /> Avisos e notícias
              </h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {data.news.map((n) => <li key={n.id}>{n.title}</li>)}
              </ul>
            </section>
          )}

          {data.prayers.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <HandHeart className="h-4 w-4" /> Pedidos de oração da semana
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.prayers.length} pedido(s) recebido(s) — acompanhe em "Pedidos de oração".
              </p>
            </section>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
