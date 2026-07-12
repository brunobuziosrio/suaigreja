// Historico de atribuicoes de ministerio -- completa a tabela
// ministry_assignments, que ja existia com RLS completa (SELECT/INSERT/
// UPDATE/DELETE), GRANTs corretos e trigger de updated_at, mas nunca
// tinha sido usada por nenhuma tela. Distinta dos campos soltos
// members.ministry/members.pastoral (so guardam UM valor atual, sem
// historico) -- aqui cada entrada representa uma passagem por um
// ministerio, com inicio/fim e funcao exercida.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccountContext } from "@/lib/account-context.server";
import { requirePermission } from "@/lib/permission-guard.server";

export type MinistryAssignmentRow = {
  id: string;
  account_id: string;
  member_id: string;
  ministry: string;
  role: string | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  members?: { full_name: string; photo_url: string | null } | null;
};

export const listMinistryAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "members", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("ministry_assignments" as never)
      .select("*, members(full_name, photo_url)")
      .eq("account_id", accountId)
      .order("active", { ascending: false })
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as MinistryAssignmentRow[];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  member_id: z.string().uuid(),
  ministry: z.string().min(1).max(120),
  role: z.string().max(120).optional().nullable(),
  start_date: z.string(),
  end_date: z.string().optional().nullable(),
});

export const upsertMinistryAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "members", data.id ? "edit" : "create");
    const { supabase } = context;
    const payload = {
      member_id: data.member_id,
      ministry: data.ministry.trim(),
      role: data.role?.trim() || null,
      start_date: data.start_date,
      end_date: data.end_date || null,
      active: !data.end_date,
    };
    if (data.id) {
      const { error } = await supabase
        .from("ministry_assignments" as never)
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("ministry_assignments" as never)
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const endMinistryAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid(), end_date: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "members", "edit");
    const { supabase } = context;
    const { error } = await supabase
      .from("ministry_assignments" as never)
      .update({ end_date: data.end_date, active: false } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMinistryAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    await requirePermission(context, "members", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("ministry_assignments" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
