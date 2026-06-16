import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import QRCode from "qrcode";
import { buildPixBrCode } from "./pix-brcode";

const slugValidator = (input: { slug: string }) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return { slug };
};

async function resolveAccountBySlug(slug: string) {
  let { data } = await supabaseAdmin
    .from("accounts")
    .select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled, brand_logo_url, brand_logo_height_px, hub_show_agenda, hub_show_prayer, hub_show_visitor, hub_show_events, hub_bio, social_instagram, social_youtube, social_facebook, social_website, visitor_whatsapp, live_url, pix_key, cta_label, cta_enabled")
    .eq("custom_slug", slug)
    .maybeSingle();
  if (!data) {
    const fb = await supabaseAdmin
      .from("accounts")
      .select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled, brand_logo_url, brand_logo_height_px, hub_show_agenda, hub_show_prayer, hub_show_visitor, hub_show_events, hub_bio, social_instagram, social_youtube, social_facebook, social_website, visitor_whatsapp, live_url, pix_key, cta_label, cta_enabled")
      .eq("site_id", slug)
      .maybeSingle();
    data = fb.data;
  }
  return data;
}

// ============== PUBLIC ==============

export const getPublicDonations = createServerFn({ method: "GET" })
  .inputValidator(slugValidator)
  .handler(async ({ data }) => {
    const account = await resolveAccountBySlug(data.slug);
    if (!account || !account.hub_enabled) return null;
    const { data: campaigns } = await supabaseAdmin
      .from("donation_campaigns")
      .select("id, title, description, image_url, suggested_amounts_cents, goal_cents, featured, sort_order")
      .eq("account_id", account.id)
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    return { account, campaigns: campaigns ?? [] };
  });

export const getPublicDonationCampaign = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string; id: string }) => {
    const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
    const id = String(input?.id || "");
    if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("invalid id");
    return { slug, id };
  })
  .handler(async ({ data }) => {
    const account = await resolveAccountBySlug(data.slug);
    if (!account || !account.hub_enabled) return null;
    const { data: campaign } = await supabaseAdmin
      .from("donation_campaigns")
      .select("*")
      .eq("account_id", account.id)
      .eq("id", data.id)
      .eq("active", true)
      .maybeSingle();
    if (!campaign) return null;
    return { account, campaign };
  });

const PixGenInput = z.object({
  slug: z.string().min(1).max(64),
  id: z.string().uuid(),
  amountCents: z.number().int().min(0).max(100_000_000).optional(),
});

export const generateDonationPix = createServerFn({ method: "POST" })
  .inputValidator((input) => PixGenInput.parse(input))
  .handler(async ({ data }) => {
    const slug = data.slug.toLowerCase();
    const account = await resolveAccountBySlug(slug);
    if (!account) throw new Error("Igreja não encontrada");
    const { data: campaign } = await supabaseAdmin
      .from("donation_campaigns")
      .select("id, pix_key, recipient_name, recipient_city, active")
      .eq("account_id", account.id)
      .eq("id", data.id)
      .maybeSingle();
    if (!campaign || !campaign.active) throw new Error("Campanha indisponível");
    const payload = buildPixBrCode({
      pixKey: campaign.pix_key,
      merchantName: campaign.recipient_name,
      merchantCity: campaign.recipient_city,
      amountCents: data.amountCents,
    });
    const qrDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 320 });
    return { payload, qrDataUrl };
  });

// ============== ADMIN ==============

export const listMyDonationCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("donation_campaigns")
      .select("*")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const PIX_KEY_TYPES = ["cpf", "cnpj", "email", "telefone", "aleatoria"] as const;

const CampaignInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  image_url: z.string().url().max(500).nullable(),
  pix_key: z.string().min(1).max(200),
  pix_key_type: z.enum(PIX_KEY_TYPES),
  recipient_name: z.string().min(1).max(80),
  recipient_city: z.string().min(1).max(40).default("BRASIL"),
  suggested_amounts_cents: z.array(z.number().int().min(100).max(100_000_000)).max(6),
  goal_cents: z.number().int().min(0).nullable(),
  active: z.boolean(),
  featured: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const upsertDonationCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => CampaignInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, account_id: userId };
    const { error } = data.id
      ? await supabase.from("donation_campaigns").update(row).eq("id", data.id)
      : await supabase.from("donation_campaigns").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDonationCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("donation_campaigns").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });