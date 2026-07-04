import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listPrivacyPolicyVersions,
  createPrivacyPolicyVersion,
  setCurrentPrivacyPolicyVersion,
  deletePrivacyPolicyVersion,
} from "@/lib/privacy-policy.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/politica-privacidade")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const qc = useQueryClient();
  const fetchVersions = useServerFn(listPrivacyPolicyVersions);
  const create = useServerFn(createPrivacyPolicyVersion);
  const setCurrent = useServerFn(setCurrentPrivacyPolicyVersion);
  const remove = useServerFn(deletePrivacyPolicyVersion);

  const { data: versions = [], isLoading } = useQuery({ queryKey: ["privacy-policy-versions"], queryFn: () => fetchVersions() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    version: "",
    content: "",
    effective_date: new Date().toISOString().slice(0, 10),
    make_current: true,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["privacy-policy-versions"] });

  const createMut = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => {
      invalidate();
      toast.success("Versão publicada");
      setOpen(false);
      setForm({ version: "", content: "", effective_date: new Date().toISOString().slice(0, 10), make_current: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentMut = useMutation({
    mutationFn: (id: string) => setCurrent({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Versão vigente atualizada"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Versão removida"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="w-full max-w-2xl">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" /> Política de Privacidade
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              A política que sua igreja publica pra visitantes e membros — versionada, com histórico.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova versão</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Nova versão da política</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Rótulo da versão</Label>
                      <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="Ex: v1.0, Julho/2026" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de vigência</Label>
                      <Input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Texto completo da política de privacidade..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button
                    disabled={!form.version.trim() || form.content.trim().length < 20 || createMut.isPending}
                    onClick={() => createMut.mutate()}
                  >
                    {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Publicar como vigente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : versions.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma versão publicada ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">Crie a primeira versão da política de privacidade da sua igreja.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {versions.map((v) => (
              <Card key={v.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{v.version}</span>
                      {v.is_current && <Badge variant="success">Vigente</Badge>}
                      <span className="text-xs text-muted-foreground">
                        vigora desde {new Date(`${v.effective_date}T00:00:00`).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{v.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!v.is_current && (
                      <Button size="sm" variant="outline" onClick={() => currentMut.mutate(v.id)}>Tornar vigente</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm(`Remover a versão "${v.version}"?`)) deleteMut.mutate(v.id);
                    }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <ExternalLink className="h-3 w-3" />
          A versão vigente aparece automaticamente no rodapé do site público da sua igreja.
        </p>
      </div>
    </AppShell>
  );
}
