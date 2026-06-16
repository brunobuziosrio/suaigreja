import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import QRCode from "qrcode";
import { buildPixBrCode } from "./pix-brcode";

const MERCADOPAGO_BASE_URL = "https://api.mercadopago.com";

async function generateDonationPixViaMercadoPago(opts: {
  accountId: string;
  campaignId: string;
  amountCents: number;
  accessToken: string;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  description: string;
}) {
  const host = getRequestHost();
  const protocol = host?.includes("localhost") ? "http" : "https";
  const notificationUrl = `${protocol}://${host}/api/public/mercadopago-webhook?account_id=${opts.accountId}`;

  const response = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.accessToken}`,
      "X-Idempotency-Key": `${opts.campaignId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
    body: JSON.stringify({
      transaction_amount: Math.round(opts.amountCents) / 100,
      description: opts.description,
      payment_method_id: "pix",
      payer: { email: opts.donorEmail || "doador@email.com", first_name: opts.donorName || "Doador" },
      notification_url: notificationUrl,
      external_reference: `${opts.accountId}:${opts.campaignId}:${Date.now()}`,
    }),
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((raw as { message?: string } | null)?.message ?? "Não foi possível gerar o Pix no Mercado Pago.");
  }

  const txData = (raw as Record<string, unknown>)?.point_of_interaction as
    | { transaction_data?: { qr_code?: string; qr_code_base64?: string } }
    | undefined;
  const copyPaste = txData?.transaction_data?.qr_code ?? null;
  const qrBase64 = txData?.transaction_data?.qr_code_base64 ?? null;
  const paymentId = String((raw as Record<string, unknown>)?.id ?? "");

  const { data: inserted, error } = await supabaseAdmin
    .from("donations")
    .insert({
      account_id: opts.accountId,
      campaign_id: opts.campaignId,
      donor_name: opts.donorName || null,
      donor_email: opts.donorEmail || null,
      donor_phone: opts.donorPhone || null,
      amount_cents: opts.amountCents,
      status: "pending",
      mercadopago_payment_id: paymentId || null,
      copy_paste: copyPaste,
      qr_code: qrBase64,
      raw_response: raw as never,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  return {
    payload: copyPaste ?? "",
    qrDataUrl: qrBase64 ? `data:image/png;base64,${qrBase64}` : "",
    donationId: inserted.id as string,
    tracked: true as const,
  };
}

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
  donorName: z.string().max(120).optional(),
  donorEmail: z.string().email().max(160).optional(),
  donorPhone: z.string().max(40).optional(),
});

export const generateDonationPix = createServerFn({ method: "POST" })
  .inputValidator((input) => PixGenInput.parse(input))
  .handler(async ({ data }) => {
    const slug = data.slug.toLowerCase();
    const account = await resolveAccountBySlug(slug);
    if (!account) throw new Error("Igreja não encontrada");
    const { data: campaign } = await supabaseAdmin
      .from("donation_campaigns")
      .select("id, title, pix_key, recipient_name, recipient_city, active")
      .eq("account_id", account.id)
      .eq("id", data.id)
      .maybeSingle();
    if (!campaign || !campaign.active) throw new Error("Campanha indisponível");

    const { data: mpConnection } = await supabaseAdmin
      .from("mercadopago_connections")
      .select("access_token")
      .eq("account_id", account.id)
      .maybeSingle();

    if (mpConnection?.access_token) {
      if (!data.amountCents || data.amountCents <= 0) {
        throw new Error("Informe um valor para continuar com a doação.");
      }
      return generateDonationPixViaMercadoPago({
        accountId: account.id,
        campaignId: campaign.id,
        amountCents: data.amountCents,
        accessToken: mpConnection.access_token,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        donorPhone: data.donorPhone,
        description: `Doação - ${campaign.title}`,
      });
    }

    const payload = buildPixBrCode({
      pixKey: campaign.pix_key,
      merchantName: campaign.recipient_name,
      merchantCity: campaign.recipient_city,
      amountCents: data.amountCents,
    });
    const qrDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 320 });
    return { payload, qrDataUrl, donationId: null, tracked: false as const };
  });

export const getPublicDonationReceipt = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: donation } = await supabaseAdmin
      .from("donations")
      .select("id, account_id, campaign_id, donor_name, amount_cents, status, paid_at, mercadopago_payment_id, created_at")
      .eq("id", data.id)
      .eq("status", "paid")
      .maybeSingle();
    if (!donation) return null;

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("brand_title, primary_color")
      .eq("id", donation.account_id)
      .maybeSingle();

    const { data: campaign } = donation.campaign_id
      ? await supabaseAdmin.from("donation_campaigns").select("title").eq("id", donation.campaign_id).maybeSingle()
      : { data: null };

    return { donation, church: account, campaignTitle: campaign?.title ?? null };
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

export const getDonationCampaignStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: campaigns, error: campaignsError } = await supabase
      .from("donation_campaigns")
      .select("id, title, goal_cents")
      .eq("account_id", userId);
    if (campaignsError) throw new Error(campaignsError.message);

    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("campaign_id, amount_cents")
      .eq("account_id", userId)
      .eq("status", "paid");
    if (donationsError) throw new Error(donationsError.message);

    const raisedByCampaign = new Map<string, number>();
    for (const d of donations ?? []) {
      if (!d.campaign_id) continue;
      raisedByCampaign.set(d.campaign_id, (raisedByCampaign.get(d.campaign_id) ?? 0) + d.amount_cents);
    }

    return (campaigns ?? []).map((c) => ({
      campaignId: c.id,
      title: c.title,
      goalCents: c.goal_cents,
      raisedCents: raisedByCampaign.get(c.id) ?? 0,
    }));
  });

export const listDonationsByCampaign = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { campaignId: string }) => z.object({ campaignId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("donations")
      .select("id, donor_name, amount_cents, status, paid_at, created_at")
      .eq("account_id", userId)
      .eq("campaign_id", data.campaignId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getDonationsMonthlyReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { year: number }) => z.object({ year: z.number().int().min(2020).max(2100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const start = `${data.year}-01-01T00:00:00.000Z`;
    const end = `${data.year + 1}-01-01T00:00:00.000Z`;
    const { data: rows, error } = await supabase
      .from("donations")
      .select("amount_cents, paid_at, donor_name, campaign_id")
      .eq("account_id", userId)
      .eq("status", "paid")
      .gte("paid_at", start)
      .lt("paid_at", end)
      .order("paid_at", { ascending: true });
    if (error) throw new Error(error.message);

    const byMonth = new Map<number, { count: number; totalCents: number }>();
    for (const r of rows ?? []) {
      if (!r.paid_at) continue;
      const month = new Date(r.paid_at).getUTCMonth();
      const entry = byMonth.get(month) ?? { count: 0, totalCents: 0 };
      entry.count += 1;
      entry.totalCents += r.amount_cents;
      byMonth.set(month, entry);
    }

    return {
      rows: rows ?? [],
      monthly: Array.from({ length: 12 }, (_, month) => ({
        month: month + 1,
        count: byMonth.get(month)?.count ?? 0,
        totalCents: byMonth.get(month)?.totalCents ?? 0,
      })),
    };
  });