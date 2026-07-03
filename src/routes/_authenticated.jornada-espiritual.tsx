import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMembers, setMemberSpiritualStage, SPIRITUAL_STAGES } from "@/lib/members.functions";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/jornada-espiritual")({
  component: SpiritualJourneyPage,
});

const STAGE_META: Record<string, { label: string; color: string }> = {
  novo_convertido: { label: "Novo convertido", color: "bg-sky-100 text-sky-800" },
  em_acompanhamento: { label: "Em acompanhamento", color: "bg-amber-100 text-amber-800" },
  batizado: { label: "Batizado", color: "bg-emerald-100 text-emerald-800" },
  serve: { label: "Serve num ministério", color: "bg-purple-100 text-purple-800" },
  lider: { label: "Líder", color: "bg-rose-100 text-rose-800" },
};

const STAGE_ORDER = [...SPIRITUAL_STAGES];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function SpiritualJourneyPage() {
  const qc = useQueryClient();
  const fetchMembers = useServerFn(listMembers);
  const setStage = useServerFn(setMemberSpiritualStage);

  const { data: members = [], isLoading } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const [filter, setFilter] = useState("todos");

  const stageMut = useMutation({
    mutationFn: (v: { member_id: string; spiritual_stage: string | null }) => setStage({ data: v as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Etapa atualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { sem_etapa: 0 };
    for (const stage of STAGE_ORDER) c[stage] = 0;
    for (const m of members as any[]) {
      if (m.status !== "ativo") continue;
      if (m.spiritual_stage && c[m.spiritual_stage] !== undefined) c[m.spiritual_stage]++;
      else c.sem_etapa++;
    }
    return c;
  }, [members]);

  const filtered = useMemo(() => {
    const active = (members as any[]).filter((m) => m.status === "ativo");
    if (filter === "todos") return active;
    if (filter === "sem_etapa") return active.filter((m) => !m.spiritual_stage);
    return active.filter((m) => m.spiritual_stage === filter);
  }, [members, filter]);

  return (
    <AppShell>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sprout className="h-6 w-6" /> Jornada Espiritual
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Em que etapa de crescimento cada fiel está — pra direcionar acompanhamento pastoral.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <button
            onClick={() => setFilter("todos")}
            className={`text-left rounded-lg border p-3 transition-colors ${filter === "todos" ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
          >
            <p className="text-2xl font-semibold">{(members as any[]).filter((m) => m.status === "ativo").length}</p>
            <p className="text-xs text-muted-foreground">Todos</p>
          </button>
          {STAGE_ORDER.map((stage) => (
            <button
              key={stage}
              onClick={() => setFilter(stage)}
              className={`text-left rounded-lg border p-3 transition-colors ${filter === stage ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
            >
              <p className="text-2xl font-semibold">{counts[stage]}</p>
              <p className="text-xs text-muted-foreground">{STAGE_META[stage].label}</p>
            </button>
          ))}
          <button
            onClick={() => setFilter("sem_etapa")}
            className={`text-left rounded-lg border p-3 transition-colors ${filter === "sem_etapa" ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
          >
            <p className="text-2xl font-semibold">{counts.sem_etapa}</p>
            <p className="text-xs text-muted-foreground">Sem etapa definida</p>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">Nenhum fiel nesta etapa.</Card>
        ) : (
          <div className="grid gap-2">
            {filtered.map((m: any) => (
              <Card key={m.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(m.full_name)}
                    </div>
                  )}
                  <p className="text-sm font-medium truncate">{m.full_name}</p>
                </div>
                <Select
                  value={m.spiritual_stage ?? "_none"}
                  onValueChange={(v) => stageMut.mutate({ member_id: m.id, spiritual_stage: v === "_none" ? null : v })}
                >
                  <SelectTrigger className="w-56"><SelectValue placeholder="Sem etapa definida" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem etapa definida</SelectItem>
                    {STAGE_ORDER.map((stage) => (
                      <SelectItem key={stage} value={stage}>{STAGE_META[stage].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
