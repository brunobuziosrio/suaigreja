import { c as createServerRpc } from "./createServerRpc-C_8Vdjgs.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
const listEbdClasses_createServerFn_handler = createServerRpc({
  id: "ef72a764d07151b7316b4ae331c9166ebe913dab38a63095ca0c4726f0b1d6a9",
  name: "listEbdClasses",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => listEbdClasses.__executeServer(opts));
const listEbdClasses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listEbdClasses_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("ebd_classes").select("*").eq("account_id", userId).order("sort_order", {
    ascending: true
  }).order("name", {
    ascending: true
  });
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
  active: z.boolean().optional()
});
const upsertEbdClass_createServerFn_handler = createServerRpc({
  id: "4743b930ba36aad65ce5e1b70840d533085e526195d6d6b8083d6a25cc4034a4",
  name: "upsertEbdClass",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => upsertEbdClass.__executeServer(opts));
const upsertEbdClass = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => classSchema.parse(i)).handler(upsertEbdClass_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payload = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    teacher_name: data.teacher_name?.trim() || null,
    weekday: data.weekday ?? null,
    start_time: data.start_time || null,
    age_range: data.age_range || null,
    active: data.active ?? true
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("ebd_classes").update(payload).eq("id", data.id).eq("account_id", userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("ebd_classes").insert({
    ...payload,
    account_id: userId
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteEbdClass_createServerFn_handler = createServerRpc({
  id: "04faf4c4a0e2edce2f423d8c9636b5c5557cba2527599165ce84be309e6080ba",
  name: "deleteEbdClass",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => deleteEbdClass.__executeServer(opts));
const deleteEbdClass = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  id: z.string().uuid()
}).parse(i)).handler(deleteEbdClass_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("ebd_classes").delete().eq("id", data.id).eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listEnrollments_createServerFn_handler = createServerRpc({
  id: "3381839750ac935343d825f770b53a5a03071fd4f8e93d4065288be7bd4d760a",
  name: "listEnrollments",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => listEnrollments.__executeServer(opts));
const listEnrollments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid()
}).parse(i)).handler(listEnrollments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("ebd_enrollments").select("*, members(id, full_name, photo_url)").eq("account_id", userId).eq("class_id", data.class_id);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const setEnrollment_createServerFn_handler = createServerRpc({
  id: "d0ac6a5d4a4bf41fc45a95f8d623b1b88943f5e2a7254fa6edbb28aa4b1b5885",
  name: "setEnrollment",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => setEnrollment.__executeServer(opts));
const setEnrollment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid(),
  member_id: z.string().uuid(),
  enroll: z.boolean()
}).parse(i)).handler(setEnrollment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (data.enroll) {
    const {
      error
    } = await supabase.from("ebd_enrollments").insert({
      account_id: userId,
      class_id: data.class_id,
      member_id: data.member_id
    });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabase.from("ebd_enrollments").delete().eq("account_id", userId).eq("class_id", data.class_id).eq("member_id", data.member_id);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const recordAttendance_createServerFn_handler = createServerRpc({
  id: "79466d9522d15e0e14302d89f5751b254d3cc241575ad94fb88282f8a3ac55db",
  name: "recordAttendance",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => recordAttendance.__executeServer(opts));
const recordAttendance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string(),
  entries: z.array(z.object({
    member_id: z.string().uuid(),
    present: z.boolean()
  })).min(1).max(500)
}).parse(i)).handler(recordAttendance_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  for (const e of data.entries) {
    await supabase.from("ebd_attendance").delete().eq("account_id", userId).eq("class_id", data.class_id).eq("member_id", e.member_id).eq("attendance_date", data.attendance_date);
    const {
      error
    } = await supabase.from("ebd_attendance").insert({
      account_id: userId,
      class_id: data.class_id,
      member_id: e.member_id,
      attendance_date: data.attendance_date,
      present: e.present
    });
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const getAttendanceStats_createServerFn_handler = createServerRpc({
  id: "2911d88f499536c6a19e67e77c05c26360f3441e7e72d5d701aefe7bfd50feee",
  name: "getAttendanceStats",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => getAttendanceStats.__executeServer(opts));
const getAttendanceStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getAttendanceStats_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - 60);
  const sinceStr = since.toISOString().slice(0, 10);
  const {
    data,
    error
  } = await supabase.from("ebd_attendance").select("present, attendance_date").eq("account_id", userId).gte("attendance_date", sinceStr);
  if (error) throw new Error(error.message);
  const total = data?.length ?? 0;
  const present = data?.filter((r) => r.present).length ?? 0;
  return {
    total,
    present,
    rate: total > 0 ? Math.round(present / total * 100) : 0
  };
});
const getAttendanceForDate_createServerFn_handler = createServerRpc({
  id: "4e5f16d0674dc70e7ec7c65599f37d638f882ede958c5f416c025b6597243571",
  name: "getAttendanceForDate",
  filename: "src/lib/ebd.functions.ts"
}, (opts) => getAttendanceForDate.__executeServer(opts));
const getAttendanceForDate = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string()
}).parse(i)).handler(getAttendanceForDate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("ebd_attendance").select("member_id, present").eq("account_id", userId).eq("class_id", data.class_id).eq("attendance_date", data.attendance_date);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
export {
  deleteEbdClass_createServerFn_handler,
  getAttendanceForDate_createServerFn_handler,
  getAttendanceStats_createServerFn_handler,
  listEbdClasses_createServerFn_handler,
  listEnrollments_createServerFn_handler,
  recordAttendance_createServerFn_handler,
  setEnrollment_createServerFn_handler,
  upsertEbdClass_createServerFn_handler
};
