import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMembers, upsertMember, deleteMember } from "@/lib/members.functions";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users, Loader2, QrCode, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { ImageCropDialog } from "@/components/image-crop-dialog";

export const Route = createFileRoute("/_authenticated/membros")({
  component: MembersPage,
});

type Form = {
  id?: string;
  full_name: string;
  photo_url: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  marital_status: string;
  role: string;
  member_since: string;
  status: string;
  address_city: string;
  address_state: string;
  notes: string;
  cpf: string;
  congregation: string;
  is_tither: boolean;
};

const empty: Form = {
  full_name: "", photo_url: "", email: "", phone: "", birth_date: "",
  gender: "", marital_status: "", role: "membro", member_since: "",
  status: "ativo", address_city: "", address_state: "", notes: "",
  cpf: "", congregation: "", is_tither: false,
};

const ROLES = ["membro", "visitante", "lider", "diacono", "obreiro", "pastor"];
const STATUS = ["ativo", "inativo", "transferido", "falecido"];

function MembersPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listMembers);
  const save = useServerFn(upsertMember);
  const remove = useServerFn(deleteMember);
  const { data: items = [], isLoading } = useQuery({ queryKey: ["members"], queryFn: () => fetchList() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const upsertMut = useMutation({
    mutationFn: (input: Form) => save({
      data: {
        id: input.id, full_name: input.full_name.trim(),
        photo_url: input.photo_url || null,
        email: input.email.trim() || null, phone: input.phone.trim() || null,
        birth_date: input.birth_date || null,
        gender: input.gender || null, marital_status: input.marital_status || null,
        role: input.role, member_since: input.member_since || null,
        status: input.status,
        address_city: input.address_city.trim() || null,
        address_state: input.address_state.trim() || null,
        notes: input.notes.trim() || null,
        cpf: input.cpf.trim() || null,
        congregation: input.congregation.trim() || null,
        is_tither: input.is_tither,
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membro salvo");
      setOpen(false); setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["members"] }); toast.success("Removido"); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem maior que 5MB"); return; }
    // Open crop dialog with 3x4 aspect instead of uploading directly
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadBlob(blob: Blob) {
    setUploading(true);
    try {
      const path = `members/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("member-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("member-photos").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: pub.publicUrl }));
      toast.success("Foto enviada");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  }

  const filtered = items.filter((m) =>
    !search.trim() || m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Membros</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastro de membros, líderes e visitantes. Base para carteirinhas, documentos e EBD.
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo membro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar membro" : "Novo membro"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {form.photo_url ? (
                      <img src={form.photo_url} alt="" className="h-32 w-24 rounded-md object-cover border-2 border-border" />
                    ) : (
                      <div className="h-32 w-24 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                    <input ref={fileInput} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                    <Button type="button" size="sm" variant="outline" className="mt-2 w-24"
                      onClick={() => fileInput.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Upload className="h-3 w-3 mr-1" />Foto</>}
                    </Button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Nome completo</Label>
                      <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>Telefone</Label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 90000-0000" /></div>
                      <div className="space-y-2"><Label>E-mail</Label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Função</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>Membro desde</Label>
                    <Input type="date" value={form.member_since} onChange={(e) => setForm({ ...form, member_since: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Nascimento</Label>
                    <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Sexo</Label>
                    <Select value={form.gender || "_"} onValueChange={(v) => setForm({ ...form, gender: v === "_" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_">—</SelectItem>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>Estado civil</Label>
                    <Input value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value })} placeholder="Solteiro(a), Casado(a)…" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>CPF</Label>
                    <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" /></div>
                  <div className="space-y-2"><Label>Igreja / Congregação</Label>
                    <Input value={form.congregation} onChange={(e) => setForm({ ...form, congregation: e.target.value })} placeholder="Ex: Sede / Filial Centro" /></div>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>Dizimista</Label>
                    <p className="text-xs text-muted-foreground">Recebe lembrete mensal de contribuição via WhatsApp</p>
                  </div>
                  <Switch checked={form.is_tither} onCheckedChange={(v) => setForm({ ...form, is_tither: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Cidade</Label>
                    <Input value={form.address_city} onChange={(e) => setForm({ ...form, address_city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Estado</Label>
                    <Input value={form.address_state} onChange={(e) => setForm({ ...form, address_state: e.target.value })} maxLength={2} placeholder="RJ" /></div>
                </div>
                <div className="space-y-2"><Label>Observações</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!form.full_name.trim() || upsertMut.isPending} onClick={() => upsertMut.mutate(form)}>
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum membro ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre seu primeiro membro pra começar.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" className="h-14 w-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{m.full_name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] capitalize">{m.role}</Badge>
                      {m.status !== "ativo" && <Badge variant="outline" className="text-[10px] capitalize">{m.status}</Badge>}
                    </div>
                    {m.phone && <p className="text-xs text-muted-foreground mt-1 truncate">{m.phone}</p>}
                  </div>
                </div>
                <div className="flex gap-1 mt-3 pt-3 border-t">
                  <Button asChild variant="ghost" size="sm" className="flex-1">
                    <a href={`/c/${m.id}`} target="_blank" rel="noopener noreferrer">
                      <QrCode className="h-3.5 w-3.5 mr-1" />Carteirinha
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setForm({
                      id: m.id, full_name: m.full_name, photo_url: m.photo_url ?? "",
                      email: m.email ?? "", phone: m.phone ?? "",
                      birth_date: m.birth_date ?? "", gender: m.gender ?? "",
                      marital_status: m.marital_status ?? "", role: m.role,
                      member_since: m.member_since ?? "", status: m.status,
                      address_city: m.address_city ?? "", address_state: m.address_state ?? "",
                      notes: m.notes ?? "",
                      cpf: (m as any).cpf ?? "", congregation: (m as any).congregation ?? "",
                      is_tither: (m as any).is_tither ?? false,
                    });
                    setOpen(true);
                  }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm(`Remover ${m.full_name}?`)) deleteMut.mutate(m.id);
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        aspect={3/4}
        onCancel={() => setCropSrc(null)}
        onConfirm={async (blob) => { setCropSrc(null); await uploadBlob(blob); }}
      />
    </AppShell>
  );
}
