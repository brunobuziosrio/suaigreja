import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listFamilyGroups, setMemberFamilyHead } from "@/lib/members.functions";
import { listMembers } from "@/lib/members.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserX, Loader2, Link2, Cake } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/familias")({
  component: FamiliesPage,
});

type MemberOption = {
  id: string;
  full_name: string;
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function FamiliesPage() {
  const qc = useQueryClient();
  const fetchGroups = useServerFn(listFamilyGroups);
  const fetchMembers = useServerFn(listMembers);
  const setHead = useServerFn(setMemberFamilyHead);

  const { data: groups = [], isLoading } = useQuery({ queryKey: ["family-groups"], queryFn: () => fetchGroups() });
  const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });

  const [memberId, setMemberId] = useState("");
  const [headId, setHeadId] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["family-groups"] });
  };

  const linkMut = useMutation({
    mutationFn: () => setHead({ data: { member_id: memberId, family_head_id: headId || null } }),
    onSuccess: () => {
      invalidate();
      toast.success(headId ? "Vínculo criado" : "Vínculo removido");
      setMemberId(""); setHeadId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unlinkMut = useMutation({
    mutationFn: (dependentId: string) => setHead({ data: { member_id: dependentId, family_head_id: null } }),
    onSuccess: () => { invalidate(); toast.success("Removido do núcleo familiar"); },
  });

  const totalPeople = useMemo(
    () => groups.reduce((sum, g) => sum + 1 + g.dependents.length, 0),
    [groups],
  );

  const headOptions = useMemo(
    () => (members as MemberOption[]).filter((m) => m.id !== memberId),
    [members, memberId],
  );

  return (
    <AppShell>
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" /> Vínculo Familiar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {groups.length} núcleo(s) familiar(es) · {totalPeople} pessoa(s) vinculada(s)
          </p>
        </div>

        <Card className="p-5 mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Link2 className="h-4 w-4" />Vincular membro a uma família</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Membro</label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger><SelectValue placeholder="Selecione o membro…" /></SelectTrigger>
                <SelectContent>
                  {(members as MemberOption[]).map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">É dependente de (chefe de família)</label>
              <Select value={headId} onValueChange={setHeadId} disabled={!memberId}>
                <SelectTrigger><SelectValue placeholder="Selecione o chefe da família…" /></SelectTrigger>
                <SelectContent>
                  {headOptions.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3"
            disabled={!memberId || !headId || linkMut.isPending}
            onClick={() => linkMut.mutate()}
          >
            {linkMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Vincular
          </Button>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum núcleo familiar montado ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use o formulário acima pra vincular um membro como dependente de outro.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {groups.map((g) => (
              <Card key={g.head.id} className="p-4">
                <div className="flex items-center gap-3 pb-3 mb-3 border-b">
                  {g.head.photo_url ? (
                    <img src={g.head.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {initials(g.head.full_name)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{g.head.full_name}</p>
                    <p className="text-xs text-muted-foreground">Chefe de família{g.head.phone ? ` · ${g.head.phone}` : ""}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {g.dependents.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/30 p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {d.photo_url ? (
                          <img src={d.photo_url} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-background text-muted-foreground flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {initials(d.full_name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm truncate">{d.full_name}</p>
                          {d.birth_date && (
                            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                              <Cake className="h-3 w-3" />{new Date(`${d.birth_date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => unlinkMut.mutate(d.id)} title="Remover do núcleo familiar">
                        <UserX className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
