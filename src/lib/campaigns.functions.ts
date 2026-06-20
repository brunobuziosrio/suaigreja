/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("account_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional().nullable(),
  goal_amount_cents: z.number().int().min(0),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  pix_key: z.string().max(100).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
});

export const upsertCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      goal_amount_cents: data.goal_amount_cents,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      is_active: data.is_active ?? true,
      pix_key: data.pix_key?.trim() || null,
      sort_order: data.sort_order ?? 0,
    };
    if (data.id) {
      const { error } = await client
        .from("campaigns")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("campaigns")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("campaigns")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCampaignStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ campaignId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", data.campaignId)
      .eq("account_id", userId)
      .single();
    if (cErr) throw new Error(cErr.message);

    const { data: donations, error: dErr } = await supabase
      .from("donations")
      .select("amount_cents, status")
      .eq("campaign_id", data.campaignId)
      .eq("account_id", userId);
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
