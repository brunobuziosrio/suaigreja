import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDocumentTemplates, listMemberDocuments, upsertMemberDocument, deleteMemberDocument, renderTemplate } from "@/lib/documents.functions";
import { listMembers } from "@/lib/members.functions";
import { getMyAccount } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/documentos")({
  component: DocsPage,
});

function DocsPage() {
  const qc = useQueryClient();
  const fetchTpl = useServerFn(listDocumentTemplates);
  const fetchDocs = useServerFn(listMemberDocuments);
  const fetchMembers = useServerFn(listMembers);
  const fetchAccount = useServerFn(getMyAccount);
  const save = useServerFn(upsertMemberDocument);
  const remove = useServerFn(deleteMemberDocument);

  const { data: templates = [] } = useQuery({ queryKey: ["doc-templates"], queryFn: () => fetchTpl() });
  const { data: docs = [], isLoading } = useQuery({ queryKey: ["member-docs"], queryFn: () => fetchDocs() });
  const { data: members = [] } = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount() });

  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const [memberId, setMemberId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().slice(0, 10));

  const selectedMember = members.find((m) => m.id === memberId);
  const selectedTpl = templates.find((t) => t.id === templateId);

  function applyTemplate(tplId: string) {
    setTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setTitle(tpl.title);
    const vars = {
      nome: selectedMember?.full_name ?? "",
      igreja: account?.brand_title ?? "",
      data: new Date(issuedAt).toLocaleDateString("pt-BR"),
      data_membresia: selectedMember?.member_since
        ? new Date(selectedMember.member_since).toLocaleDateString("pt-BR") : "",
    };
    setBody(renderTemplate(tpl.body, vars));
  }

  const upsertMut = useMutation({
    mutationFn: () => save({ data: {
      template_id: templateId || null, member_id: memberId || null,
      title, body, issued_at: issuedAt,
    }}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member-docs"] });
      toast.success("Documento emitido");
      setOpen(false); setTemplateId(""); setMemberId(""); setTitle(""); setBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function printDoc(d: any) {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${d.title}</title>
      <style>body{font-family:Georgia,serif;max-width:680px;margin:60px auto;padding:0 40px;color:#222;line-height:1.7}
      h1{font-size:22px;text-align:center;margin-bottom:8px} .meta{text-align:center;color:#777;font-size:13px;margin-bottom:40px}
      .body{white-space:pre-wrap;font-size:15px} .sig{margin-top:80px;text-align:center;border-top:1px solid #333;padding-top:8px;width:60%;margin-left:auto;margin-right:auto;font-size:13px}
      @media print{body{margin:20px}}</style></head><body>
      <h1>${d.title}</h1>
      <div class="meta">${account?.brand_title ?? "Igreja"} · ${new Date(d.issued_at).toLocaleDateString("pt-BR")}</div>
      <div class="body">${d.body.replace(/</g, "&lt;")}</div>
      <div class="sig">Assinatura e carimbo</div>
      <script>window.print()</script></body></html>`);
    w.document.close();
  }

  const tplGroups = useMemo(() => {
    const globals = templates.filter((t) => t.is_global);
    const mine = templates.filter((t) => !t.is_global);
    return { globals, mine };
  }, [templates]);

  return (
    <AppShell>
      <div className="p-6 max-w-6xl">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documentos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Declarações, certificados, ofícios e cartas com modelos prontos da plataforma.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Emitir documento</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Emitir documento</DialogTitle></DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Modelo</Label>
                    <Select value={templateId} onValueChange={applyTemplate}>
                      <SelectTrigger><SelectValue placeholder="Escolher modelo…" /></SelectTrigger>
                      <SelectContent>
                        {tplGroups.globals.map((t) => <SelectItem key={t.id} value={t.id}>★ {t.title}</SelectItem>)}
                        {tplGroups.mine.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                      </SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>Membro</Label>
                    <Select value={memberId} onValueChange={(v) => { setMemberId(v); if (templateId) applyTemplate(templateId); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                      <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                    </Select></div>
                </div>
                <div className="space-y-2"><Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label>Data de emissão</Label>
                  <Input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className="w-48" /></div>
                <div className="space-y-2"><Label>Conteúdo</Label>
                  <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
                  {selectedTpl && <p className="text-xs text-muted-foreground">Variáveis: {`{{nome}} {{igreja}} {{data}} {{data_membresia}}`}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!title.trim() || !body.trim() || upsertMut.isPending} onClick={() => upsertMut.mutate()}>
                  {upsertMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Emitir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-4 mb-6 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Modelos disponíveis</p>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t) => (
              <Badge key={t.id} variant={t.is_global ? "secondary" : "outline"} className="text-xs">
                {t.is_global && "★ "}{t.title}
              </Badge>
            ))}
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : docs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Nenhum documento emitido</h3>
            <p className="text-sm text-muted-foreground mt-1">Use os modelos acima pra emitir o primeiro.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {docs.map((d: any) => (
              <Card key={d.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.members?.full_name ?? "Sem membro vinculado"} · {new Date(d.issued_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => printDoc(d)}><Printer className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Remover este documento?")) remove({ data: { id: d.id } }).then(() => qc.invalidateQueries({ queryKey: ["member-docs"] }));
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}