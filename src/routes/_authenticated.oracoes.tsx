import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPrayerRequests, updatePrayerStatus, deletePrayerRequest } from "@/lib/prayer.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HandHeart, Check, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/oracoes")({ component: PrayersPage });

function PrayersPage() {
  const list = useServerFn(listPrayerRequests);
  const upd = useServerFn(updatePrayerStatus);
  const del = useServerFn(deletePrayerRequest);
  const qc = useQueryClient();
  const { data: all = [], isLoading } = useQuery({ queryKey: ["prayers"], queryFn: () => list() });
  const [tab, setTab] = useState<"pending" | "approved" | "archived">("pending");

  const updMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "approved" | "archived" }) =>
      upd({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prayers"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["prayers"] });
    },
  });

  const filtered = all.filter((p) => p.status === tab);
  const counts = {
    pending: all.filter((p) => p.status === "pending").length,
    approved: all.filter((p) => p.status === "approved").length,
    archived: all.filter((p) => p.status === "archived").length,
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <HandHeart className="h-6 w-6" /> Pedidos de Oração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Receba pedidos da sua comunidade. Aprove para exibir no mural público da sua igreja.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">Pendentes ({counts.pending})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados ({counts.approved})</TabsTrigger>
            <TabsTrigger value="archived">Arquivados ({counts.archived})</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4 space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && filtered.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Nenhum pedido nesta caixa.
              </Card>
            )}
            {filtered.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{p.is_anonymous ? "Anônimo" : p.name}</span>
                      {p.is_anonymous && <Badge variant="secondary">anônimo</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </span>
                      {p.status === "approved" && (
                        <Badge variant="outline">🙏 {p.prayer_count}</Badge>
                      )}
                    </div>
                    {!p.is_anonymous && (p.email || p.phone) && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {p.email} {p.phone && `· ${p.phone}`}
                      </div>
                    )}
                    <p className="mt-2 text-sm whitespace-pre-wrap">{p.message}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {p.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updMut.mutate({ id: p.id, status: "approved" })}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                      </Button>
                    )}
                    {p.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updMut.mutate({ id: p.id, status: "archived" })}
                      >
                        <Archive className="h-3.5 w-3.5 mr-1" /> Arquivar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirm("Excluir definitivamente?") && delMut.mutate(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}