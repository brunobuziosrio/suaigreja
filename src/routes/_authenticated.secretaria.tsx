/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-23
 *
 * Portal da Secretaria — gestão de solicitações de atendimento da igreja.
 */

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, ClipboardList, Paperclip, Download, Upload } from "lucide-react";
import {
  listSecretariaRequests,
  getSecretariaStats,
  createSecretariaAttachmentDownloadUrl,
  deleteSecretariaAttachment,
  listSecretariaAttachments,
  listSecretariaRequestEvents,
  upsertSecretariaRequest,
  uploadSecretariaAttachment,
  updateSecretariaStatus,
  deleteSecretariaRequest,
} from "@/lib/secretaria.functions";
import { listMembers } from "@/lib/members.functions";

export const Route = createFileRoute("/_authenticated/secretaria")({
  component: SecretariaPage,
});

type SecretariaRequest = {
  id: string;
  member_id: string | null;
  request_type: string;
  requester_name: string;
  requester_phone: string | null;
  requester_email: string | null;
  details: string | null;
  status: string;
  priority: string;
  preferred_date: string | null;
  scheduled_at: string | null;
  assignee_name: string | null;
  due_date: string | null;
  internal_notes: string | null;
  created_at: string;
};

type SecretariaEvent = {
  id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type SecretariaAttachment = {
  id: string;
  file_name: string;
  content_type: string | null;
  file_size: number;
  created_at: string;
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  batismo: "Batismo",
  casamento: "Casamento",
  catequese: "Catequese",
  visita_pastoral: "Visita pastoral",
  aconselhamento: "Aconselhamento",
  declaracao: "Declaração",
  certidao: "Certidão",
  apresentacao_crianca: "Apresentação de criança",
  outro: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  recebido: "Recebido",
  em_andamento: "Em andamento",
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
  recebido: "bg-blue-100 text-blue-800",
  em_andamento: "bg-amber-100 text-amber-800",
  agendado: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-gray-100 text-gray-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
};

const PRIORITY_STYLES: Record<string, string> = {
  baixa: "bg-slate-100 text-slate-700",
  normal: "bg-sky-100 text-sky-800",
  alta: "bg-red-100 text-red-800",
};

const STATUS_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "recebido", label: "Recebidos" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "agendado", label: "Agendados" },
  { value: "concluido", label: "Concluídos" },
  { value: "cancelado", label: "Cancelados" },
];

const emptyForm = {
  id: "",
  member_id: "",
  request_type: "batismo",
  requester_name: "",
  requester_phone: "",
  requester_email: "",
  details: "",
  status: "recebido",
  priority: "normal",
  preferred_date: "",
  scheduled_at: "",
  assignee_name: "",
  due_date: "",
  internal_notes: "",
};

