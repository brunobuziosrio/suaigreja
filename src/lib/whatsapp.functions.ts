/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @modified 2026-06-15
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MSG_KINDS = [
  "birthday",
  "event_reminder",
  "welcome",
  "manual",
  "culto_reminder",
  "celula_reminder",
  "prayer_request",
  "tithe_reminder",
  "newsletter",
] as const;

const SettingsInput = z.object({
  enabled: z.boolean(),
  send_hour_brt: z.number().int().min(0).max(23),
  sender_name: z.string().max(80).nullable(),
  birthday_enabled: z.boolean(),
  birthday_template: z.string().min(10).max(800),
  welcome_enabled: z.boolean(),
  welcome_template: z.string().min(10).max(800),
  culto_reminder_enabled: z.boolean(),
  culto_reminder_template: z.string().min(10).max(800),
  celula_reminder_enabled: z.boolean(),
  celula_reminder_template: z.string().min(10).max(800),
  prayer_request_enabled: z.boolean(),
  prayer_request_template: z.string().min(10).max(800),
  tithe_reminder_enabled: z.boolean(),
  tithe_reminder_template: z.string().min(10).max(800),
  newsletter_enabled: z.boolean(),
  newsletter_template: z.string().min(10).max(800),
});

export const getWhatsappData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: settings }, { data: packages }, { data: recent }, { data: counts }] =
      await Promise.all([
        supabase.from("whatsapp_settings").select("*").eq("account_id", userId).maybeSingle(),
        supabase.from("whatsapp_packages").select("*").eq("active", true).order("sort_order"),
        supabase
          .from("whatsapp_messages")
          .select(
            "id, kind, phone, recipient_name, content, status, scheduled_for, sent_at, error_message, created_at",
          )
          .eq("account_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("whatsapp_messages").select("status, kind").eq("account_id", userId),
      ]);

    const totals = (counts ?? []).reduce(
      (acc: Record<string, number>, m: any) => {
        acc[m.status] = (acc[m.status] ?? 0) + 1;
        acc[`kind_${m.kind}`] = (acc[`kind_${m.kind}`] ?? 0) + 1;
        acc.total = (acc.total ?? 0) + 1;
        return acc;
      },
      { total: 0 },
    );

    return {
      settings: settings ?? null,
      packages: packages ?? [],
      recent: recent ?? [],
      totals,
    };
  });

export const upsertWhatsappSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SettingsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("whatsapp_settings")
      .upsert({ account_id: userId, ...data }, { onConflict: "account_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteQueuedWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("whatsapp_messages")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId)
      .eq("status", "queued");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const enqueueWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        phone: z.string().min(10).max(20),
        recipient_name: z.string().max(200).nullable().optional(),
        content: z.string().min(1).max(800),
        kind: z.enum(MSG_KINDS),
        member_id: z.string().uuid().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: settings } = await supabase
      .from("whatsapp_settings")
      .select("credits_balance, enabled")
      .eq("account_id", userId)
      .maybeSingle();

    if (!settings?.enabled) throw new Error("WhatsApp não está ativado nas configurações gerais.");
    if ((settings?.credits_balance ?? 0) < 1)
      throw new Error("Créditos insuficientes. Adquira mais créditos para continuar.");

    const phone = String(data.phone).replace(/\D/g, "");
    if (phone.length < 10) throw new Error("Número de telefone inválido (mínimo 10 dígitos com DDD).");

    const { error } = await supabase.from("whatsapp_messages").insert({
      account_id: userId,
      member_id: data.member_id ?? null,
      kind: data.kind,
      phone,
      recipient_name: data.recipient_name ?? null,
      content: data.content,
      status: "queued",
      scheduled_for: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });
