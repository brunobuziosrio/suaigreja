import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn, a as getRequestHost } from "./server-aNfUBU9s.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { r as resolveAtivoPayApiKey } from "./admin-payment-settings.functions-DPCtUTO2.js";
import QRCode from "qrcode";
import { z } from "zod";
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
const ATIVOPAY_BASE_URL = "https://api-gateway.ativopay.com";
function slugify(input) {
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}
const EventPageInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(5e3).default(""),
  cover_image_url: z.string().url().nullable().optional(),
  event_date: z.string().min(10).max(10),
  start_time: z.string().min(5).max(8),
  end_time: z.string().min(5).max(8).nullable().optional(),
  location_name: z.string().max(200).default(""),
  location_address: z.string().max(300).nullable().optional(),
  price_cents: z.number().int().min(0).max(1e6),
  max_attendees: z.number().int().min(0).nullable().optional(),
  allow_free: z.boolean().default(true),
  active: z.boolean().default(true),
  primary_color: z.string().max(20).default("#467da5"),
  whatsapp_contact: z.string().max(40).nullable().optional(),
  slug: z.string().max(80).optional()
});
const listEventPages_createServerFn_handler = createServerRpc({
  id: "18f75a4b6606747bfe37901a1d64507e9d468b34c5dfc4992c6bb7beefd72ae5",
  name: "listEventPages",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => listEventPages.__executeServer(opts));
const listEventPages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listEventPages_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("event_pages").select("*").eq("account_id", userId).order("event_date", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((e) => e.id);
  const counts = {};
  if (ids.length > 0) {
    const {
      data: regs
    } = await supabase.from("event_registrations").select("event_page_id, status").in("event_page_id", ids);
    for (const r of regs ?? []) {
      const c = counts[r.event_page_id] ?? {
        total: 0,
        paid: 0
      };
      c.total += 1;
      if (r.status === "paid" || r.status === "confirmed") c.paid += 1;
      counts[r.event_page_id] = c;
    }
  }
  return (data ?? []).map((e) => ({
    ...e,
    _counts: counts[e.id] ?? {
      total: 0,
      paid: 0
    }
  }));
});
const saveEventPage_createServerFn_handler = createServerRpc({
  id: "3c88e63965157bf211fa6180dfade4e139ed6da899205b0d9c33ee9f5dd531f2",
  name: "saveEventPage",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => saveEventPage.__executeServer(opts));
const saveEventPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventPageInput.parse(input)).handler(saveEventPage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let slug = data.slug && data.slug.length > 2 ? slugify(data.slug) : slugify(data.title);
  if (!slug) slug = Math.random().toString(36).slice(2, 8);
  if (!data.id) {
    let candidate = slug;
    let n = 1;
    while (true) {
      const {
        data: existing
      } = await supabaseAdmin.from("event_pages").select("id").eq("slug", candidate).maybeSingle();
      if (!existing) break;
      n += 1;
      candidate = `${slug}-${n}`;
      if (n > 50) {
        candidate = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        break;
      }
    }
    slug = candidate;
  }
  const payload = {
    account_id: userId,
    slug,
    title: data.title,
    description: data.description,
    cover_image_url: data.cover_image_url ?? null,
    event_date: data.event_date,
    start_time: data.start_time,
    end_time: data.end_time ?? null,
    location_name: data.location_name,
    location_address: data.location_address ?? null,
    price_cents: data.price_cents,
    max_attendees: data.max_attendees ?? null,
    allow_free: data.allow_free,
    active: data.active,
    primary_color: data.primary_color,
    whatsapp_contact: data.whatsapp_contact ?? null
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("event_pages").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id,
      slug
    };
  }
  const {
    data: inserted,
    error
  } = await supabase.from("event_pages").insert(payload).select("id, slug").single();
  if (error) throw new Error(error.message);
  return inserted;
});
const deleteEventPage_createServerFn_handler = createServerRpc({
  id: "ea23eec6d66b416a2e273b490a2fb8f07c8eb2a9c1d5d1665d1f060bb377c931",
  name: "deleteEventPage",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => deleteEventPage.__executeServer(opts));
const deleteEventPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteEventPage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("event_pages").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listEventRegistrations_createServerFn_handler = createServerRpc({
  id: "129f9f8bed05d7e2261e8327f43116d10056f5d3e550267d5fee438d14323f19",
  name: "listEventRegistrations",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => listEventRegistrations.__executeServer(opts));
const listEventRegistrations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventPageId: z.string().uuid()
}).parse(input)).handler(listEventRegistrations_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: regs,
    error
  } = await supabase.from("event_registrations").select("id, name, email, phone, amount_cents, status, paid_at, notes, created_at, transaction_id").eq("event_page_id", data.eventPageId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return regs ?? [];
});
const getRegistrationPayment_createServerFn_handler = createServerRpc({
  id: "351ffc6fd93f5e4fceb008f915473d11e5ed1acc4570a9726ee7cc26e5fefcbd",
  name: "getRegistrationPayment",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => getRegistrationPayment.__executeServer(opts));
const getRegistrationPayment = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  registrationId: z.string().uuid()
}).parse(input)).handler(getRegistrationPayment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: reg
  } = await supabase.from("event_registrations").select("id, transaction_id, amount_cents, status").eq("id", data.registrationId).maybeSingle();
  if (!reg) throw new Error("Inscrição não encontrada.");
  if (!reg.transaction_id) return {
    copyPaste: null,
    qrCodeImage: null,
    payUrl: null,
    status: reg.status
  };
  const {
    data: tx
  } = await supabase.from("payment_transactions").select("copy_paste, qr_code, pay_url, status").eq("id", reg.transaction_id).maybeSingle();
  return {
    copyPaste: tx?.copy_paste ?? null,
    qrCodeImage: tx?.qr_code ?? null,
    payUrl: tx?.pay_url ?? null,
    status: tx?.status ?? reg.status
  };
});
const getPublicEventPage_createServerFn_handler = createServerRpc({
  id: "65cb4918752aab1517a2ca65b68dd3b02e470fb48c5d92a5dbedb52e4be449b3",
  name: "getPublicEventPage",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => getPublicEventPage.__executeServer(opts));
const getPublicEventPage = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").slice(0, 80).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(getPublicEventPage_createServerFn_handler, async ({
  data
}) => {
  const {
    data: page
  } = await supabaseAdmin.from("event_pages").select("id, account_id, slug, title, description, cover_image_url, event_date, start_time, end_time, location_name, location_address, price_cents, max_attendees, allow_free, active, primary_color, whatsapp_contact").eq("slug", data.slug).maybeSingle();
  if (!page || !page.active) return null;
  const {
    count
  } = await supabaseAdmin.from("event_registrations").select("id", {
    count: "exact",
    head: true
  }).eq("event_page_id", page.id).in("status", ["paid", "confirmed"]);
  const {
    data: account
  } = await supabaseAdmin.from("accounts").select("site_id, custom_slug, brand_title").eq("id", page.account_id).maybeSingle();
  return {
    ...page,
    confirmed_count: count ?? 0,
    account_slug: account?.custom_slug || account?.site_id || "",
    brand_title: account?.brand_title || "Evento"
  };
});
const listPublicEventsBySite_createServerFn_handler = createServerRpc({
  id: "e5a23320874be81a91206b2972b53c0677757ddab1fe8a51dab375881a4ea6d1",
  name: "listPublicEventsBySite",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => listPublicEventsBySite.__executeServer(opts));
const listPublicEventsBySite = createServerFn({
  method: "GET"
}).inputValidator((input) => {
  const slug = String(input?.slug || "").slice(0, 120).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("invalid slug");
  return {
    slug
  };
}).handler(listPublicEventsBySite_createServerFn_handler, async ({
  data
}) => {
  const {
    data: account
  } = await supabaseAdmin.from("accounts").select("id, site_id, custom_slug, brand_title, primary_color, hub_show_events").or(`custom_slug.eq.${data.slug},site_id.eq.${data.slug}`).maybeSingle();
  if (!account) return null;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: events
  } = await supabaseAdmin.from("event_pages").select("id, slug, title, description, event_date, start_time, location_name, cover_image_url, price_cents").eq("account_id", account.id).eq("active", true).gte("event_date", today).order("event_date", {
    ascending: true
  }).limit(60);
  return {
    account,
    events: events ?? []
  };
});
const RegisterInput = z.object({
  slug: z.string().max(80),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional()
});
const registerForEvent_createServerFn_handler = createServerRpc({
  id: "d4b21eceb526d8f801cb53277218b45973ec8daf63e13809efbfe42a1143a8a9",
  name: "registerForEvent",
  filename: "src/lib/event-pages.functions.ts"
}, (opts) => registerForEvent.__executeServer(opts));
const registerForEvent = createServerFn({
  method: "POST"
}).inputValidator((input) => RegisterInput.parse(input)).handler(registerForEvent_createServerFn_handler, async ({
  data
}) => {
  const slug = data.slug.toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("Slug inválido.");
  const {
    data: page
  } = await supabaseAdmin.from("event_pages").select("id, account_id, title, price_cents, allow_free, active, max_attendees").eq("slug", slug).maybeSingle();
  if (!page || !page.active) throw new Error("Evento indisponível.");
  if (page.max_attendees && page.max_attendees > 0) {
    const {
      count
    } = await supabaseAdmin.from("event_registrations").select("id", {
      count: "exact",
      head: true
    }).eq("event_page_id", page.id).in("status", ["paid", "confirmed", "pending"]);
    if ((count ?? 0) >= page.max_attendees) {
      throw new Error("As vagas para este evento se esgotaram.");
    }
  }
  const isFree = page.price_cents === 0 || page.allow_free;
  const status = isFree && page.price_cents === 0 ? "confirmed" : "pending";
  const {
    data: reg,
    error
  } = await supabaseAdmin.from("event_registrations").insert({
    event_page_id: page.id,
    account_id: page.account_id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    notes: data.notes ?? null,
    amount_cents: page.price_cents,
    status,
    paid_at: status === "confirmed" ? (/* @__PURE__ */ new Date()).toISOString() : null
  }).select("id").single();
  if (error) throw new Error(error.message);
  if (page.price_cents === 0) {
    return {
      registrationId: reg.id,
      status: "confirmed",
      payment: null
    };
  }
  const apiKey = await resolveAtivoPayApiKey();
  if (!apiKey) {
    return {
      registrationId: reg.id,
      status: "pending",
      payment: null,
      message: "Inscrição registrada. Pagamento será confirmado manualmente pelo organizador."
    };
  }
  const host = getRequestHost();
  const protocol = host?.includes("localhost") ? "http" : "https";
  const postbackUrl = `${protocol}://${host}/api/public/ativopay-webhook`;
  const response = await fetch(`${ATIVOPAY_BASE_URL}/api/user/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "AtivoB2B/1.0",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      pix: {
        expiresInDays: 1
      },
      items: [{
        title: `Inscrição: ${page.title}`,
        quantity: 1,
        tangible: false,
        unitPrice: page.price_cents,
        externalRef: `evt-${page.id}`
      }],
      amount: page.price_cents,
      currency: "BRL",
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone?.replace(/\D/g, "") || "11999999999",
        document: {
          type: "CPF",
          number: "00000000000"
        }
      },
      metadata: JSON.stringify({
        kind: "event_registration",
        accountId: page.account_id,
        registrationId: reg.id,
        eventPageId: page.id
      }),
      traceable: false,
      externalRef: `evt:${reg.id}:${Date.now()}`,
      postbackUrl,
      paymentMethod: "PIX"
    })
  });
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(raw?.message ?? "Não foi possível gerar o PIX.");
  }
  const payment = raw.data ?? raw;
  const pay = payment;
  const pix = pay.pix && typeof pay.pix === "object" ? pay.pix : {};
  const copyPaste = typeof pix.qrcode === "string" && pix.qrcode || typeof pay.qrCode === "string" && pay.qrCode || typeof pay.copyPaste === "string" && pay.copyPaste || null;
  const qrCodeImage = copyPaste ? await QRCode.toDataURL(copyPaste, {
    margin: 1,
    width: 280
  }) : null;
  const {
    data: tx
  } = await supabaseAdmin.from("payment_transactions").insert({
    account_id: page.account_id,
    kind: "event_registration",
    amount_cents: page.price_cents,
    status: String(pay.status ?? "pending").toLowerCase(),
    ativopay_transaction_id: typeof pay.id === "string" ? pay.id : null,
    copy_paste: copyPaste,
    qr_code: qrCodeImage,
    pay_url: typeof pay.payUrl === "string" && pay.payUrl || null,
    expires_at: typeof pix.expirationDate === "string" && pix.expirationDate || null,
    raw_response: raw
  }).select("id").single();
  if (tx?.id) {
    await supabaseAdmin.from("event_registrations").update({
      transaction_id: tx.id
    }).eq("id", reg.id);
  }
  return {
    registrationId: reg.id,
    status: "pending",
    payment: {
      copyPaste,
      qrCodeImage,
      amountCents: page.price_cents,
      payUrl: typeof pay.payUrl === "string" && pay.payUrl || null
    }
  };
});
export {
  deleteEventPage_createServerFn_handler,
  getPublicEventPage_createServerFn_handler,
  getRegistrationPayment_createServerFn_handler,
  listEventPages_createServerFn_handler,
  listEventRegistrations_createServerFn_handler,
  listPublicEventsBySite_createServerFn_handler,
  registerForEvent_createServerFn_handler,
  saveEventPage_createServerFn_handler
};
