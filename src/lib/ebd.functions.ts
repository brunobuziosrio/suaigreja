import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";

export const listEbdClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("ebd_classes")
      .select("*")
      .eq("account_id", userId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const classSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  teacher_name: z.string().max(120).optional().nullable(),
  weekday: z.number().int().min(0).max(6).nullable().optional(),
  start_time: z.string().optional().nullable(),
  age_range: z.string().max(40).optional().nullable(),
  active: z.boolean().optional(),
});

export const upsertEbdClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => classSchema.parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      teacher_name: data.teacher_name?.trim() || null,
      weekday: data.weekday ?? null,
      start_time: data.start_time || null,
      age_range: data.age_range || null,
      active: data.active ?? true,
    };
    if (data.id) {
      const { error } = await supabase
        .from("ebd_classes")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("ebd_classes")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteEbdClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("ebd_classes")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ class_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("ebd_enrollments")
      .select("*, members(id, full_name, photo_url)")
      .eq("account_id", userId)
      .eq("class_id", data.class_id);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      class_id: z.string().uuid(),
      member_id: z.string().uuid(),
      enroll: z.boolean(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    if (data.enroll) {
      const { error } = await supabase.from("ebd_enrollments").insert({
        account_id: userId,
        class_id: data.class_id,
        member_id: data.member_id,
      } as any);
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("ebd_enrollments")
        .delete()
        .eq("account_id", userId)
        .eq("class_id", data.class_id)
        .eq("member_id", data.member_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const recordAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      class_id: z.string().uuid(),
      attendance_date: z.string(),
      entries: z.array(z.object({
        member_id: z.string().uuid(),
        present: z.boolean(),
      })).min(1).max(500),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    // upsert each entry
    for (const e of data.entries) {
      await supabase.from("ebd_attendance").delete()
        .eq("account_id", userId)
        .eq("class_id", data.class_id)
        .eq("member_id", e.member_id)
        .eq("attendance_date", data.attendance_date);
      const { error } = await supabase.from("ebd_attendance").insert({
        account_id: userId,
        class_id: data.class_id,
        member_id: e.member_id,
        attendance_date: data.attendance_date,
        present: e.present,
      } as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getAttendanceStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceStr = since.toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("ebd_attendance")
      .select("present, attendance_date")
      .eq("account_id", userId)
      .gte("attendance_date", sinceStr);
    if (error) throw new Error(error.message);
    const total = data?.length ?? 0;
    const present = data?.filter((r) => r.present).length ?? 0;
    return {
      total,
      present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

export const getAttendanceForDate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    class_id: z.string().uuid(),
    attendance_date: z.string(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "premium");
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("ebd_attendance")
      .select("member_id, present")
      .eq("account_id", userId)
      .eq("class_id", data.class_id)
      .eq("attendance_date", data.attendance_date);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
