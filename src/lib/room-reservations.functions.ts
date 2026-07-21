// Reserva de Ambientes — reservar locais ja cadastrados com deteccao de
// conflito de horario, evitando dupla marcacao da mesma sala.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export type RoomReservationRow = {
  id: string;
  account_id: string;
  location_id: string | null;
  title: string;
  member_id: string | null;
  requester_name: string;
  requester_phone: string | null;
  start_at: string;
  end_at: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  locations?: { name: string } | null;
};

type RoomReservationConflict = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  status: string;
};

type RoomReservationQueryResult = {
  data: RoomReservationConflict[] | null;
  error: { message: string } | null;
};

type RoomReservationQuery = PromiseLike<RoomReservationQueryResult> & {
  select(columns: string): RoomReservationQuery;
  eq(column: string, value: string | null): RoomReservationQuery;
  in(column: string, values: string[]): RoomReservationQuery;
  lt(column: string, value: string): RoomReservationQuery;
  gt(column: string, value: string): RoomReservationQuery;
  limit(count: number): RoomReservationQuery;
  neq(column: string, value: string): RoomReservationQuery;
};

type RoomReservationSupabase = {
  from(table: string): RoomReservationQuery;
};

export const listRoomReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "events", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("room_reservations" as never)
      .select("*, locations(name)")
      .eq("account_id", accountId)
      .order("start_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as RoomReservationRow[];
  });

// Verifica se ja existe reserva aprovada (ou pendente, quando strict=true)
// do mesmo local com horario sobreposto.
async function findConflict(
  supabase: RoomReservationSupabase,
  accountId: string,
  locationId: string | null,
  startAt: string,
  endAt: string,
  excludeId: string | undefined,
  statuses: string[],
) {
  if (!locationId) return null;
  let query = supabase
    .from("room_reservations" as never)
    .select("id, title, start_at, end_at, status")
    .eq("account_id", accountId)
    .eq("location_id", locationId)
    .in("status", statuses)
    .lt("start_at", endAt)
    .gt("end_at", startAt)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  location_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(160),
  member_id: z.string().uuid().nullable().optional(),
  requester_name: z.string().min(1).max(160),
  requester_phone: z.string().max(40).optional().nullable(),
  start_at: z.string(),
  end_at: z.string(),
  notes: z.string().max(1000).optional().nullable(),
});

export const upsertRoomReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "events", data.id ? "edit" : "create");
    const { supabase } = context;

    if (new Date(data.end_at).getTime() <= new Date(data.start_at).getTime()) {
      throw new Error("O horário final precisa ser depois do horário inicial.");
    }

    // Bloqueia apenas contra reservas ja APROVADAS do mesmo local — pendentes
    // podem se sobrepor ate alguem decidir (aprovar uma delas resolve o
    // conflito na hora de aprovar, ver updateRoomReservationStatus).
    const conflict = await findConflict(
      supabase as unknown as RoomReservationSupabase,
      accountId,
      data.location_id ?? null,
      data.start_at,
      data.end_at,
      data.id,
      ["approved"],
    );
    if (conflict) {
      throw new Error(`Esse local já está reservado nesse horário: "${conflict.title}".`);
    }

    const payload = {
      location_id: data.location_id || null,
      title: data.title.trim(),
      member_id: data.member_id || null,
      requester_name: data.requester_name.trim(),
      requester_phone: data.requester_phone?.trim() || null,
      start_at: data.start_at,
      end_at: data.end_at,
      notes: data.notes?.trim() || null,
    };

    if (data.id) {
      const { error } = await supabase
        .from("room_reservations" as never)
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("room_reservations" as never)
      .insert({ ...payload, account_id: accountId, status: "pending" } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const updateRoomReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected", "cancelled"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "events", "edit");
    const { supabase } = context;

    if (data.status === "approved") {
      const { data: current, error: curErr } = await supabase
        .from("room_reservations" as never)
        .select("location_id, start_at, end_at")
        .eq("id", data.id)
        .eq("account_id", accountId)
        .maybeSingle();
      if (curErr) throw new Error(curErr.message);
      if (!current) throw new Error("Reserva não encontrada.");
      const c = current as { location_id: string | null; start_at: string; end_at: string };
      const conflict = await findConflict(
        supabase as unknown as RoomReservationSupabase,
        accountId,
        c.location_id,
        c.start_at,
        c.end_at,
        data.id,
        ["approved"],
      );
      if (conflict) {
        throw new Error(
          `Não é possível aprovar: conflita com "${conflict.title}", já aprovada para o mesmo horário.`,
        );
      }
    }

    const { error } = await supabase
      .from("room_reservations" as never)
      .update({ status: data.status } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRoomReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "events", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("room_reservations" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
