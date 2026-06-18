import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/;
const slugSchema = z.object({
  slug: z.string().trim().toLowerCase().min(3, "Mínimo 3 caracteres").max(40, "Máximo 40 caracteres").regex(SLUG_REGEX, "Use letras minúsculas, números e hífen")
});
const checkSlugAvailability = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => slugSchema.parse(input)).handler(createSsrRpc("cf5e587c0afee1db7e66fbff466812e122fef819b698de6b979956f73ded1429"));
const updateCustomSlug = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  slug: z.string().trim().toLowerCase().nullable()
}).parse(input)).handler(createSsrRpc("5b448930e7d8a50902350c96b3476fa4817cbd2a62842dd3ade89e44455afd1f"));
const ALLOWED_IMAGE_MIME = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]);
const UploadInput = z.object({
  folder: z.enum(["church-logo", "card-logo", "donations-image"]),
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(100).refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
    message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO."
  }),
  base64: z.string().min(1).max(12e6)
});
const uploadAccountAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => UploadInput.parse(input)).handler(createSsrRpc("f560ad215a8e1df17a87a9662632ed838252cad4fd9cb79601479c54e06e6430"));
const getMyAccount = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5066297d56e7d337c91702997c269ac30924387d613a1b2d901701e9e5bf61e4"));
const onboardingSchema = z.object({
  religion_profile: z.enum(["catolico", "evangelico", "adventista", "batista", "pentecostal", "comunidade_crista"])
});
const completeOnboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => onboardingSchema.parse(input)).handler(createSsrRpc("7ea1a88bdba63f836dfc258e21fb6d4ab6e256d4e02b92f0189dff2849cc36f3"));
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
  religion_profile: z.enum(["catolico", "evangelico", "adventista", "batista", "pentecostal", "comunidade_crista"]).optional()
});
const updateAccountSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => settingsSchema.parse(input)).handler(createSsrRpc("ae14dc8bad5838c4b60c568fb2414608a473cdf130ad1d6a9f2ee980dd8965f8"));
export {
  checkSlugAvailability as a,
  updateCustomSlug as b,
  completeOnboarding as c,
  uploadAccountAsset as d,
  getMyAccount as g,
  updateAccountSettings as u
};
