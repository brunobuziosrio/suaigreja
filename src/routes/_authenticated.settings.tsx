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
  updateCustomSlug,
} from "@/lib/account.functions";
import { listEvents } from "@/lib/events.functions";
import { listTypes } from "@/lib/types.functions";
import { PublicAgendaView } from "@/components/public-agenda-view";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, Copy } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";
import { adminUpdateBranding } from "@/lib/branding.functions";
import { getIsAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";
import { MemberCard } from "@/components/member-card";

const DEFAULT_COLOR = "#467da5";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const getAccount = useServerFn(getMyAccount);
  const updateSettings = useServerFn(updateAccountSettings);
  const checkSlug = useServerFn(checkSlugAvailability);
  const saveSlug = useServerFn(updateCustomSlug);
  const fetchEvents = useServerFn(listEvents);
  const fetchTypes = useServerFn(listTypes);
  const qc = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

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
    mutationFn: () =>
      updateSettings({
        data: {
          ...form,
          brand_logo_url: form.brand_logo_url || null,
          brand_logo_height_px: Number(form.brand_logo_height_px) || 32,
          brand_footer_logo_url: form.brand_footer_logo_url || null,
          card_logo_url: form.card_logo_url || null,
          card_logo_height_px: Number(form.card_logo_height_px) || 72,
          card_accent_color: form.card_accent_color,
          card_footer_text: form.card_footer_text,
          card_title_size_px: Number(form.card_title_size_px) || 36,
          card_footer_size_px: Number(form.card_footer_size_px) || 12,
          card_field_size_px: Number(form.card_field_size_px) || 15,
          card_label_size_px: Number(form.card_label_size_px) || 13,
        },
      }),
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

  const publicOrigin = "https://suaigreja.top";
  const fixedUrl = account ? `${publicOrigin}/a/${account.site_id}` : "";
  const slugUrl = currentSlug ? `${publicOrigin}/a/${currentSlug}` : "";
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado");
  };

  return (
    <AppShell>
      <div className="p-6 max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Perfil, campos do formulário, textos e aparência da sua agenda pública.
        </p>

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
              {mut.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Card>

        <PlatformBrandingSection />

        <MemberCardSettingsCard form={form} setForm={setForm} />

        <Card className="p-6">
          <div className="flex justify-end">
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || isLoading}>
              {mut.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Card>

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
      </div>
    </AppShell>
  );
}

function ChurchIdentityCard({
  form,
  setForm,
  isLoading,
  uploading,
  setUploading,
  inputRef,
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
}) {
  const footerInputRef = useRef<HTMLInputElement | null>(null);
  const [footerUploading, setFooterUploading] = useState(false);

  async function uploadLogoFile(file: File, field: "brand_logo_url" | "brand_footer_logo_url", setBusy: (b: boolean) => void) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) {
      toast.error("Use PNG (transparente), JPG ou WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem maior que 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `church-logo/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f: any) => ({ ...f, [field]: pub.publicUrl }));
      toast.success("Logo enviado. Não esqueça de salvar.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const [removingBg, setRemovingBg] = useState<null | "brand_logo_url" | "brand_footer_logo_url">(null);
  async function handleRemoveBackground(field: "brand_logo_url" | "brand_footer_logo_url") {
    const url = form[field];
    if (!url) return;
    setRemovingBg(field);
    const tId = toast.loading("Removendo fundo… isso pode levar alguns segundos.");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Não foi possível baixar a logo atual.");
      const inputBlob = await res.blob();
      const outBlob = await removeBackground(inputBlob, { output: { format: "image/png" } });
      const file = new File([outBlob], `logo-${Date.now()}.png`, { type: "image/png" });
      const path = `church-logo/${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: "image/png" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f: any) => ({ ...f, [field]: pub.publicUrl }));
      toast.success("Fundo removido! Não esqueça de salvar.", { id: tId });
    } catch (e) {
      toast.error("Falha ao remover fundo: " + (e as Error).message, { id: tId });
    } finally {
      setRemovingBg(null);
    }
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
        {form.brand_logo_url && (
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
                : "✨ Remover fundo da logo (IA)"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Gratuito — processa no seu navegador, sem enviar para servidor.
            </span>
          </div>
        )}
        {form.brand_footer_logo_url && (
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

function PlatformBrandingSection() {
  const checkAdmin = useServerFn(getIsAdmin);
  const updateBranding = useServerFn(adminUpdateBranding);
  const { data: adminCheck } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });
  const { data: branding } = useBranding();
  const qc = useQueryClient();
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<"icon" | "logo" | null>(null);

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
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
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

  if (!adminCheck?.isAdmin) return null;

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold">Identidade da plataforma (admin)</h2>
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
        {form.logo_url && (
          <div className="flex items-center gap-3">
            <div className="rounded-md border bg-muted/40 p-3 inline-block">
              <img
                src={form.logo_url}
                alt="Logo"
                style={{ height: form.logo_height_px }}
                className="w-auto object-contain"
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

        {form.icon_url && (
          <div className="border-t pt-3">
            <img src={form.icon_url} alt="" className="h-12 w-12 rounded-md border object-cover" />
          </div>
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