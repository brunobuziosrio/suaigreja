import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlatformBranding = {
  brand_text: string;
  subtitle: string;
  icon_text: string;
  icon_url: string | null;
  logo_url: string | null;
  logo_height_px: number;
};

const DEFAULTS: PlatformBranding = {
  brand_text: "suaigreja",
  subtitle: "painel",
  icon_text: "s",
  icon_url: null,
  logo_url: null,
  logo_height_px: 32,
};

export function useBranding() {
  return useQuery({
    queryKey: ["platform-branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_branding")
        .select("brand_text, subtitle, icon_text, icon_url, logo_url, logo_height_px")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? DEFAULTS) as PlatformBranding;
    },
    staleTime: 60_000,
  });
}

export const BRANDING_DEFAULTS = DEFAULTS;