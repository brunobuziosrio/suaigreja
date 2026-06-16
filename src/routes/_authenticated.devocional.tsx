import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listDevotionals, upsertDevotional, deleteDevotional } from "@/lib/devotionals.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/devocional")({
  component: DevocionalPage,
  head: () => ({ meta: [{ title: "Devocional Diário" }] }),
});

function DevocionalPage() {
  const list = useServerFn(listDevotionals);
  const upsert = useServerFn(upsertDevotional);
  const del = useServerFn(deleteDevotional);
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["devotionals"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (p: any) => upsert({ data: p }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["devotionals"] }); setOpen(false); toast.success("Salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["devotionals"] }); toast.success("Removido"); },
  });

  return (
    <AppShell>
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Devocional Diário</h1>
          <p className="text-sm text-muted-foreground">Programe versículos e reflexões diárias. O mais recente publicado aparece no Hub.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo devocional</Button>
      </div>

      <div className="space-y-3">
        {items.map((d: any) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{new Date(d.devotional_date + "T00:00:00").toLocaleDateString("pt-BR")}{!d.published && " · Rascunho"}</p>
                <h3 className="font-semibold">{d.verse_ref}</h3>
                <p className="text-sm italic mt-1">"{d.verse_text}"</p>
                {d.message && <p className="text-sm mt-2 whitespace-pre-wrap">{d.message}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(d); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && remove.mutate(d.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum devocional ainda.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar devocional" : "Novo devocional"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            save.mutate({
              id: editing?.id,
              devotional_date: f.get("devotional_date"),
              verse_ref: f.get("verse_ref"),
              verse_text: f.get("verse_text"),
              message: f.get("message") || null,
              published: f.get("published") === "on",
            });
          }} className="space-y-3">
            <div><Label>Data*</Label><Input name="devotional_date" type="date" required defaultValue={editing?.devotional_date ?? new Date().toISOString().slice(0,10)} /></div>
            <div><Label>Referência*</Label><Input name="verse_ref" required defaultValue={editing?.verse_ref} placeholder="João 3:16" /></div>
            <div><Label>Versículo*</Label><Textarea name="verse_text" required rows={3} defaultValue={editing?.verse_text} /></div>
            <div><Label>Reflexão</Label><Textarea name="message" rows={5} defaultValue={editing?.message ?? ""} /></div>
            <div className="flex items-center gap-2"><Switch name="published" defaultChecked={editing ? editing.published : true} /> <Label>Publicado</Label></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}