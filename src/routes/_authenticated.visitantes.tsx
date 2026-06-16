import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listVisitors,
  updateVisitorStatus,
  updateVisitorNotes,
  deleteVisitor,
  getVisitorSettings,
  saveVisitorSettings,
} from "@/lib/visitors.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QrCode, Copy, Download, MessageCircle, Phone, Mail, UserPlus, Trash2, Archive, Check } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

export const Route = createFileRoute("/_authenticated/visitantes")({ component: VisitantesPage });

function VisitantesPage() {
  const list = useServerFn(listVisitors);
  const upd = useServerFn(updateVisitorStatus);
  const updNotes = useServerFn(updateVisitorNotes);
  const del = useServerFn(deleteVisitor);
  const getCfg = useServerFn(getVisitorSettings);
  const saveCfg = useServerFn(saveVisitorSettings);
  const qc = useQueryClient();

  const { data: visitors = [], isLoading } = useQuery({ queryKey: ["visitors"], queryFn: () => list() });
  const { data: cfg } = useQuery({ queryKey: ["visitor-cfg"], queryFn: () => getCfg() });

  const [tab, setTab] = useState<"new" | "contacted" | "member" | "archived">("new");
  const [qrOpen, setQrOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false);

  const updMut = useMutation({
    mutationFn: (v: { id: string; status: "new" | "contacted" | "member" | "archived" }) =>
      upd({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitors"] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });

  const filtered = visitors.filter((v) => v.status === tab);
  const counts = {
    new: visitors.filter((v) => v.status === "new").length,
    contacted: visitors.filter((v) => v.status === "contacted").length,
    member: visitors.filter((v) => v.status === "member").length,
    archived: visitors.filter((v) => v.status === "archived").length,
  };

  const siteSlug = cfg?.custom_slug || cfg?.site_id || "";
  const publicUrl = siteSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/v/${siteSlug}` : "";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <UserPlus className="h-6 w-6" /> Visitantes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Imprima o QR Code e coloque na entrada da igreja. Os visitantes preenchem em segundos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCfgOpen(true)}>Configurações</Button>
            <Button onClick={() => setQrOpen(true)} disabled={!publicUrl}>
              <QrCode className="h-4 w-4 mr-2" /> Gerar QR Code
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="new">Novos ({counts.new})</TabsTrigger>
            <TabsTrigger value="contacted">Contatados ({counts.contacted})</TabsTrigger>
            <TabsTrigger value="member">Membros ({counts.member})</TabsTrigger>
            <TabsTrigger value="archived">Arquivados ({counts.archived})</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4 space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && filtered.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Nenhum visitante nesta caixa.
              </Card>
            )}
            {filtered.map((v) => (
              <VisitorCard
                key={v.id}
                v={v}
                onStatus={(s) => updMut.mutate({ id: v.id, status: s })}
                onDelete={() => confirm("Excluir definitivamente?") && delMut.mutate(v.id)}
                onSaveNotes={async (notes) => {
                  await updNotes({ data: { id: v.id, notes } });
                  toast.success("Anotação salva");
                  qc.invalidateQueries({ queryKey: ["visitors"] });
                }}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <QrDialog open={qrOpen} url={publicUrl} title={cfg?.brand_title ?? "Visitantes"} onClose={() => setQrOpen(false)} />

      <SettingsDialog
        open={cfgOpen}
        initial={{
          visitor_whatsapp: cfg?.visitor_whatsapp ?? "",
          visitor_welcome_message: cfg?.visitor_welcome_message ?? "",
        }}
        onSave={async (v) => {
          await saveCfg({ data: v });
          toast.success("Salvo");
          qc.invalidateQueries({ queryKey: ["visitor-cfg"] });
          setCfgOpen(false);
        }}
        onClose={() => setCfgOpen(false)}
      />
    </AppShell>
  );
}

type VisitorRow = Awaited<ReturnType<typeof listVisitors>>[number];

function VisitorCard({
  v,
  onStatus,
  onDelete,
  onSaveNotes,
}: {
  v: VisitorRow;
  onStatus: (s: "new" | "contacted" | "member" | "archived") => void;
  onDelete: () => void;
  onSaveNotes: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(v.notes ?? "");
  const waLink = v.phone
    ? `https://wa.me/55${v.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá ${v.name.split(" ")[0]}! Que alegria conhecer você na nossa igreja. 🙏`,
      )}`
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{v.name}</span>
            {v.is_first_time && <Badge variant="secondary">1ª vez</Badge>}
            {v.age_range && <Badge variant="outline">{v.age_range}</Badge>}
            <span className="text-xs text-muted-foreground">
              {new Date(v.created_at).toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
            {v.phone && (
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {v.phone}</span>
            )}
            {v.email && (
              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {v.email}</span>
            )}
            {v.how_found && <span>· Conheceu por: {v.how_found}</span>}
          </div>
          {v.prayer_request && (
            <div className="mt-2 text-sm bg-muted/40 rounded p-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Pedido</span>
              <p className="whitespace-pre-wrap">{v.prayer_request}</p>
            </div>
          )}
          {!v.allow_contact && (
            <p className="text-xs text-amber-600 mt-1">⚠ Não autorizou contato</p>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {waLink && v.allow_contact && (
            <a href={waLink} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="w-full">
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          {v.status !== "contacted" && v.status !== "member" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus("contacted")}>
              <Check className="h-3.5 w-3.5 mr-1" /> Contatado
            </Button>
          )}
          {v.status !== "member" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus("member")}>
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Tornou membro
            </Button>
          )}
          {v.status !== "archived" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus("archived")}>
              <Archive className="h-3.5 w-3.5 mr-1" /> Arquivar
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <Textarea
          rows={2}
          placeholder="Anotações internas (visitas, follow-up...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {notes !== (v.notes ?? "") && (
          <Button size="sm" className="mt-2" onClick={() => onSaveNotes(notes)}>
            Salvar anotação
          </Button>
        )}
      </div>
    </Card>
  );
}

function QrDialog({ open, url, title, onClose }: { open: boolean; url: string; title: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && url) {
      QRCode.toDataURL(url, { width: 600, margin: 2 }).then(setDataUrl);
    }
  }, [open, url]);

  const download = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-visitantes-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const printIt = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`
      <html><head><title>QR Visitantes · ${title}</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 60px 20px; }
        h1 { font-size: 28px; margin: 0 0 8px; }
        h2 { font-size: 18px; color: #555; margin: 0 0 32px; font-weight: 500; }
        img { width: 360px; height: 360px; }
        p { font-size: 14px; color: #888; margin-top: 24px; }
        .url { font-family: monospace; font-size: 12px; word-break: break-all; }
      </style></head><body>
        <h1>Bem-vindo(a) à ${title}! 🙏</h1>
        <h2>Aponte sua câmera para o QR Code abaixo</h2>
        <img src="${dataUrl}" />
        <p>Conte pra gente um pouquinho sobre você</p>
        <p class="url">${url}</p>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code de Visitantes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2" ref={canvasRef}>
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code" className="w-64 h-64 border rounded" />
          ) : (
            <div className="w-64 h-64 bg-muted animate-pulse rounded" />
          )}
          <div className="w-full">
            <Label className="text-xs">Link público</Label>
            <div className="flex gap-2 mt-1">
              <Input readOnly value={url} className="text-xs" />
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success("Copiado!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={download} className="flex-1">
            <Download className="h-4 w-4 mr-2" /> Baixar PNG
          </Button>
          <Button onClick={printIt} className="flex-1">
            Imprimir cartaz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: { visitor_whatsapp: string; visitor_welcome_message: string };
  onSave: (v: { visitor_whatsapp: string; visitor_welcome_message: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);
  useEffect(() => setForm(initial), [initialKey]);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações de visitantes</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>WhatsApp do pastor / recepção (opcional)</Label>
            <Input
              placeholder="(11) 99999-9999"
              value={form.visitor_whatsapp}
              onChange={(e) => setForm({ ...form, visitor_whatsapp: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Será usado para mensagens rápidas via WhatsApp.</p>
          </div>
          <div>
            <Label>Mensagem de boas-vindas exibida no final do formulário</Label>
            <Textarea
              rows={3}
              value={form.visitor_welcome_message}
              onChange={(e) => setForm({ ...form, visitor_welcome_message: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}