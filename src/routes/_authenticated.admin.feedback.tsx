import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/admin.functions";
import {
  listSystemUpdates,
  createSystemUpdate,
  deleteSystemUpdate,
  listAllSuggestions,
  deleteSuggestion,
} from "@/lib/feedback.functions";
import { toast } from "sonner";
import { useState } from "react";
import { Megaphone, Lightbulb, Trash2, Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  component: AdminFeedbackPage,
});

function AdminFeedbackPage() {
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = !!adminCheck?.isAdmin;

  const fetchUpdates = useServerFn(listSystemUpdates);
  const fetchSuggestions = useServerFn(listAllSuggestions);
  const addUpdate = useServerFn(createSystemUpdate);
  const removeUpdate = useServerFn(deleteSystemUpdate);
  const removeSuggestion = useServerFn(deleteSuggestion);

  const { data: updates = [] } = useQuery({
    queryKey: ["system-updates"],
    queryFn: () => fetchUpdates(),
    enabled: isAdmin,
  });
  const { data: suggestions = [] } = useQuery({
    queryKey: ["all-suggestions"],
    queryFn: () => fetchSuggestions(),
    enabled: isAdmin,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");

  const addMut = useMutation({
    mutationFn: () =>
      addUpdate({ data: { title: title.trim(), content: content.trim(), version: version.trim() || null } }),
    onSuccess: () => {
      toast.success("Atualização publicada");
      setTitle(""); setContent(""); setVersion("");
      qc.invalidateQueries({ queryKey: ["system-updates"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro"),
  });

  const delUpdateMut = useMutation({
    mutationFn: (id: string) => removeUpdate({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["system-updates"] }),
  });

  const delSugMut = useMutation({
    mutationFn: (id: string) => removeSuggestion({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-suggestions"] }),
  });

  if (checking) {
    return (
      <AppShell>
        <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="p-6 max-w-md">
          <Card className="p-6 text-center">
            <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Acesso restrito a administradores.</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Atualizações & Sugestões</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Publique novidades para todos os assinantes e veja as sugestões recebidas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Publicar atualização</h2>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  className="col-span-2"
                  placeholder="Título da atualização"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={160}
                />
                <Input
                  placeholder="Versão (opcional)"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  maxLength={40}
                />
              </div>
              <Textarea
                placeholder="O que mudou nesta atualização?"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={4000}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => addMut.mutate()}
                  disabled={addMut.isPending || !title.trim() || !content.trim()}
                >
                  {addMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Publicar
                </Button>
              </div>
            </div>

            <div className="mt-5 border-t pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Publicadas</p>
              {updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma atualização publicada ainda.</p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto pr-1">
                  {(updates as any[]).map((u) => (
                    <li key={u.id} className="border rounded p-2 flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{u.title}</p>
                          {u.version && (
                            <span className="text-[10px] font-mono uppercase rounded bg-primary/10 text-primary px-1.5 py-0.5">
                              v{u.version}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">{u.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(u.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { if (confirm("Remover esta atualização?")) delUpdateMut.mutate(u.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold">Sugestões dos clientes</h2>
            </div>
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma sugestão recebida ainda.</p>
            ) : (
              <ul className="space-y-2 max-h-[600px] overflow-auto pr-1">
                {(suggestions as any[]).map((s) => (
                  <li key={s.id} className="border rounded p-3 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-line mt-1">{s.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {s.account_name || s.email || "—"} ·{" "}
                        {new Date(s.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { if (confirm("Remover sugestão?")) delSugMut.mutate(s.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}