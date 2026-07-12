import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { RELIGION_PROFILES, type ReligionProfile } from "./religion-profiles";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccountAccess } from "@/lib/plan-access";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";

import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";

const RESERVED_SLUGS = new Set([
  "a",
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "agenda",
  "billing",
  "dashboard",
  "embed",
  "help",
  "login",
  "logout",
  "marketplace",
  "onboarding",
  "public",
  "root",
  "settings",
  "signin",
  "signup",
  "static",
  "support",
  "types",
  "locations",
  "www",
]);

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/;
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
const DOMAIN_TARGET = "suaigreja.top";

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

function verificationToken() {
  return `suaigreja-domain=${randomBytes(16).toString("hex")}`;
}

type AccountPlanQueryClient = {
  from(table: "accounts"): {
    select(columns: string): {
      eq(
        column: "id",
        value: string,
      ): {
        maybeSingle(): Promise<{
          data: Parameters<typeof resolveAccountAccess>[0] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

async function requirePremiumDomainAccess(supabase: AccountPlanQueryClient, accountId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("plan_tier, subscription_status, subscription_ends_at, trial_ends_at")
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const access = resolveAccountAccess(data);
  if (!access.billingActive || access.tier !== "premium") {
    throw new Error("Domínio próprio está disponível apenas no plano Premium ativo.");
  }
}

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
  .validator((input) => slugSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    if (RESERVED_SLUGS.has(data.slug)) {
      return { available: false, reason: "Este nome é reservado" as const };
    }
    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("custom_slug", data.slug)
      .maybeSingle();
    if (existing && existing.id !== accountId) {
      return { available: false, reason: "Já está em uso" as const };
    }
    return { available: true as const };
  });

export const updateCustomSlug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ slug: z.string().trim().toLowerCase().nullable() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    if (data.slug === null || data.slug === "") {
      const { error } = await supabase
        .from("accounts")
        .update({ custom_slug: null })
        .eq("id", accountId);
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
    if (existing && existing.id !== accountId) {
      throw new Error("Já está em uso");
    }
    const { error } = await supabase
      .from("accounts")
      .update({ custom_slug: parsed.slug })
      .eq("id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true, slug: parsed.slug };
  });

const domainSchema = z.object({
  domain: z.string().trim().max(253).nullable(),
});

const managedDomainSchema = z.object({
  domain: z.string().trim().max(253).nullable(),
  holder_name: z.string().trim().max(160).nullable().optional(),
  holder_document: z.string().trim().max(32).nullable().optional(),
  holder_email: z.string().trim().max(160).nullable().optional(),
  holder_phone: z.string().trim().max(32).nullable().optional(),
  holder_address: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updateCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => domainSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    await requirePremiumDomainAccess(supabase, accountId);

    const domain = data.domain ? normalizeDomain(data.domain) : "";
    if (!domain) {
      const { error } = await supabase
        .from("accounts")
        .update({
          custom_domain: null,
          custom_domain_status: "not_configured",
          custom_domain_verification_token: null,
          custom_domain_verified_at: null,
          custom_domain_last_checked_at: null,
          custom_domain_error: null,
        })
        .eq("id", accountId);
      if (error) throw new Error(error.message);
      return { ok: true, domain: null, token: null, status: "not_configured" };
    }

    if (!DOMAIN_REGEX.test(domain) || domain.length > 253 || domain.endsWith(`.${DOMAIN_TARGET}`)) {
      throw new Error("Informe um domínio válido, como igreja.org.br.");
    }

    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("custom_domain", domain)
      .maybeSingle();
    if (existing && existing.id !== accountId) {
      throw new Error("Este domínio já está configurado em outra conta.");
    }

    const token = verificationToken();
    const { error } = await supabase
      .from("accounts")
      .update({
        custom_domain: domain,
        custom_domain_status: "pending",
        custom_domain_verification_token: token,
        custom_domain_verified_at: null,
        custom_domain_last_checked_at: null,
        custom_domain_error: null,
      })
      .eq("id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true, domain, token, status: "pending" };
  });

export const verifyCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    await requirePremiumDomainAccess(supabase, accountId);

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("custom_domain, custom_domain_verification_token")
      .eq("id", accountId)
      .maybeSingle();
    if (accountError) throw new Error(accountError.message);
    if (!account?.custom_domain || !account?.custom_domain_verification_token) {
      throw new Error("Configure um domínio antes de verificar.");
    }

    let verified = false;
    let message = "";
    try {
      const txtRecords = await resolveTxt(account.custom_domain);
      const values = txtRecords.map((parts) => parts.join(""));
      verified = values.includes(account.custom_domain_verification_token);
      message = verified
        ? ""
        : "Registro TXT ainda não encontrado. A propagação DNS pode levar alguns minutos.";
    } catch (e) {
      message = (e as Error).message || "Não foi possível consultar o DNS do domínio.";
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("accounts")
      .update({
        custom_domain_status: verified ? "verified" : "failed",
        custom_domain_verified_at: verified ? now : null,
        custom_domain_last_checked_at: now,
        custom_domain_error: verified ? null : message,
      })
      .eq("id", accountId);
    if (error) throw new Error(error.message);
    return {
      ok: verified,
      status: verified ? "verified" : "failed",
      error: verified ? null : message,
    };
  });

export const requestManagedDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => managedDomainSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    await requirePremiumDomainAccess(supabase, accountId);

    const domain = data.domain ? normalizeDomain(data.domain) : "";
    if (!domain) {
      const { error } = await supabase
        .from("accounts")
        .update({
          managed_domain_requested_name: null,
          managed_domain_status: "not_requested",
          managed_domain_holder_name: null,
          managed_domain_holder_document: null,
          managed_domain_holder_email: null,
          managed_domain_holder_phone: null,
          managed_domain_holder_address: null,
          managed_domain_notes: null,
          managed_domain_requested_at: null,
          managed_domain_updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);
      if (error) throw new Error(error.message);
      return { ok: true, status: "not_requested" };
    }

    if (!DOMAIN_REGEX.test(domain) || domain.length > 253 || domain.endsWith(`.${DOMAIN_TARGET}`)) {
      throw new Error("Informe um domínio válido, como paroquia-santana.org.br.");
    }

    const required = [
      data.holder_name,
      data.holder_document,
      data.holder_email,
      data.holder_phone,
      data.holder_address,
    ];
    if (required.some((value) => !value?.trim())) {
      throw new Error("Preencha titular, documento, e-mail, telefone e endereço.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.holder_email ?? "")) {
      throw new Error("Informe um e-mail válido.");
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("accounts")
      .update({
        managed_domain_requested_name: domain,
        managed_domain_status: "requested",
        managed_domain_holder_name: data.holder_name?.trim() || null,
        managed_domain_holder_document: data.holder_document?.trim() || null,
        managed_domain_holder_email: data.holder_email?.trim() || null,
        managed_domain_holder_phone: data.holder_phone?.trim() || null,
        managed_domain_holder_address: data.holder_address?.trim() || null,
        managed_domain_notes: data.notes?.trim() || null,
        managed_domain_requested_at: now,
        managed_domain_updated_at: now,
      })
      .eq("id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true, status: "requested", domain };
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
  contentType: z
    .string()
    .min(1)
    .max(100)
    .refine((v) => ALLOWED_IMAGE_MIME.has(v.toLowerCase()), {
      message: "contentType não permitido. Use JPEG, PNG, WEBP, GIF ou ICO.",
    }),
  base64: z.string().min(1).max(12_000_000),
});

export const uploadAccountAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => UploadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    let ext =
      (data.filename.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 5) || "jpg";
    if (!ALLOWED_IMAGE_EXT.has(ext)) ext = "jpg";
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${data.folder}/${accountId}-${Date.now()}-${rand}.${ext}`;
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
    // Resolve a conta real: para o dono, accountId = userId (compatibilidade); para
    // um membro convidado da equipe, accountId vem do vinculo em account_members.
    const { accountId } = await resolveAccountContext(context.userId);
    const { data, error } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("id", accountId)
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
  brand_title: z.string().trim().min(2).max(120).optional(),
  owner_name: z.string().trim().min(2).max(160).optional(),
  owner_phone: z.string().trim().max(30).optional(),
});

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => onboardingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    const profile = RELIGION_PROFILES.find((p) => p.id === data.religion_profile)!;

    const { error: updateErr } = await supabase
      .from("accounts")
      .update({
        religion_profile: data.religion_profile as ReligionProfile,
        onboarded: true,
        ...(data.brand_title ? { brand_title: data.brand_title } : {}),
        ...(data.owner_name ? { owner_name: data.owner_name } : {}),
        ...(data.owner_phone ? { owner_phone: data.owner_phone } : {}),
      } as never)
      .eq("id", accountId);
    if (updateErr) throw new Error(updateErr.message);

    // seed default celebration types if account has none
    const { count } = await supabase
      .from("celebration_types")
      .select("id", { count: "exact", head: true })
      .eq("account_id", accountId);

    if (!count) {
      const rows = profile.defaultTypes.map((name, idx) => ({
        account_id: accountId,
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
  card_accent_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
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
  religion_profile: z
    .enum(["catolico", "evangelico", "adventista", "batista", "pentecostal", "comunidade_crista"])
    .optional(),
});

export const updateAccountSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "settings", "manage");
    const { error } = await supabase.from("accounts").update(data).eq("id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
