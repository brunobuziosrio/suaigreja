import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (opts: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      setUser: (
        identifier: string,
        attrs: { email?: string; name?: string }
      ) => void;
      setCustomAttributes: (attrs: Record<string, string | number | boolean>) => void;
      reset: () => void;
    };
    chatwootSettings?: Record<string, unknown>;
  }
}

const DEFAULT_BASE_URL = "https://chatwoot.digitallagos.top";
const DEFAULT_WEBSITE_TOKEN = "psP8qad1WdWFFMJGWwu9DGgr";

export function ChatwootWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide on public client-facing hub pages (visible only to internal users/admin)
  const isPublicHub = (() => {
    const p = pathname || "/";
    if (p === "/") return false;
    // Internal app routes that must keep the widget
    const internalPrefixes = [
      "/login", "/onboarding", "/dashboard", "/agenda", "/hub", "/billing",
      "/settings", "/admin", "/embed", "/marketplace", "/eventos",
      "/oracoes", "/visitantes", "/locations", "/types", "/api",
    ];
    if (internalPrefixes.some((pre) => p === pre || p.startsWith(pre + "/"))) return false;
    // Anything else at top level is a public hub page (/$slug, /a/..., /o/..., /v/..., /e/...)
    return true;
  })();

  const baseUrl =
    (import.meta.env.VITE_CHATWOOT_BASE_URL as string | undefined) ??
    DEFAULT_BASE_URL;
  const websiteToken =
    (import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN as string | undefined) ??
    DEFAULT_WEBSITE_TOKEN;
  const { user } = useAuth();
  const qc = useQueryClient();
  const account = qc.getQueryData<Record<string, any>>(["account", user?.id]);

  useEffect(() => {
    if (isPublicHub) {
      // Hide widget if it was already injected from a previous internal route
      const existing = document.querySelector<HTMLElement>(".woot-widget-holder, .woot--bubble-holder");
      if (existing) existing.style.display = "none";
      return;
    }
    // Show again if returning to an internal route
    const existing = document.querySelector<HTMLElement>(".woot-widget-holder, .woot--bubble-holder");
    if (existing) existing.style.display = "";

    if (!baseUrl || !websiteToken) return;
    if (typeof window === "undefined") return;

    window.chatwootSettings = {
      position: "right",
      type: "standard",
      launcherTitle: "Fale com o suporte",
    };

    const scriptId = "chatwoot-sdk";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      window.chatwootSDK?.run({ websiteToken, baseUrl });
    };
    document.body.appendChild(script);
  }, [baseUrl, websiteToken, isPublicHub]);

  useEffect(() => {
    if (!user || isPublicHub) return;
    const handler = () => {
      window.$chatwoot?.setUser(user.id, {
        email: user.email ?? undefined,
        name:
          (user.user_metadata?.name as string | undefined) ??
          user.email ??
          undefined,
      });
      if (account) {
        window.$chatwoot?.setCustomAttributes({
          plano: account.current_plan ?? "trial",
          status_assinatura: account.subscription_status ?? "",
          site_id: account.site_id ?? "",
          igreja: account.brand_title ?? "",
          perfil_religioso: account.religion_profile ?? "",
          onboarded: !!account.onboarded,
          trial_termina_em: account.trial_ends_at ?? "",
          assinatura_termina_em: account.subscription_ends_at ?? "",
        });
      }
    };
    if (window.$chatwoot) {
      handler();
    } else {
      window.addEventListener("chatwoot:ready", handler);
      return () => window.removeEventListener("chatwoot:ready", handler);
    }
  }, [user, account]);

  return null;
}