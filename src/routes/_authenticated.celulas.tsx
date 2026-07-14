import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listSmallGroups,
  upsertSmallGroup,
  deleteSmallGroup,
  type SmallGroupRow,
  type SmallGroupUpsertPayload,
} from "@/lib/small-groups.functions";
import {
  listSmallGroupMembers,
  addSmallGroupMember,
  setSmallGroupMemberRole,
  removeSmallGroupMember,
} from "@/lib/small-group-members.functions";
import { listMembers } from "@/lib/members.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users2, MapPin, Clock, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/celulas")({
  component: CelulasPage,
  head: () => ({ meta: [{ title: "Pequenos Grupos / Células" }] }),
});

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
type MemberOption = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "full_name">;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

function CelulasPage() {
  const list = useServerFn(listSmallGroups);
  const upsert = useServerFn(upsertSmallGroup);
  const del = useServerFn(deleteSmallGroup);
  const qc = useQueryClient();
  const { data: groups = [], isLoading } = useQuery({ queryKey: ["small_groups"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SmallGroupRow | null>(null);
  const [membersGroup, setMembersGroup] = useState<SmallGroupRow | null>(null);

  const save = useMutation({
    mutationFn: (payload: SmallGroupUpsertPayload) => upsert({ data: payload }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["small_groups"] }); setOpen(false); toast.success("Salvo"); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["small_groups"] }); toast.success("Removido"); },
  });

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Users2 className="h-6 w-6" /> Pequenos Grupos / Células</h1>
          <p className="text-sm text-muted-foreground">Cadastre células com líder, dia, horário e endereço.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova célula</Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Card key={g.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  {g.leader_name && <p className="text-xs text-muted-foreground">Líder: {g.leader_name}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" title="Membros" onClick={() => setMembersGroup(g)}><UserPlus className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(g); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && remove.mutate(g.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {g.weekday != null && (
                <p className="text-sm flex items-center gap-1"><Clock className="h-3 w-3" /> {WEEKDAYS[g.weekday]} {g.start_time?.slice(0,5)}</p>
              )}
              {g.address && <p className="text-xs text-muted-foreground flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5" /> {g.address}{g.neighborhood ? ` — ${g.neighborhood}` : ""}</p>}
              {!g.active && <span className="text-xs text-muted-foreground">Inativa</span>}
            </Card>
          ))}
          {groups.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Nenhuma célula cadastrada ainda.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar célula" : "Nova célula"}</DialogTitle></DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const getText = (name: string) => {
                const value = f.get(name);
                return typeof value === "string" ? value : "";
              };
              const wd = getText("weekday");
              save.mutate({
                id: editing?.id,
                name: getText("name"),
                leader_name: getText("leader_name") || null,
                leader_phone: getText("leader_phone") || null,
                weekday: wd ? Number(wd) : null,
                start_time: getText("start_time") || null,
                address: getText("address") || null,
                neighborhood: getText("neighborhood") || null,
                description: getText("description") || null,
                capacity: getText("capacity") ? Number(getText("capacity")) : null,
                active: getText("active") === "on",
              });
            }}
            className="space-y-3"
          >
            <div><Label>Nome*</Label><Input name="name" required defaultValue={editing?.name} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Líder</Label><Input name="leader_name" defaultValue={editing?.leader_name ?? ""} /></div>
              <div><Label>WhatsApp do líder</Label><Input name="leader_phone" defaultValue={editing?.leader_phone ?? ""} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dia da semana</Label>
                <select name="weekday" defaultValue={editing?.weekday ?? ""} className="w-full h-10 px-3 rounded-md border bg-background">
                  <option value="">—</option>
                  {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div><Label>Horário</Label><Input name="start_time" type="time" defaultValue={editing?.start_time?.slice(0,5) ?? ""} /></div>
            </div>
            <div><Label>Endereço</Label><Input name="address" defaultValue={editing?.address ?? ""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bairro</Label><Input name="neighborhood" defaultValue={editing?.neighborhood ?? ""} /></div>
              <div><Label>Capacidade</Label><Input name="capacity" type="number" min="0" defaultValue={editing?.capacity ?? ""} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea name="description" rows={3} defaultValue={editing?.description ?? ""} /></div>
            <div className="flex items-center gap-2"><Switch name="active" defaultChecked={editing ? editing.active : true} /> <Label>Ativa</Label></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <GroupMembersDialog group={membersGroup} onClose={() => setMembersGroup(null)} />
    </div>
    </AppShell>
  );
}

function GroupMembersDialog({ group, onClose }: { group: SmallGroupRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const fetchRoster = useServerFn(listSmallGroupMembers);
  const fetchMembers = useServerFn(listMembers);
  const add = useServerFn(addSmallGroupMember);
  const setRole = useServerFn(setSmallGroupMemberRole);
  const removeMember = useServerFn(removeSmallGroupMember);
  const groupId = group?.id ?? "";

  const { data: roster = [], isLoading } = useQuery({
    queryKey: ["small-group-members", groupId],
    queryFn: () => (groupId ? fetchRoster({ data: { group_id: groupId } }) : Promise.resolve([])),
    enabled: !!group,
  });
  const { data: allMembers = [] } = useQuery<MemberOption[]>({
    queryKey: ["members"],
    queryFn: () => fetchMembers() as Promise<MemberOption[]>,
    enabled: !!group,
  });

  const [memberId, setMemberId] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["small-group-members", groupId] });

  const addMut = useMutation({
    mutationFn: () => add({ data: { group_id: groupId, member_id: memberId, role: "membro" } }),
    onSuccess: () => { invalidate(); toast.success("Adicionado à célula"); setMemberId(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMut = useMutation({
    mutationFn: (v: { id: string; role: string }) => setRole({ data: v }),
    onSuccess: () => { invalidate(); toast.success("Papel atualizado"); },
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => removeMember({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Removido da célula"); },
  });

  const availableMembers = allMembers.filter((member) => !roster.some((rosterMember) => rosterMember.member_id === member.id));

  return (
    <Dialog open={!!group} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Membros — {group?.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Adicionar membro…" /></SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => <SelectItem key={member.id} value={member.id}>{member.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" disabled={!memberId || addMut.isPending} onClick={() => addMut.mutate()}>
              {addMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Adicionar"}
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum membro nesta célula ainda.</p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {roster.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-muted/40">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.members?.photo_url ? (
                      <img src={r.members.photo_url} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {(r.members?.full_name ?? "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm truncate">{r.members?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select value={r.role} onValueChange={(v) => roleMut.mutate({ id: r.id, role: v })}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="anfitriao">Anfitrião</SelectItem>
                        <SelectItem value="membro">Membro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => removeMut.mutate(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
