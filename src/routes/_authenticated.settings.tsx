import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RELIGION_PROFILES, type ReligionProfile } from "@/lib/religion-profiles";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyAccount,
  updateAccountSettings,
  checkSlugAvailability,
  requestManagedDomain,
  updateCustomSlug,
  updateCustomDomain,
  verifyCustomDomain,
  uploadAccountAsset,
} from "@/lib/account.functions";
import { listEvents } from "@/lib/events.functions";
import { listTypes } from "@/lib/types.functions";
import { PublicAgendaView } from "@/components/public-agenda-view";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CalendarCog,
  Check,
  Copy,
  Eye,
  Globe,
  IdCard,
  Landmark,
  Loader2,
  X,
} from "lucide-react";
import { useBranding } from "@/hooks/use-branding";
import { adminUpdateBranding } from "@/lib/branding.functions";
import { getIsAdmin } from "@/lib/admin.functions";
import { getPlatformPaymentSettings, updatePlatformPaymentSettings } from "@/lib/admin-payment-settings.functions";
import {
  getMyMercadoPagoConnection,
  saveMercadoPagoConnection,
  disconnectMercadoPago,
} from "@/lib/mercadopago-connections.functions";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";
import { MemberCard } from "@/components/member-card";

const DEFAULT_COLOR = "#467da5";

const SETTINGS_SECTIONS = [
  { id: "institution", label: "Instituição", description: "Endereço, identidade e tradição", icon: Building2 },
  { id: "domain", label: "Domínio e PWA", description: "Domínio próprio e app instalável", icon: Globe },
  { id: "agenda", label: "Agenda pública", description: "Campos, textos e aparência", icon: CalendarCog },
  { id: "donations", label: "Doações", description: "Contas e recebimentos", icon: Landmark },
  { id: "member-card", label: "Carteirinha", description: "Identidade do membro", icon: IdCard },
  { id: "preview", label: "Prévia", description: "Resultado publicado", icon: Eye },
] as const;

