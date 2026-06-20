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

export const listVolunteerSchedules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabase
      .from("volunteer_schedules")
      .select("*, volunteer_shifts(*)")
      .eq("account_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const scheduleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional().nullable(),
  volunteer_type: z.string().min(1).max(100),
  is_active: z.boolean().optional().default(true),
  notes: z.string().max(500).optional().nullable(),
});

export const upsertVolunteerSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => scheduleSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      volunteer_type: data.volunteer_type.trim(),
      is_active: data.is_active ?? true,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await client
        .from("volunteer_schedules")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("volunteer_schedules")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteVolunteerSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("volunteer_schedules")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listVolunteerShifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ scheduleId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: shifts, error } = await supabase
      .from("volunteer_shifts")
      .select("*, members(full_name, phone, email), schedule:volunteer_schedules(name)")
      .eq("schedule_id", data.scheduleId)
      .order("shift_date", { ascending: true })
      .order("shift_start_time", { ascending: true });
    if (error) throw new Error(error.message);
    return shifts ?? [];
  });

const shiftSchema = z.object({
  id: z.string().uuid().optional(),
  schedule_id: z.string().uuid(),
  member_id: z.string().uuid(),
  shift_date: z.string(),
  shift_start_time: z.string(),
  shift_end_time: z.string().optional().nullable(),
  confirmed: z.boolean().optional().default(false),
  confirmed_at: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const upsertVolunteerShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => shiftSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const payload = {
      schedule_id: data.schedule_id,
      member_id: data.member_id,
      shift_date: data.shift_date,
      shift_start_time: data.shift_start_time,
      shift_end_time: data.shift_end_time || null,
      confirmed: data.confirmed ?? false,
      confirmed_at: data.confirmed_at || null,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await client
        .from("volunteer_shifts")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("volunteer_shifts")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteVolunteerShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("volunteer_shifts")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const confirmVolunteerShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("volunteer_shifts")
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestVolunteerReplacement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      shiftId: z.string().uuid(),
      reason: z.string().max(500).optional().nullable(),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const { supabase: client, userId } = context;
    const { error } = await client
      .from("volunteer_shifts")
      .update({
        confirmed: false,
        confirmed_at: null,
        notes: data.reason || "Solicitou substituição",
      } as any)
      .eq("id", data.shiftId)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
