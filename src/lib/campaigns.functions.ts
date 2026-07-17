/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireModuleAccess } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

// String vazia ("") vinda do formulário de registro novo nao e nem
// undefined nem null, entao .optional().nullable() nao intercepta antes
// da checagem .uuid() -- precisa normalizar ANTES via preprocess.
// Ver memoria fix_uuid_validation.md.
const optionalUuid = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().uuid().optional(),
);

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context, "/campanhas");
    await requirePermission(context, "campaigns", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("campaigns")
      .select(
        "id, name, description, goal_amount_cents, current_amount_cents, start_date, end_date, is_active, pix_key, sort_order, created_at, updated_at",
      )
      .eq("account_id", accountId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: optionalUuid,
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional().nullable(),
  goal_amount_cents: z.number().int().min(0),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  pix_key: z.string().max(100).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
});

type CampaignPayload = {
  name: string;
  description: string | null;
  goal_amount_cents: number;
  start_date?: string;
  end_date: string | null;
  is_active: boolean;
  pix_key: string | null;
  sort_order: number;
};

export const upsertCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context, "/campanhas");
    await requirePermission(context, "campaigns", data.id ? "edit" : "create");
    const { supabase: client } = context;
    const payload: CampaignPayload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      goal_amount_cents: data.goal_amount_cents,
      // start_date e NOT NULL com default CURRENT_DATE no banco -- so o
      // default se aplica quando a coluna e omitida do INSERT, nao quando
      // recebe null explicito. undefined vira ausencia de chave no JSON.
      ...(data.start_date ? { start_date: data.start_date } : {}),
      end_date: data.end_date || null,
      is_active: data.is_active ?? true,
      pix_key: data.pix_key?.trim() || null,
      sort_order: data.sort_order ?? 0,
    };
    if (data.id) {
      const { error } = await client
        .from("campaigns")
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("campaigns")
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context, "/campanhas");
    await requirePermission(context, "campaigns", "delete");
    const { supabase: client } = context;
    const { error } = await client
      .from("campaigns")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCampaignStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ campaignId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context, "/campanhas");
    await requirePermission(context, "campaigns", "view");
    const { supabase } = context;
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", data.campaignId)
      .eq("account_id", accountId)
      .single();
    if (cErr) throw new Error(cErr.message);

    const { data: donations, error: dErr } = await supabase
      .from("donations")
      .select("amount_cents, status")
      .eq("campaign_id", data.campaignId)
      .eq("account_id", accountId);
    if (dErr) throw new Error(dErr.message);

    const totalDonated = (donations ?? [])
      .filter((d) => d.status === "paid")
      .reduce((sum, d) => sum + d.amount_cents, 0);

    return {
      campaign,
      totalDonated,
      percentReached: campaign?.goal_amount_cents
        ? Math.round((totalDonated / campaign.goal_amount_cents) * 100)
        : 0,
    };
  });
