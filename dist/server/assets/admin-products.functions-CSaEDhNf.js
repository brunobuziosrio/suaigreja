import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
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
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado.");
}
const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  name: z.string().min(1).max(160),
  tagline: z.string().max(240).default(""),
  description: z.string().max(5e3).default(""),
  price_cents: z.number().int().min(0).max(1e7),
  image_url: z.string().url().nullable().optional(),
  features: z.array(z.string().min(1).max(160)).max(20).default([]),
  external_url: z.string().url().nullable().optional(),
  badge: z.string().max(40).nullable().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(1e3).default(0)
});
const adminListProducts_createServerFn_handler = createServerRpc({
  id: "65386349d6700f5b00a7ee9ee7d31022ece5f340f6221a4ee6531310b6ddc01d",
  name: "adminListProducts",
  filename: "src/lib/admin-products.functions.ts"
}, (opts) => adminListProducts.__executeServer(opts));
const adminListProducts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListProducts_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("products").select("*").order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const adminSaveProduct_createServerFn_handler = createServerRpc({
  id: "c043c96ec360e9f56ad9697fd1e3104373e5a12cee2ad4eb5bc6073a8b10ba8f",
  name: "adminSaveProduct",
  filename: "src/lib/admin-products.functions.ts"
}, (opts) => adminSaveProduct.__executeServer(opts));
const adminSaveProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => productSchema.parse(i)).handler(adminSaveProduct_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const payload = {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    price_cents: data.price_cents,
    image_url: data.image_url ?? null,
    features: data.features,
    external_url: data.external_url ?? null,
    badge: data.badge ?? null,
    active: data.active,
    featured: data.featured,
    sort_order: data.sort_order
  };
  if (data.id) {
    const {
      error
    } = await supabaseAdmin.from("products").update(payload).eq("id", data.id);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabaseAdmin.from("products").insert(payload);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const adminDeleteProduct_createServerFn_handler = createServerRpc({
  id: "7df71b07a4f1953c3a83b670761362b57ab987131317823f7e2c2b85c4524ea5",
  name: "adminDeleteProduct",
  filename: "src/lib/admin-products.functions.ts"
}, (opts) => adminDeleteProduct.__executeServer(opts));
const adminDeleteProduct = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(adminDeleteProduct_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("products").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  adminDeleteProduct_createServerFn_handler,
  adminListProducts_createServerFn_handler,
  adminSaveProduct_createServerFn_handler
};
