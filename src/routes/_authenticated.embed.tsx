import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccount } from "@/lib/account.functions";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import JSZip from "jszip";

export const Route = createFileRoute("/_authenticated/embed")({
  component: EmbedPage,
});

function EmbedPage() {
  const fetchAccount = useServerFn(getMyAccount);
  const { data: account, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
  });
  const [heightFull, setHeightFull] = useState(700);
  const [heightSummary, setHeightSummary] = useState(280);

  if (isLoading || !account) {
    return (
      <AppShell>
        <div className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  // Always use the public custom domain for embeds. Preview/project URLs can
  // be blocked inside Elementor, while this domain opens the agenda directly.
  const origin = "https://suaigreja.top";
  const handle = account.custom_slug || account.site_id;
  const publicUrl = `${origin}/a/${handle}`;
  const summaryUrl = `${publicUrl}?view=summary`;
  const apiUrl = `${origin}/api/public/agenda/${handle}`;
  const safeTitle = account.brand_title.replace(/"/g, "&quot;");
  const iframeFull = `<iframe src="${publicUrl}" style="width:100%;height:${heightFull}px;border:0" loading="lazy" title="${safeTitle}"></iframe>`;
  const iframeSummary = `<iframe src="${summaryUrl}" style="width:100%;height:${heightSummary}px;border:0" loading="lazy" title="${safeTitle}"></iframe>`;
  const linkCode = `<a href="${publicUrl}" target="_blank" rel="noopener">Ver agenda</a>`;
  const shortcodeFull = `[suaigreja_agenda site="${handle}" height="${heightFull}"]`;
  const shortcodeSummary = `[suaigreja_agenda site="${handle}" view="summary" height="${heightSummary}"]`;
  const pluginPhp = `<?php
/**
 * Plugin Name: Sua Igreja - Agenda
 * Description: Shortcode [suaigreja_agenda] para exibir a agenda no Elementor ou em qualquer página.
 * Version: 1.0.0
 * Author: Sua Igreja
 */
if (!defined('ABSPATH')) { exit; }

add_shortcode('suaigreja_agenda', function ($atts) {
    $a = shortcode_atts([
        'site'   => '',
        'view'   => 'full',     // "full" ou "summary"
        'height' => '700',
    ], $atts);

    $site   = preg_replace('/[^a-zA-Z0-9_-]/', '', $a['site']);
    $view   = $a['view'] === 'summary' ? 'summary' : 'full';
    $height = (int) $a['height'];
    if ($height < 200) $height = 200;
    if ($height > 2000) $height = 2000;

    $url = 'https://suaigreja.top/a/' . $site;
    if ($view === 'summary') $url .= '?view=summary';

    return sprintf(
        '<iframe src="%s" style="width:100%%;height:%dpx;border:0" loading="lazy" title="Agenda"></iframe>',
        esc_url($url),
        $height
    );
});`;

  const downloadPlugin = async () => {
    const zip = new JSZip();
    const folder = zip.folder("suaigreja-agenda")!;
    folder.file("suaigreja-agenda.php", pluginPhp);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suaigreja-agenda.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Plugin .zip baixado");
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  return (
    <AppShell>
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Compartilhar agenda
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use o link ou cole o código no seu site.
          </p>
        </div>

        <Card className="p-5 space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Link público (agenda completa)
          </Label>
          <div className="flex gap-2">
            <Input readOnly value={publicUrl} className="font-mono text-sm" />
            <Button variant="outline" onClick={() => copy(publicUrl, "Link")}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground pt-2">
            Link público (resumo do próximo dia)
          </Label>
          <div className="flex gap-2">
            <Input readOnly value={summaryUrl} className="font-mono text-sm" />
            <Button variant="outline" onClick={() => copy(summaryUrl, "Link")}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" asChild>
              <a href={summaryUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="iframe">
          <TabsList>
            <TabsTrigger value="iframe">Iframe completo</TabsTrigger>
            <TabsTrigger value="iframe-summary">Iframe resumo (home)</TabsTrigger>
            <TabsTrigger value="link">Link HTML</TabsTrigger>
            <TabsTrigger value="shortcode">Shortcode (Elementor)</TabsTrigger>
            <TabsTrigger value="json">API (JSON)</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-3">
            <Card className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                Mostra todos os próximos eventos. Ideal para uma página dedicada à agenda.
              </p>
              <div className="flex items-center gap-3">
                <Label htmlFor="hfull" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Altura (px)
                </Label>
                <Input
                  id="hfull"
                  type="number"
                  min={300}
                  max={2000}
                  value={heightFull}
                  onChange={(e) => setHeightFull(Number(e.target.value) || 700)}
                  className="w-32"
                />
              </div>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {iframeFull}
              </pre>
              <Button onClick={() => copy(iframeFull, "Código iframe")}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar código
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="iframe-summary" className="space-y-3">
            <Card className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                Mostra apenas o próximo dia com eventos. Ideal para a home do site.
              </p>
              <div className="flex items-center gap-3">
                <Label htmlFor="hsum" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Altura (px)
                </Label>
                <Input
                  id="hsum"
                  type="number"
                  min={200}
                  max={800}
                  value={heightSummary}
                  onChange={(e) => setHeightSummary(Number(e.target.value) || 280)}
                  className="w-32"
                />
              </div>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {iframeSummary}
              </pre>
              <Button onClick={() => copy(iframeSummary, "Código iframe")}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar código
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="link" className="space-y-3">
            <Card className="p-5 space-y-3">
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {linkCode}
              </pre>
              <Button onClick={() => copy(linkCode, "Código do link")}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="shortcode" className="space-y-3">
            <Card className="p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Forma mais fácil: use o iframe</p>
                <p className="text-sm text-muted-foreground">
                  Na aba <strong>Iframe completo</strong> ou <strong>Iframe resumo</strong>,
                  copie o código e cole no widget <strong>HTML</strong> do Elementor.
                  Pronto — não precisa instalar nada.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <p className="text-sm font-medium">Prefere usar um shortcode?</p>
                <p className="text-sm text-muted-foreground">
                  Baixe o plugin abaixo e instale no WordPress em{" "}
                  <strong>Plugins → Adicionar novo → Enviar plugin</strong>.
                  Ative e use o shortcode em qualquer página (inclusive no
                  widget <strong>Shortcode</strong> do Elementor).
                </p>
                <Button onClick={downloadPlugin}>
                  <Copy className="h-4 w-4 mr-2" />
                  Baixar plugin WordPress (.zip)
                </Button>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Agenda completa
                </Label>
                <div className="flex gap-2">
                  <Input readOnly value={shortcodeFull} className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copy(shortcodeFull, "Shortcode")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground pt-2">
                  Resumo do próximo dia
                </Label>
                <div className="flex gap-2">
                  <Input readOnly value={shortcodeSummary} className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copy(shortcodeSummary, "Shortcode")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-3">
            <Card className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                Endpoint público com os próximos 90 dias. Sem autenticação,
                CORS liberado.
              </p>
              <div className="flex gap-2">
                <Input readOnly value={apiUrl} className="font-mono text-sm" />
                <Button variant="outline" onClick={() => copy(apiUrl, "URL")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}