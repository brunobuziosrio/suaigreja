import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn, a as getRequestHost } from "./server-aNfUBU9s.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
import QRCode from "qrcode";
import { b as buildPixBrCode } from "./pix-brcode-DEjoVxT-.js";
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
const MERCADOPAGO_BASE_URL = "https://api.mercadopago.com";
async function generateDonationPixViaMercadoPago(opts) {
  const host = getRequestHost();
  const protocol = host?.includes("localhost") ? "http" : "https";
  const notificationUrl = `${protocol}://${host}/api/public/mercadopago-webhook?account_id=${opts.accountId}`;
  const response = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.accessToken}`,
      "X-Idempotency-Key": `${opts.campaignId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    },
    body: JSON.stringify({
      transaction_amount: Math.round(opts.amountCents) / 100,
      description: opts.description,
      payment_method_id: "pix",
      payer: {
        email: opts.donorEmail || "doador@email.com",
        first_name: opts.donorName || "Doador"
      },
      notification_url: notificationUrl,
      external_reference: `${opts.accountId}:${opts.campaignId}:${Date.now()}`
    })
  });
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(raw?.message ?? "Não foi possível gerar o Pix no Mercado Pago.");
  }
  const txData = raw?.point_of_interaction;
  const copyPaste = txData?.transaction_data?.qr_code ?? null;
  const qrBase64 = txData?.transaction_data?.qr_code_base64 ?? null;
  const paymentId = String(raw?.id ?? "");
  const {
    data: inserted,
    error
  } = await supabaseAdmin.from("donations").insert({
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
    raw_response: raw
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    payload: copyPaste ?? "",
    qrDataUrl: qrBase64 ? `data:image/png;base64,${qrBase64}` : "",
    donationId: inserted.id,
    tracked: true
  };
}
const slugValidator = (input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
};
async function resolveAccountBySlug(slug) {
  let {
    data
  } = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled, brand_logo_url, brand_logo_height_px, hub_show_agenda, hub_show_prayer, hub_show_visitor, hub_show_events, hub_bio, social_instagram, social_youtube, social_facebook, social_website, visitor_whatsapp, live_url, pix_key, cta_label, cta_enabled").eq("custom_slug", slug).maybeSingle();
  if (!data) {
    const fb = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_enabled, brand_logo_url, brand_logo_height_px, hub_show_agenda, hub_show_prayer, hub_show_visitor, hub_show_events, hub_bio, social_instagram, social_youtube, social_facebook, social_website, visitor_whatsapp, live_url, pix_key, cta_label, cta_enabled").eq("site_id", slug).maybeSingle();
    data = fb.data;
  }
  return data;
}
const getPublicDonations_createServerFn_handler = createServerRpc({
  id: "4f1c301f3b19a78b2343eee91833dc4c887022b1d9f4ccc774e4507bbbd44c8d",
  name: "getPublicDonations",
  filename: "src/lib/donations.functions.ts"
}, (opts) => getPublicDonations.__executeServer(opts));
const getPublicDonations = createServerFn({
  method: "GET"
}).inputValidator(slugValidator).handler(getPublicDonations_createServerFn_handler, async ({
  data
}) => {
  const account = await resolveAccountBySlug(data.slug);
  if (!account || !account.hub_enabled) return null;
  const {
    data: campaigns
  } = await supabaseAdmin.from("donation_campaigns").select("id, title, description, image_url, suggested_amounts_cents, goal_cents, featured, sort_order").eq("account_id", account.id).eq("active", true).order("featured", {
    ascending: false
  }).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  });
  return {
    account,
    campaigns: campaigns ?? []
  };
});
const getPublicDonationCampaign_createServerFn_handler = createServerRpc({
  id: "f43ae3e8e95bc60889280aab911f8b6d73cd1c07ce6099b68d26295c7f87e2c5",
  name: "getPublicDonationCampaign",
  filename: "src/lib/donations.functions.ts"
}, (opts) => getPublicDonationCampaign.__executeServer(opts));
const getPublicDonationCampaign = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").toLowerCase().slice(0, 64);
  const id = String(input?.id || "");
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error("invalid slug");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("invalid id");
  return {
    slug,
    id
  };
}).handler(getPublicDonationCampaign_createServerFn_handler, async ({
  data
}) => {
  const account = await resolveAccountBySlug(data.slug);
  if (!account || !account.hub_enabled) return null;
  const {
    data: campaign
  } = await supabaseAdmin.from("donation_campaigns").select("*").eq("account_id", account.id).eq("id", data.id).eq("active", true).maybeSingle();
  if (!campaign) return null;
  return {
    account,
    campaign
  };
});
const PixGenInput = z.object({
  slug: z.string().min(1).max(64),
  id: z.string().uuid(),
  amountCents: z.number().int().min(0).max(1e8).optional(),
  donorName: z.string().max(120).optional(),
  donorEmail: z.string().email().max(160).optional(),
  donorPhone: z.string().max(40).optional()
});
const generateDonationPix_createServerFn_handler = createServerRpc({
  id: "b5609fa6a5a6f88d2940311e39206a2b95e960f8bc229ac06ff3944be0bb2055",
  name: "generateDonationPix",
  filename: "src/lib/donations.functions.ts"
}, (opts) => generateDonationPix.__executeServer(opts));
const generateDonationPix = createServerFn({
  method: "POST"
}).inputValidator((input) => PixGenInput.parse(input)).handler(generateDonationPix_createServerFn_handler, async ({
  data
}) => {
  const slug = data.slug.toLowerCase();
  const account = await resolveAccountBySlug(slug);
  if (!account) throw new Error("Igreja não encontrada");
  const {
    data: campaign
  } = await supabaseAdmin.from("donation_campaigns").select("id, title, pix_key, recipient_name, recipient_city, active").eq("account_id", account.id).eq("id", data.id).maybeSingle();
  if (!campaign || !campaign.active) throw new Error("Campanha indisponível");
  const {
    data: mpConnection
  } = await supabaseAdmin.from("mercadopago_connections").select("access_token").eq("account_id", account.id).maybeSingle();
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
      description: `Doação - ${campaign.title}`
    });
  }
  const payload = buildPixBrCode({
    pixKey: campaign.pix_key,
    merchantName: campaign.recipient_name,
    merchantCity: campaign.recipient_city,
    amountCents: data.amountCents
  });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    margin: 1,
    width: 320
  });
  return {
    payload,
    qrDataUrl,
    donationId: null,
    tracked: false
  };
});
const getPublicDonationReceipt_createServerFn_handler = createServerRpc({
  id: "65d3fee73cb0dda3526224a34503a0a57990817b3d1a080677a33e8d08c85364",
  name: "getPublicDonationReceipt",
  filename: "src/lib/donations.functions.ts"
}, (opts) => getPublicDonationReceipt.__executeServer(opts));
const getPublicDonationReceipt = createServerFn({
  method: "GET"
}).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(getPublicDonationReceipt_createServerFn_handler, async ({
  data
}) => {
  const {
    data: donation
  } = await supabaseAdmin.from("donations").select("id, account_id, campaign_id, donor_name, amount_cents, status, paid_at, mercadopago_payment_id, created_at").eq("id", data.id).eq("status", "paid").maybeSingle();
  if (!donation) return null;
  const {
    data: account
  } = await supabaseAdmin.from("accounts").select("brand_title, primary_color").eq("id", donation.account_id).maybeSingle();
  const {
    data: campaign
  } = donation.campaign_id ? await supabaseAdmin.from("donation_campaigns").select("title").eq("id", donation.campaign_id).maybeSingle() : {
    data: null
  };
  return {
    donation,
    church: account,
    campaignTitle: campaign?.title ?? null
  };
});
const listMyDonationCampaigns_createServerFn_handler = createServerRpc({
  id: "057df525a4aa1f7cda5c1a39650071f2e55e7a828f2712cec7d214cd5fb17af7",
  name: "listMyDonationCampaigns",
  filename: "src/lib/donations.functions.ts"
}, (opts) => listMyDonationCampaigns.__executeServer(opts));
const listMyDonationCampaigns = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyDonationCampaigns_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("donation_campaigns").select("*").order("featured", {
    ascending: false
  }).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const PIX_KEY_TYPES = ["cpf", "cnpj", "email", "telefone", "aleatoria"];
const CampaignInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(2e3).default(""),
  image_url: z.string().url().max(500).nullable(),
  pix_key: z.string().min(1).max(200),
  pix_key_type: z.enum(PIX_KEY_TYPES),
  recipient_name: z.string().min(1).max(80),
  recipient_city: z.string().min(1).max(40).default("BRASIL"),
  suggested_amounts_cents: z.array(z.number().int().min(100).max(1e8)).max(6),
  goal_cents: z.number().int().min(0).nullable(),
  active: z.boolean(),
  featured: z.boolean(),
  sort_order: z.number().int().min(0).max(9999)
});
const upsertDonationCampaign_createServerFn_handler = createServerRpc({
  id: "256d42016a62e72319c16cb2bc0fe7510a00007df272863e03d9cdfc74c09e77",
  name: "upsertDonationCampaign",
  filename: "src/lib/donations.functions.ts"
}, (opts) => upsertDonationCampaign.__executeServer(opts));
const upsertDonationCampaign = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => CampaignInput.parse(input)).handler(upsertDonationCampaign_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const row = {
    ...data,
    account_id: userId
  };
  const {
    error
  } = data.id ? await supabase.from("donation_campaigns").update(row).eq("id", data.id) : await supabase.from("donation_campaigns").insert(row);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteDonationCampaign_createServerFn_handler = createServerRpc({
  id: "7992fad4d1a022c081642c3ff7dfc32be00f28f417d8f5d1697ebc5191f9a91c",
  name: "deleteDonationCampaign",
  filename: "src/lib/donations.functions.ts"
}, (opts) => deleteDonationCampaign.__executeServer(opts));
const deleteDonationCampaign = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteDonationCampaign_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("donation_campaigns").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getDonationCampaignStats_createServerFn_handler = createServerRpc({
  id: "87037d8d19c6b09f69d9449c01a01a46c3dbaec3cad2f15eda70218bfc3c962d",
  name: "getDonationCampaignStats",
  filename: "src/lib/donations.functions.ts"
}, (opts) => getDonationCampaignStats.__executeServer(opts));
const getDonationCampaignStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getDonationCampaignStats_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: campaigns,
    error: campaignsError
  } = await supabase.from("donation_campaigns").select("id, title, goal_cents").eq("account_id", userId);
  if (campaignsError) throw new Error(campaignsError.message);
  const {
    data: donations,
    error: donationsError
  } = await supabase.from("donations").select("campaign_id, amount_cents").eq("account_id", userId).eq("status", "paid");
  if (donationsError) throw new Error(donationsError.message);
  const raisedByCampaign = /* @__PURE__ */ new Map();
  for (const d of donations ?? []) {
    if (!d.campaign_id) continue;
    raisedByCampaign.set(d.campaign_id, (raisedByCampaign.get(d.campaign_id) ?? 0) + d.amount_cents);
  }
  return (campaigns ?? []).map((c) => ({
    campaignId: c.id,
    title: c.title,
    goalCents: c.goal_cents,
    raisedCents: raisedByCampaign.get(c.id) ?? 0
  }));
});
const listDonationsByCampaign_createServerFn_handler = createServerRpc({
  id: "079ea5a3a43f69a92f2de925a8e096166a63d6c04eadbd6c11f1f686ea4f9c05",
  name: "listDonationsByCampaign",
  filename: "src/lib/donations.functions.ts"
}, (opts) => listDonationsByCampaign.__executeServer(opts));
const listDonationsByCampaign = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  campaignId: z.string().uuid()
}).parse(input)).handler(listDonationsByCampaign_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("donations").select("id, donor_name, amount_cents, status, paid_at, created_at").eq("account_id", userId).eq("campaign_id", data.campaignId).eq("status", "paid").order("paid_at", {
    ascending: false
  }).limit(50);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const getDonationsMonthlyReport_createServerFn_handler = createServerRpc({
  id: "2eefd65801379873095e5cce02aafd1864a0c52547e6048bb1dd5f4c53bc011e",
  name: "getDonationsMonthlyReport",
  filename: "src/lib/donations.functions.ts"
}, (opts) => getDonationsMonthlyReport.__executeServer(opts));
const getDonationsMonthlyReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  year: z.number().int().min(2020).max(2100)
}).parse(input)).handler(getDonationsMonthlyReport_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const start = `${data.year}-01-01T00:00:00.000Z`;
  const end = `${data.year + 1}-01-01T00:00:00.000Z`;
  const {
    data: rows,
    error
  } = await supabase.from("donations").select("amount_cents, paid_at, donor_name, campaign_id").eq("account_id", userId).eq("status", "paid").gte("paid_at", start).lt("paid_at", end).order("paid_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  const byMonth = /* @__PURE__ */ new Map();
  for (const r of rows ?? []) {
    if (!r.paid_at) continue;
    const month = new Date(r.paid_at).getUTCMonth();
    const entry = byMonth.get(month) ?? {
      count: 0,
      totalCents: 0
    };
    entry.count += 1;
    entry.totalCents += r.amount_cents;
    byMonth.set(month, entry);
  }
  return {
    rows: rows ?? [],
    monthly: Array.from({
      length: 12
    }, (_, month) => ({
      month: month + 1,
      count: byMonth.get(month)?.count ?? 0,
      totalCents: byMonth.get(month)?.totalCents ?? 0
    }))
  };
});
export {
  deleteDonationCampaign_createServerFn_handler,
  generateDonationPix_createServerFn_handler,
  getDonationCampaignStats_createServerFn_handler,
  getDonationsMonthlyReport_createServerFn_handler,
  getPublicDonationCampaign_createServerFn_handler,
  getPublicDonationReceipt_createServerFn_handler,
  getPublicDonations_createServerFn_handler,
  listDonationsByCampaign_createServerFn_handler,
  listMyDonationCampaigns_createServerFn_handler,
  upsertDonationCampaign_createServerFn_handler
};
