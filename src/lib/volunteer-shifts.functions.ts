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

export const listVolunteerSchedules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("volunteer_schedules")
      .select("id, name, description, volunteer_type, is_active, notes, created_at, updated_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const scheduleSchema = z.object({
  id: optionalUuid,
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional().nullable(),
  volunteer_type: z.string().min(1).max(100),
  is_active: z.boolean().optional().default(true),
  notes: z.string().max(500).optional().nullable(),
});

export const upsertVolunteerSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => scheduleSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", data.id ? "edit" : "create");
    const { supabase: client } = context;
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
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("volunteer_schedules")
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const deleteVolunteerSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "delete");
    const { supabase: client } = context;
    const { error } = await client
      .from("volunteer_schedules")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listVolunteerShifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ scheduleId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "view");
    const { supabase } = context;
    const { data: shifts, error } = await supabase
      .from("volunteer_shifts")
      .select("*, members(full_name, phone, email), schedule:volunteer_schedules(name)")
      .eq("schedule_id", data.scheduleId)
      .eq("account_id", accountId)
      .order("shift_date", { ascending: true })
      .order("shift_start_time", { ascending: true });
    if (error) throw new Error(error.message);
    return shifts ?? [];
  });

const shiftSchema = z.object({
  id: optionalUuid,
  schedule_id: z.string().uuid(),
  member_id: z.string().uuid(),
  shift_date: z.string(),
  shift_start_time: z.string(),
  shift_end_time: z.string().optional().nullable(),
  confirmed: z.boolean().optional().default(false),
  confirmed_at: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

type VolunteerUnavailabilityConflict = {
  start_date: string;
  end_date: string;
  reason: string | null;
};

type VolunteerUnavailabilityQuery = {
  select(columns: string): VolunteerUnavailabilityQuery;
  eq(column: string, value: string): VolunteerUnavailabilityQuery;
  lte(column: string, value: string): VolunteerUnavailabilityQuery;
  gte(column: string, value: string): VolunteerUnavailabilityQuery;
  limit(count: number): Promise<{
    data: VolunteerUnavailabilityConflict[] | null;
    error: { message: string } | null;
  }>;
};

type VolunteerSupabase = {
  from(table: string): VolunteerUnavailabilityQuery;
};

async function assertMemberAvailable(
  supabase: VolunteerSupabase,
  accountId: string,
  memberId: string,
  shiftDate: string,
) {
  const { data, error } = await supabase
    .from("volunteer_unavailability" as never)
    .select("start_date, end_date, reason")
    .eq("account_id", accountId)
    .eq("member_id", memberId)
    .lte("start_date", shiftDate)
    .gte("end_date", shiftDate)
    .limit(1);
  if (error) throw new Error(error.message);
  const conflict = data?.[0];
  if (conflict) {
    const period =
      conflict.start_date === conflict.end_date
        ? new Date(`${conflict.start_date}T00:00:00`).toLocaleDateString("pt-BR")
        : `${new Date(`${conflict.start_date}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${conflict.end_date}T00:00:00`).toLocaleDateString("pt-BR")}`;
    throw new Error(
      `Este voluntário marcou indisponibilidade em ${period}${conflict.reason ? ` (${conflict.reason})` : ""}. Remova o bloqueio ou escolha outro voluntário/data.`,
    );
  }
}

export const upsertVolunteerShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => shiftSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", data.id ? "edit" : "create");
    const { supabase: client } = context;
    await assertMemberAvailable(
      client as unknown as VolunteerSupabase,
      accountId,
      data.member_id,
      data.shift_date,
    );
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
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("volunteer_shifts")
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const deleteVolunteerShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "delete");
    const { supabase: client } = context;
    const { error } = await client
      .from("volunteer_shifts")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const confirmVolunteerShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "edit");
    const { supabase: client } = context;
    const { error } = await client
      .from("volunteer_shifts")
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
      } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestVolunteerReplacement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) =>
    z
      .object({
        shiftId: z.string().uuid(),
        reason: z.string().max(500).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "edit");
    const { supabase: client } = context;
    const { error } = await client
      .from("volunteer_shifts")
      .update({
        confirmed: false,
        confirmed_at: null,
        notes: data.reason || "Solicitou substituição",
      } as never)
      .eq("id", data.shiftId)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type VolunteerUnavailabilityRow = {
  id: string;
  account_id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
  members?: { full_name: string } | null;
};

export const listVolunteerUnavailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("volunteer_unavailability" as never)
      .select("*, members(full_name)")
      .eq("account_id", accountId)
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as VolunteerUnavailabilityRow[];
  });

const unavailabilitySchema = z.object({
  member_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string().max(300).optional().nullable(),
});

export const addVolunteerUnavailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => unavailabilitySchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "create");
    const { supabase } = context;
    if (new Date(data.end_date).getTime() < new Date(data.start_date).getTime()) {
      throw new Error("A data final precisa ser igual ou depois da data inicial.");
    }
    const { error } = await supabase.from("volunteer_unavailability" as never).insert({
      account_id: accountId,
      member_id: data.member_id,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason?.trim() || null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVolunteerUnavailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("volunteer_unavailability" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Usado no alerta "O que fazer hoje" do Dashboard -- turnos dos proximos
// 7 dias que ninguem confirmou ainda, cruzando todas as escalas da conta
// (nao precisa de scheduleId como listVolunteerShifts).
export const listUpcomingUnconfirmedShifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/escalas");
    await requirePermission(context, "volunteer_shifts", "view");
    const { supabase } = context;
    const today = new Date();
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    const pad = (n: number) => String(n).padStart(2, "0");
    const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const { data, error } = await supabase
      .from("volunteer_shifts")
      .select("id, shift_date, members(full_name), schedule:volunteer_schedules(name)")
      .eq("account_id", accountId)
      .eq("confirmed", false)
      .gte("shift_date", toIso(today))
      .lte("shift_date", toIso(in7Days))
      .order("shift_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
