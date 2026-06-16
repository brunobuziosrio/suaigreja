import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const monthSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

function monthBounds(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const from = `${year}-${pad(month)}-01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}-${pad(month)}-${pad(last)}`;
  return { from, to };
}

// ============= EBD MONTHLY ATTENDANCE =============
export const getEbdMonthly = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => monthSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { from, to } = monthBounds(data.year, data.month);
    const [{ data: rows }, { data: classes }, { data: members }] = await Promise.all([
      supabase
        .from("ebd_attendance")
        .select("class_id, member_id, attendance_date, present")
        .eq("account_id", userId)
        .gte("attendance_date", from)
        .lte("attendance_date", to),
      supabase.from("ebd_classes").select("id, name").eq("account_id", userId),
      supabase.from("members").select("id, full_name").eq("account_id", userId),
    ]);
    const memberMap = new Map((members ?? []).map((m: any) => [m.id, m.full_name]));
    const classMap = new Map((classes ?? []).map((c: any) => [c.id, c.name]));
    const byClass = new Map<string, { present: number; total: number; dates: Set<string>; members: Map<string, { present: number; total: number; name: string }> }>();
    for (const r of rows ?? []) {
      const key = r.class_id as string;
      if (!byClass.has(key)) byClass.set(key, { present: 0, total: 0, dates: new Set(), members: new Map() });
      const c = byClass.get(key)!;
      c.total++;
      if (r.present) c.present++;
      c.dates.add(r.attendance_date as string);
      const mid = r.member_id as string;
      if (!c.members.has(mid)) c.members.set(mid, { present: 0, total: 0, name: memberMap.get(mid) ?? "—" });
      const m = c.members.get(mid)!;
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
        rate: c.total ? Math.round((c.present / c.total) * 100) : 0,
        members: Array.from(c.members.entries())
          .map(([mid, m]) => ({
            member_id: mid,
            name: m.name,
            present: m.present,
            total: m.total,
            rate: m.total ? Math.round((m.present / m.total) * 100) : 0,
          }))
          .sort((a, b) => b.rate - a.rate),
      })).sort((a, b) => a.class_name.localeCompare(b.class_name)),
    };
  });

// ============= SERVICE CHECK-IN MONTHLY =============
export const getCheckinMonthly = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => monthSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { from, to } = monthBounds(data.year, data.month);
    const { data: sessions } = await supabase
      .from("checkin_sessions")
      .select("id, title, session_date, start_time")
      .eq("account_id", userId)
      .gte("session_date", from)
      .lte("session_date", to)
      .order("session_date", { ascending: true });
    const sessionIds = (sessions ?? []).map((s: any) => s.id);
    let entries: any[] = [];
    if (sessionIds.length) {
      const { data: e } = await supabase
        .from("checkin_entries")
        .select("session_id, member_id, visitor_name, checked_in_at")
        .eq("account_id", userId)
        .in("session_id", sessionIds);
      entries = e ?? [];
    }
    const counts = new Map<string, { total: number; members: number; visitors: number }>();
    for (const e of entries) {
      const k = e.session_id as string;
      if (!counts.has(k)) counts.set(k, { total: 0, members: 0, visitors: 0 });
      const c = counts.get(k)!;
      c.total++;
      if (e.member_id) c.members++;
      else c.visitors++;
    }
    return {
      sessions: (sessions ?? []).map((s: any) => ({
        ...s,
        ...(counts.get(s.id) ?? { total: 0, members: 0, visitors: 0 }),
      })),
      totals: {
        sessions: (sessions ?? []).length,
        total: entries.length,
        members: entries.filter((e) => e.member_id).length,
        visitors: entries.filter((e) => !e.member_id).length,
      },
    };
  });

// ============= SMALL GROUPS RANKING =============
export const getSmallGroupsReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: groups }, { data: memberships }] = await Promise.all([
      supabase
        .from("small_groups")
        .select("id, name, leader_name, leader_phone, neighborhood, weekday, start_time, capacity, active")
        .eq("account_id", userId),
      supabase
        .from("small_group_members")
        .select("group_id, member_id, role")
        .eq("account_id", userId),
    ]);
    const countByGroup = new Map<string, number>();
    for (const m of memberships ?? []) {
      const k = m.group_id as string;
      countByGroup.set(k, (countByGroup.get(k) ?? 0) + 1);
    }
    const ranked = (groups ?? [])
      .map((g: any) => {
        const members = countByGroup.get(g.id) ?? 0;
        const occupancy = g.capacity ? Math.round((members / g.capacity) * 100) : null;
        return { ...g, members, occupancy };
      })
      .sort((a, b) => b.members - a.members);
    return {
      groups: ranked,
      totals: {
        groups: ranked.length,
        active: ranked.filter((g) => g.active).length,
        members: (memberships ?? []).length,
      },
    };
  });