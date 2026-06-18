import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
import { R as RELIGION_PROFILES } from "./religion-profiles-CyOvWaWi.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
const RESERVED_SLUGS = /* @__PURE__ */ new Set(["a", "admin", "api", "app", "assets", "auth", "agenda", "billing", "dashboard", "embed", "help", "login", "logout", "marketplace", "onboarding", "public", "root", "settings", "signin", "signup", "static", "support", "types", "locations", "www"]);
const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/;
const slugSchema = z.object({
  slug: z.string().trim().toLowerCase().min(3, "Mínimo 3 caracteres").max(40, "Máximo 40 caracteres").regex(SLUG_REGEX, "Use letras minúsculas, números e hífen")
});
const checkSlugAvailability_createServerFn_handler = createServerRpc({
  id: "cf5e587c0afee1db7e66fbff466812e122fef819b698de6b979956f73ded1429",
  name: "checkSlugAvailability",
  filename: "src/lib/account.functions.ts"
}, (opts) => checkSlugAvailability.__executeServer(opts));
const checkSlugAvailability = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => slugSchema.parse(input)).handler(checkSlugAvailability_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  if (RESERVED_SLUGS.has(data.slug)) {
    return {
      available: false,
      reason: "Este nome é reservado"
    };
  }
  const {
    data: existing
  } = await supabaseAdmin.from("accounts").select("id").eq("custom_slug", data.slug).maybeSingle();
  if (existing && existing.id !== userId) {
    return {
      available: false,
      reason: "Já está em uso"
    };
  }
  return {
    available: true
  };
});
const updateCustomSlug_createServerFn_handler = createServerRpc({
  id: "5b448930e7d8a50902350c96b3476fa4817cbd2a62842dd3ade89e44455afd1f",
  name: "updateCustomSlug",
  filename: "src/lib/account.functions.ts"
}, (opts) => updateCustomSlug.__executeServer(opts));
const updateCustomSlug = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  slug: z.string().trim().toLowerCase().nullable()
}).parse(input)).handler(updateCustomSlug_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (data.slug === null || data.slug === "") {
    const {
      error: error2
    } = await supabase.from("accounts").update({
      custom_slug: null
    }).eq("id", userId);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      slug: null
    };
  }
  const parsed = slugSchema.parse({
    slug: data.slug
  });
  if (RESERVED_SLUGS.has(parsed.slug)) {
    throw new Error("Este nome é reservado");
  }
  const {
    data: existing
  } = await supabaseAdmin.from("accounts").select("id").eq("custom_slug", parsed.slug).maybeSingle();
  if (existing && existing.id !== userId) {
    throw new Error("Já está em uso");
  }
  const {
    error
  } = await supabase.from("accounts").update({
    custom_slug: parsed.slug
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    slug: parsed.slug
  };
});
const ALLOWED_IMAGE_MIME = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]);
const ALLOWED_IMAGE_EXT = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "webp", "gif", "ico"]);
const UploadInput = z.object({
  folder: z.enum(["church-logo", "card-logo", "donations-image"]),
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(100).refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
    message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO."
  }),
  base64: z.string().min(1).max(12e6)
});
const uploadAccountAsset_createServerFn_handler = createServerRpc({
  id: "f560ad215a8e1df17a87a9662632ed838252cad4fd9cb79601479c54e06e6430",
  name: "uploadAccountAsset",
  filename: "src/lib/account.functions.ts"
}, (opts) => uploadAccountAsset.__executeServer(opts));
const uploadAccountAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => UploadInput.parse(input)).handler(uploadAccountAsset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  let ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${data.folder}/${userId}-${Date.now()}-${rand}.${ext}`;
  const bytes = Buffer.from(data.base64, "base64");
  let contentType = data.contentType.toLowerCase();
  if (contentType === "image/x-icon" || contentType === "image/vnd.microsoft.icon") {
    contentType = "image/png";
  }
  const {
    error
  } = await supabaseAdmin.storage.from("product-images").upload(path, bytes, {
    contentType,
    upsert: false
  });
  if (error) throw new Error(error.message);
  const {
    data: pub
  } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return {
    url: pub.publicUrl
  };
});
const getMyAccount_createServerFn_handler = createServerRpc({
  id: "5066297d56e7d337c91702997c269ac30924387d613a1b2d901701e9e5bf61e4",
  name: "getMyAccount",
  filename: "src/lib/account.functions.ts"
}, (opts) => getMyAccount.__executeServer(opts));
const getMyAccount = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyAccount_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("accounts").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});
const onboardingSchema = z.object({
  religion_profile: z.enum(["catolico", "evangelico", "adventista", "batista", "pentecostal", "comunidade_crista"])
});
const completeOnboarding_createServerFn_handler = createServerRpc({
  id: "7ea1a88bdba63f836dfc258e21fb6d4ab6e256d4e02b92f0189dff2849cc36f3",
  name: "completeOnboarding",
  filename: "src/lib/account.functions.ts"
}, (opts) => completeOnboarding.__executeServer(opts));
const completeOnboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => onboardingSchema.parse(input)).handler(completeOnboarding_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const profile = RELIGION_PROFILES.find((p) => p.id === data.religion_profile);
  const {
    error: updateErr
  } = await supabase.from("accounts").update({
    religion_profile: data.religion_profile,
    onboarded: true
  }).eq("id", userId);
  if (updateErr) throw new Error(updateErr.message);
  const {
    count
  } = await supabase.from("celebration_types").select("id", {
    count: "exact",
    head: true
  }).eq("account_id", userId);
  if (!count) {
    const rows = profile.defaultTypes.map((name, idx) => ({
      account_id: userId,
      name,
      sort_order: idx
    }));
    const {
      error: insertErr
    } = await supabase.from("celebration_types").insert(rows);
    if (insertErr) throw new Error(insertErr.message);
  }
  return {
    ok: true
  };
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
  religion_profile: z.enum(["catolico", "evangelico", "adventista", "batista", "pentecostal", "comunidade_crista"]).optional()
});
const updateAccountSettings_createServerFn_handler = createServerRpc({
  id: "ae14dc8bad5838c4b60c568fb2414608a473cdf130ad1d6a9f2ee980dd8965f8",
  name: "updateAccountSettings",
  filename: "src/lib/account.functions.ts"
}, (opts) => updateAccountSettings.__executeServer(opts));
const updateAccountSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => settingsSchema.parse(input)).handler(updateAccountSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("accounts").update(data).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  checkSlugAvailability_createServerFn_handler,
  completeOnboarding_createServerFn_handler,
  getMyAccount_createServerFn_handler,
  updateAccountSettings_createServerFn_handler,
  updateCustomSlug_createServerFn_handler,
  uploadAccountAsset_createServerFn_handler
};
