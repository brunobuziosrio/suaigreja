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

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  name: z.string().min(1).max(160),
  tagline: z.string().max(240).default(""),
  description: z.string().max(5000).default(""),
  price_cents: z.number().int().min(0).max(10_000_000),
  image_url: z.string().url().nullable().optional(),
  features: z.array(z.string().min(1).max(160)).max(20).default([]),
  external_url: z.string().url().nullable().optional(),
  badge: z.string().max(40).nullable().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => productSchema.parse(i))
  .handler(async ({ data, context }) => {
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
      sort_order: data.sort_order,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("products").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });