import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, MapPin, Phone, Plus, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteCongregation, listCongregations, upsertCongregation, type CongregationRow } from "@/lib/congregations.functions";

export const Route = createFileRoute("/_authenticated/congregacoes")({ component: CongregationsPage });
type Form = { id?: string; name: string; code: string; address: string; city: string; state: string; leader_name: string; leader_phone: string; notes: string; active: boolean };
const empty: Form = { name: "", code: "", address: "", city: "", state: "", leader_name: "", leader_phone: "", notes: "", active: true };

function CongregationsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listCongregations), save = useServerFn(upsertCongregation), remove = useServerFn(deleteCongregation);
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["congregations"], queryFn: () => list() });
  const [open, setOpen] = useState(false), [form, setForm] = useState<Form>(empty);
  const refresh = () => qc.invalidateQueries({ queryKey: ["congregations"] });
  const saving = useMutation({ mutationFn: () => save({ data: { ...form, code: form.code || null, address: form.address || null, city: form.city || null, state: form.state || null, leader_name: form.leader_name || null, leader_phone: form.leader_phone || null, notes: form.notes || null } }), onSuccess: () => { refresh(); setOpen(false); setForm(empty); toast.success("Congregação salva"); }, onError: (e: Error) => toast.error(e.message) });
  const deleting = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: () => { refresh(); toast.success("Congregação removida"); }, onError: (e: Error) => toast.error(e.message) });
  const edit = (c: CongregationRow) => { setForm({ id: c.id, name: c.name, code: c.code ?? "", address: c.address ?? "", city: c.city ?? "", state: c.state ?? "", leader_name: c.leader_name ?? "", leader_phone: c.leader_phone ?? "", notes: c.notes ?? "", active: c.active }); setOpen(true); };
  return <AppShell><div className="w-full space-y-6">
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-sm">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
      <div className="relative flex flex-wrap items-end justify-between gap-5"><div><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Building2 className="h-5 w-5" /></div><h1 className="text-2xl font-semibold tracking-tight">Congregações</h1><p className="mt-1 max-w-2xl text-sm text-emerald-100">Organize sede e unidades em um só lugar, com liderança e membros vinculados.</p></div>
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setForm(empty); }}><DialogTrigger asChild><Button variant="secondary"><Plus className="mr-2 h-4 w-4" />Nova unidade</Button></DialogTrigger><DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>{form.id ? "Editar congregação" : "Nova congregação"}</DialogTitle></DialogHeader><div className="grid gap-4 py-2">
        <div className="grid gap-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Congregação Jardim Esperança" /></div>
        <div className="grid grid-cols-3 gap-3"><div className="col-span-2 grid gap-2"><Label>Código interno</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="FILIAL-02" /></div><div className="grid gap-2"><Label>UF</Label><Input maxLength={2} value={form.state} onChange={e => setForm({ ...form, state: e.target.value.toUpperCase() })} /></div></div>
        <div className="grid gap-2"><Label>Endereço</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div><div className="grid gap-2"><Label>Cidade</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        <div className="grid gap-3 sm:grid-cols-2"><div className="grid gap-2"><Label>Líder responsável</Label><Input value={form.leader_name} onChange={e => setForm({ ...form, leader_name: e.target.value })} /></div><div className="grid gap-2"><Label>Telefone</Label><Input value={form.leader_phone} onChange={e => setForm({ ...form, leader_phone: e.target.value })} /></div></div>
        <div className="grid gap-2"><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div><div className="flex items-center justify-between rounded-lg border p-3"><div><Label>Unidade ativa</Label><p className="text-xs text-muted-foreground">Unidades inativas permanecem no histórico.</p></div><Switch checked={form.active} onCheckedChange={active => setForm({ ...form, active })} /></div>
      </div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={!form.name.trim() || saving.isPending} onClick={() => saving.mutate()}>Salvar</Button></DialogFooter></DialogContent></Dialog></div>
    </div>
    {isLoading ? <p className="py-12 text-center text-sm text-muted-foreground">Carregando unidades…</p> : isError ? <Card className="p-8 text-center" role="alert"><h2 className="font-semibold">Não foi possível carregar as unidades</h2><p className="mt-1 text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p><Button className="mt-4" variant="outline" onClick={() => refetch()}>Tentar novamente</Button></Card> : data.length === 0 ? <Card className="border-dashed p-12 text-center"><Building2 className="mx-auto mb-3 h-9 w-9 text-muted-foreground" /><h2 className="font-semibold">Nenhuma congregação cadastrada</h2><p className="mt-1 text-sm text-muted-foreground">Cadastre a sede ou a primeira unidade para iniciar a organização.</p></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map(c => <Card key={c.id} className={"group overflow-hidden p-0 transition-shadow hover:shadow-md " + (!c.active ? "opacity-65" : "")}><div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{c.name}</h2>{c.code && <p className="text-xs text-muted-foreground">{c.code}</p>}</div><Badge variant={c.active ? "success" : "neutral"}>{c.active ? "Ativa" : "Inativa"}</Badge></div><div className="mt-4 space-y-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Users className="h-4 w-4" />{c.members_count} membro(s)</p>{c.leader_name && <p className="flex items-center gap-2"><UserRound className="h-4 w-4" />{c.leader_name}</p>}{c.leader_phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{c.leader_phone}</p>}{(c.address || c.city) && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{[c.address, c.city, c.state].filter(Boolean).join(" · ")}</p>}</div><div className="mt-5 flex gap-2 border-t pt-3"><Button size="sm" variant="outline" onClick={() => edit(c)}>Editar</Button><Button size="sm" variant="ghost" onClick={() => confirm("Remover esta congregação? Os membros ficarão sem unidade vinculada.") && deleting.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div></Card>)}</div>}
  </div></AppShell>;
}
