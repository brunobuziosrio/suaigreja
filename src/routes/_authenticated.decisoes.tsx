import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listDecisions,
  updateDecisionStatus,
  updateDecisionNote,
  deleteDecision,
  type DecisionRow,
} from "@/lib/decisions.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HandHeart, MessageCircle, Phone, Mail, Trash2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/decisoes")({ component: DecisionsPage });

const KIND_LABELS: Record<string, string> = {
  aceitar_jesus: "Aceitar Jesus",
  voltar_igreja: "Voltar pra igreja",
  conversar: "Conversar com alguém",
  batismo: "Quero me batizar",
  celula: "Entrar numa célula",
  aconselhamento: "Aconselhamento",
};

const STATUS_LABELS = { pending: "Novos", contacted: "Em contato", done: "Concluídos" } as const;

function DecisionsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listDecisions);
  const upd = useServerFn(updateDecisionStatus);
  const updNote = useServerFn(updateDecisionNote);
  const del = useServerFn(deleteDecision);

  const { data: decisions = [], isLoading } = useQuery({ queryKey: ["decisions"], queryFn: () => list() });
  const [tab, setTab] = useState<"pending" | "contacted" | "done">("pending");

  const updMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "contacted" | "done" }) => upd({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decisions"] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["decisions"] });
    },
  });

  const filtered = decisions.filter((d) => d.status === tab);
  const counts = {
    pending: decisions.filter((d) => d.status === "pending").length,
    contacted: decisions.filter((d) => d.status === "contacted").length,
    done: decisions.filter((d) => d.status === "done").length,
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <HandHeart className="h-6 w-6" /> Central de Decisões
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Respostas do formulário público: aceitar Jesus, voltar pra igreja, batismo, célula e aconselhamento.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">{STATUS_LABELS.pending} ({counts.pending})</TabsTrigger>
            <TabsTrigger value="contacted">{STATUS_LABELS.contacted} ({counts.contacted})</TabsTrigger>
            <TabsTrigger value="done">{STATUS_LABELS.done} ({counts.done})</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4 space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && filtered.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">Nenhum registro nesta caixa.</Card>
            )}
            {filtered.map((d) => (
              <DecisionCard
                key={d.id}
                d={d}
                onStatus={(s) => updMut.mutate({ id: d.id, status: s })}
                onDelete={() => confirm("Excluir definitivamente?") && delMut.mutate(d.id)}
                onSaveNote={async (note) => {
                  await updNote({ data: { id: d.id, note } });
                  toast.success("Anotação salva");
                  qc.invalidateQueries({ queryKey: ["decisions"] });
                }}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function DecisionCard({
  d,
  onStatus,
  onDelete,
  onSaveNote,
}: {
  d: DecisionRow;
  onStatus: (s: "pending" | "contacted" | "done") => void;
  onDelete: () => void;
  onSaveNote: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState(d.assignee_note ?? "");
  const [saving, setSaving] = useState(false);
  const waLink = d.phone
    ? `https://wa.me/55${d.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${d.name.split(" ")[0]}! Recebemos seu pedido e queremos conversar com você. 🙏`)}`
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{d.name}</span>
            <Badge variant="primary">{KIND_LABELS[d.kind] ?? d.kind}</Badge>
            <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString("pt-BR")}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
            {d.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {d.phone}</span>}
            {d.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {d.email}</span>}
          </div>
          {d.message && (
            <div className="mt-2 text-sm bg-muted/40 rounded p-2 whitespace-pre-wrap">{d.message}</div>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="w-full">
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          {d.status !== "contacted" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus("contacted")}>
              <Check className="h-3.5 w-3.5 mr-1" /> Em contato
            </Button>
          )}
          {d.status !== "done" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus("done")}>
              <Check className="h-3.5 w-3.5 mr-1" /> Concluir
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <Textarea
          rows={2}
          placeholder="Anotações internas (quem vai visitar, encaminhamento...)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {note !== (d.assignee_note ?? "") && (
          <Button
            size="sm"
            className="mt-2"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSaveNote(note);
              setSaving(false);
            }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}Salvar anotação
          </Button>
        )}
      </div>
    </Card>
  );
}
