import { c as createServerRpc } from "./createServerRpc-B2KAdeW2.js";
import { e as createServerFn } from "./server-aNfUBU9s.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-CuIHMyp3.js";
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
const monthSchema = z.object({
  year: z.number().int().min(2e3).max(2100),
  month: z.number().int().min(1).max(12)
});
function monthBounds(year, month) {
  const pad = (n) => String(n).padStart(2, "0");
  const from = `${year}-${pad(month)}-01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}-${pad(month)}-${pad(last)}`;
  return {
    from,
    to
  };
}
const getEbdMonthly_createServerFn_handler = createServerRpc({
  id: "d772e93ca7d8f9707bd37334870d8ee30e8998d906edb62529e2ef277e9b16e5",
  name: "getEbdMonthly",
  filename: "src/lib/reports.functions.ts"
}, (opts) => getEbdMonthly.__executeServer(opts));
const getEbdMonthly = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => monthSchema.parse(i)).handler(getEbdMonthly_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    from,
    to
  } = monthBounds(data.year, data.month);
  const [{
    data: rows
  }, {
    data: classes
  }, {
    data: members
  }] = await Promise.all([supabase.from("ebd_attendance").select("class_id, member_id, attendance_date, present").eq("account_id", userId).gte("attendance_date", from).lte("attendance_date", to), supabase.from("ebd_classes").select("id, name").eq("account_id", userId), supabase.from("members").select("id, full_name").eq("account_id", userId)]);
  const memberMap = new Map((members ?? []).map((m) => [m.id, m.full_name]));
  const classMap = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const byClass = /* @__PURE__ */ new Map();
  for (const r of rows ?? []) {
    const key = r.class_id;
    if (!byClass.has(key)) byClass.set(key, {
      present: 0,
      total: 0,
      dates: /* @__PURE__ */ new Set(),
      members: /* @__PURE__ */ new Map()
    });
    const c = byClass.get(key);
    c.total++;
    if (r.present) c.present++;
    c.dates.add(r.attendance_date);
    const mid = r.member_id;
    if (!c.members.has(mid)) c.members.set(mid, {
      present: 0,
      total: 0,
      name: memberMap.get(mid) ?? "—"
    });
    const m = c.members.get(mid);
    m.total++;
    if (r.present) m.present++;
  }
  return {
    classes: Array.from(byClass.entries()).map(([id, c]) => ({
      class_id: id,
      class_name: classMap.get(id) ?? "Turma",
      meetings: c.dates.size,
      present: c.present,
      total: c.total,
      rate: c.total ? Math.round(c.present / c.total * 100) : 0,
      members: Array.from(c.members.entries()).map(([mid, m]) => ({
        member_id: mid,
        name: m.name,
        present: m.present,
        total: m.total,
        rate: m.total ? Math.round(m.present / m.total * 100) : 0
      })).sort((a, b) => b.rate - a.rate)
    })).sort((a, b) => a.class_name.localeCompare(b.class_name))
  };
});
const getCheckinMonthly_createServerFn_handler = createServerRpc({
  id: "5ce55c471ba0a4d7322b30677fa19e82a84bf896ad51956914006552444644c1",
  name: "getCheckinMonthly",
  filename: "src/lib/reports.functions.ts"
}, (opts) => getCheckinMonthly.__executeServer(opts));
const getCheckinMonthly = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => monthSchema.parse(i)).handler(getCheckinMonthly_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    from,
    to
  } = monthBounds(data.year, data.month);
  const {
    data: sessions
  } = await supabase.from("checkin_sessions").select("id, title, session_date, start_time").eq("account_id", userId).gte("session_date", from).lte("session_date", to).order("session_date", {
    ascending: true
  });
  const sessionIds = (sessions ?? []).map((s) => s.id);
  let entries = [];
  if (sessionIds.length) {
    const {
      data: e
    } = await supabase.from("checkin_entries").select("session_id, member_id, visitor_name, checked_in_at").eq("account_id", userId).in("session_id", sessionIds);
    entries = e ?? [];
  }
  const counts = /* @__PURE__ */ new Map();
  for (const e of entries) {
    const k = e.session_id;
    if (!counts.has(k)) counts.set(k, {
      total: 0,
      members: 0,
      visitors: 0
    });
    const c = counts.get(k);
    c.total++;
    if (e.member_id) c.members++;
    else c.visitors++;
  }
  return {
    sessions: (sessions ?? []).map((s) => ({
      ...s,
      ...counts.get(s.id) ?? {
        total: 0,
        members: 0,
        visitors: 0
      }
    })),
    totals: {
      sessions: (sessions ?? []).length,
      total: entries.length,
      members: entries.filter((e) => e.member_id).length,
      visitors: entries.filter((e) => !e.member_id).length
    }
  };
});
const getSmallGroupsReport_createServerFn_handler = createServerRpc({
  id: "60f7e8c23d47adace97bc8dcd3759ef7054d057d8b8088d100438fe8e78143c8",
  name: "getSmallGroupsReport",
  filename: "src/lib/reports.functions.ts"
}, (opts) => getSmallGroupsReport.__executeServer(opts));
const getSmallGroupsReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getSmallGroupsReport_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const [{
    data: groups
  }, {
    data: memberships
  }] = await Promise.all([supabase.from("small_groups").select("id, name, leader_name, leader_phone, neighborhood, weekday, start_time, capacity, active").eq("account_id", userId), supabase.from("small_group_members").select("group_id, member_id, role").eq("account_id", userId)]);
  const countByGroup = /* @__PURE__ */ new Map();
  for (const m of memberships ?? []) {
    const k = m.group_id;
    countByGroup.set(k, (countByGroup.get(k) ?? 0) + 1);
  }
  const ranked = (groups ?? []).map((g) => {
    const members = countByGroup.get(g.id) ?? 0;
    const occupancy = g.capacity ? Math.round(members / g.capacity * 100) : null;
    return {
      ...g,
      members,
      occupancy
    };
  }).sort((a, b) => b.members - a.members);
  return {
    groups: ranked,
    totals: {
      groups: ranked.length,
      active: ranked.filter((g) => g.active).length,
      members: (memberships ?? []).length
    }
  };
});
export {
  getCheckinMonthly_createServerFn_handler,
  getEbdMonthly_createServerFn_handler,
  getSmallGroupsReport_createServerFn_handler
};
