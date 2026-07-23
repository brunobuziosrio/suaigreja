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

const brandingAssetSchema = z.object({
  filename: z.string().min(1).max(120),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]),
  base64: z.string().min(1).max(8_000_000),
  kind: z.enum(["icon", "logo"]),
});

export const adminUpdateBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => brandingSchema.parse(i))
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

export const adminUploadBrandingAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => brandingAssetSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const extension = data.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const safeExtension = ["jpg", "jpeg", "png", "webp", "gif", "ico"].includes(extension) ? extension : "png";
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024) {
      throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const path = `branding/${data.kind}-${crypto.randomUUID()}.${safeExtension}`;
    const contentType = data.contentType.includes("icon") ? "image/png" : data.contentType;
    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(error.message);

    const { data: publicUrl } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
    return { url: publicUrl.publicUrl };
  });
