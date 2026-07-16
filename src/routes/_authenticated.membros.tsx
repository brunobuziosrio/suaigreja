import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMembers, upsertMember, deleteMember, importMembersCsv } from "@/lib/members.functions";
import { getMyAccount } from "@/lib/account.functions";
import { listCongregations } from "@/lib/congregations.functions";
import { getReligionTerms } from "@/lib/religion-profiles";
import { supabase } from "@/integrations/supabase/client";
import { buildCsv } from "@/lib/csv";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  QrCode,
  Search,
  Upload,
  ClipboardCheck,
  UserCheck,
  Cake,
  AlertCircle,
  FileSpreadsheet,
  Download,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { validateImageFile } from "@/lib/file-validation";

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
  congregation_id: string;
  is_tither: boolean;
  whatsapp_consent: boolean;
};

const empty: Form = {
  full_name: "",
  photo_url: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  marital_status: "",
  role: "membro",
  member_since: "",
  status: "ativo",
  address_city: "",
  address_state: "",
  notes: "",
  cpf: "",
  congregation: "",
  congregation_id: "",
  is_tither: false,
  whatsapp_consent: false,
};

const ROLES = ["membro", "visitante", "lider", "diacono", "obreiro", "pastor"];
const STATUS = ["ativo", "inativo", "transferido", "falecido"];

const CSV_TEMPLATE_HEADERS = [
  "nome",
  "telefone",
  "email",
  "nascimento",
  "sexo",
  "estado_civil",
  "cpf",
  "funcao",
  "membro_desde",
  "status",
  "cidade",
  "estado",
  "congregacao",
  "dizimista",
  "observacoes",
];
const CSV_TEMPLATE_SAMPLE_ROW = [
  "João da Silva",
  "(11) 91234-5678",
  "joao@exemplo.com",
  "1985-04-12",
  "masculino",
  "casado",
  "123.456.789-00",
  "membro",
  "2020-01-15",
  "ativo",
  "São Paulo",
  "SP",
  "Sede",
  "sim",
  "Exemplo de observação",
];

function downloadMembersCsvTemplate() {
  const csv = buildCsv(CSV_TEMPLATE_HEADERS, [CSV_TEMPLATE_SAMPLE_ROW]);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-importacao-membros.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
};

type MemberListItem = {
  id: string;
  full_name: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  marital_status: string | null;
  role: string;
  member_since: string | null;
  status: string;
  address_city: string | null;
  address_state: string | null;
  notes: string | null;
  cpf: string | null;
  congregation: string | null;
  congregation_id: string | null;
  is_tither: boolean | null;
  whatsapp_consent: boolean | null;
};

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

const MEMBER_COMPLETENESS_FIELDS = [
  { key: "full_name", label: "nome" },
  { key: "phone", label: "telefone" },
  { key: "birth_date", label: "nascimento" },
  { key: "cpf", label: "CPF" },
  { key: "photo_url", label: "foto" },
  { key: "address_city", label: "cidade" },
  { key: "address_state", label: "UF" },
  { key: "member_since", label: "data de entrada" },
  { key: "congregation", label: "congregacao" },
  { key: "role", label: "funcao" },
] as const;

function getMemberCompleteness(member: Record<string, unknown>) {
  const missing = MEMBER_COMPLETENESS_FIELDS.filter((field) => {
    const value = member[field.key];
    return typeof value !== "string" || value.trim().length === 0;
  }).map((field) => field.label);
  const complete = MEMBER_COMPLETENESS_FIELDS.length - missing.length;
  return {
    percent: Math.round((complete / MEMBER_COMPLETENESS_FIELDS.length) * 100),
    missing,
  };
}

function MembersPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listMembers);
  const fetchAccount = useServerFn(getMyAccount);
  const fetchCongregations = useServerFn(listCongregations);
  const save = useServerFn(upsertMember);
  const remove = useServerFn(deleteMember);
  const { data: items = [], isLoading, isError, refetch } = useQuery<MemberListItem[]>({
    queryKey: ["members"],
    queryFn: async () => (await fetchList()) as MemberListItem[],
  });
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount() });
  const { data: congregations = [] } = useQuery({
    queryKey: ["congregations"],
    queryFn: () => fetchCongregations(),
  });
  const terms = getReligionTerms(account?.religion_profile);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [completenessFilter, setCompletenessFilter] = useState("todos");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const formCompleteness = getMemberCompleteness(form);

  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const csvFileInput = useRef<HTMLInputElement>(null);
  const runImport = useServerFn(importMembersCsv);
  const importMut = useMutation({
    mutationFn: (csv: string) => runImport({ data: { csv } }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["members"] });
      setImportResult(result);
      if (result.errors.length === 0) {
        toast.success(`${result.created} criado(s), ${result.updated} atualizado(s)`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleCsvFile(file: File) {
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = () => importMut.mutate(String(reader.result));
    reader.onerror = () => toast.error("Não foi possível ler o arquivo.");
    reader.readAsText(file, "utf-8");
  }

  const upsertMut = useMutation({
    mutationFn: (input: Form) =>
      save({
        data: {
          id: input.id,
          full_name: input.full_name.trim(),
          photo_url: input.photo_url || null,
          email: input.email.trim() || null,
          phone: input.phone.trim() || null,
          birth_date: input.birth_date || null,
          gender: input.gender || null,
          marital_status: input.marital_status || null,
          role: input.role,
          member_since: input.member_since || null,
          status: input.status,
          address_city: input.address_city.trim() || null,
          address_state: input.address_state.trim() || null,
          notes: input.notes.trim() || null,
          cpf: input.cpf.trim() || null,
          congregation: input.congregation.trim() || null,
          congregation_id: input.congregation_id || null,
          is_tither: input.is_tither,
          whatsapp_consent: input.whatsapp_consent,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success(`${capitalize(terms.person)} salvo`);
      setOpen(false);
      setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFile(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) return toast.error(validationError);
    // Open crop dialog with 3x4 aspect instead of uploading directly
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadBlob(blob: Blob) {
    setUploading(true);
    try {
      const path = `members/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("member-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("member-photos").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: pub.publicUrl }));
      toast.success("Foto enviada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const memberStats = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const active = items.filter((m) => m.status === "ativo").length;
    const birthdays = items.filter((m) => {
      if (!m.birth_date) return false;
      return new Date(`${m.birth_date}T00:00:00`).getMonth() + 1 === currentMonth;
    }).length;
    const incomplete = items.filter(
      (m) => getMemberCompleteness(m as Record<string, unknown>).percent < 80,
    ).length;
    return { total: items.length, active, birthdays, incomplete };
  }, [items]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return items.filter((m) => {
      const completeness = getMemberCompleteness(m as Record<string, unknown>);
      const searchable = [m.full_name, m.phone, m.cpf, m.email, m.congregation]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === "todos" || m.status === statusFilter;
      const matchesCompleteness =
        completenessFilter === "todos" ||
        (completenessFilter === "incompletos" && completeness.percent < 80) ||
        (completenessFilter === "completos" && completeness.percent >= 80);
      return matchesSearch && matchesStatus && matchesCompleteness;
    });
  }, [completenessFilter, items, search, statusFilter]);

  return (
    <AppShell>
      <div className="w-full">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{terms.people}</h1>
            <p className="text-sm text-muted-foreground mt-1">{terms.peopleDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={importOpen}
              onOpenChange={(o) => {
                setImportOpen(o);
                if (!o) setImportResult(null);
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Importar {terms.people} por CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Cadastre vários {terms.people.toLowerCase()} de uma vez a partir de uma planilha
                    exportada de outro sistema. Registros com o mesmo CPF ou e-mail já cadastrado
                    são atualizados em vez de duplicados.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadMembersCsvTemplate}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Baixar modelo CSV
                  </Button>
                  <input
                    ref={csvFileInput}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCsvFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    disabled={importMut.isPending}
                    onClick={() => csvFileInput.current?.click()}
                  >
                    {importMut.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Importando…
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher arquivo CSV
                      </>
                    )}
                  </Button>

                  {importResult && (
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {importResult.created} criado(s), {importResult.updated} atualizado(s) de{" "}
                        {importResult.total} linha(s)
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="max-h-48 overflow-y-auto rounded border bg-amber-50 dark:bg-amber-950/20 p-2 text-xs space-y-1">
                          <p className="font-medium text-amber-800 dark:text-amber-400">
                            {importResult.errors.length} aviso(s):
                          </p>
                          {importResult.errors.map((err, idx) => (
                            <p key={idx} className="text-amber-700 dark:text-amber-500">
                              Linha {err.row}: {err.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportOpen(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  Novo {terms.person}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {form.id ? `Editar ${terms.person}` : `Novo ${terms.person}`}
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-1">
                  <div className="mb-4 rounded-md border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Qualidade do cadastro</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Ajuda a manter carteirinha, relatórios e comunicação prontos para uso.
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-primary">
                        {formCompleteness.percent}%
                      </span>
                    </div>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label="Qualidade do cadastro"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={formCompleteness.percent}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-200"
                        style={{ width: `${formCompleteness.percent}%` }}
                      />
                    </div>
                    {formCompleteness.missing.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Faltam: {formCompleteness.missing.slice(0, 4).join(", ")}
                        {formCompleteness.missing.length > 4 ? " e outros campos" : ""}.
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {form.photo_url ? (
                        <img
                          src={form.photo_url}
                          alt=""
                          className="h-32 w-24 rounded-md object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="h-32 w-24 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8" />
                        </div>
                      )}
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 w-24"
                        onClick={() => fileInput.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Foto
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Label>
                          Nome completo <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="(00) 90000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="pessoal" className="mt-5">
                    <TabsList className="grid h-auto w-full grid-cols-3">
                      <TabsTrigger value="pessoal">Dados pessoais</TabsTrigger>
                      <TabsTrigger value="igreja">{capitalize(terms.institution)}</TabsTrigger>
                      <TabsTrigger value="contato">Contato e notas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pessoal" className="space-y-4 pt-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Nascimento</Label>
                          <Input
                            type="date"
                            value={form.birth_date}
                            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sexo</Label>
                          <Select
                            value={form.gender || "_"}
                            onValueChange={(v) => setForm({ ...form, gender: v === "_" ? "" : v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_">—</SelectItem>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Estado civil</Label>
                          <Input
                            value={form.marital_status}
                            onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
                            placeholder="Solteiro(a), Casado(a)..."
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>CPF</Label>
                          <Input
                            value={form.cpf}
                            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{capitalize(terms.person)} desde</Label>
                          <Input
                            type="date"
                            value={form.member_since}
                            onChange={(e) => setForm({ ...form, member_since: e.target.value })}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="igreja" className="space-y-4 pt-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Funcao</Label>
                          <Select
                            value={form.role}
                            onValueChange={(v) => setForm({ ...form, role: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {capitalize(r)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={form.status}
                            onValueChange={(v) => setForm({ ...form, status: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {capitalize(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{capitalize(terms.institution)} / congregacao</Label>
                          {congregations.length > 0 ? (
                            <Select
                              value={form.congregation_id || "_"}
                              onValueChange={(id) => {
                                const selected = congregations.find((c) => c.id === id);
                                setForm({
                                  ...form,
                                  congregation_id: id === "_" ? "" : id,
                                  congregation: selected?.name ?? "",
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a unidade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_">Sem unidade</SelectItem>
                                {congregations
                                  .filter((c) => c.active)
                                  .map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={form.congregation}
                              onChange={(e) => setForm({ ...form, congregation: e.target.value })}
                              placeholder="Ex: Sede / Filial Centro"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <Label>
                            {terms.contribution === "dízimo" ? "Dizimista" : "Contribuinte"}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Recebe lembrete mensal de {terms.contribution} via WhatsApp
                          </p>
                        </div>
                        <Switch
                          checked={form.is_tither}
                          onCheckedChange={(v) => setForm({ ...form, is_tither: v })}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="contato" className="space-y-4 pt-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Cidade</Label>
                          <Input
                            value={form.address_city}
                            onChange={(e) => setForm({ ...form, address_city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Estado</Label>
                          <Input
                            value={form.address_state}
                            onChange={(e) => setForm({ ...form, address_state: e.target.value })}
                            maxLength={2}
                            placeholder="RJ"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <Label>Consentimento para WhatsApp</Label>
                          <p className="text-xs text-muted-foreground">
                            Autoriza comunicados, lembretes e mensagens pastorais conforme LGPD.
                          </p>
                        </div>
                        <Switch
                          checked={form.whatsapp_consent}
                          onCheckedChange={(v) => setForm({ ...form, whatsapp_consent: v })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Observacoes</Label>
                        <Textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    disabled={!form.full_name.trim() || upsertMut.isPending}
                    onClick={() => upsertMut.mutate(form)}
                  >
                    {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total cadastrado</p>
                <p className="text-2xl font-semibold">{memberStats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-700">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-semibold">{memberStats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-pink-500/10 p-2 text-pink-600">
                <Cake className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aniversarios no mes</p>
                <p className="text-2xl font-semibold">{memberStats.birthdays}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-amber-500/10 p-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fichas abaixo de 80%</p>
                <p className="text-2xl font-semibold">{memberStats.incomplete}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_200px]">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone, CPF, e-mail ou congregacao"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {capitalize(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={completenessFilter} onValueChange={setCompletenessFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as fichas</SelectItem>
                <SelectItem value="incompletos">Abaixo de 80%</SelectItem>
                <SelectItem value="completos">80% ou mais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(search || statusFilter !== "todos" || completenessFilter !== "todos") && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                {filtered.length} resultado(s) encontrado(s)
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("todos");
                  setCompletenessFilter("todos");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <Card className="p-8 text-center" role="alert">
            <h3 className="font-semibold">Não foi possível carregar os cadastros</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente antes de alterar os dados.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum {terms.person} ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre seu primeiro {terms.person} para começar.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((m) => {
              const completeness = getMemberCompleteness(m as Record<string, unknown>);
              return (
                <Card key={m.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{m.full_name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="neutral" className="text-[10px] capitalize">
                          {m.role}
                        </Badge>
                        {m.status !== "ativo" && (
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {m.status}
                          </Badge>
                        )}
                      </div>
                      {m.phone && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{m.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
                        Ficha
                      </div>
                      <span className="text-xs font-semibold">{completeness.percent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${completeness.percent}%` }}
                      />
                    </div>
                    <p className="mt-2 min-h-8 text-xs leading-4 text-muted-foreground">
                      {completeness.missing.length === 0
                        ? "Cadastro pronto para carteirinha, relatorios e comunicacao."
                        : `Faltam: ${completeness.missing.slice(0, 4).join(", ")}${completeness.missing.length > 4 ? "..." : ""}.`}
                    </p>
                  </div>
                  <div className="flex gap-1 mt-3 pt-3 border-t">
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <a href={`/c/${m.id}`} target="_blank" rel="noopener noreferrer">
                        <QrCode className="h-3.5 w-3.5 mr-1" />
                        Carteirinha
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({
                          id: m.id,
                          full_name: m.full_name,
                          photo_url: m.photo_url ?? "",
                          email: m.email ?? "",
                          phone: m.phone ?? "",
                          birth_date: m.birth_date ?? "",
                          gender: m.gender ?? "",
                          marital_status: m.marital_status ?? "",
                          role: m.role,
                          member_since: m.member_since ?? "",
                          status: m.status,
                          address_city: m.address_city ?? "",
                          address_state: m.address_state ?? "",
                          notes: m.notes ?? "",
                          cpf: m.cpf ?? "",
                          congregation: m.congregation ?? "",
                          congregation_id: m.congregation_id ?? "",
                          is_tither: m.is_tither ?? false,
                          whatsapp_consent: m.whatsapp_consent ?? false,
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
                        if (confirm(`Remover ${m.full_name}?`)) deleteMut.mutate(m.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        aspect={3 / 4}
        onCancel={() => setCropSrc(null)}
        onConfirm={async (blob) => {
          setCropSrc(null);
          await uploadBlob(blob);
        }}
      />
    </AppShell>
  );
}
