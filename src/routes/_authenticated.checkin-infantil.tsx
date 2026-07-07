import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Baby, CheckCircle2, KeyRound, Phone, Plus, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  checkinChild,
  checkoutChild,
  listChildCheckin,
  upsertChildProfile,
} from "@/lib/child-checkin.functions";

export const Route = createFileRoute("/_authenticated/checkin-infantil")({
  component: ChildCheckinPage,
  head: () => ({ meta: [{ title: "Check-in Infantil Seguro" }] }),
});

type ChildForm = {
  id?: string;
  full_name: string;
  birth_date: string;
  guardian_name: string;
  guardian_phone: string;
  authorized_pickups: string;
  allergies: string;
  medical_notes: string;
  active: boolean;
};

type ChildProfile = ChildForm & { id: string };
type ActiveEntry = {
  id: string;
  child_id: string;
  checked_in_at: string;
  child_profiles?: Pick<
    ChildProfile,
    "full_name" | "guardian_name" | "guardian_phone" | "allergies"
  > | null;
};

const empty: ChildForm = {
  full_name: "",
  birth_date: "",
  guardian_name: "",
  guardian_phone: "",
  authorized_pickups: "",
  allergies: "",
  medical_notes: "",
  active: true,
};

function ChildCheckinPage() {
  const queryClient = useQueryClient();
  const load = useServerFn(listChildCheckin);
  const save = useServerFn(upsertChildProfile);
  const enter = useServerFn(checkinChild);
  const leave = useServerFn(checkoutChild);

  const { data, isLoading } = useQuery({
    queryKey: ["child-checkin"],
    queryFn: () => load(),
    refetchInterval: 30000,
  });

  const children = (data?.children ?? []) as ChildProfile[];
  const active = (data?.activeEntries ?? []) as ActiveEntry[];
  const activeIds = new Set(active.map((entry) => entry.child_id));

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ChildForm>(empty);
  const [code, setCode] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<ActiveEntry | null>(null);
  const [pickupCode, setPickupCode] = useState("");
  const [pickupPerson, setPickupPerson] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["child-checkin"] });
  const closeCheckout = () => {
    setCheckout(null);
    setPickupCode("");
    setPickupPerson("");
  };

  const saveMut = useMutation({
    mutationFn: () =>
      save({
        data: {
          ...form,
          birth_date: form.birth_date || null,
          authorized_pickups: form.authorized_pickups || null,
          allergies: form.allergies || null,
          medical_notes: form.medical_notes || null,
        },
      }),
    onSuccess: () => {
      refresh();
      setOpen(false);
      setForm(empty);
      toast.success("Cadastro infantil salvo");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const enterMut = useMutation({
    mutationFn: (child_id: string) => enter({ data: { child_id } }),
    onSuccess: (result) => {
      setCode(result.code);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const leaveMut = useMutation({
    mutationFn: () =>
      leave({
        data: { entry_id: checkout?.id ?? "", code: pickupCode, pickup_person: pickupPerson },
      }),
    onSuccess: () => {
      closeCheckout();
      refresh();
      toast.success("Retirada registrada com segurança");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-[#102a2b] p-6 text-white shadow-xl md:p-8">
          <div className="absolute right-0 top-0 h-full w-2/5 bg-[radial-gradient(circle_at_center,rgba(250,204,21,.18),transparent_65%)]" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <Badge className="mb-4 border-white/15 bg-white/10 text-white">
                Segurança infantil
              </Badge>
              <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
                <ShieldCheck className="h-8 w-8 text-yellow-300" />
                Entrada tranquila. Retirada protegida.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-teal-100">
                Cada entrada gera um código secreto de seis dígitos. A criança só é liberada após
                validação do código e identificação de quem retira.
              </p>
            </div>
            <Dialog
              open={open}
              onOpenChange={(value) => {
                setOpen(value);
                if (!value) setForm(empty);
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-yellow-300 text-slate-950 hover:bg-yellow-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar criança
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{form.id ? "Editar cadastro" : "Cadastro infantil"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Nome da criança *</Label>
                    <Input
                      value={form.full_name}
                      onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Nascimento</Label>
                      <Input
                        type="date"
                        value={form.birth_date}
                        onChange={(event) => setForm({ ...form, birth_date: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Responsável *</Label>
                      <Input
                        value={form.guardian_name}
                        onChange={(event) =>
                          setForm({ ...form, guardian_name: event.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone do responsável *</Label>
                    <Input
                      value={form.guardian_phone}
                      onChange={(event) => setForm({ ...form, guardian_phone: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Pessoas autorizadas a retirar</Label>
                    <Textarea
                      value={form.authorized_pickups}
                      onChange={(event) =>
                        setForm({ ...form, authorized_pickups: event.target.value })
                      }
                      placeholder="Ex: mãe Ana, pai Marcos, avó Lúcia"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Alergias</Label>
                      <Textarea
                        value={form.allergies}
                        onChange={(event) => setForm({ ...form, allergies: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Cuidados médicos</Label>
                      <Textarea
                        value={form.medical_notes}
                        onChange={(event) =>
                          setForm({ ...form, medical_notes: event.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Cadastro ativo</Label>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(active) => setForm({ ...form, active })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    disabled={
                      !form.full_name.trim() ||
                      !form.guardian_name.trim() ||
                      form.guardian_phone.length < 8 ||
                      saveMut.isPending
                    }
                    onClick={() => saveMut.mutate()}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Crianças cadastradas</h2>
              <span className="text-xs text-muted-foreground">{children.length} cadastro(s)</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {children.map((child) => {
                const isInside = activeIds.has(child.id);
                return (
                  <Card key={child.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{child.full_name}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserRound className="h-3.5 w-3.5" />
                          {child.guardian_name}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {child.guardian_phone}
                        </p>
                      </div>
                      {isInside ? (
                        <Badge variant="success">Dentro</Badge>
                      ) : child.active ? (
                        <Baby className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Badge variant="neutral">Inativo</Badge>
                      )}
                    </div>
                    {child.allergies && (
                      <p className="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
                        Alergia: {child.allergies}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        disabled={!child.active || isInside || enterMut.isPending}
                        onClick={() => enterMut.mutate(child.id)}
                      >
                        Fazer entrada
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setForm({
                            ...empty,
                            ...child,
                            birth_date: child.birth_date ?? "",
                            authorized_pickups: child.authorized_pickups ?? "",
                            allergies: child.allergies ?? "",
                            medical_notes: child.medical_notes ?? "",
                          });
                          setOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            {!isLoading && children.length === 0 && (
              <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
                Cadastre a primeira criança para iniciar.
              </Card>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Aguardando retirada</h2>
              <Badge variant={active.length ? "warning" : "neutral"}>{active.length} dentro</Badge>
            </div>
            <div className="space-y-3">
              {active.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-yellow-400 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{entry.child_profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {entry.child_profiles?.guardian_name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Entrada{" "}
                        {new Date(entry.checked_in_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setCheckout(entry)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Retirar
                    </Button>
                  </div>
                </Card>
              ))}
              {active.length === 0 && (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-medium">Nenhuma retirada pendente</p>
                </Card>
              )}
            </div>
          </section>
        </div>

        <Dialog open={!!code} onOpenChange={(value) => !value && setCode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Código de retirada</DialogTitle>
            </DialogHeader>
            <div className="rounded-2xl bg-[#102a2b] p-7 text-center text-white">
              <p className="text-xs uppercase tracking-[.25em] text-teal-200">
                Entregue somente ao responsável
              </p>
              <p className="mt-3 font-mono text-5xl font-bold tracking-[.2em] text-yellow-300">
                {code}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              O código não poderá ser consultado novamente. Oriente o responsável a guardar este
              número.
            </p>
            <Button onClick={() => setCode(null)}>Concluir</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={!!checkout} onOpenChange={(value) => !value && closeCheckout()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Validar retirada de {checkout?.child_profiles?.full_name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Código de 6 dígitos</Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  className="text-center font-mono text-2xl tracking-[.3em]"
                  value={pickupCode}
                  onChange={(event) => setPickupCode(event.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Nome de quem está retirando</Label>
                <Input
                  value={pickupPerson}
                  onChange={(event) => setPickupPerson(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeCheckout}>
                Cancelar
              </Button>
              <Button
                disabled={
                  pickupCode.length !== 6 || pickupPerson.trim().length < 2 || leaveMut.isPending
                }
                onClick={() => leaveMut.mutate()}
              >
                Confirmar retirada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
