import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listBankAccounts,
  upsertBankAccount,
  setPrimaryBankAccount,
  setBankAccountActive,
  deleteBankAccount,
  type BankAccountRow,
} from "@/lib/bank-accounts.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Plus, Trash2, Loader2, Star, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contas-bancarias")({
  component: BankAccountsPage,
});

type Form = {
  id?: string;
  label: string;
  bank_name: string;
  account_kind: "checking" | "savings";
  agency: string;
  account_number: string;
  holder_name: string;
  pix_key: string;
  pix_key_type: "cpf" | "cnpj" | "email" | "phone" | "random" | "";
  visible_to_members: boolean;
  notes: string;
};

const empty: Form = {
  label: "", bank_name: "", account_kind: "checking", agency: "", account_number: "",
  holder_name: "", pix_key: "", pix_key_type: "", visible_to_members: false, notes: "",
};

const PIX_KEY_LABELS: Record<string, string> = {
  cpf: "CPF", cnpj: "CNPJ", email: "E-mail", phone: "Telefone", random: "Chave aleatória",
};

function BankAccountsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listBankAccounts);
  const save = useServerFn(upsertBankAccount);
  const makePrimary = useServerFn(setPrimaryBankAccount);
  const setActive = useServerFn(setBankAccountActive);
  const remove = useServerFn(deleteBankAccount);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => fetchList(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["bank-accounts"] });

  const upsertMut = useMutation({
    mutationFn: () => save({
      data: {
        id: form.id,
        label: form.label.trim(),
        bank_name: form.bank_name.trim() || null,
        account_kind: form.account_kind,
        agency: form.agency.trim() || null,
        account_number: form.account_number.trim() || null,
        holder_name: form.holder_name.trim() || null,
        pix_key: form.pix_key.trim() || null,
        pix_key_type: form.pix_key_type || null,
        visible_to_members: form.visible_to_members,
        notes: form.notes.trim() || null,
      },
    }),
    onSuccess: () => { invalidate(); toast.success("Conta salva"); setOpen(false); setForm(empty); },
    onError: (e: Error) => toast.error(e.message),
  });

  const primaryMut = useMutation({
    mutationFn: (id: string) => makePrimary({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Definida como conta principal"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeMut = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => setActive({ data: v }),
    onSuccess: () => { invalidate(); toast.success("Atualizado"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Conta removida"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (a: BankAccountRow) => {
    setForm({
      id: a.id, label: a.label, bank_name: a.bank_name ?? "", account_kind: a.account_kind,
      agency: a.agency ?? "", account_number: a.account_number ?? "", holder_name: a.holder_name ?? "",
      pix_key: a.pix_key ?? "", pix_key_type: a.pix_key_type ?? "",
      visible_to_members: a.visible_to_members, notes: a.notes ?? "",
    });
    setOpen(true);
  };

  const copyPix = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Chave Pix copiada");
  };

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Landmark className="h-6 w-6" /> Contas Bancárias e Pix
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre as contas e chaves Pix da igreja. Marque uma como principal e escolha quais são visíveis para os membros.
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova conta</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{form.id ? "Editar conta" : "Nova conta"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Identificação</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Ex: Conta principal, Poupança obras…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.account_kind} onValueChange={(v) => setForm({ ...form, account_kind: v as "checking" | "savings" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Conta corrente</SelectItem>
                        <SelectItem value="savings">Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Titular</Label>
                  <Input value={form.holder_name} onChange={(e) => setForm({ ...form, holder_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Chave Pix</Label>
                    <Input value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo da chave</Label>
                    <Select value={form.pix_key_type || "_"} onValueChange={(v) => setForm({ ...form, pix_key_type: v === "_" ? "" : (v as Form["pix_key_type"]) })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_">—</SelectItem>
                        {Object.entries(PIX_KEY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Visível para membros</Label>
                    <p className="text-xs text-muted-foreground">Mostra esta conta na área do membro, não no site público.</p>
                  </div>
                  <Switch checked={form.visible_to_members} onCheckedChange={(v) => setForm({ ...form, visible_to_members: v })} />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!form.label.trim() || upsertMut.isPending} onClick={() => upsertMut.mutate()}>
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <Landmark className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhuma conta cadastrada</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre a primeira conta bancária ou chave Pix da igreja.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((a) => (
              <Card key={a.id} className={`p-4 ${!a.active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate flex items-center gap-1.5">
                      {a.is_primary && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                      {a.label}
                    </p>
                    {a.bank_name && <p className="text-xs text-muted-foreground">{a.bank_name} · {a.account_kind === "checking" ? "Corrente" : "Poupança"}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {a.is_primary && <Badge variant="success">Principal</Badge>}
                    {!a.active && <Badge variant="neutral">Inativa</Badge>}
                    {a.active && a.visible_to_members && <Badge variant="outline">Visível p/ membros</Badge>}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  {(a.agency || a.account_number) && <p>Ag {a.agency || "—"} · Conta {a.account_number || "—"}</p>}
                  {a.holder_name && <p>Titular: {a.holder_name}</p>}
                  {a.pix_key && (
                    <p className="flex items-center gap-1">
                      Pix ({PIX_KEY_LABELS[a.pix_key_type ?? ""] ?? "chave"}): <span className="font-medium">{a.pix_key}</span>
                      <button type="button" onClick={() => copyPix(a.pix_key!)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                    </p>
                  )}
                </div>
                {a.notes && <p className="text-xs mt-2 bg-muted/40 rounded p-2">{a.notes}</p>}
                <div className="flex gap-1 mt-3 pt-3 border-t flex-wrap">
                  {!a.is_primary && a.active && (
                    <Button size="sm" variant="outline" onClick={() => primaryMut.mutate(a.id)}>
                      <Star className="h-3.5 w-3.5 mr-1" />Tornar principal
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => activeMut.mutate({ id: a.id, active: !a.active })}>
                    {a.active ? "Desativar" : "Reativar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (confirm(`Remover "${a.label}"?`)) deleteMut.mutate(a.id);
                  }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