type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["id"];

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const getAccount = useServerFn(getMyAccount);
  const updateSettings = useServerFn(updateAccountSettings);
  const checkSlug = useServerFn(checkSlugAvailability);
  const requestDomain = useServerFn(requestManagedDomain);
  const saveSlug = useServerFn(updateCustomSlug);
  const saveDomain = useServerFn(updateCustomDomain);
  const verifyDomain = useServerFn(verifyCustomDomain);
  const uploadAsset = useServerFn(uploadAccountAsset);
  const fetchEvents = useServerFn(listEvents);
  const fetchTypes = useServerFn(listTypes);
  const qc = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("institution");

  async function saveAccountSettings(nextForm = form) {
    return updateSettings({
      data: {
        ...nextForm,
        brand_logo_url: nextForm.brand_logo_url || null,
        brand_logo_height_px: Number(nextForm.brand_logo_height_px) || 32,
        brand_footer_logo_url: nextForm.brand_footer_logo_url || null,
        card_logo_url: nextForm.card_logo_url || null,
        card_logo_height_px: Number(nextForm.card_logo_height_px) || 72,
        card_accent_color: nextForm.card_accent_color,
        card_footer_text: nextForm.card_footer_text,
        card_title_size_px: Number(nextForm.card_title_size_px) || 36,
        card_footer_size_px: Number(nextForm.card_footer_size_px) || 12,
        card_field_size_px: Number(nextForm.card_field_size_px) || 15,
        card_label_size_px: Number(nextForm.card_label_size_px) || 13,
      },
    });
  }

  const { data: account, isLoading } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getAccount(),
  });

  // Load next ~30 days of real events so the preview matches the public site exactly.
  const { data: previewEvents } = useQuery({
    queryKey: ["settings-preview-events"],
    queryFn: () => {
      const pad = (n: number) => String(n).padStart(2, "0");
      const today = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return fetchEvents({ data: { from: fmt(today), to: fmt(end) } });
    },
  });

  const { data: previewTypes = [] } = useQuery({
    queryKey: ["types"],
    queryFn: () => fetchTypes(),
  });

  const [form, setForm] = useState({
    brand_title: "",
    brand_today_title: "",
    brand_subtitle: "",
    brand_empty_message: "",
    primary_color: DEFAULT_COLOR,
    brand_logo_url: "",
    brand_logo_height_px: 32,
    brand_footer_logo_url: "",
    card_logo_url: "",
    card_logo_height_px: 72,
    card_accent_color: "#c8102e",
    card_footer_text:
      "É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva. Art 5º, VII, Constituição Federal.",
    card_title_size_px: 36,
    card_footer_size_px: 12,
    card_field_size_px: 15,
    card_label_size_px: 13,
    show_end_time: false,
    show_live_fields: true,
    force_show_type: false,
    religion_profile: "catolico" as ReligionProfile,
  });

  useEffect(() => {
    if (account) {
      setForm({
        brand_title: account.brand_title ?? "",
        brand_today_title: account.brand_today_title ?? "Celebrações de hoje",
        brand_subtitle: account.brand_subtitle ?? "",
        brand_empty_message: account.brand_empty_message ?? "",
        primary_color: account.primary_color ?? DEFAULT_COLOR,
        brand_logo_url: account.brand_logo_url ?? "",
        brand_logo_height_px: account.brand_logo_height_px ?? 32,
        brand_footer_logo_url: account.brand_footer_logo_url ?? "",
        card_logo_url: (account as any).card_logo_url ?? "",
        card_logo_height_px: (account as any).card_logo_height_px ?? 72,
        card_accent_color: (account as any).card_accent_color ?? "#c8102e",
        card_footer_text:
          (account as any).card_footer_text ??
          "É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva. Art 5º, VII, Constituição Federal.",
        card_title_size_px: (account as any).card_title_size_px ?? 36,
        card_footer_size_px: (account as any).card_footer_size_px ?? 12,
        card_field_size_px: (account as any).card_field_size_px ?? 15,
        card_label_size_px: (account as any).card_label_size_px ?? 13,
        show_end_time: account.show_end_time ?? false,
        show_live_fields: account.show_live_fields ?? true,
        force_show_type: account.force_show_type ?? false,
        religion_profile: (account.religion_profile ?? "catolico") as ReligionProfile,
      });
    }
  }, [account]);

  const mut = useMutation({
    mutationFn: () => saveAccountSettings(),
    onSuccess: () => {
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["my-account"] });
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao salvar"),
  });

  // Slug state
  const [slugInput, setSlugInput] = useState("");
  const [slugStatus, setSlugStatus] = useState<
    | { kind: "idle" }
    | { kind: "checking" }
    | { kind: "available" }
    | { kind: "taken"; reason: string }
    | { kind: "invalid"; reason: string }
  >({ kind: "idle" });

  useEffect(() => {
    setSlugInput(account?.custom_slug ?? "");
  }, [account?.custom_slug]);

  const currentSlug = account?.custom_slug ?? "";
  const normalizedInput = slugInput.trim().toLowerCase();

  useEffect(() => {
    if (!normalizedInput || normalizedInput === currentSlug) {
      setSlugStatus({ kind: "idle" });
      return;
    }
    if (!/^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/.test(normalizedInput)) {
      setSlugStatus({
        kind: "invalid",
        reason: "3-40 letras minúsculas, números ou hífen",
      });
      return;
    }
    setSlugStatus({ kind: "checking" });
    const handle = setTimeout(async () => {
      try {
        const res = await checkSlug({ data: { slug: normalizedInput } });
        if (res.available) setSlugStatus({ kind: "available" });
        else setSlugStatus({ kind: "taken", reason: res.reason });
      } catch (e) {
        setSlugStatus({
          kind: "invalid",
          reason: (e as Error).message ?? "Erro ao verificar",
        });
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [normalizedInput, currentSlug, checkSlug]);

  const slugMut = useMutation({
    mutationFn: (slug: string | null) => saveSlug({ data: { slug } }),
    onSuccess: (res) => {
      toast.success(
        res.slug
          ? "Nome curto atualizado. Links antigos com o nome anterior pararam de funcionar."
          : "Nome curto removido. Apenas o código fixo funciona agora.",
      );
      qc.invalidateQueries({ queryKey: ["my-account"] });
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao salvar"),
  });

  const [domainInput, setDomainInput] = useState("");
  useEffect(() => {
    setDomainInput(((account as any)?.custom_domain ?? "") as string);
  }, [(account as any)?.custom_domain]);

  const domainMut = useMutation({
    mutationFn: (domain: string | null) => saveDomain({ data: { domain } }),
    onSuccess: () => {
      toast.success("Domínio atualizado");
      qc.invalidateQueries({ queryKey: ["my-account"] });
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao salvar domínio"),
  });

  const verifyDomainMut = useMutation({
    mutationFn: () => verifyDomain(),
    onSuccess: (res) => {
      if (res.ok) toast.success("Domínio verificado");
      else toast.error(res.error || "Registro DNS ainda não encontrado");
      qc.invalidateQueries({ queryKey: ["my-account"] });
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao verificar domínio"),
  });

  const [managedDomainForm, setManagedDomainForm] = useState({
    domain: "",
    holder_name: "",
    holder_document: "",
    holder_email: "",
    holder_phone: "",
    holder_address: "",
    notes: "",
  });

  useEffect(() => {
    setManagedDomainForm({
      domain: ((account as any)?.managed_domain_requested_name ?? "") as string,
      holder_name: ((account as any)?.managed_domain_holder_name ?? "") as string,
      holder_document: ((account as any)?.managed_domain_holder_document ?? "") as string,
      holder_email: ((account as any)?.managed_domain_holder_email ?? "") as string,
      holder_phone: ((account as any)?.managed_domain_holder_phone ?? "") as string,
      holder_address: ((account as any)?.managed_domain_holder_address ?? "") as string,
      notes: ((account as any)?.managed_domain_notes ?? "") as string,
    });
  }, [
    (account as any)?.managed_domain_requested_name,
    (account as any)?.managed_domain_holder_name,
    (account as any)?.managed_domain_holder_document,
    (account as any)?.managed_domain_holder_email,
    (account as any)?.managed_domain_holder_phone,
    (account as any)?.managed_domain_holder_address,
    (account as any)?.managed_domain_notes,
  ]);

  const managedDomainMut = useMutation({
    mutationFn: () => requestDomain({ data: managedDomainForm }),
    onSuccess: () => {
      toast.success("Pedido de domínio gerenciado registrado");
      qc.invalidateQueries({ queryKey: ["my-account"] });
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao registrar pedido"),
  });

  const cancelManagedDomainMut = useMutation({
    mutationFn: () => requestDomain({ data: { domain: null } }),
    onSuccess: () => {
      toast.success("Pedido de domínio gerenciado removido");
      qc.invalidateQueries({ queryKey: ["my-account"] });
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao remover pedido"),
  });

  const publicOrigin = "https://suaigreja.top";
  const fixedUrl = account ? `${publicOrigin}/a/${account.site_id}` : "";
  const slugUrl = currentSlug ? `${publicOrigin}/a/${currentSlug}` : "";
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado");
  };

  return (
    <AppShell>
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize a identidade, a agenda pública e as integrações da instituição.
        </p>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav
            aria-label="Áreas das configurações"
            className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:block lg:self-start lg:space-y-1 lg:overflow-visible lg:pb-0"
          >
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;
              const selected = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex min-h-12 min-w-[190px] items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full lg:min-w-0",
                    selected
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{section.label}</span>
                    <span className="hidden truncate text-xs text-muted-foreground lg:block">
                      {section.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <section aria-live="polite" className="min-w-0 space-y-6">
        {activeSection === "institution" && <>

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold">Endereço público</h2>
            <p className="text-xs text-muted-foreground mt-1">
              O endereço onde sua agenda fica disponível na internet.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Código fixo (sempre funciona)
            </Label>
            <div className="flex gap-2">
              <Input readOnly value={fixedUrl} className="font-mono text-sm" />
              <Button variant="outline" type="button" onClick={() => copy(fixedUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="custom_slug">
              Nome curto da igreja (opcional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Crie um endereço mais bonito, ex:{" "}
              <span className="font-mono">{publicOrigin}/a/matriz-sp</span>. Use de
              3 a 40 letras minúsculas, números ou hífen.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border bg-muted/40 pl-3 pr-1 flex-1 focus-within:ring-1 focus-within:ring-ring">
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {publicOrigin}/a/
                </span>
                <Input
                  id="custom_slug"
                  value={slugInput}
                  onChange={(e) =>
                    setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                  placeholder="minha-igreja"
                  maxLength={40}
                  className="border-0 shadow-none focus-visible:ring-0 font-mono text-sm bg-transparent"
                />
                <div className="pr-2">
                  {slugStatus.kind === "checking" && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {slugStatus.kind === "available" && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  {(slugStatus.kind === "taken" || slugStatus.kind === "invalid") && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={() => slugMut.mutate(normalizedInput || null)}
                disabled={
                  slugMut.isPending ||
                  normalizedInput === currentSlug ||
                  (normalizedInput !== "" && slugStatus.kind !== "available")
                }
              >
                {slugMut.isPending ? "Salvando..." : "Salvar"}
              </Button>
              {currentSlug && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSlugInput("");
                    slugMut.mutate(null);
                  }}
                  disabled={slugMut.isPending}
                >
                  Remover
                </Button>
              )}
            </div>
            {(slugStatus.kind === "taken" || slugStatus.kind === "invalid") && (
              <p className="text-xs text-destructive">{slugStatus.reason}</p>
            )}
            {slugStatus.kind === "available" && (
              <p className="text-xs text-green-600">Disponível</p>
            )}

            {currentSlug && (
              <div className="space-y-2 pt-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Endereço atual
                </Label>
                <div className="flex gap-2">
                  <Input readOnly value={slugUrl} className="font-mono text-sm" />
                  <Button variant="outline" type="button" onClick={() => copy(slugUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md p-2 mt-2">
              ⚠️ Atenção: ao alterar ou remover o nome curto, links antigos
              compartilhados com o nome anterior <strong>param de funcionar</strong>.
              O código fixo acima continua funcionando sempre.
            </p>
          </div>
        </Card>

        <ChurchIdentityCard
          form={form}
          setForm={setForm}
          isLoading={isLoading}
          uploading={logoUploading}
          setUploading={setLogoUploading}
          inputRef={logoInputRef}
          uploadAsset={uploadAsset}
          saveSettings={saveAccountSettings}
        />

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold">Perfil da instituição</h2>
            <p className="text-xs text-muted-foreground mt-1">
              O perfil define o vocabulário usado no sistema (ex: missa, culto, reunião).
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELIGION_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setForm({ ...form, religion_profile: p.id })}
                className={cn(
                  "text-left rounded-md border p-3 transition-colors",
                  form.religion_profile === p.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50",
                )}
              >
                <div className="font-medium text-sm">{p.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-end">
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || isLoading}>
              {mut.isPending ? "Salvando..." : "Salvar instituição"}
            </Button>
          </div>
        </Card>
        </>}

        {activeSection === "domain" && (
          <DomainPwaSection
            account={account}
            value={domainInput}
            setValue={setDomainInput}
            saving={domainMut.isPending}
            verifying={verifyDomainMut.isPending}
            onSave={() => domainMut.mutate(domainInput.trim() || null)}
            onRemove={() => {
              setDomainInput("");
              domainMut.mutate(null);
            }}
            onVerify={() => verifyDomainMut.mutate()}
            managedForm={managedDomainForm}
            setManagedForm={setManagedDomainForm}
            savingManaged={managedDomainMut.isPending}
            removingManaged={cancelManagedDomainMut.isPending}
            onSaveManaged={() => managedDomainMut.mutate()}
            onRemoveManaged={() => cancelManagedDomainMut.mutate()}
            copy={copy}
          />
        )}

        {activeSection === "agenda" && <>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold">Campos do formulário</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ative ou desative campos do painel de cadastro de eventos.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 py-2 border-t">
              <div>
                <Label htmlFor="show_end_time" className="text-sm">Hora de término</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Exibe um campo de hora de término no cadastro.
                </p>
              </div>
              <Switch
                id="show_end_time"
                checked={form.show_end_time}
                onCheckedChange={(v) => setForm({ ...form, show_end_time: v })}
              />
            </div>
            <div className="flex items-start justify-between gap-4 py-2 border-t">
              <div>
                <Label htmlFor="show_live_fields" className="text-sm">Transmissão ao vivo</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Exibe os campos de live e link de transmissão em cada evento.
                </p>
              </div>
              <Switch
                id="show_live_fields"
                checked={form.show_live_fields}
                onCheckedChange={(v) => setForm({ ...form, show_live_fields: v })}
              />
            </div>
            <div className="flex items-start justify-between gap-4 py-2 border-t">
              <div>
                <Label htmlFor="force_show_type" className="text-sm">Mostrar tipo em todos os eventos</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Exibe o badge do tipo (ex: "Missa") em todos os eventos da agenda pública, mesmo nos que não marcaram "Mostrar tipo" individualmente.
                </p>
              </div>
              <Switch
                id="force_show_type"
                checked={form.force_show_type}
                onCheckedChange={(v) => setForm({ ...form, force_show_type: v })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold">Textos da agenda no site</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Defina os títulos exibidos na agenda pública. O nome da igreja é
              editado no card <strong>Identidade da igreja</strong> acima.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_today_title">Título na agenda somente de hoje</Label>
            <Input
              id="brand_today_title"
              value={form.brand_today_title}
              onChange={(e) => setForm({ ...form, brand_today_title: e.target.value })}
              placeholder="Celebrações de hoje"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_subtitle">Subtítulo (opcional)</Label>
            <Input
              id="brand_subtitle"
              value={form.brand_subtitle}
              onChange={(e) => setForm({ ...form, brand_subtitle: e.target.value })}
              placeholder="Confira os próximos horários da nossa comunidade"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_empty_message">Mensagem quando não houver celebrações</Label>
            <Textarea
              id="brand_empty_message"
              value={form.brand_empty_message}
              onChange={(e) => setForm({ ...form, brand_empty_message: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold">Aparência</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Cor principal usada nos destaques da agenda pública.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border p-2">
              <input
                id="primary_color"
                type="color"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="h-9 w-12 rounded border cursor-pointer"
                disabled={isLoading}
              />
              <Input
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="w-28 font-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => setForm({ ...form, primary_color: DEFAULT_COLOR })}
              disabled={isLoading || form.primary_color === DEFAULT_COLOR}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar cor padrão
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-end">
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || isLoading}>
              {mut.isPending ? "Salvando..." : "Salvar agenda pública"}
            </Button>
          </div>
        </Card>
        </>}

        {activeSection === "donations" && <>
        <MercadoPagoSection />
        </>}

        {activeSection === "member-card" && <>
        <MemberCardSettingsCard form={form} setForm={setForm} />

        <Card className="p-6">
          <div className="flex justify-end">
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || isLoading}>
              {mut.isPending ? "Salvando..." : "Salvar carteirinha"}
            </Button>
          </div>
        </Card>
        </>}

        {activeSection === "preview" && <>
        <Card className="p-6">
          <h2 className="text-base font-semibold">Prévia do site</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Renderização exata da agenda pública. O que você vê aqui é o que será exibido
            no shortcode, iframe ou link compartilhado.
          </p>
          <div className="mt-4">
            <PublicAgendaView
              account={{
                brand_title: form.brand_title || "Agenda de Celebrações",
                brand_subtitle: form.brand_subtitle,
                brand_empty_message:
                  form.brand_empty_message || "Nenhuma celebração programada.",
                brand_today_title: form.brand_today_title,
                primary_color: form.primary_color,
                force_show_type: form.force_show_type,
              }}
              events={(previewEvents ?? []).map((e) => ({
                id: e.id,
                event_date: e.event_date,
                start_time: e.start_time,
                end_time: e.end_time,
                location_name: e.location_name,
                type_name: e.type_name,
                type_id: e.type_id,
                description: e.description,
                show_type: e.show_type,
                is_live: e.is_live,
                live_url: e.live_url,
              }))}
              types={previewTypes.map((t) => ({
                id: t.id,
                name: t.name,
                color: t.color ?? "#467da5",
                icon: t.icon ?? "",
              }))}
              view="full"
            />
          </div>
        </Card>
        </>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function DomainPwaSection({
  account,
  value,
  setValue,
  saving,
  verifying,
  onSave,
  onRemove,
  onVerify,
  managedForm,
  setManagedForm,
  savingManaged,
  removingManaged,
  onSaveManaged,
  onRemoveManaged,
  copy,
}: {
  account: any;
  value: string;
  setValue: (value: string) => void;
  saving: boolean;
  verifying: boolean;
  onSave: () => void;
  onRemove: () => void;
  onVerify: () => void;
  managedForm: {
    domain: string;
    holder_name: string;
    holder_document: string;
    holder_email: string;
    holder_phone: string;
    holder_address: string;
    notes: string;
  };
  setManagedForm: (value: {
    domain: string;
    holder_name: string;
    holder_document: string;
    holder_email: string;
    holder_phone: string;
    holder_address: string;
    notes: string;
  }) => void;
  savingManaged: boolean;
  removingManaged: boolean;
  onSaveManaged: () => void;
  onRemoveManaged: () => void;
  copy: (text: string) => void;
}) {
  const status = account?.custom_domain_status ?? "not_configured";
  const token = account?.custom_domain_verification_token ?? "";
  const configuredDomain = account?.custom_domain ?? "";
  const isPremium = account?.plan_tier === "premium";
  const manifestPath = configuredDomain
    ? `https://${configuredDomain}/manifest/${account?.custom_slug || account?.site_id}/json`
    : account
      ? `https://suaigreja.top/manifest/${account.custom_slug || account.site_id}/json`
      : "";
  const statusCopy: Record<string, { label: string; className: string }> = {
    not_configured: { label: "Não configurado", className: "bg-muted text-muted-foreground" },
    pending: { label: "Aguardando DNS", className: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
    failed: { label: "Não verificado", className: "bg-destructive/10 text-destructive" },
    verified: { label: "Verificado", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  };
  const statusInfo = statusCopy[status] ?? statusCopy.not_configured;
  const managedStatus = account?.managed_domain_status ?? "not_requested";
  const managedStatusCopy: Record<string, { label: string; className: string }> = {
    not_requested: { label: "Não solicitado", className: "bg-muted text-muted-foreground" },
    requested: { label: "Pedido recebido", className: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
    in_progress: { label: "Em andamento", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
    registered: { label: "Registrado", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300" },
    configured: { label: "Configurado", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
    blocked: { label: "Pendente", className: "bg-destructive/10 text-destructive" },
  };
  const managedInfo = managedStatusCopy[managedStatus] ?? managedStatusCopy.not_requested;
  const setManagedField = (field: keyof typeof managedForm, fieldValue: string) =>
    setManagedForm({ ...managedForm, [field]: fieldValue });

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Domínio próprio</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure um domínio da instituição e valide a posse via DNS antes de ativar o roteamento.
            </p>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusInfo.className)}>
            {statusInfo.label}
          </span>
        </div>

        {!isPremium && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            Domínio próprio é um recurso do plano Premium ativo. O manifesto PWA por tenant continua funcionando nos links da suaigreja.top.
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="custom_domain">Domínio da instituição</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="custom_domain"
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase().replace(/^https?:\/\//, ""))}
              placeholder="minhaigreja.org.br"
              disabled={!isPremium || saving}
              className="font-mono"
            />
            <Button type="button" onClick={onSave} disabled={!isPremium || saving || value.trim() === configuredDomain}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar domínio
            </Button>
            {configuredDomain && (
              <Button type="button" variant="outline" onClick={onRemove} disabled={!isPremium || saving}>
                Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Use apenas o domínio, sem https:// e sem caminho. Exemplo: <code>paroquia.org.br</code>.
          </p>
        </div>

        {configuredDomain && token && (
          <div className="rounded-md border bg-muted/30 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">Registros DNS necessários</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Adicione estes registros no provedor do domínio e clique em verificar.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={onVerify} disabled={!isPremium || verifying}>
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar DNS
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">TXT</p>
                <p className="mt-1 text-sm">Nome: <code>@</code></p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded bg-muted px-2 py-1 text-xs">{token}</code>
                  <Button type="button" variant="ghost" size="icon" onClick={() => copy(token)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CNAME/ALIAS</p>
                <p className="mt-1 text-sm">Nome: <code>@</code> ou <code>www</code></p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded bg-muted px-2 py-1 text-xs">suaigreja.top</code>
                  <Button type="button" variant="ghost" size="icon" onClick={() => copy("suaigreja.top")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {account?.custom_domain_error && (
              <p className="mt-3 text-xs text-destructive">{account.custom_domain_error}</p>
            )}
            {account?.custom_domain_last_checked_at && (
              <p className="mt-2 text-xs text-muted-foreground">
                Última verificação: {new Date(account.custom_domain_last_checked_at).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Domínio gerenciado pela plataforma</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Para um plano com domínio incluso, registre o domínio desejado e os dados do titular.
              A equipe usa estas informações para registro, cobrança e configuração.
            </p>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", managedInfo.className)}>
            {managedInfo.label}
          </span>
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          Esta etapa ainda é assistida: o sistema coleta os dados e acompanha o status. A automação completa
          com registrador/Registro.br fica para a próxima fase, depois da decisão comercial e operacional.
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="managed_domain">Domínio desejado</Label>
            <Input
              id="managed_domain"
              value={managedForm.domain}
              onChange={(e) => setManagedField("domain", e.target.value.toLowerCase().replace(/^https?:\/\//, ""))}
              placeholder="minhaigreja.org.br"
              disabled={!isPremium || savingManaged}
              className="font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="managed_holder_name">Nome do titular</Label>
            <Input
              id="managed_holder_name"
              value={managedForm.holder_name}
              onChange={(e) => setManagedField("holder_name", e.target.value)}
              placeholder="Paróquia Santa Ana ou Comunidade Exemplo"
              disabled={!isPremium || savingManaged}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="managed_holder_document">CPF/CNPJ do titular</Label>
            <Input
              id="managed_holder_document"
              value={managedForm.holder_document}
              onChange={(e) => setManagedField("holder_document", e.target.value)}
              placeholder="00.000.000/0001-00"
              disabled={!isPremium || savingManaged}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="managed_holder_email">E-mail do titular</Label>
            <Input
              id="managed_holder_email"
              type="email"
              value={managedForm.holder_email}
              onChange={(e) => setManagedField("holder_email", e.target.value)}
              placeholder="contato@instituicao.org.br"
              disabled={!isPremium || savingManaged}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="managed_holder_phone">Telefone</Label>
            <Input
              id="managed_holder_phone"
              value={managedForm.holder_phone}
              onChange={(e) => setManagedField("holder_phone", e.target.value)}
              placeholder="(11) 99999-9999"
              disabled={!isPremium || savingManaged}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="managed_holder_address">Endereço completo</Label>
            <Input
              id="managed_holder_address"
              value={managedForm.holder_address}
              onChange={(e) => setManagedField("holder_address", e.target.value)}
              placeholder="Rua, número, cidade, UF e CEP"
              disabled={!isPremium || savingManaged}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="managed_notes">Observações</Label>
            <Textarea
              id="managed_notes"
              rows={3}
              value={managedForm.notes}
              onChange={(e) => setManagedField("notes", e.target.value)}
              placeholder="Domínios alternativos, preferência por .org.br/.com.br ou dados complementares."
              disabled={!isPremium || savingManaged}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {managedStatus !== "not_requested" && (
            <Button type="button" variant="outline" onClick={onRemoveManaged} disabled={!isPremium || removingManaged}>
              {removingManaged ? "Removendo..." : "Remover pedido"}
            </Button>
          )}
          <Button type="button" onClick={onSaveManaged} disabled={!isPremium || savingManaged}>
            {savingManaged && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Solicitar domínio incluso
          </Button>
        </div>

        {account?.managed_domain_requested_at && (
          <p className="text-xs text-muted-foreground">
            Pedido registrado em {new Date(account.managed_domain_requested_at).toLocaleString("pt-BR")}.
          </p>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">App instalável</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            O manifesto PWA já usa a identidade da instituição nas páginas públicas.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nome do app</p>
            <p className="mt-1 text-sm font-medium">{account?.brand_title ?? "Sua Igreja"}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cor do tema</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded border" style={{ background: account?.primary_color ?? DEFAULT_COLOR }} />
              <code className="text-xs">{account?.primary_color ?? DEFAULT_COLOR}</code>
            </div>
          </div>
        </div>
        {manifestPath && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={manifestPath} className="font-mono text-sm" />
            <Button type="button" variant="outline" onClick={() => copy(manifestPath)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function ChurchIdentityCard({
  form,
  setForm,
  isLoading,
  uploading,
  setUploading,
  inputRef,
  uploadAsset,
  saveSettings,
}: {
  form: {
    brand_title: string;
    brand_logo_url: string;
    brand_logo_height_px: number;
    brand_footer_logo_url: string;
  } & Record<string, any>;
  setForm: (updater: any) => void;
  isLoading: boolean;
  uploading: boolean;
  setUploading: (b: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  uploadAsset: (input: {
    data: {
      folder: "church-logo";
      filename: string;
      contentType: string;
      base64: string;
    };
  }) => Promise<{ url: string }>;
  saveSettings: (nextForm: any) => Promise<any>;
}) {
  const footerInputRef = useRef<HTMLInputElement | null>(null);
  const [footerUploading, setFooterUploading] = useState(false);

  async function uploadLogoFile(file: File, field: "brand_logo_url" | "brand_footer_logo_url", setBusy: (b: boolean) => void) {
    if (!/\.(png|jpg|jpeg|webp|gif|ico)$/i.test(file.name)) {
      toast.error("Formato: PNG, JPG, WEBP, GIF ou ICO");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máx. 5 MB");
      return;
    }

    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const data = await uploadAsset({
        data: {
          folder: "church-logo",
          filename: file.name,
          contentType: file.type || "image/png",
          base64,
        },
      });

      const nextForm = { ...form, [field]: data.url };
      setForm(nextForm);
      await saveSettings(nextForm);
      toast.success("✓ Enviado e salvo");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
      reader.readAsDataURL(file);
    });
  }

  const [removingBg, setRemovingBg] = useState<null | "brand_logo_url" | "brand_footer_logo_url">(null);
  async function handleRemoveBackground(field: "brand_logo_url" | "brand_footer_logo_url") {
    const primaryUrl = field === "brand_footer_logo_url" ? form.brand_footer_logo_url : form.brand_logo_url;
    const fallbackUrl = field === "brand_footer_logo_url" ? form.brand_logo_url : null;
    const url = isValidImageUrl(primaryUrl) ? primaryUrl : fallbackUrl;
    if (!url) {
      toast.error(
        field === "brand_footer_logo_url"
          ? "Envie ou informe uma URL válida para a logo antes de gerar a versão branca."
          : "Envie ou informe uma URL válida para a logo antes de remover o fundo.",
      );
      return;
    }
    setRemovingBg(field);
    const tId = toast.loading(
      field === "brand_footer_logo_url"
        ? "Gerando logo branca… isso pode levar alguns segundos."
        : "Removendo fundo… isso pode levar alguns segundos.",
    );
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Não foi possível baixar a imagem atual.");
      const inputBlob = await res.blob();
      const removedBlob = await removeBackground(inputBlob, { output: { format: "image/png" } });
      const finalBlob =
        field === "brand_footer_logo_url"
          ? await makeWhiteLogo(removedBlob)
          : removedBlob;
      const file = new File([finalBlob], `${field}-${Date.now()}.png`, { type: "image/png" });
      const base64 = await fileToBase64(file);
      const uploaded = await uploadAsset({
        data: {
          folder: "church-logo",
          filename: file.name,
          contentType: "image/png",
          base64,
        },
      });
      const nextForm = { ...form, [field]: uploaded.url };
      setForm(nextForm);
      await saveSettings(nextForm);
      toast.success(
        field === "brand_footer_logo_url"
          ? "Logo branca pronta e salva!"
          : "Fundo removido e salvo!",
        { id: tId },
      );
    } catch (e) {
      toast.error(
        field === "brand_footer_logo_url"
          ? "Falha ao gerar logo branca: " + (e as Error).message
          : "Falha ao remover fundo: " + (e as Error).message,
        { id: tId },
      );
    } finally {
      setRemovingBg(null);
    }
  }

  function isValidImageUrl(value: string | null | undefined) {
    if (!value) return false;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function makeWhiteLogo(blob: Blob) {
    const imageUrl = URL.createObjectURL(blob);
    try {
      const img = await loadImage(imageUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Falha ao preparar a imagem.");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = data.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha < 24) {
          pixels[i + 3] = 0;
          continue;
        }
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = alpha;
      }
      ctx.putImageData(data, 0, 0);
      return await canvasToBlob(canvas);
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Falha ao ler a imagem processada."));
      img.src = src;
    });
  }

  function canvasToBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Falha ao exportar a imagem."));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  }

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold">Identidade da igreja</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Nome e logo usados em toda a página pública da igreja (topo, rodapé,
          link compartilhado e agenda).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_title">Nome da igreja</Label>
        <Input
          id="brand_title"
          value={form.brand_title}
          onChange={(e) => setForm({ ...form, brand_title: e.target.value })}
          placeholder="Ex: Paróquia Nossa Senhora Aparecida"
          disabled={isLoading}
          maxLength={120}
        />
        <p className="text-xs text-muted-foreground">
          Aparece no topo da página, no rodapé e como título da agenda quando
          não houver logo enviado.
        </p>
      </div>

      <div className="space-y-3 border-t pt-4">
        <div>
          <Label>Logo do topo do site</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Recomendado: <strong>400×120&nbsp;px</strong> (proporção
            horizontal). Formatos: <strong>PNG transparente</strong>, JPG ou
            WEBP. Tamanho máx.: 3&nbsp;MB. Quando enviado, substitui o nome no
            topo do site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={form.brand_logo_url}
            onChange={(e) => setForm({ ...form, brand_logo_url: e.target.value })}
            type="url"
            autoComplete="off"
            placeholder="https://… ou envie um arquivo"
            className="flex-1 min-w-[220px]"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadLogoFile(f, "brand_logo_url", setUploading);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Enviando…" : "Enviar arquivo"}
          </Button>
          {form.brand_logo_url && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...form, brand_logo_url: "" })}
            >
              Remover
            </Button>
          )}
        </div>
        {form.brand_logo_url && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleRemoveBackground("brand_logo_url")}
              disabled={removingBg !== null || uploading}
            >
              {removingBg === "brand_logo_url" ? "Processando…" : "✨ Remover fundo da logo (IA)"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Gratuito — processa no seu navegador, sem enviar para servidor.
            </span>
          </div>
        )}
        {isValidImageUrl(form.brand_logo_url) && (
          <div className="rounded-md border bg-muted/40 p-3 inline-block">
            <img
              src={form.brand_logo_url}
              alt="Logo da igreja"
              style={{ height: form.brand_logo_height_px }}
              className="w-auto object-contain"
            />
          </div>
        )}
        <div className="grid sm:grid-cols-[160px_1fr] gap-3 items-start pt-2">
          <div className="space-y-1">
            <Label htmlFor="brand_logo_height_px">Altura exibida (px)</Label>
            <Input
              id="brand_logo_height_px"
              type="number"
              min={16}
              max={64}
              value={form.brand_logo_height_px}
              onChange={(e) =>
                setForm({
                  ...form,
                  brand_logo_height_px: Number(e.target.value) || 32,
                })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground sm:pt-7">
            Entre 16 e 64&nbsp;px. Mantém a proporção e evita logos gigantes no
            topo do site.
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <div>
          <Label>Logo do rodapé (opcional)</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Use uma versão diferente da logo no rodapé (que tem fundo escuro).
            Se não enviar, usamos a logo do topo. Ideal: <strong>PNG com fundo transparente</strong>{" "}
            e a arte em tons claros.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={form.brand_footer_logo_url}
            onChange={(e) => setForm({ ...form, brand_footer_logo_url: e.target.value })}
            type="url"
            autoComplete="off"
            placeholder="https://… ou envie um arquivo"
            className="flex-1 min-w-[220px]"
          />
          <input
            ref={footerInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadLogoFile(f, "brand_footer_logo_url", setFooterUploading);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => footerInputRef.current?.click()}
            disabled={footerUploading}
          >
            {footerUploading ? "Enviando…" : "Enviar arquivo"}
          </Button>
          {form.brand_footer_logo_url && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...form, brand_footer_logo_url: "" })}
            >
              Remover
            </Button>
          )}
        </div>
        {form.brand_footer_logo_url && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleRemoveBackground("brand_footer_logo_url")}
              disabled={removingBg !== null || footerUploading}
            >
              {removingBg === "brand_footer_logo_url"
                ? "Processando…"
                : "✨ Deixar logo branca (IA)"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Gratuito — processa no seu navegador e gera uma versão branca para o rodapé.
            </span>
          </div>
        )}
        {isValidImageUrl(form.brand_footer_logo_url) && (
          <div className="rounded-md border bg-stone-900 p-3 inline-block">
            <img
              src={form.brand_footer_logo_url}
              alt="Logo do rodapé"
              style={{ height: 48 }}
              className="w-auto object-contain"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function MercadoPagoSection() {
  const fetchConnection = useServerFn(getMyMercadoPagoConnection);
  const saveConnection = useServerFn(saveMercadoPagoConnection);
  const removeConnection = useServerFn(disconnectMercadoPago);
  const qc = useQueryClient();
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");

  const { data: connection, isLoading } = useQuery({
    queryKey: ["mercadopago-connection"],
    queryFn: () => fetchConnection(),
  });

  const saveMut = useMutation({
    mutationFn: () => saveConnection({ data: { accessToken, publicKey: publicKey || null } }),
    onSuccess: () => {
      toast.success("Mercado Pago conectado! As doações agora vão direto para sua conta.");
      setAccessToken("");
      setPublicKey("");
      qc.invalidateQueries({ queryKey: ["mercadopago-connection"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: () => removeConnection(),
    onSuccess: () => {
      toast.success("Mercado Pago desconectado. As doações voltam a usar o Pix simples.");
      qc.invalidateQueries({ queryKey: ["mercadopago-connection"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold">Mercado Pago (doações)</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Conecte sua própria conta do Mercado Pago para que as doações dos fiéis caiam direto na conta da
          sua igreja, com confirmação automática de pagamento. Sem conectar, as doações continuam usando o
          Pix simples (copia e cola), sem rastreio de pagamento.
        </p>
      </div>

      {!isLoading && connection?.connected ? (
        <div className="rounded-md border bg-muted/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            Conectado
          </div>
          <Button variant="outline" size="sm" onClick={() => removeMut.mutate()} disabled={removeMut.isPending}>
            {removeMut.isPending ? "Desconectando…" : "Desconectar"}
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Access Token</Label>
            <Input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="APP_USR-..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Public Key (opcional)</Label>
            <Input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} placeholder="APP_USR-..." />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || accessToken.trim().length < 10}>
              {saveMut.isPending ? "Conectando…" : "Conectar Mercado Pago"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function MemberCardSettingsCard({
  form,
  setForm,
}: {
  form: any;
  setForm: (updater: any) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);

  async function uploadLogo(file: File) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) {
      toast.error("Use PNG (transparente), JPG ou WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem maior que 3 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `card-logo/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f: any) => ({ ...f, card_logo_url: pub.publicUrl }));
      toast.success("Logo enviada. Não esqueça de salvar.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function removeBg() {
    if (!form.card_logo_url) return;
    setRemovingBg(true);
    const tId = toast.loading("Removendo fundo… isso pode levar alguns segundos.");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const res = await fetch(form.card_logo_url);
      if (!res.ok) throw new Error("Não foi possível baixar a logo.");
      const inputBlob = await res.blob();
      const outBlob = await removeBackground(inputBlob, { output: { format: "image/png" } });
      const file = new File([outBlob], `card-${Date.now()}.png`, { type: "image/png" });
      const path = `card-logo/${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: "image/png" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f: any) => ({ ...f, card_logo_url: pub.publicUrl }));
      toast.success("Fundo removido! Não esqueça de salvar.", { id: tId });
    } catch (e) {
      toast.error("Falha ao remover fundo: " + (e as Error).message, { id: tId });
    } finally {
      setRemovingBg(false);
    }
  }

  const sampleMember = {
    id: "preview00-0000-0000-0000-000000000000",
    full_name: "João da Silva Exemplo",
    photo_url: null,
    role: "Membro",
    status: "ativo",
    member_since: "2020-03-15",
    birth_date: "1990-07-22",
    cpf: "000.000.000-00",
    congregation: form.brand_title || "Sede",
  };

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold">Carteirinha de membro</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Modelo padrão do sistema. Os dados (foto, nome, CPF, datas, QR) são
          puxados automaticamente do cadastro do membro. Você personaliza
          apenas a <strong>logo</strong>, as <strong>cores</strong> e o
          <strong> texto legal do rodapé</strong>. A cor principal vem do bloco
          <em> Aparência</em> acima.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Logo da carteirinha</Label>
            <p className="text-xs text-muted-foreground">
              Recomendado: <strong>400×400&nbsp;px</strong>, PNG com fundo
              transparente. Tamanho máx.: 3&nbsp;MB.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                value={form.card_logo_url}
                onChange={(e) => setForm({ ...form, card_logo_url: e.target.value })}
                placeholder="https://… ou envie um arquivo"
                className="flex-1 min-w-[220px]"
              />
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadLogo(f);
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? "Enviando…" : "Enviar arquivo"}
              </Button>
              {form.card_logo_url && (
                <Button type="button" variant="ghost" onClick={() => setForm({ ...form, card_logo_url: "" })}>
                  Remover
                </Button>
              )}
            </div>
            {form.card_logo_url && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={removeBg} disabled={removingBg || uploading}>
                  {removingBg ? "Processando…" : "✨ Remover fundo (IA)"}
                </Button>
                <span className="text-xs text-muted-foreground">Gratuito — processa no seu navegador.</span>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-[160px_1fr] gap-3 items-start">
            <div className="space-y-1">
              <Label>Altura da logo (px)</Label>
              <Input
                type="number"
                min={24}
                max={160}
                value={form.card_logo_height_px}
                onChange={(e) => setForm({ ...form, card_logo_height_px: Number(e.target.value) || 72 })}
              />
            </div>
            <p className="text-xs text-muted-foreground sm:pt-7">
              Entre 24 e 160&nbsp;px. Dica: para uma logo quadrada, comece em 72 px.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cor da faixa de destaque (vermelha por padrão)</Label>
            <div className="flex items-center gap-2 rounded-md border p-2 w-fit">
              <input
                type="color"
                value={form.card_accent_color}
                onChange={(e) => setForm({ ...form, card_accent_color: e.target.value })}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <Input
                value={form.card_accent_color}
                onChange={(e) => setForm({ ...form, card_accent_color: e.target.value })}
                className="w-28 font-mono text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A cor azul/principal da carteirinha vem do bloco <em>Aparência</em> acima.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Texto legal do rodapé</Label>
            <Textarea
              rows={3}
              value={form.card_footer_text}
              onChange={(e) => setForm({ ...form, card_footer_text: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tamanho do título "CARTEIRA DE MEMBRO" (px)</Label>
              <Input
                type="number" min={18} max={60}
                value={form.card_title_size_px}
                onChange={(e) => setForm({ ...form, card_title_size_px: Number(e.target.value) || 36 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tamanho do texto legal (px)</Label>
              <Input
                type="number" min={8} max={20}
                value={form.card_footer_size_px}
                onChange={(e) => setForm({ ...form, card_footer_size_px: Number(e.target.value) || 12 })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tamanho do texto do membro (px)</Label>
              <Input
                type="number" min={10} max={28}
                value={form.card_field_size_px}
                onChange={(e) => setForm({ ...form, card_field_size_px: Number(e.target.value) || 15 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tamanho dos rótulos (NOME, CPF...) (px)</Label>
              <Input
                type="number" min={9} max={20}
                value={form.card_label_size_px}
                onChange={(e) => setForm({ ...form, card_label_size_px: Number(e.target.value) || 13 })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prévia</Label>
          <div className="rounded-lg border bg-muted/30 p-4">
            <MemberCard
              member={sampleMember}
              church={{
                brand_title: form.brand_title,
                card_logo_url: form.card_logo_url || null,
                card_logo_height_px: form.card_logo_height_px,
                primary_color: form.primary_color,
                card_accent_color: form.card_accent_color,
                card_footer_text: form.card_footer_text,
                card_title_size_px: form.card_title_size_px,
                card_footer_size_px: form.card_footer_size_px,
                card_field_size_px: form.card_field_size_px,
                card_label_size_px: form.card_label_size_px,
              }}
              qrValue="https://suaigreja.top/c/preview"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A prévia usa um membro fictício. Cada carteirinha real é gerada na
            página <code>/c/&lt;id-do-membro&gt;</code> com os dados reais.
          </p>
        </div>
      </div>
    </Card>
  );
}
