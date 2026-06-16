/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @modified 2026-06-15
 */
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getWhatsappData,
  upsertWhatsappSettings,
  deleteQueuedWhatsappMessage,
  enqueueWhatsappMessage,
} from "@/lib/whatsapp.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MessageCircle,
  Cake,
  Wallet,
  Trash2,
  Info,
  UserPlus,
  Users2,
  Heart,
  Coins,
  Newspaper,
  Send,
  Settings,
  Bell,
  Building2,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/whatsapp")({
  component: WhatsappPage,
  errorComponent: ({ error }) => (
    <div className="p-6">Erro ao carregar: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6">Página não encontrada.</div>,
});

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-amber-100 text-amber-800",
  sending: "bg-blue-100 text-blue-800",
  sent: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  skipped: "bg-zinc-200 text-zinc-700",
};

const KIND_LABELS: Record<string, string> = {
  birthday: "Aniversário",
  welcome: "Boas-vindas",
  culto_reminder: "Lembrete de culto",
  celula_reminder: "Lembrete de célula",
  prayer_request: "Pedido de oração",
  tithe_reminder: "Lembrete de contribuição",
  newsletter: "Boletim semanal",
  event_reminder: "Aviso de evento",
  manual: "Envio avulso",
};

type Settings = {
  enabled: boolean;
  send_hour_brt: number;
  sender_name: string;
  birthday_enabled: boolean;
  birthday_template: string;
  welcome_enabled: boolean;
  welcome_template: string;
  culto_reminder_enabled: boolean;
  culto_reminder_template: string;
  celula_reminder_enabled: boolean;
  celula_reminder_template: string;
  prayer_request_enabled: boolean;
  prayer_request_template: string;
  tithe_reminder_enabled: boolean;
  tithe_reminder_template: string;
  newsletter_enabled: boolean;
  newsletter_template: string;
};

const DEFAULTS: Settings = {
  enabled: false,
  send_hour_brt: 9,
  sender_name: "",
  birthday_enabled: false,
  birthday_template:
    "Feliz aniversário, {nome}! 🎉 Que Deus abençoe seu novo ciclo de vida. Equipe {igreja}.",
  welcome_enabled: false,
  welcome_template:
    "Olá, {nome}! Ficamos felizes com sua visita à {igreja}. Que Deus abençoe você! 🙏",
  culto_reminder_enabled: false,
  culto_reminder_template:
    "Olá, {nome}! Lembramos que temos culto hoje. Te esperamos na {igreja}! 🙌",
  celula_reminder_enabled: false,
  celula_reminder_template:
    "Olá, {nome}! Hoje tem encontro da célula *{celula}* com {lider}. Te esperamos! 🏠",
  prayer_request_enabled: false,
  prayer_request_template:
    "Olá, {nome}! Recebemos seu pedido de oração. Nossa equipe está intercedendo por você. 🙏 Equipe {igreja}.",
  tithe_reminder_enabled: false,
  tithe_reminder_template:
    "Olá, {nome}! Passamos para lembrar sobre a sua contribuição deste mês. Que Deus multiplique! Equipe {igreja}.",
  newsletter_enabled: false,
  newsletter_template:
    "Olá, {nome}! Confira as novidades desta semana na {igreja}: {conteudo}",
};

