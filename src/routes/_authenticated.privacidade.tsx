import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getConsentStatus,
  recordDataConsent,
  exportMyAccountData,
  requestDataDeletion,
} from "@/lib/lgpd.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldCheck, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/privacidade")({
  component: PrivacyPage,
});

const CONSENT_LABELS: Record<string, string> = {
  data_processing: "Processamento dos meus dados pela plataforma",
  whatsapp_contact: "Contato via WhatsApp sobre minha conta",
  marketing_emails: "E-mails de novidades e melhorias",
  cookies: "Cookies de análise e preferências",
};

const CONSENT_TYPES = Object.keys(CONSENT_LABELS) as (keyof typeof CONSENT_LABELS)[];

function PrivacyPage() {
  const fetchStatus = useServerFn(getConsentStatus);
  const saveConsent = useServerFn(recordDataConsent);
  const exportData = useServerFn(exportMyAccountData);
  const requestDeletion = useServerFn(requestDataDeletion);

  const { data: consents = {}, refetch } = useQuery({ queryKey: ["consent-status"], queryFn: () => fetchStatus() });

  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const consentMut = useMutation({
    mutationFn: (v: { consent_type: string; accepted: boolean }) =>
      saveConsent({ data: v as any }),
    onSuccess: () => refetch(),
    onError: (e: Error) => toast.error(e.message),
  });

  const exportMut = useMutation({
    mutationFn: () => exportData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Arquivo baixado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletionMut = useMutation({
    mutationFn: () => requestDeletion({ data: { reason: reason.trim() || null, confirm_deletion: true } }),
    onSuccess: (res) => {
      toast.success(res.message);
      setConfirmOpen(false);
      setReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" /> Privacidade e Dados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seus consentimentos e exerça seus direitos garantidos pela LGPD sobre a sua conta nesta plataforma.
          </p>
        </div>

        <Card className="p-5 mb-4">
          <h2 className="font-semibold mb-3">Consentimentos</h2>
          <div className="space-y-3">
            {CONSENT_TYPES.map((type) => (
              <div key={type} className="flex items-center justify-between gap-3">
                <Label htmlFor={type} className="!m-0 text-sm font-normal cursor-pointer">
                  {CONSENT_LABELS[type]}
                </Label>
                <Switch
                  id={type}
                  checked={!!(consents as any)[type]}
                  onCheckedChange={(checked) => consentMut.mutate({ consent_type: type, accepted: checked })}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 mb-4">
          <h2 className="font-semibold mb-1 flex items-center gap-2"><Download className="h-4 w-4" />Baixar meus dados</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Baixe um arquivo com os dados que a plataforma guarda sobre a sua conta de usuário
            (vínculo com a igreja, histórico de consentimentos e solicitações).
          </p>
          <Button size="sm" variant="outline" disabled={exportMut.isPending} onClick={() => exportMut.mutate()}>
            {exportMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Baixar arquivo (.json)
          </Button>
        </Card>

        <Card className="p-5 border-destructive/30">
          <h2 className="font-semibold mb-1 flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" />Excluir minha conta</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Solicite a exclusão da sua conta de usuário nesta plataforma. A solicitação é registrada e
            processada em até 30 dias, conforme a LGPD. Isso não apaga os dados da igreja/congregação,
            que pertencem à instituição.
          </p>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">Solicitar exclusão</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Confirmar solicitação de exclusão</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">
                Essa ação registra um pedido formal de exclusão da sua conta. Nossa equipe entrará em
                contato pra confirmar antes de processar.
              </p>
              <Textarea
                placeholder="Motivo (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                <Button variant="destructive" disabled={deletionMut.isPending} onClick={() => deletionMut.mutate()}>
                  {deletionMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Confirmar solicitação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </AppShell>
  );
}