function SecretariaPage() {
  const qc = useQueryClient();
  const fetchRequests = useServerFn(listSecretariaRequests);
  const fetchStats = useServerFn(getSecretariaStats);
  const fetchEvents = useServerFn(listSecretariaRequestEvents);
  const fetchAttachments = useServerFn(listSecretariaAttachments);
  const fetchMembers = useServerFn(listMembers);
  const saveRequest = useServerFn(upsertSecretariaRequest);
  const uploadAttachment = useServerFn(uploadSecretariaAttachment);
  const createDownloadUrl = useServerFn(createSecretariaAttachmentDownloadUrl);
  const removeAttachment = useServerFn(deleteSecretariaAttachment);
  const changeStatus = useServerFn(updateSecretariaStatus);
  const removeRequest = useServerFn(deleteSecretariaRequest);

  const [statusFilter, setStatusFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["secretaria-requests"],
    queryFn: () => fetchRequests(),
    staleTime: 60000,
    gcTime: Infinity,
  });

  const { data: stats } = useQuery({
    queryKey: ["secretaria-stats"],
    queryFn: () => fetchStats(),
    staleTime: 60000,
    gcTime: Infinity,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers(),
    enabled: openDialog,
    staleTime: 3600000,
    gcTime: Infinity,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["secretaria-request-events", form.id],
    queryFn: () => fetchEvents({ data: { id: form.id } }),
    enabled: openDialog && !!form.id,
    staleTime: 30000,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["secretaria-request-attachments", form.id],
    queryFn: () => fetchAttachments({ data: { request_id: form.id } }),
    enabled: openDialog && !!form.id,
    staleTime: 30000,
  });

  const filtered = useMemo(
    () =>
      statusFilter === "todos"
        ? requests
        : requests.filter((r) => r.status === statusFilter),
    [requests, statusFilter],
  );

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["secretaria-requests"] });
    qc.invalidateQueries({ queryKey: ["secretaria-stats"] });
    if (form.id) qc.invalidateQueries({ queryKey: ["secretaria-request-events", form.id] });
    if (form.id) qc.invalidateQueries({ queryKey: ["secretaria-request-attachments", form.id] });
  };

  const saveMut = useMutation({
    mutationFn: (data: typeof form) => saveRequest({ data: data as any }),
    onSuccess: () => {
      invalidate();
      toast.success("Solicitação salva");
      setOpenDialog(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      changeStatus({ data: vars as any }),
    onSuccess: () => {
      invalidate();
      toast.success("Status atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => removeRequest({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Solicitação removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file);
      return uploadAttachment({
        data: {
          request_id: form.id,
          file_name: file.name,
          content_type: file.type || "application/octet-stream",
          base64,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["secretaria-request-attachments", form.id] });
      toast.success("Anexo enviado");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const downloadMut = useMutation({
    mutationFn: (id: string) => createDownloadUrl({ data: { id } }),
    onSuccess: (res) => {
      window.open(res.url, "_blank", "noopener,noreferrer");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAttachmentMut = useMutation({
    mutationFn: (id: string) => removeAttachment({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["secretaria-request-attachments", form.id] });
      toast.success("Anexo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (req: SecretariaRequest) => {
    setForm({
      id: req.id,
      member_id: req.member_id || "",
      request_type: req.request_type,
      requester_name: req.requester_name,
      requester_phone: req.requester_phone || "",
      requester_email: req.requester_email || "",
      details: req.details || "",
      status: req.status,
      priority: req.priority,
      preferred_date: req.preferred_date || "",
      scheduled_at: req.scheduled_at ? req.scheduled_at.slice(0, 16) : "",
      assignee_name: req.assignee_name || "",
      due_date: req.due_date || "",
      internal_notes: req.internal_notes || "",
    });
    setOpenDialog(true);
  };

  if (isLoading)
    return (
      <AppShell>
        <div className="space-y-6 p-6" aria-busy="true" aria-label="Carregando solicitações">
          <div className="h-10 w-72 animate-pulse rounded-md bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
        </div>
      </AppShell>
    );

  if (isError)
    return (
      <AppShell>
        <Card className="m-6 p-6 text-center">
          <p className="font-medium">Não foi possível carregar as solicitações.</p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </Card>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <ClipboardList className="h-7 w-7" /> Portal da Secretaria
            </h1>
            <p className="text-muted-foreground">
              Solicitações de batismo, casamento, catequese, visita pastoral e mais
            </p>
          </div>
          <Button onClick={openNew} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nova solicitação
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats?.total ?? 0} />
          <StatCard label="Recebidos" value={stats?.pendentes ?? 0} />
          <StatCard label="Em andamento" value={stats?.emAndamento ?? 0} />
          <StatCard label="Concluídos" value={stats?.concluidos ?? 0} />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma solicitação encontrada para este filtro.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preferência</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{req.requester_name}</div>
                        {req.requester_phone && (
                          <div className="text-xs text-muted-foreground">{req.requester_phone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {REQUEST_TYPE_LABELS[req.request_type] ?? req.request_type}
                      </TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_STYLES[req.priority] ?? ""}>
                          {PRIORITY_LABELS[req.priority] ?? req.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={req.status}
                          onValueChange={(status) => statusMut.mutate({ id: req.id, status })}
                        >
                          <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(STATUS_LABELS).map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {req.preferred_date
                          ? new Date(req.preferred_date).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div>{req.assignee_name || "—"}</div>
                        {req.due_date && (
                          <div className="text-xs text-muted-foreground">
                            Prazo {new Date(req.due_date).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button variant="outline" size="sm" onClick={() => openEdit(req)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMut.mutate(req.id)}
                          disabled={deleteMut.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <span className="hidden" />
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar" : "Nova"} solicitação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tipo de solicitação</Label>
                  <Select
                    value={form.request_type}
                    onValueChange={(v) => setForm({ ...form, request_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(REQUEST_TYPE_LABELS).map((t) => (
                        <SelectItem key={t} value={t}>
                          {REQUEST_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm({ ...form, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PRIORITY_LABELS).map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Vincular a um membro (opcional)</Label>
                <Select
                  value={form.member_id || "none"}
                  onValueChange={(v) => {
                    if (v === "none") {
                      setForm({ ...form, member_id: "" });
                      return;
                    }
                    const m = members.find((mm) => mm.id === v);
                    setForm({
                      ...form,
                      member_id: v,
                      requester_name: form.requester_name || m?.full_name || "",
                      requester_phone: form.requester_phone || m?.phone || "",
                      requester_email: form.requester_email || m?.email || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nome do solicitante</Label>
                <Input
                  value={form.requester_name}
                  onChange={(e) => setForm({ ...form, requester_name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={form.requester_phone}
                    onChange={(e) => setForm({ ...form, requester_phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={form.requester_email}
                    onChange={(e) => setForm({ ...form, requester_email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Data de preferência</Label>
                  <Input
                    type="date"
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Agendar atendimento</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Detalhes da solicitação</Label>
                <Textarea
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Descreva o pedido do solicitante"
                />
              </div>

              <div>
                <Label>Observações internas</Label>
                <Textarea
                  value={form.internal_notes}
                  onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                  placeholder="Anotações da equipe (não exibidas ao solicitante)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Responsável interno</Label>
                  <Input
                    value={form.assignee_name}
                    onChange={(e) => setForm({ ...form, assignee_name: e.target.value })}
                    placeholder="Nome da pessoa responsável"
                  />
                </div>
                <div>
                  <Label>Prazo interno</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>
              </div>

              {form.id && (
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" /> Anexos privados
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadMut.isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadMut.isPending ? "Enviando" : "Anexar"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadMut.mutate(file);
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    {(attachments as SecretariaAttachment[]).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum anexo enviado.</p>
                    ) : (
                      (attachments as SecretariaAttachment[]).map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <div className="truncate font-medium">{attachment.file_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.file_size)} · {new Date(attachment.created_at).toLocaleString("pt-BR")}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => downloadMut.mutate(attachment.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => deleteAttachmentMut.mutate(attachment.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {form.id && (
                <div className="rounded-md border p-3">
                  <Label>Histórico da solicitação</Label>
                  <div className="mt-3 space-y-2">
                    {(events as SecretariaEvent[]).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum histórico registrado ainda.</p>
                    ) : (
                      (events as SecretariaEvent[]).map((event) => (
                        <div key={event.id} className="flex items-start justify-between gap-3 text-sm">
                          <div>
                            <div className="font-medium">{eventLabel(event)}</div>
                            {event.from_status !== event.to_status && event.to_status && (
                              <div className="text-xs text-muted-foreground">
                                {event.from_status
                                  ? `${STATUS_LABELS[event.from_status] ?? event.from_status} -> `
                                  : ""}
                                {STATUS_LABELS[event.to_status] ?? event.to_status}
                              </div>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => saveMut.mutate(form)}
                disabled={saveMut.isPending || !form.requester_name.trim()}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function eventLabel(event: SecretariaEvent) {
  if (event.event_type === "created") return "Solicitação criada";
  if (event.event_type === "status_changed") return "Status alterado";
  if (event.event_type === "deleted") return "Solicitação removida";
  return "Solicitação atualizada";
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
