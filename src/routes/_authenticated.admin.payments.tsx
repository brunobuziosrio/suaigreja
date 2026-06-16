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
import { ShieldCheck, WalletCards } from "lucide-react";
import { getIsAdmin } from "@/lib/admin.functions";
import { useBranding } from "@/hooks/use-branding";
import { adminUpdateBranding } from "@/lib/branding.functions";
import { getPlatformPaymentSettings, updatePlatformPaymentSettings } from "@/lib/admin-payment-settings.functions";
import { supabase } from "@/integrations/supabase/client";

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
            Identidade visual exibida pra todos os clientes e gateways de pagamento da assinatura SaaS.
            Visível só pra administradores da plataforma.
          </p>
        </div>
        <PlatformBrandingSection />
      </div>
    </AppShell>
  );
}

function PlatformBrandingSection() {
  const updateBranding = useServerFn(adminUpdateBranding);
  const fetchPaymentSettings = useServerFn(getPlatformPaymentSettings);
  const savePaymentSettings = useServerFn(updatePlatformPaymentSettings);
  const { data: branding } = useBranding();
  const qc = useQueryClient();
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<"icon" | "logo" | null>(null);
  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setIconError(false);
    setLogoError(false);
  }, [form.icon_url, form.logo_url]);

  const { data: paymentSettings } = useQuery({
    queryKey: ["platform-payment-settings"],
    queryFn: () => fetchPaymentSettings(),
  });

  const [paymentForm, setPaymentForm] = useState({
    ativopayApiKey: "",
    ativopayWebhookSecret: "",
    mercadopagoAccessToken: "",
  });

  useEffect(() => {
    if (paymentSettings) {
      setPaymentForm({
        ativopayApiKey: paymentSettings.ativopayApiKey,
        ativopayWebhookSecret: paymentSettings.ativopayWebhookSecret,
        mercadopagoAccessToken: paymentSettings.mercadopagoAccessToken,
      });
    }
  }, [paymentSettings]);

  const savePaymentMut = useMutation({
    mutationFn: () => savePaymentSettings({ data: paymentForm }),
    onSuccess: () => {
      toast.success("Configurações de pagamento atualizadas");
      qc.invalidateQueries({ queryKey: ["platform-payment-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB.");
      return;
    }
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `branding/${kind}-${crypto.randomUUID()}.${ext}`;
      
      // Fix for "mime type image/x-icon is not supported"
      let contentType = file.type;
      if (contentType === "image/x-icon" || contentType === "image/vnd.microsoft.icon") {
        contentType = "image/png";
      }

      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
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
        ? `${pub.publicUrl}?dim=${dims.w}x${dims.h}`
        : pub.publicUrl;
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

      {/* GRUPO 1: Logo expandida (imagem OU texto + subtítulo) */}
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

      {/* GRUPO 2: Ícone compacto (imagem OU letra) */}
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

      {/* GRUPO 3: Gateways de pagamento da plataforma */}
      <div className="rounded-md border p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Gateways de pagamento (assinatura)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            AtivoPay recebe o pagamento das assinaturas das igrejas. O campo de Mercado Pago da plataforma
            fica reservado para uma futura migração — ainda não está em uso na cobrança.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">AtivoPay — API Key</Label>
            <Input
              type="password"
              value={paymentForm.ativopayApiKey}
              onChange={(e) => setPaymentForm({ ...paymentForm, ativopayApiKey: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">AtivoPay — Webhook Secret</Label>
            <Input
              type="password"
              value={paymentForm.ativopayWebhookSecret}
              onChange={(e) => setPaymentForm({ ...paymentForm, ativopayWebhookSecret: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Mercado Pago da plataforma — Access Token (reservado)</Label>
            <Input
              type="password"
              value={paymentForm.mercadopagoAccessToken}
              onChange={(e) => setPaymentForm({ ...paymentForm, mercadopagoAccessToken: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end border-t pt-3">
          <Button onClick={() => savePaymentMut.mutate()} disabled={savePaymentMut.isPending}>
            {savePaymentMut.isPending ? "Salvando…" : "Salvar gateways"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