function settingsFromData(data: any): Settings {
  const s = data?.settings;
  if (!s) return DEFAULTS;
  return {
    enabled: s.enabled ?? false,
    send_hour_brt: s.send_hour_brt ?? 9,
    sender_name: s.sender_name ?? "",
    birthday_enabled: s.birthday_enabled ?? false,
    birthday_template: s.birthday_template ?? DEFAULTS.birthday_template,
    welcome_enabled: s.welcome_enabled ?? false,
    welcome_template: s.welcome_template ?? DEFAULTS.welcome_template,
    culto_reminder_enabled: s.culto_reminder_enabled ?? false,
    culto_reminder_template: s.culto_reminder_template ?? DEFAULTS.culto_reminder_template,
    celula_reminder_enabled: s.celula_reminder_enabled ?? false,
    celula_reminder_template: s.celula_reminder_template ?? DEFAULTS.celula_reminder_template,
    prayer_request_enabled: s.prayer_request_enabled ?? false,
    prayer_request_template: s.prayer_request_template ?? DEFAULTS.prayer_request_template,
    tithe_reminder_enabled: s.tithe_reminder_enabled ?? false,
    tithe_reminder_template: s.tithe_reminder_template ?? DEFAULTS.tithe_reminder_template,
    newsletter_enabled: s.newsletter_enabled ?? false,
    newsletter_template: s.newsletter_template ?? DEFAULTS.newsletter_template,
  };
}

