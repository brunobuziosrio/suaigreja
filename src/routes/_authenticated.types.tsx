import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTypes, upsertType, deleteType } from "@/lib/types.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/types")({
  component: TypesPage,
});

type TypeForm = { id?: string; name: string; active: boolean; color: string; icon: string };
const empty: TypeForm = { name: "", active: true, color: "#467da5", icon: "" };
const EMOJI_PRESETS = ["⛪", "🙏", "🕊️", "🎉", "💒", "👶", "✝️", "📖", "🎵", "🤝", "🌿", "🕯️"];

function TypesPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listTypes);
  const save = useServerFn(upsertType);
  const remove = useServerFn(deleteType);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchList(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TypeForm>(empty);

  const upsertMut = useMutation({
    mutationFn: (input: TypeForm) =>
      save({
        data: {
          id: input.id,
          name: input.name.trim(),
          active: input.active,
          color: input.color,
          icon: input.icon.trim(),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["types"] });
      toast.success("Tipo salvo");
      setOpen(false);
      setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["types"] });
      toast.success("Tipo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="p-6 max-w-5xl">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tipos de celebração</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Defina os tipos que aparecem ao criar um evento.
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setForm(empty);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo tipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar tipo" : "Novo tipo"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Missa, Culto, Vigília..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ícone (emoji)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value.slice(0, 4) })}
                      placeholder="Ex: ⛪"
                      className="w-20 text-center text-lg"
                      maxLength={4}
                    />
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_PRESETS.map((emj) => (
                        <button
                          key={emj}
                          type="button"
                          onClick={() => setForm({ ...form, icon: emj })}
                          className="text-lg w-8 h-8 rounded border hover:border-primary"
                        >
                          {emj}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="color"
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-28 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={!form.name.trim() || upsertMut.isPending}
                  onClick={() => upsertMut.mutate(form)}
                >
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <ListChecks className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum tipo cadastrado</h3>
          </Card>
        ) : (
          <div className="grid gap-3">
            {items.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-base shrink-0"
                    style={{ backgroundColor: `${t.color}22`, color: t.color }}
                  >
                    {t.icon || "•"}
                  </span>
                  <p className="font-medium truncate">{t.name}</p>
                  {!t.active && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativo</span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setForm({
                        id: t.id,
                        name: t.name,
                        active: t.active,
                        color: t.color ?? "#467da5",
                        icon: t.icon ?? "",
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Remover "${t.name}"?`)) deleteMut.mutate(t.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}