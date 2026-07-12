// Patrimonio e Manutencao — cadastro de equipamentos/instrumentos, local
// de guarda, responsavel atual (emprestimo) e status de manutencao.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";

export const ASSET_CATEGORIES = [
  "instrumento",
  "som",
  "projecao",
  "moveis",
  "informatica",
  "outro",
] as const;
export const ASSET_STATUSES = ["available", "loaned", "maintenance", "retired"] as const;

export type AssetRow = {
  id: string;
  account_id: string;
  name: string;
  category: (typeof ASSET_CATEGORIES)[number];
  photo_url: string | null;
  serial_or_invoice: string | null;
  location_id: string | null;
  status: (typeof ASSET_STATUSES)[number];
  holder_member_id: string | null;
  loaned_at: string | null;
  acquired_at: string | null;
  value_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  locations?: { name: string } | null;
  members?: { full_name: string } | null;
};

export const listAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("assets" as never)
      .select("*, locations(name), members(full_name)")
      .eq("account_id", accountId)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AssetRow[];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  category: z.enum(ASSET_CATEGORIES),
  photo_url: z.string().max(800).optional().nullable(),
  serial_or_invoice: z.string().max(120).optional().nullable(),
  location_id: z.string().uuid().nullable().optional(),
  acquired_at: z.string().optional().nullable(),
  value_cents: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

const assetIdSchema = z.object({ id: z.string().uuid() });

export const upsertAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const payload = {
      name: data.name.trim(),
      category: data.category,
      photo_url: data.photo_url || null,
      serial_or_invoice: data.serial_or_invoice?.trim() || null,
      location_id: data.location_id || null,
      acquired_at: data.acquired_at || null,
      value_cents: data.value_cents ?? null,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await supabase
        .from("assets" as never)
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("assets" as never)
      .insert({ ...payload, account_id: accountId, status: "available" } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const deleteAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => assetIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { error } = await supabase
      .from("assets" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const loanSchema = z.object({
  id: z.string().uuid(),
  holder_member_id: z.string().uuid(),
});

export const loanAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => loanSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { error } = await supabase
      .from("assets" as never)
      .update({
        status: "loaned",
        holder_member_id: data.holder_member_id,
        loaned_at: new Date().toISOString().slice(0, 10),
      } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const returnAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => assetIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const { error } = await supabase
      .from("assets" as never)
      .update({ status: "available", holder_member_id: null, loaned_at: null } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAssetMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["maintenance", "available", "retired"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    const { supabase } = context;
    const payload = { status: data.status, holder_member_id: null, loaned_at: null };
    const { error } = await supabase
      .from("assets" as never)
      .update(payload as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
