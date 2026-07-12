// Acao Social Digital — cadastro de familias em acompanhamento
// assistencial e historico de entregas (cestas basicas, doacoes, etc).
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";

export type SocialFamilyRow = {
  id: string;
  account_id: string;
  family_name: string;
  responsible_name: string;
  phone: string | null;
  address: string | null;
  family_size: number | null;
  needs: string | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialDeliveryRow = {
  id: string;
  account_id: string;
  family_id: string;
  delivered_at: string;
  items: string;
  delivered_by: string | null;
  notes: string | null;
  created_at: string;
};

export const listSocialFamilies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("social_families" as never)
      .select("*")
      .eq("account_id", accountId)
      .order("family_name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as SocialFamilyRow[];
  });

const familySchema = z.object({
  id: z.string().uuid().optional(),
  family_name: z.string().min(1).max(160),
  responsible_name: z.string().min(1).max(160),
  phone: z.string().max(40).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  family_size: z.number().int().min(0).max(50).optional().nullable(),
  needs: z.string().max(1000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const upsertSocialFamily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => familySchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const payload = {
      family_name: data.family_name.trim(),
      responsible_name: data.responsible_name.trim(),
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      family_size: data.family_size ?? null,
      needs: data.needs?.trim() || null,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await supabase
        .from("social_families" as never)
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("social_families" as never)
      .insert({ ...payload, account_id: accountId, status: "active" } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const setSocialFamilyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "inactive"]) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { error } = await supabase
      .from("social_families" as never)
      .update({ status: data.status } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSocialFamily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { error } = await supabase
      .from("social_families" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSocialDeliveries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ family_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("social_deliveries" as never)
      .select("*")
      .eq("account_id", accountId)
      .eq("family_id", data.family_id)
      .order("delivered_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as SocialDeliveryRow[];
  });

export const listSocialDeliveriesThisMonth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const { data, error } = await supabase
      .from("social_deliveries" as never)
      .select("id")
      .eq("account_id", accountId)
      .gte("delivered_at", monthStart);
    if (error) throw new Error(error.message);
    return (data ?? []).length;
  });

const deliverySchema = z.object({
  family_id: z.string().uuid(),
  delivered_at: z.string(),
  items: z.string().min(1).max(500),
  delivered_by: z.string().max(160).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const addSocialDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => deliverySchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { data: family, error: famErr } = await supabase
      .from("social_families" as never)
      .select("id")
      .eq("id", data.family_id)
      .eq("account_id", accountId)
      .maybeSingle();
    if (famErr) throw new Error(famErr.message);
    if (!family) throw new Error("Família não encontrada nesta igreja.");

    const { error } = await supabase.from("social_deliveries" as never).insert({
      account_id: accountId,
      family_id: data.family_id,
      delivered_at: data.delivered_at,
      items: data.items.trim(),
      delivered_by: data.delivered_by?.trim() || null,
      notes: data.notes?.trim() || null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSocialDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { error } = await supabase
      .from("social_deliveries" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
