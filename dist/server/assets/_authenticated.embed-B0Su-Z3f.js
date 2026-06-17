import { jsx, jsxs } from "react/jsx-runtime";
import { A as AppShell } from "./app-shell-CrQ0iXNE.js";
import { C as Card } from "./card-Bh1G_xJT.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { g as getMyAccount } from "./account.functions-DK5H0Kdx.js";
import { Loader2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import JSZip from "jszip";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@tanstack/react-router";
import "./admin-payment-settings.functions-DPCtUTO2.js";
import "./server-aNfUBU9s.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CuIHMyp3.js";
import "@supabase/supabase-js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./router-BAWvi9U-.js";
import "./client-DVtn2Z4s.js";
import "./billing-plans-Ce8xzhRW.js";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
function EmbedPage() {
  const fetchAccount = useServerFn(getMyAccount);
  const {
    data: account,
    isLoading
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount()
  });
  const [heightFull, setHeightFull] = useState(700);
  const [heightSummary, setHeightSummary] = useState(280);
  if (isLoading || !account) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "w-full p-6 flex justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) });
  }
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
    const folder = zip.folder("suaigreja-agenda");
    folder.file("suaigreja-agenda.php", pluginPhp);
    const blob = await zip.generateAsync({
      type: "blob"
    });
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
  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Compartilhar agenda" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Use o link ou cole o código no seu site." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Link público (agenda completa)" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Input, { readOnly: true, value: publicUrl, className: "font-mono text-sm" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => copy(publicUrl, "Link"), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsx("a", { href: publicUrl, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }) })
      ] }),
      /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground pt-2", children: "Link público (resumo do próximo dia)" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Input, { readOnly: true, value: summaryUrl, className: "font-mono text-sm" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => copy(summaryUrl, "Link"), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsx("a", { href: summaryUrl, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "iframe", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "iframe", children: "Iframe completo" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "iframe-summary", children: "Iframe resumo (home)" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "link", children: "Link HTML" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "shortcode", children: "Shortcode (Elementor)" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "json", children: "API (JSON)" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "iframe", className: "space-y-3", children: /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Mostra todos os próximos eventos. Ideal para uma página dedicada à agenda." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "hfull", className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Altura (px)" }),
          /* @__PURE__ */ jsx(Input, { id: "hfull", type: "number", min: 300, max: 2e3, value: heightFull, onChange: (e) => setHeightFull(Number(e.target.value) || 700), className: "w-32" })
        ] }),
        /* @__PURE__ */ jsx("pre", { className: "text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all", children: iframeFull }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => copy(iframeFull, "Código iframe"), children: [
          /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
          "Copiar código"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "iframe-summary", className: "space-y-3", children: /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Mostra apenas o próximo dia com eventos. Ideal para a home do site." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "hsum", className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Altura (px)" }),
          /* @__PURE__ */ jsx(Input, { id: "hsum", type: "number", min: 200, max: 800, value: heightSummary, onChange: (e) => setHeightSummary(Number(e.target.value) || 280), className: "w-32" })
        ] }),
        /* @__PURE__ */ jsx("pre", { className: "text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all", children: iframeSummary }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => copy(iframeSummary, "Código iframe"), children: [
          /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
          "Copiar código"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "link", className: "space-y-3", children: /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("pre", { className: "text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all", children: linkCode }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => copy(linkCode, "Código do link"), children: [
          /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
          "Copiar"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "shortcode", className: "space-y-3", children: /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Forma mais fácil: use o iframe" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Na aba ",
            /* @__PURE__ */ jsx("strong", { children: "Iframe completo" }),
            " ou ",
            /* @__PURE__ */ jsx("strong", { children: "Iframe resumo" }),
            ", copie o código e cole no widget ",
            /* @__PURE__ */ jsx("strong", { children: "HTML" }),
            " do Elementor. Pronto — não precisa instalar nada."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-3 border-t", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Prefere usar um shortcode?" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Baixe o plugin abaixo e instale no WordPress em",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "Plugins → Adicionar novo → Enviar plugin" }),
            ". Ative e use o shortcode em qualquer página (inclusive no widget ",
            /* @__PURE__ */ jsx("strong", { children: "Shortcode" }),
            " do Elementor)."
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: downloadPlugin, children: [
            /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
            "Baixar plugin WordPress (.zip)"
          ] }),
          /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Agenda completa" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Input, { readOnly: true, value: shortcodeFull, className: "font-mono text-sm" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => copy(shortcodeFull, "Shortcode"), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wide text-muted-foreground pt-2", children: "Resumo do próximo dia" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Input, { readOnly: true, value: shortcodeSummary, className: "font-mono text-sm" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => copy(shortcodeSummary, "Shortcode"), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "json", className: "space-y-3", children: /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Endpoint público com os próximos 90 dias. Sem autenticação, CORS liberado." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Input, { readOnly: true, value: apiUrl, className: "font-mono text-sm" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => copy(apiUrl, "URL"), children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  EmbedPage as component
};