function WhatsappPage() {
  const fetchData = useServerFn(getWhatsappData);
  const saveSettings = useServerFn(upsertWhatsappSettings);
  const deleteMsg = useServerFn(deleteQueuedWhatsappMessage);
  const enqueue = useServerFn(enqueueWhatsappMessage);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-data"],
    queryFn: () => fetchData(),
  });

  const [cfg, setCfg] = useState<Settings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [histKind, setHistKind] = useState("all");

  useEffect(() => {
    if (data) setCfg(settingsFromData(data));
  }, [data]);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings({ data: cfg });
      toast.success("Configurações salvas");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMsg({ data: { id } });
      toast.success("Mensagem removida da fila");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  }

  const credits = data?.settings?.credits_balance ?? 0;
  const totals = (data?.totals ?? {}) as Record<string, number>;
  const recent = (data?.recent ?? []) as any[];
  const filtered =
    histKind === "all" ? recent : recent.filter((m: any) => m.kind === histKind);

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold">Mensagens WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Configure e monitore todos os tipos de mensagem automática.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <StatCard icon={<Wallet className="h-4 w-4" />} label="Créditos" value={credits} />
          <StatCard label="Enviadas" value={totals.sent ?? 0} />
          <StatCard label="Na fila" value={totals.queued ?? 0} />
          <StatCard label="Total" value={totals.total ?? 0} />
        </div>

        {!cfg.enabled && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              WhatsApp está <strong>desativado</strong>. Ative na aba{" "}
              <strong>Configurações Gerais</strong> para começar a usar.
            </span>
          </div>
        )}

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="geral" className="flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> Geral
            </TabsTrigger>
            <TabsTrigger value="tipos" className="flex items-center gap-1">
              <Bell className="h-3.5 w-3.5" /> Tipos de mensagem
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1">
              <Send className="h-3.5 w-3.5" /> Envio manual
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Histórico
            </TabsTrigger>
          </TabsList>

          {/* ===== ABA: CONFIGURAÇÕES GERAIS ===== */}
          <TabsContent value="geral" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações gerais</CardTitle>
                <CardDescription>
                  Controles globais que afetam todas as mensagens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-base">WhatsApp ativado</Label>
                    <p className="text-xs text-muted-foreground">
                      Chave mestre — desativar suspende todos os envios.
                    </p>
                  </div>
                  <Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="hour">Horário padrão de envio (BRT)</Label>
                    <Input
                      id="hour"
                      type="number"
                      min={0}
                      max={23}
                      value={cfg.send_hour_brt}
                      onChange={(e) => set("send_hour_brt", Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Hora do dia (0–23) para mensagens automáticas agendadas.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="sender">Nome do remetente (opcional)</Label>
                    <Input
                      id="sender"
                      maxLength={80}
                      value={cfg.sender_name}
                      onChange={(e) => set("sender_name", e.target.value)}
                      placeholder="Ex: Igreja Renovação"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900 border border-blue-200">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    A integração com o provider WhatsApp (Meta Business API) ainda será ativada.
                    As mensagens já são enfileiradas; o envio efetivo começa assim que o provider
                    for conectado.
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving || isLoading}>
                  {saving ? "Salvando..." : "Salvar configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ABA: TIPOS DE MENSAGEM ===== */}
          <TabsContent value="tipos" className="mt-4 space-y-4">
            <MsgTypeCard
              icon={Cake}
              title="Aniversário"
              description="Disparada automaticamente no dia do aniversário dos membros com telefone cadastrado."
              trigger="Automático · diário"
              variables="{nome}, {nome_completo}, {igreja}"
              enabledKey="birthday_enabled"
              templateKey="birthday_template"
              cfg={cfg}
              onChange={set}
            />
            <MsgTypeCard
              icon={UserPlus}
              title="Boas-vindas ao visitante"
              description="Enviada quando um visitante novo é cadastrado com permissão de contato."
              trigger="Automático · ao cadastrar visitante"
              variables="{nome}, {igreja}"
              enabledKey="welcome_enabled"
              templateKey="welcome_template"
              cfg={cfg}
              onChange={set}
            />
            <MsgTypeCard
              icon={Building2}
              title="Lembrete de culto"
              description="Lembrete enviado no dia do culto para membros cadastrados com telefone."
              trigger="Manual · via página de Check-in"
              variables="{nome}, {igreja}"
              enabledKey="culto_reminder_enabled"
              templateKey="culto_reminder_template"
              cfg={cfg}
              onChange={set}
            />
            <MsgTypeCard
              icon={Users2}
              title="Lembrete de célula"
              description="Lembrete enviado no dia da reunião semanal de cada célula para seus membros."
              trigger="Automático · semanal conforme dia da célula"
              variables="{nome}, {celula}, {lider}, {igreja}"
              enabledKey="celula_reminder_enabled"
              templateKey="celula_reminder_template"
              cfg={cfg}
              onChange={set}
            />
            <MsgTypeCard
              icon={Heart}
              title="Pedido de oração"
              description="Confirmação enviada quando alguém registra um pedido de oração pelo site ou hub."
              trigger="Automático · ao receber pedido de oração"
              variables="{nome}, {igreja}"
              enabledKey="prayer_request_enabled"
              templateKey="prayer_request_template"
              cfg={cfg}
              onChange={set}
            />
            <MsgTypeCard
              icon={Coins}
              title="Lembrete de contribuição"
              description="Lembrete mensal para dizimistas e contribuintes regulares."
              trigger="Manual · mensal"
              variables="{nome}, {igreja}"
              enabledKey="tithe_reminder_enabled"
              templateKey="tithe_reminder_template"
              cfg={cfg}
              onChange={set}
            />
            <MsgTypeCard
              icon={Newspaper}
              title="Boletim semanal"
              description="Boletim de avisos enviado manualmente com conteúdo personalizado para todos os membros."
              trigger="Manual · semanal"
              variables="{nome}, {igreja}, {conteudo}"
              enabledKey="newsletter_enabled"
              templateKey="newsletter_template"
              cfg={cfg}
              onChange={set}
            />

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving || isLoading}>
                {saving ? "Salvando..." : "Salvar todos os templates"}
              </Button>
            </div>
          </TabsContent>

          {/* ===== ABA: ENVIO MANUAL ===== */}
          <TabsContent value="manual" className="mt-4">
            <ManualSendForm enqueue={enqueue} refetch={refetch} globalEnabled={cfg.enabled} />
          </TabsContent>

          {/* ===== ABA: HISTÓRICO ===== */}
          <TabsContent value="historico" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Histórico de mensagens</CardTitle>
                    <CardDescription>Últimas 100 mensagens de todos os tipos.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Filtrar por tipo:</Label>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={histKind}
                      onChange={(e) => setHistKind(e.target.value)}
                    >
                      <option value="all">Todos ({recent.length})</option>
                      {Object.entries(KIND_LABELS).map(([v, label]) => {
                        const count = recent.filter((m: any) => m.kind === v).length;
                        return count > 0 ? (
                          <option key={v} value={v}>
                            {label} ({count})
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-start gap-3 rounded-md border p-3 text-sm"
                      >
                        <Badge className={`shrink-0 ${STATUS_COLORS[m.status] ?? ""}`}>
                          {m.status}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">
                            {m.recipient_name ?? m.phone}{" "}
                            <span className="text-xs text-muted-foreground font-normal">
                              · {KIND_LABELS[m.kind] ?? m.kind}
                            </span>
                          </div>
                          <div className="text-muted-foreground truncate">{m.content}</div>
                          {m.error_message && (
                            <div className="text-xs text-red-600 mt-1">{m.error_message}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(m.created_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        {m.status === "queued" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(m.id)}
                            title="Remover da fila"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function MsgTypeCard({
  icon: Icon,
  title,
  description,
  trigger,
  variables,
  enabledKey,
  templateKey,
  cfg,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  trigger: string;
  variables: string;
  enabledKey: keyof Settings;
  templateKey: keyof Settings;
  cfg: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}) {
  const enabled = cfg[enabledKey] as boolean;
  const template = cfg[templateKey] as string;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <Icon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
              <Badge variant="outline" className="text-xs mt-1.5">
                {trigger}
              </Badge>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => onChange(enabledKey, v as Settings[typeof enabledKey])}
            disabled={!cfg.enabled}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          rows={3}
          value={template}
          onChange={(e) =>
            onChange(templateKey, e.target.value as Settings[typeof templateKey])
          }
          maxLength={800}
          disabled={!enabled || !cfg.enabled}
          placeholder="Template da mensagem..."
        />
        <p className="text-xs text-muted-foreground">
          Variáveis: <code>{variables}</code> · {template.length}/800
        </p>
      </CardContent>
    </Card>
  );
}

function ManualSendForm({
  enqueue,
  refetch,
  globalEnabled,
}: {
  enqueue: ReturnType<typeof useServerFn<typeof enqueueWhatsappMessage>>;
  refetch: () => void;
  globalEnabled: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [kind, setKind] = useState("manual");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!phone.trim() || !content.trim()) return;
    setSending(true);
    try {
      await enqueue({
        data: {
          phone: phone.trim(),
          recipient_name: name.trim() || null,
          content: content.trim(),
          kind: kind as any,
          member_id: null,
        },
      });
      toast.success("Mensagem adicionada à fila de envio");
      setPhone("");
      setName("");
      setContent("");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao enfileirar mensagem");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" /> Envio avulso
        </CardTitle>
        <CardDescription>
          Enfileira uma mensagem para um número específico. O envio ocorre quando o provider for
          ativado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!globalEnabled && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Ative o WhatsApp nas <strong>Configurações Gerais</strong> e certifique-se de ter
              créditos disponíveis antes de enfileirar mensagens.
            </span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Telefone com DDD*</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11987654321"
              maxLength={20}
            />
          </div>
          <div>
            <Label>Nome do destinatário</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria da Silva"
              maxLength={200}
            />
          </div>
        </div>

        <div>
          <Label>Categoria da mensagem</Label>
          <select
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="manual">Avulso (sem categoria)</option>
            <option value="birthday">Aniversário</option>
            <option value="welcome">Boas-vindas</option>
            <option value="culto_reminder">Lembrete de culto</option>
            <option value="celula_reminder">Lembrete de célula</option>
            <option value="prayer_request">Pedido de oração</option>
            <option value="tithe_reminder">Lembrete de contribuição</option>
            <option value="newsletter">Boletim semanal</option>
          </select>
        </div>

        <div>
          <Label>Mensagem*</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={800}
            placeholder="Digite a mensagem que será enviada..."
          />
          <p className="text-xs text-muted-foreground mt-1">{content.length}/800 caracteres</p>
        </div>

        <Button
          onClick={handleSend}
          disabled={sending || !phone.trim() || !content.trim()}
        >
          {sending ? "Enfileirando..." : "Enfileirar mensagem"}
        </Button>
      </CardContent>
    </Card>
  );
}
