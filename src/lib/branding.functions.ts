import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado.");
}

const brandingSchema = z.object({
  brand_text: z.string().min(1).max(60),
  subtitle: z.string().max(40).default(""),
  icon_text: z.string().min(1).max(3),
  icon_url: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  logo_height_px: z.number().int().min(16).max(96),
});

export const adminUpdateBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => brandingSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("platform_branding")
      .update({
        brand_text: data.brand_text,
        subtitle: data.subtitle,
        icon_text: data.icon_text,
        icon_url: data.icon_url ?? null,
        logo_url: data.logo_url ?? null,
        logo_height_px: data.logo_height_px,
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });