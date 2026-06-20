import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listEventPages,
  saveEventPage,
  deleteEventPage,
  listEventRegistrations,
  getRegistrationPayment,
} from "@/lib/event-pages.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarHeart, ChevronDown, ChevronRight, Copy, ExternalLink, Pencil, Plus, QrCode, Trash2, Users } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { formatCentsBRL } from "@/lib/billing-plans";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { validateImageFile } from "@/lib/file-validation";

export const Route = createFileRoute("/_authenticated/eventos")({
  component: EventosPage,
});

type EventPageRow = Awaited<ReturnType<typeof listEventPages>>[number];

const EMPTY_FORM = {
  id: undefined as string | undefined,
  title: "",
  description: "",
  cover_image_url: "" as string,
  event_date: "",
  start_time: "19:00",
  end_time: "" as string,
  location_name: "",
  location_address: "",
  price_cents: 0,
  max_attendees: "" as string,
  allow_free: true,
  active: true,
  primary_color: "#467da5",
  whatsapp_contact: "",
  slug: "",
};

function CoverUpload({
  value,
  onChange,
  userId,
}: {
  value: string;
  onChange: (url: string) => void;
  userId: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function onPick(file: File) {
    const validationError = validateImageFile(file, 10);
    if (validationError) return toast.error(validationError);
    const r = new FileReader();
    r.onload = () => setCropSrc(r.result as string);
    r.readAsDataURL(file);
  }

  async function uploadBlob(blob: Blob) {
    if (!userId) {
      toast.error("Sessão expirada. Recarregue a página.");
      return;
    }
    setUploading(true);
    const path = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("event-covers")
      .upload(path, blob, { upsert: false, contentType: "image/jpeg" });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    setCropSrc(null);
  }

  return (
    <div className="space-y-2">
      <Label>Imagem de capa (proporção 4:5 - retrato, recomendado 1080×1350)</Label>
      {value && (
        <img src={value} alt="" className="w-full max-w-xs aspect-[4/5] object-cover rounded border" />
      )}
      <div className="flex gap-2">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? "Enviando..." : value ? "Trocar imagem" : "Enviar imagem"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remover
          </Button>
        )}
      </div>
      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        aspect={4/5}
        onCancel={() => setCropSrc(null)}
        onConfirm={uploadBlob}
      />
    </div>
  );
}

