// Presenca em Eventos -- completa a tabela event_attendance, que ja
// existia com RLS completa (SELECT/INSERT/UPDATE/DELETE) mas nunca
// tinha sido usada por nenhuma tela. Distinta do check-in por QR
// (checkin_entries/checkin_sessions): aqui e uma marcacao manual de
// presenca, util pra cultos/reunioes sem totem de check-in.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";

export type EventAttendanceRow = {
  member_id: string;
  full_name: string;
  photo_url: string | null;
  attended: boolean;
  checked_in_at: string | null;
};

export const listEventAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ event_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "events", "view");
    const { supabase } = context;

    const [{ data: members, error: membersErr }, { data: attendance, error: attErr }] = await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, photo_url")
        .eq("account_id", accountId)
        .eq("status", "ativo")
        .order("full_name", { ascending: true }),
      supabase
        .from("event_attendance" as never)
        .select("member_id, attended, checked_in_at")
        .eq("account_id", accountId)
        .eq("event_id", data.event_id),
    ]);
    if (membersErr) throw new Error(membersErr.message);
    if (attErr) throw new Error(attErr.message);

    const attendanceByMember = new Map((attendance as any[] ?? []).map((a) => [a.member_id, a]));
    return (members ?? []).map((m) => {
      const a = attendanceByMember.get(m.id);
      return {
        member_id: m.id,
        full_name: m.full_name,
        photo_url: m.photo_url,
        attended: a?.attended ?? false,
        checked_in_at: a?.checked_in_at ?? null,
      };
    }) as EventAttendanceRow[];
  });

export const setEventAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      event_id: z.string().uuid(),
      member_id: z.string().uuid(),
      attended: z.boolean(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "events", "edit");
    const { supabase } = context;
    const { error } = await supabase
      .from("event_attendance" as never)
      .upsert(
        {
          account_id: accountId,
          event_id: data.event_id,
          member_id: data.member_id,
          attended: data.attended,
          checked_in_at: data.attended ? new Date().toISOString() : null,
        } as never,
        { onConflict: "member_id,event_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getEventAttendanceCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ event_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "events", "view");
    const { supabase } = context;
    const { count, error } = await supabase
      .from("event_attendance" as never)
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId)
      .eq("event_id", data.event_id)
      .eq("attended", true);
    if (error) throw new Error(error.message);
    return count ?? 0;
  });
