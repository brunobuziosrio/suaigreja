import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Settings, Upload } from "lucide-react";
import { getMyAccount, updateAccountSettings } from "@/lib/account.functions";
import {
  getMyMercadoPagoConnection,
  saveMercadoPagoConnection,
  disconnectMercadoPago,
} from "@/lib/mercadopago-connections.functions";

const DEFAULT_COLOR = "#467da5";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const getAccount = useServerFn(getMyAccount);
  const updateSettings = useServerFn(updateAccountSettings);
  const fetchMPConnection = useServerFn(getMyMercadoPagoConnection);
  const saveMPConnection = useServerFn(saveMercadoPagoConnection);
  const disconnectMP = useServerFn(disconnectMercadoPago);
  const qc = useQueryClient();

  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    brand_title: "",
    brand_subtitle: "",
    primary_color: DEFAULT_COLOR,
    show_live_fields: true,
    allow_public_members: false,
  });

  const [mpToken, setMpToken] = useState("");

  const { data: account } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => getAccount(),
  });

  const { data: mpConnection } = useQuery({
    queryKey: ["mercadopago-connection"],
    queryFn: () => fetchMPConnection(),
  });

  const saveSettingsMut = useMutation({
    mutationFn: () =>
      updateSettings({
        data: {
          brand_title: form.brand_title,
          brand_subtitle: form.brand_subtitle,
          primary_color: form.primary_color,
          show_live_fields: form.show_live_fields,
          allow_public_members: form.allow_public_members,
        },
      }),
    onSuccess: () => {
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["my-account"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  const saveMPMut = useMutation({
    mutationFn: () => saveMPConnection({ data: { access_token: mpToken } }),
    onSuccess: () => {
      toast.success("Mercado Pago conectado");
      setMpToken("");
      qc.invalidateQueries({ queryKey: ["mercadopago-connection"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao conectar"),
  });

  const disconnectMPMut = useMutation({
    mutationFn: () => disconnectMP(),
    onSuccess: () => {
      toast.success("Mercado Pago desconectado");
      qc.invalidateQueries({ queryKey: ["mercadopago-connection"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao desconectar"),
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" /> Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Identidade da sua igreja e integrações.
          </p>
        </div>

        {/* Identidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identidade da Igreja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Igreja</Label>
              <Input
                value={form.brand_title}
                onChange={(e) => setForm({ ...form, brand_title: e.target.value })}
                placeholder="Ex: Igreja Apostólica"
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input
                value={form.brand_subtitle}
                onChange={(e) => setForm({ ...form, brand_subtitle: e.target.value })}
                placeholder="Ex: Comunidade de fé"
              />
            </div>
            <div>
              <Label>Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <Button onClick={() => saveSettingsMut.mutate()} disabled={saveSettingsMut.isPending}>
              {saveSettingsMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </CardContent>
        </Card>

        {/* Agenda */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mostrar horários ao vivo</Label>
              <Switch
                checked={form.show_live_fields}
                onCheckedChange={(v) => setForm({ ...form, show_live_fields: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Permitir membros públicos</Label>
              <Switch
                checked={form.allow_public_members}
                onCheckedChange={(v) => setForm({ ...form, allow_public_members: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mercado Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mercado Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mpConnection ? (
              <>
                <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
                  ✓ Mercado Pago conectado
                </div>
                <Button
                  variant="destructive"
                  onClick={() => disconnectMPMut.mutate()}
                  disabled={disconnectMPMut.isPending}
                >
                  Desconectar
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Conecte seu Mercado Pago para aceitar doações.
                </p>
                <Textarea
                  value={mpToken}
                  onChange={(e) => setMpToken(e.target.value)}
                  placeholder="Cole seu access token do Mercado Pago"
                  rows={3}
                />
                <Button
                  onClick={() => saveMPMut.mutate()}
                  disabled={saveMPMut.isPending || !mpToken.trim()}
                >
                  {saveMPMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Conectar Mercado Pago
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
