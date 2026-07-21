import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireModuleAccess } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export const listEbdClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("ebd_classes")
      .select("*")
      .eq("account_id", accountId)
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

const idSchema = z.object({ id: z.string().uuid() });
const classIdSchema = z.object({ class_id: z.string().uuid() });
const enrollmentSchema = z.object({
  class_id: z.string().uuid(),
  member_id: z.string().uuid(),
  enroll: z.boolean(),
});
const attendanceDateSchema = z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string(),
});
const attendanceSchema = z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string(),
  entries: z
    .array(
      z.object({
        member_id: z.string().uuid(),
        present: z.boolean(),
      }),
    )
    .min(1)
    .max(500),
});

export const upsertEbdClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => classSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", data.id ? "edit" : "create");
    const { supabase } = context;
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
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("ebd_classes")
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteEbdClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("ebd_classes")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => classIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "view");
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("ebd_enrollments")
      .select("*, members(id, full_name, photo_url)")
      .eq("account_id", accountId)
      .eq("class_id", data.class_id);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => enrollmentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "edit");
    const { supabase } = context;
    if (data.enroll) {
      const { error } = await supabase.from("ebd_enrollments").insert({
        account_id: accountId,
        class_id: data.class_id,
        member_id: data.member_id,
      } as never);
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("ebd_enrollments")
        .delete()
        .eq("account_id", accountId)
        .eq("class_id", data.class_id)
        .eq("member_id", data.member_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const recordAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => attendanceSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "edit");
    const { supabase } = context;
    // upsert each entry
    for (const e of data.entries) {
      await supabase
        .from("ebd_attendance")
        .delete()
        .eq("account_id", accountId)
        .eq("class_id", data.class_id)
        .eq("member_id", e.member_id)
        .eq("attendance_date", data.attendance_date);
      const { error } = await supabase.from("ebd_attendance").insert({
        account_id: accountId,
        class_id: data.class_id,
        member_id: e.member_id,
        attendance_date: data.attendance_date,
        present: e.present,
      } as never);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getAttendanceStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "view");
    const { supabase } = context;
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceStr = since.toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("ebd_attendance")
      .select("present, attendance_date")
      .eq("account_id", accountId)
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
  .validator((input) => attendanceDateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/ebd");
    await requirePermission(context, "education", "view");
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("ebd_attendance")
      .select("member_id, present")
      .eq("account_id", accountId)
      .eq("class_id", data.class_id)
      .eq("attendance_date", data.attendance_date);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
