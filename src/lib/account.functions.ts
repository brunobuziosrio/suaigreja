import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { RELIGION_PROFILES, type ReligionProfile } from "./religion-profiles";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RESERVED_SLUGS = new Set([
  "a", "admin", "api", "app", "assets", "auth", "agenda", "billing",
  "dashboard", "embed", "help", "login", "logout", "marketplace",
  "onboarding", "public", "root", "settings", "signin", "signup",
  "static", "support", "types", "locations", "www",
]);

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/;

const slugSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG_REGEX, "Use letras minúsculas, números e hífen"),
});

export const checkSlugAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => slugSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (RESERVED_SLUGS.has(data.slug)) {
      return { available: false, reason: "Este nome é reservado" as const };
    }
    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("custom_slug", data.slug)
      .maybeSingle();
    if (existing && existing.id !== userId) {
      return { available: false, reason: "Já está em uso" as const };
    }
    return { available: true as const };
  });

export const updateCustomSlug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ slug: z.string().trim().toLowerCase().nullable() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.slug === null || data.slug === "") {
      const { error } = await supabase
        .from("accounts")
        .update({ custom_slug: null })
        .eq("id", userId);
      if (error) throw new Error(error.message);
      return { ok: true, slug: null };
    }
    const parsed = slugSchema.parse({ slug: data.slug });
    if (RESERVED_SLUGS.has(parsed.slug)) {
      throw new Error("Este nome é reservado");
    }
    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("custom_slug", parsed.slug)
      .maybeSingle();
    if (existing && existing.id !== userId) {
      throw new Error("Já está em uso");
    }
    const { error } = await supabase
      .from("accounts")
      .update({ custom_slug: parsed.slug })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, slug: parsed.slug };
  });

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "ico"]);

const UploadInput = z.object({
  folder: z.enum(["church-logo", "card-logo", "donations-image"]),
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(100).refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
    message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO.",
  }),
  base64: z.string().min(1).max(12_000_000),
});

export const uploadAccountAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => UploadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    let ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
    if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${data.folder}/${userId}-${Date.now()}-${rand}.${ext}`;
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.length === 0 || bytes.length > 8 * 1024 * 1024) {
      throw new Error("A imagem deve ter entre 1 byte e 8 MB.");
    }
    
    // Fix for "mime type image/x-icon is not supported"
    let contentType = data.contentType.toLowerCase();
    if (contentType === "image/x-icon" || contentType === "image/vnd.microsoft.icon") {
      contentType = "image/png";
    }

    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
    return { url: pub.publicUrl };
  });

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const onboardingSchema = z.object({
  religion_profile: z.enum([
    "catolico",
    "evangelico",
    "adventista",
    "batista",
    "pentecostal",
    "comunidade_crista",
  ]),
});

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => onboardingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const profile = RELIGION_PROFILES.find((p) => p.id === data.religion_profile)!;

    const { error: updateErr } = await supabase
      .from("accounts")
      .update({ religion_profile: data.religion_profile as ReligionProfile, onboarded: true })
      .eq("id", userId);
    if (updateErr) throw new Error(updateErr.message);

    // seed default celebration types if account has none
    const { count } = await supabase
      .from("celebration_types")
      .select("id", { count: "exact", head: true })
      .eq("account_id", userId);

    if (!count) {
      const rows = profile.defaultTypes.map((name, idx) => ({
        account_id: userId,
        name,
        sort_order: idx,
      }));
      const { error: insertErr } = await supabase.from("celebration_types").insert(rows);
      if (insertErr) throw new Error(insertErr.message);
    }

    return { ok: true };
  });

const settingsSchema = z.object({
  brand_title: z.string().min(1).max(120),
  brand_subtitle: z.string().max(240).optional().default(""),
  brand_empty_message: z.string().min(1).max(400),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  brand_today_title: z.string().min(1).max(120).optional(),
  brand_logo_url: z.string().url().max(500).nullable().optional(),
  brand_logo_height_px: z.number().int().min(16).max(120).optional(),
  brand_footer_logo_url: z.string().url().max(500).nullable().optional(),
  card_logo_url: z.string().url().max(500).nullable().optional(),
  card_logo_height_px: z.number().int().min(24).max(160).optional(),
  card_accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  card_footer_text: z.string().max(600).optional(),
  card_title_size_px: z.number().int().min(18).max(60).optional(),
  card_footer_size_px: z.number().int().min(8).max(20).optional(),
  card_field_size_px: z.number().int().min(10).max(28).optional(),
  card_label_size_px: z.number().int().min(9).max(20).optional(),
  show_end_time: z.boolean().optional(),
  show_live_fields: z.boolean().optional(),
  force_show_type: z.boolean().optional(),
  donations_fixed_image_url: z.string().url().max(500).nullable().optional(),
  pix_key: z.string().max(200).nullable().optional(),
  religion_profile: z.enum([
    "catolico",
    "evangelico",
    "adventista",
    "batista",
    "pentecostal",
    "comunidade_crista",
  ]).optional(),
});

export const updateAccountSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("accounts")
      .update(data)
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
