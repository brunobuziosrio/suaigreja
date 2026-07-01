/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-23
 *
 * Portal da Secretaria — funções de servidor para gerenciar solicitações
 * de atendimento (batismo, casamento, catequese, visita pastoral e demais).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";

const REQUEST_TYPES = [
  "batismo",
  "casamento",
  "catequese",
  "visita_pastoral",
  "aconselhamento",
  "declaracao",
  "certidao",
  "apresentacao_crianca",
  "outro",
] as const;

const STATUSES = [
  "recebido",
  "em_andamento",
  "agendado",
  "concluido",
  "cancelado",
] as const;

const PRIORITIES = ["baixa", "normal", "alta"] as const;

const SELECT_COLUMNS =
  "id, member_id, request_type, requester_name, requester_phone, requester_email, details, status, priority, preferred_date, scheduled_at, internal_notes, created_at, updated_at";

const optionalText = z.string().max(2000).optional().nullable();

async function assertMemberBelongsToAccount(
  supabase: any,
  accountId: string,
  memberId?: string | null,
) {
  if (!memberId) return;
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .eq("account_id", accountId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("O membro selecionado não pertence a esta igreja.");
}

export const listSecretariaRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePlanTier(context, "pro");
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("secretaria_requests")
      .select(SELECT_COLUMNS)
      .eq("account_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSecretariaStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePlanTier(context, "pro");
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("secretaria_requests")
      .select("status")
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    return {
      total: rows.length,
      pendentes: rows.filter((r) => r.status === "recebido").length,
      emAndamento: rows.filter((r) => r.status === "em_andamento").length,
      agendados: rows.filter((r) => r.status === "agendado").length,
      concluidos: rows.filter((r) => r.status === "concluido").length,
    };
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional().nullable().transform((v) => v || undefined),
  member_id: z.string().uuid().optional().nullable().transform((v) => v || undefined),
  request_type: z.enum(REQUEST_TYPES),
  requester_name: z.string().min(1).max(160),
  requester_phone: z.string().max(40).optional().nullable(),
  requester_email: z.string().max(160).optional().nullable(),
  details: optionalText,
  status: z.enum(STATUSES).optional().default("recebido"),
  priority: z.enum(PRIORITIES).optional().default("normal"),
  preferred_date: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  internal_notes: optionalText,
});

export const upsertSecretariaRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase: client, userId } = context;
    await assertMemberBelongsToAccount(client, userId, data.member_id);
    const payload = {
      member_id: data.member_id || null,
      request_type: data.request_type,
      requester_name: data.requester_name.trim(),
      requester_phone: data.requester_phone?.trim() || null,
      requester_email: data.requester_email?.trim() || null,
      details: data.details?.trim() || null,
      status: data.status ?? "recebido",
      priority: data.priority ?? "normal",
      preferred_date: data.preferred_date || null,
      scheduled_at: data.scheduled_at || null,
      internal_notes: data.internal_notes?.trim() || null,
    };
    if (data.id) {
      const { data: updated, error } = await client
        .from("secretaria_requests")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!updated) throw new Error("Solicitação não encontrada nesta igreja.");
      return { id: data.id };
    }
    const { data: row, error } = await client
      .from("secretaria_requests")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const updateSecretariaStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid(), status: z.enum(STATUSES) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase: client, userId } = context;
    const { data: updated, error } = await client
      .from("secretaria_requests")
      .update({ status: data.status } as any)
      .eq("id", data.id)
      .eq("account_id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Solicitação não encontrada nesta igreja.");
    return { ok: true };
  });

export const listSecretariaRequestEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase, userId } = context;
    const { data: request, error: requestError } = await supabase
      .from("secretaria_requests")
      .select("id")
      .eq("id", data.id)
      .eq("account_id", userId)
      .maybeSingle();
    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("Solicitação não encontrada nesta igreja.");

    const { data: events, error } = await supabase
      .from("secretaria_request_events")
      .select("id, event_type, from_status, to_status, metadata, created_at")
      .eq("account_id", userId)
      .eq("request_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return events ?? [];
  });

export const deleteSecretariaRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requirePlanTier(context, "pro");
    const { supabase: client, userId } = context;
    const { data: deleted, error } = await client
      .from("secretaria_requests")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!deleted) throw new Error("Solicitação não encontrada nesta igreja.");
    return { ok: true };
  });