function EventosPage() {
  const list = useServerFn(listEventPages);
  const save = useServerFn(saveEventPage);
  const remove = useServerFn(deleteEventPage);
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: events = [], isLoading } = useQuery({ queryKey: ["event-pages"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: () =>
      save({
        data: {
          id: form.id,
          title: form.title,
          description: form.description,
          cover_image_url: form.cover_image_url || null,
          event_date: form.event_date,
          start_time: form.start_time,
          end_time: form.end_time || null,
          location_name: form.location_name,
          location_address: form.location_address || null,
          price_cents: Number(form.price_cents) || 0,
          max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
          allow_free: form.allow_free,
          active: form.active,
          primary_color: form.primary_color || "#467da5",
          whatsapp_contact: form.whatsapp_contact || null,
          slug: form.slug || undefined,
        },
      }),
    onSuccess: () => {
      toast.success(form.id ? "Evento atualizado" : "Evento criado");
      setOpen(false);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["event-pages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Evento excluído");
      qc.invalidateQueries({ queryKey: ["event-pages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }
  function openEdit(e: EventPageRow) {
    setForm({
      id: e.id,
      title: e.title,
      description: e.description,
      cover_image_url: e.cover_image_url ?? "",
      event_date: e.event_date,
      start_time: e.start_time,
      end_time: e.end_time ?? "",
      location_name: e.location_name,
      location_address: e.location_address ?? "",
      price_cents: e.price_cents,
      max_attendees: e.max_attendees ? String(e.max_attendees) : "",
      allow_free: e.allow_free,
      active: e.active,
      primary_color: e.primary_color,
      whatsapp_contact: e.whatsapp_contact ?? "",
      slug: e.slug,
    });
    setOpen(true);
  }

  const userId = user?.id ?? "";

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <CalendarHeart className="h-6 w-6" />
              Páginas de Eventos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Crie landings públicas para retiros, festas e celebrações com inscrição online e pagamento por PIX.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo evento
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum evento ainda. Clique em "Novo evento" para começar.
                  </TableCell>
                </TableRow>
              )}
              {events.map((e) => {
                const url = `${window.location.origin}/e/${e.slug}`;
                 const isOpen = expanded === e.id;
                return (
                    <>
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : e.id)}
                            className="mt-0.5 text-muted-foreground hover:text-foreground"
                            title={isOpen ? "Recolher" : "Ver inscritos"}
                          >
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <div>
                            <div className="font-medium">{e.title}</div>
                            <div className="text-xs text-muted-foreground">/{e.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                    <TableCell className="text-sm">{e.event_date}</TableCell>
                    <TableCell>{e.price_cents > 0 ? formatCentsBRL(e.price_cents) : <Badge variant="secondary">Grátis</Badge>}</TableCell>
                    <TableCell>
                      <button
                        className="text-sm underline-offset-2 hover:underline flex items-center gap-1"
                          onClick={() => setExpanded(isOpen ? null : e.id)}
                      >
                        <Users className="h-3 w-3" />
                        {e._counts.paid} pagos / {e._counts.total} total
                      </button>
                    </TableCell>
                    <TableCell>
                      {e.active ? <Badge>Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.success("Link copiado!");
                          }}
                          title="Copiar link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <a href={`/e/${e.slug}`} target="_blank" rel="noreferrer">
                          <Button size="icon" variant="ghost" title="Abrir">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Excluir "${e.title}"? Isso remove também os inscritos.`)) delMut.mutate(e.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    {isOpen && (
                      <TableRow key={e.id + "-exp"}>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <RegistrationsList eventPageId={e.id} />
                        </TableCell>
                      </TableRow>
                    )}
                    </>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar evento" : "Novo evento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Festa da Padroeira 2026" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="O que vai acontecer, programação, o que levar..."
              />
            </div>
            <CoverUpload value={form.cover_image_url} onChange={(url) => setForm({ ...form, cover_image_url: url })} userId={userId} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div>
                <Label>Início</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <Label>Fim (opcional)</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Local</Label>
                <Input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} placeholder="Igreja Matriz" />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={form.location_address} onChange={(e) => setForm({ ...form, location_address: e.target.value })} placeholder="Rua X, 100" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={(form.price_cents / 100).toString()}
                  onChange={(e) => setForm({ ...form, price_cents: Math.round(Number(e.target.value) * 100) })}
                />
                <p className="text-[10px] text-muted-foreground mt-1">0 = gratuito</p>
              </div>
              <div>
                <Label>Vagas máx.</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.max_attendees}
                  onChange={(e) => setForm({ ...form, max_attendees: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>WhatsApp de contato (opcional)</Label>
              <Input value={form.whatsapp_contact} onChange={(e) => setForm({ ...form, whatsapp_contact: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/e/</span>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto a partir do título" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label className="!m-0">Página pública ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || !form.title || !form.event_date}
            >
              {saveMut.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}

function RegistrationsList({ eventPageId }: { eventPageId: string }) {
  const list = useServerFn(listEventRegistrations);
  const getPay = useServerFn(getRegistrationPayment);
  const { data: regs = [], isLoading } = useQuery({
    queryKey: ["event-regs", eventPageId],
    queryFn: () => list({ data: { eventPageId } }),
  });
  const [payOpen, setPayOpen] = useState<{ id: string; name: string } | null>(null);
  const { data: pay } = useQuery({
    queryKey: ["reg-pay", payOpen?.id],
    queryFn: () => getPay({ data: { registrationId: payOpen!.id } }),
    enabled: !!payOpen,
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (regs.length === 0) return <p className="text-sm text-muted-foreground">Nenhum inscrito ainda.</p>;
  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regs.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-sm">{r.email}</TableCell>
              <TableCell className="text-sm">{r.phone ?? "—"}</TableCell>
              <TableCell>
                {r.status === "paid" || r.status === "confirmed" ? (
                  <Badge>Confirmado</Badge>
                ) : (
                  <Badge variant="outline">{r.status}</Badge>
                )}
              </TableCell>
              <TableCell>{r.amount_cents > 0 ? formatCentsBRL(r.amount_cents) : "—"}</TableCell>
              <TableCell className="text-right">
                {r.amount_cents > 0 && r.status !== "paid" && r.status !== "confirmed" && (
                  <Button size="sm" variant="outline" onClick={() => setPayOpen({ id: r.id, name: r.name })}>
                    <QrCode className="h-3.5 w-3.5 mr-1" /> Enviar PIX
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!payOpen} onOpenChange={(v) => !v && setPayOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PIX · {payOpen?.name}</DialogTitle>
          </DialogHeader>
          {!pay ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !pay.copyPaste ? (
            <p className="text-sm text-muted-foreground">
              Não há PIX gerado para esta inscrição. Peça ao inscrito que refaça a inscrição na página pública.
            </p>
          ) : (
            <div className="space-y-3">
              {pay.qrCodeImage && <img src={pay.qrCodeImage} alt="QR" className="w-56 h-56 mx-auto" />}
              <div>
                <Label className="text-xs">Copia e cola</Label>
                <div className="flex gap-2 mt-1">
                  <Input readOnly value={pay.copyPaste} className="font-mono text-xs" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(pay.copyPaste!);
                      toast.success("Copiado!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {pay.payUrl && (
                <a href={pay.payUrl} target="_blank" rel="noreferrer" className="text-sm underline text-primary">
                  Abrir página de pagamento ↗
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
