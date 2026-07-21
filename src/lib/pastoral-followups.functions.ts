import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";

const sourceType = z.enum(["visitor", "decision", "prayer", "absence"]);
const followupSchema = z.object({
  source_type: sourceType,
  source_id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "done"]),
  assignee_user_id: z.string().uuid().nullable().optional(),
  next_contact_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  outcome: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type PastoralQueueItem = {
  source_type: z.infer<typeof sourceType>; source_id: string; name: string; phone: string | null;
  detail: string | null; created_at: string; history: Array<{ status: "open" | "in_progress" | "done"; note: string | null; created_at: string }>; followup: { id: string; status: "open" | "in_progress" | "done"; assignee_user_id: string | null; next_contact_at: string | null; outcome: string | null; notes: string | null } | null;
};

export const listPastoralQueue = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { accountId } = await resolveAccountContext(context.userId);
  await requirePermission(context, "pastoral_care", "view");
  const { supabase } = context;
  const [visitors, decisions, prayers, followups, members, attendance] = await Promise.all([
    supabase.from("visitors").select("id,name,phone,prayer_request,created_at,status").eq("account_id", accountId).neq("status", "archived"),
    supabase.from("decisions" as never).select("id,name,phone,message,created_at,status").eq("account_id", accountId).neq("status", "done"),
    supabase.from("prayer_requests").select("id,name,phone,message,created_at,status").eq("account_id", accountId).neq("status", "archived"),
    supabase.from("pastoral_followups" as never).select("id,source_type,source_id,status,assignee_user_id,next_contact_at,outcome,notes").eq("account_id", accountId),
    supabase.from("members").select("id,full_name,phone,created_at").eq("account_id", accountId).eq("status", "ativo"),
    supabase.from("event_attendance" as never).select("member_id,checked_in_at").eq("account_id", accountId).eq("attended", true).order("checked_in_at", { ascending: false }),
  ]);
  for (const result of [visitors, decisions, prayers, followups, members, attendance]) if (result.error) throw new Error(result.error.message);
  const map = new Map(((followups.data ?? []) as Array<{id:string;source_type: PastoralQueueItem["source_type"];source_id:string;status:"open"|"in_progress"|"done";assignee_user_id:string|null;next_contact_at:string|null;outcome:string|null;notes:string|null}>).map((x) => [`${x.source_type}:${x.source_id}`, x]));
  const followupIds = [...map.values()].map((followup) => followup.id);
  const historyByFollowup = new Map<string, PastoralQueueItem["history"]>();
  if (followupIds.length > 0) {
    const { data: events, error: eventsError } = await supabase
      .from("pastoral_followup_events" as never)
      .select("followup_id,status,note,created_at")
      .eq("account_id", accountId)
      .in("followup_id", followupIds)
      .order("created_at", { ascending: false })
      .limit(300);
    if (eventsError) throw new Error(eventsError.message);
    for (const event of (events ?? []) as Array<{ followup_id: string; status: "open" | "in_progress" | "done"; note: string | null; created_at: string }>) {
      const history = historyByFollowup.get(event.followup_id) ?? [];
      if (history.length < 3) history.push({ status: event.status, note: event.note, created_at: event.created_at });
      historyByFollowup.set(event.followup_id, history);
    }
  }
  const lastAttendance = new Map<string, string>();
  for (const row of (attendance.data ?? []) as Array<{ member_id: string; checked_in_at: string | null }>) {
    if (row.checked_in_at && !lastAttendance.has(row.member_id)) lastAttendance.set(row.member_id, row.checked_in_at);
  }
  const trackingStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const trackingActive = [...lastAttendance.values()].some((date) => new Date(date).getTime() >= trackingStart);
  const absenceItems = trackingActive
    ? (members.data ?? []).flatMap((member) => {
        const last = lastAttendance.get(member.id);
        const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000) : null;
        return days === null || days >= 21
          ? [{ source_type: "absence" as const, source_id: member.id, name: member.full_name, phone: member.phone, detail: last ? `Sem presença há ${days} dias.` : "Sem presença registrada.", created_at: last ?? member.created_at }]
          : [];
      })
    : [];
  const items: PastoralQueueItem[] = [
    ...((visitors.data ?? []).filter((x) => x.status !== "member").map((x) => ({ source_type: "visitor" as const, source_id:x.id, name:x.name, phone:x.phone, detail:x.prayer_request, created_at:x.created_at }))),
    ...((decisions.data ?? []) as Array<{id:string;name:string;phone:string|null;message:string|null;created_at:string}>).map((x) => ({ source_type: "decision" as const, source_id:x.id, name:x.name, phone:x.phone, detail:x.message, created_at:x.created_at })),
    ...(prayers.data ?? []).map((x) => ({ source_type: "prayer" as const, source_id:x.id, name:x.name, phone:x.phone, detail:x.message, created_at:x.created_at })),
    ...absenceItems,
  ].map((x) => {
    const followup = map.get(`${x.source_type}:${x.source_id}`) ?? null;
    return { ...x, followup, history: followup ? (historyByFollowup.get(followup.id) ?? []) : [] };
  }).filter((x) => x.followup?.status !== "done");
  return items.sort((a,b) => (a.followup?.next_contact_at ?? "9999").localeCompare(b.followup?.next_contact_at ?? "9999") || b.created_at.localeCompare(a.created_at));
});

