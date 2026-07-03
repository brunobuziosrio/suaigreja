import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicSecretariaStatus } from "@/lib/secretaria.functions";
import { Card } from "@/components/ui/card";
import { ClipboardList, FileX, CheckCircle2, Clock, CalendarCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/protocolo/$id")({
  loader: async ({ params }) => {
    const data = await getPublicSecretariaStatus({ data: { id: params.id } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Acompanhar solicitação — ${loaderData?.churchName ?? "Igreja"}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProtocolStatusPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-muted/30">
      <div>
        <FileX className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold mt-3">Protocolo não encontrado</h1>
        <p className="text-sm text-muted-foreground mt-1">Confira se o link está correto.</p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-muted/30">
      <div><p className="text-sm text-destructive">{error.message}</p></div>
    </div>
  ),
});

const REQUEST_TYPE_LABELS: Record<string, string> = {
  batismo: "Batismo",
  casamento: "Casamento",
  catequese: "Catequese",
  visita_pastoral: "Visita pastoral",
  aconselhamento: "Aconselhamento",
  declaracao: "Declaração",
  certidao: "Certidão",
  apresentacao_crianca: "Apresentação de criança",
  outro: "Solicitação",
};

const STEPS = [
  { key: "recebido", label: "Recebido", icon: ClipboardList },
  { key: "em_andamento", label: "Em andamento", icon: Clock },
  { key: "agendado", label: "Agendado", icon: CalendarCheck },
  { key: "concluido", label: "Concluído", icon: CheckCircle2 },
];

function ProtocolStatusPage() {
  const data = Route.useLoaderData();
  const isCancelled = data.status === "cancelado";
  const currentIndex = STEPS.findIndex((s) => s.key === data.status);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <ClipboardList className="h-9 w-9 mx-auto text-muted-foreground" />
          <h1 className="text-lg font-semibold mt-3">Acompanhamento de solicitação</h1>
          <p className="text-sm text-muted-foreground mt-1">{data.churchName}</p>
        </div>

        <div className="mt-6 rounded-md border divide-y text-sm">
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Solicitante</span>
            <span className="font-medium text-right">{data.requester_name}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Tipo</span>
            <span className="font-medium text-right">{REQUEST_TYPE_LABELS[data.request_type] ?? data.request_type}</span>
          </div>
          {data.preferred_date && (
            <div className="flex items-center justify-between p-3">
              <span className="text-muted-foreground">Data de preferência</span>
              <span className="font-medium">{new Date(`${data.preferred_date}T00:00:00`).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
          {data.scheduled_at && (
            <div className="flex items-center justify-between p-3">
              <span className="text-muted-foreground">Agendado para</span>
              <span className="font-medium">{new Date(data.scheduled_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Aberto em</span>
            <span className="font-medium">{new Date(data.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {isCancelled ? (
          <div className="mt-6 flex items-center gap-2 justify-center text-sm text-destructive">
            <XCircle className="h-4 w-4" /> Esta solicitação foi cancelada.
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentIndex;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center text-center relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${i <= currentIndex ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                      done ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs mt-1.5 ${done ? "font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Dúvidas? Entre em contato diretamente com a secretaria.
        </p>
      </Card>
    </div>
  );
}
