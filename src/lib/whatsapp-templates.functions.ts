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

export const listWhatsappTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabase
      .from("whatsapp_template_library")
      .select("*")
      .eq("account_id", userId)
      .order("kind", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const templateSchema = z.object({
  id: z.string().uuid().optional().nullable().transform(v => v || undefined),
  name: z.string().min(1).max(160),
  kind: z.string().min(1).max(50),
  content: z.string().min(10).max(800),
  preview: z.string().max(200).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const upsertWhatsappTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => templateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const payload = {
      name: data.name.trim(),
      kind: data.kind.trim(),
      content: data.content.trim(),
      preview: data.preview?.trim() || null,
      is_active: data.is_active ?? true,
    };
    if (data.id) {
      const { error } = await client
        .from("whatsapp_template_library")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("whatsapp_template_library")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteWhatsappTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("whatsapp_template_library")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listWhatsappAutomationRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabase
      .from("whatsapp_automation_rules")
      .select("*, template:whatsapp_template_library(name, content)")
      .eq("account_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const automationSchema = z.object({
  id: z.string().uuid().optional().nullable().transform(v => v || undefined),
  name: z.string().min(1).max(160),
  trigger_type: z.string().min(1).max(50),
  template_id: z.string().uuid().nullable().optional(),
  custom_content: z.string().max(800).optional().nullable(),
  is_active: z.boolean().optional().default(false),
  send_hour_brt: z.number().int().min(0).max(23).optional().default(9),
  days_offset: z.number().int().min(-30).max(30).optional().default(0),
});

export const upsertWhatsappAutomationRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => automationSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const payload = {
      name: data.name.trim(),
      trigger_type: data.trigger_type.trim(),
      template_id: data.template_id || null,
      custom_content: data.custom_content?.trim() || null,
      is_active: data.is_active ?? false,
      send_hour_brt: data.send_hour_brt ?? 9,
      days_offset: data.days_offset ?? 0,
    };
    if (data.id) {
      const { error } = await client
        .from("whatsapp_automation_rules")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("whatsapp_automation_rules")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteWhatsappAutomationRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("whatsapp_automation_rules")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