export const listPastoralAssignees = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { accountId } = await resolveAccountContext(context.userId);
  await requirePermission(context, "pastoral_care", "view");
  const { data, error } = await context.supabase.from("account_members" as never).select("user_id,role").eq("account_id", accountId).eq("status", "active").not("user_id", "is", null);
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ user_id: string; role: string }>;
});

export const savePastoralFollowup = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((i) => followupSchema.parse(i)).handler(async ({ data, context }) => {
  const { accountId } = await resolveAccountContext(context.userId); await requirePermission(context, "pastoral_care", "edit");
  const sourceQuery = data.source_type === "visitor"
    ? context.supabase.from("visitors").select("id").eq("id", data.source_id).eq("account_id", accountId).maybeSingle()
    : data.source_type === "decision"
      ? context.supabase.from("decisions" as never).select("id").eq("id", data.source_id).eq("account_id", accountId).maybeSingle()
      : data.source_type === "prayer"
        ? context.supabase.from("prayer_requests").select("id").eq("id", data.source_id).eq("account_id", accountId).maybeSingle()
        : context.supabase.from("members").select("id").eq("id", data.source_id).eq("account_id", accountId).maybeSingle();
  const [sourceResult, assigneeResult] = await Promise.all([
    sourceQuery,
    data.assignee_user_id
      ? context.supabase.from("account_members" as never).select("user_id").eq("account_id", accountId).eq("user_id", data.assignee_user_id).eq("status", "active").maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (sourceResult.error) throw new Error(sourceResult.error.message);
  if (!sourceResult.data) throw new Error("Origem do acompanhamento não encontrada nesta comunidade.");
  if (assigneeResult.error) throw new Error(assigneeResult.error.message);
  if (data.assignee_user_id && !assigneeResult.data) throw new Error("Responsável não pertence à comunidade atual.");
  const { data: row, error } = await context.supabase
    .from("pastoral_followups" as never)
    .upsert(
      { ...data, account_id: accountId, completed_at: data.status === "done" ? new Date().toISOString() : null } as never,
      { onConflict: "account_id,source_type,source_id" },
    )
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const { error: eventError } = await context.supabase.from("pastoral_followup_events" as never).insert({
    account_id: accountId,
    followup_id: (row as { id: string }).id,
    actor_user_id: context.userId,
    status: data.status,
    note: data.notes ?? null,
    next_contact_at: data.next_contact_at ?? null,
  } as never);
  if (eventError) throw new Error(eventError.message);
  return { ok: true };
});
