import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, KeyRound, Loader2, ShieldCheck, Trash2, WalletCards } from "lucide-react";
import { getIsAdmin } from "@/lib/admin.functions";
import { useBranding } from "@/hooks/use-branding";
import { adminUpdateBranding, adminUploadBrandingAsset } from "@/lib/branding.functions";
import {
  getPlatformPaymentSettings,
  updatePlatformPaymentSettings,
  validatePlatformMercadoPagoAccessToken,
} from "@/lib/admin-payment-settings.functions";
import { validateImageFile } from "@/lib/file-validation";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck, isLoading: checking } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = !!adminCheck?.isAdmin;

  if (checking) {
    return (
      <AppShell>
        <div className="w-full text-sm text-muted-foreground">Verificando permissões…</div>
      </AppShell>
    );
  }
  if (!isAdmin) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-xl font-semibold">Área restrita</h1>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <WalletCards className="h-6 w-6" /> Pagamentos da plataforma
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure o Mercado Pago para assinaturas, produtos do marketplace,
            inscrições pagas e créditos WhatsApp.
          </p>
        </div>
        <PlatformPaymentsSection />
      </div>
    </AppShell>
  );
}

export function PlatformBrandingSection() {
  const updateBranding = useServerFn(adminUpdateBranding);
  const uploadBrandingAsset = useServerFn(adminUploadBrandingAsset);
  const { data: branding } = useBranding();
  const qc = useQueryClient();
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<"icon" | "logo" | null>(null);
  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const [form, setForm] = useState({
    brand_text: "",
    subtitle: "",
    icon_text: "",
    icon_url: "",
    logo_url: "",
    logo_height_px: 32,
  });

  useEffect(() => {
    if (branding) {
      setForm({
        brand_text: branding.brand_text,
        subtitle: branding.subtitle,
        icon_text: branding.icon_text,
        icon_url: branding.icon_url ?? "",
        logo_url: branding.logo_url ?? "",
        logo_height_px: branding.logo_height_px,
      });
    }
  }, [branding]);

  const saveMut = useMutation({
    mutationFn: () =>
      updateBranding({
        data: {
          brand_text: form.brand_text,
          subtitle: form.subtitle,
          icon_text: form.icon_text,
          icon_url: form.icon_url || null,
          logo_url: form.logo_url || null,
          logo_height_px: Number(form.logo_height_px) || 32,
        },
      }),
    onSuccess: () => {
      toast.success("Identidade visual atualizada");
      qc.invalidateQueries({ queryKey: ["platform-branding"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadFile(file: File, kind: "icon" | "logo") {
    const validationError = validateImageFile(file);
    if (validationError) return toast.error(validationError);
    setUploading(kind);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
        reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        reader.readAsDataURL(file);
      });
      const uploaded = await uploadBrandingAsset({
        data: {
          filename: file.name,
          contentType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/x-icon" | "image/vnd.microsoft.icon",
          base64,
          kind,
        },
      });
      const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
      const finalUrl = dims
        ? `${uploaded.url}?dim=${dims.w}x${dims.h}`
        : uploaded.url;
      if (kind === "icon") setForm((f) => ({ ...f, icon_url: finalUrl }));
      else setForm((f) => ({ ...f, logo_url: finalUrl }));
      toast.success(
        dims ? `Enviada (${dims.w}×${dims.h}px)` : "Enviada",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(null);
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold">Identidade da plataforma</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Logo, ícone e textos exibidos no menu lateral para <strong>todos os clientes</strong>.
          A imagem tem prioridade; o texto/letra só aparece quando não houver imagem enviada.
        </p>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Logo expandida</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aparece no menu lateral quando aberto. Envie uma imagem (PNG transparente, ~200×64) — se não houver, mostramos o texto abaixo.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://… ou envie um arquivo"
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, "logo");
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => logoInputRef.current?.click()}
            disabled={uploading === "logo"}
          >
            {uploading === "logo" ? "Enviando…" : "Enviar imagem"}
          </Button>
          {form.logo_url && (
            <Button type="button" variant="ghost" onClick={() => setForm({ ...form, logo_url: "" })}>
              Remover
            </Button>
          )}
        </div>
        {form.logo_url && !logoError && (
          <div className="flex items-center gap-3">
            <div className="rounded-md border bg-muted/40 p-3 inline-block">
              <img
                src={form.logo_url}
                alt="Logo"
                style={{ height: form.logo_height_px }}
                className="w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Altura (px)</Label>
              <Input
                type="number"
                min={16}
                max={96}
                value={form.logo_height_px}
                onChange={(e) =>
                  setForm({ ...form, logo_height_px: Number(e.target.value) || 32 })
                }
                className="w-24"
              />
            </div>
          </div>
        )}
        {logoError && form.logo_url && (
          <p className="text-xs text-destructive">Erro ao carregar a logo. Verifique o link.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-3 border-t pt-3">
          <div className="space-y-1">
            <Label className="text-xs">Texto da marca (fallback)</Label>
            <Input
              value={form.brand_text}
              onChange={(e) => setForm({ ...form, brand_text: e.target.value })}
              placeholder="suaigreja"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subtítulo</Label>
            <Input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="painel"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Ícone compacto</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aparece no menu lateral quando recolhido e na aba do navegador. Envie uma imagem (64×64).
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={form.icon_url}
            onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
            placeholder="https://… ou envie um arquivo"
          />
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, "icon");
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => iconInputRef.current?.click()}
            disabled={uploading === "icon"}
          >
            {uploading === "icon" ? "Enviando…" : "Enviar imagem"}
          </Button>
          {form.icon_url && (
            <Button type="button" variant="ghost" onClick={() => setForm({ ...form, icon_url: "" })}>
              Remover
            </Button>
          )}
        </div>

        {form.icon_url && !iconError && (
          <div className="border-t pt-3">
            <img
              src={form.icon_url}
              alt=""
              className="h-12 w-12 rounded-md border object-cover"
              onError={() => setIconError(true)}
            />
          </div>
        )}
        {iconError && form.icon_url && (
          <p className="text-xs text-destructive">Erro ao carregar o ícone. Verifique o link.</p>
        )}
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending ? "Salvando…" : "Salvar identidade"}
        </Button>
      </div>

    </Card>
  );
}

function PlatformPaymentsSection() {
  const fetchPaymentSettings = useServerFn(getPlatformPaymentSettings);
  const savePaymentSettings = useServerFn(updatePlatformPaymentSettings);
  const validatePaymentSettings = useServerFn(validatePlatformMercadoPagoAccessToken);
  const qc = useQueryClient();
  const { data: paymentSettings } = useQuery({
    queryKey: ["platform-payment-settings"],
    queryFn: () => fetchPaymentSettings(),
  });
  const [paymentForm, setPaymentForm] = useState({ mercadopagoAccessToken: "" });
  const savePaymentMut = useMutation({
    mutationFn: (data: { mercadopagoAccessToken?: string; clearMercadoPagoAccessToken?: boolean }) =>
      savePaymentSettings({ data }),
    onSuccess: async (_result, variables) => {
      toast.success(
        variables.clearMercadoPagoAccessToken
          ? "Token do Mercado Pago removido"
          : "Token do Mercado Pago salvo com segurança",
      );
      setPaymentForm({ mercadopagoAccessToken: "" });
      await qc.invalidateQueries({ queryKey: ["platform-payment-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const validatePaymentMut = useMutation({
    mutationFn: () => validatePaymentSettings(),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="p-6">
      <div className="mb-5 rounded-lg border border-sky-500/25 bg-sky-500/[.04] p-4">
        <p className="text-sm font-semibold">Antes de colar a credencial</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Este sistema usa somente o <strong>Access Token</strong> privado no servidor para criar Pix.
          Não use a <strong>Public Key</strong>: ela é destinada ao front-end. Para receber pagamentos reais,
          copie o token da seção <strong>Produção</strong>; tokens de <strong>Testes</strong> não realizam cobranças reais.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="https://www.mercadopago.com.br/developers/panel/app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Abrir credenciais no Mercado Pago <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
          <a
            href="https://www.mercadopago.com.br/developers/pt/docs/credentials"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Como ativar Produção <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Gateway de pagamento da plataforma</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mercado Pago recebe assinaturas das igrejas, produtos do marketplace,
              inscrições pagas e compras de créditos WhatsApp.
            </p>
          </div>
        </div>

        {paymentSettings?.hasMercadoPagoAccessToken ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3.5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Token corporativo configurado</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  A credencial está armazenada com segurança e não é exibida novamente. Para trocar,
                  informe um novo token abaixo; para desativar os pagamentos, remova-o explicitamente.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-emerald-500/20 pt-3">
              <Button size="sm" variant="outline" onClick={() => validatePaymentMut.mutate()} disabled={validatePaymentMut.isPending}>
                {validatePaymentMut.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                Validar credencial
              </Button>
              {validatePaymentMut.data && (
                <p className={`text-xs font-medium ${validatePaymentMut.data.valid ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"}`}>
                  {validatePaymentMut.data.valid
                    ? `Credencial aceita${validatePaymentMut.data.accountLabel ? ` para ${validatePaymentMut.data.accountLabel}` : ""}.`
                    : "A credencial não foi aceita pelo Mercado Pago. Substitua o token."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-muted-foreground">
            Nenhum token está configurado. Assinaturas e cobranças PIX da plataforma não podem ser criadas.
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs">
            {paymentSettings?.hasMercadoPagoAccessToken ? "Substituir Access Token" : "Access Token do Mercado Pago"}
          </Label>
          <Input
            type="password"
            value={paymentForm.mercadopagoAccessToken}
            onChange={(e) => setPaymentForm({ ...paymentForm, mercadopagoAccessToken: e.target.value })}
            placeholder={paymentSettings?.hasMercadoPagoAccessToken ? "Cole um novo token para substituí-lo" : "Cole o token corporativo"}
            autoComplete="new-password"
          />
          <p className="text-[11px] text-muted-foreground">
            O valor é salvo, mas nunca volta para o navegador ou para esta tela.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          {paymentSettings?.hasMercadoPagoAccessToken ? (
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                if (window.confirm("Remover o token do Mercado Pago? Os pagamentos da plataforma deixarão de funcionar até que um novo token seja salvo.")) {
                  savePaymentMut.mutate({ clearMercadoPagoAccessToken: true });
                }
              }}
              disabled={savePaymentMut.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover token
            </Button>
          ) : <span />}
          <Button
            onClick={() => savePaymentMut.mutate(paymentForm.mercadopagoAccessToken.trim() ? paymentForm : {})}
            disabled={savePaymentMut.isPending || !paymentForm.mercadopagoAccessToken.trim()}
          >
            {savePaymentMut.isPending ? "Salvando…" : paymentSettings?.hasMercadoPagoAccessToken ? "Substituir token" : "Salvar token"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
