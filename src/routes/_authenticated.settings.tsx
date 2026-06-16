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
import {
  getMyMercadoPagoConnection,
  saveMercadoPagoConnection,
  disconnectMercadoPago,
} from "@/lib/mercadopago-connections.functions";
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
  const [logoError, setLogoError] = useState(false);

  const { data: account, isLoading } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getAccount(),
  });

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
      <div className="w-full space-y-6">
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

        <Card className="p-6">
          <div className="flex justify-end">
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || isLoading}>
              {mut.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Card>

        <MercadoPagoSection />
      </div>
    </AppShell>
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
          sua igreja, com confirmação automática de pagamento.
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
