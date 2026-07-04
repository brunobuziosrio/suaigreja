import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAbsentMembers } from "@/lib/event-attendance.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, MessageCircle, Loader2, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ausencias")({
  component: AbsentMembersPage,
});

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function AbsentMembersPage() {
  const fetchAbsent = useServerFn(listAbsentMembers);
  const { data, isLoading } = useQuery({ queryKey: ["absent-members"], queryFn: () => fetchAbsent() });

  return (
    <AppShell>
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <UserX className="h-6 w-6" /> Alertas de Ausência
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fiéis ativos sem presença registrada há 21 dias ou mais — um sinal pra visita ou ligação pastoral.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !data?.trackingActive ? (
          <Card className="p-8 text-center">
            <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-semibold">Ainda não há presença suficiente registrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use o botão de presença nos eventos da <a href="/agenda" className="underline">Agenda</a> por
              algumas semanas — os alertas de ausência aparecem aqui assim que houver dados suficientes.
            </p>
          </Card>
        ) : data.members.length === 0 ? (
          <Card className="p-8 text-center">
            <UserX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-semibold">Ninguém sumido no momento</h3>
            <p className="text-sm text-muted-foreground mt-1">Todos os fiéis ativos têm presença recente registrada.</p>
          </Card>
        ) : (
          <div className="grid gap-2">
            {data.members.map((m) => (
              <Card key={m.member_id} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(m.full_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.days_absent === null ? "Nunca teve presença registrada" : `${m.days_absent} dias sem aparecer`}
                    </p>
                  </div>
                </div>
                {m.phone && (
                  <a
                    href={`https://wa.me/55${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Olá ${m.full_name.split(" ")[0]}! Sentimos sua falta por aqui. Como você está? 🙏`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="shrink-0">
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />WhatsApp
                    </Button>
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
