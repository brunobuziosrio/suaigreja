// Central de Decisoes e Acolhimento — formulario publico de respostas
// pastorais (aceitar Jesus, voltar pra igreja, conversar, batismo,
// celula, aconselhamento) e painel de acompanhamento pela equipe.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export const DECISION_KINDS = [
  "aceitar_jesus",
  "voltar_igreja",
  "conversar",
  "batismo",
  "celula",
  "aconselhamento",
] as const;

export const listDecisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "pastoral_care", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("decisions" as never)
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as DecisionRow[];
  });

export const updateDecisionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "contacted", "done"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "pastoral_care", "edit");
    const { supabase } = context;
    const { error } = await supabase
      .from("decisions" as never)
      .update({ status: data.status } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateDecisionNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid(), note: z.string().max(1000) }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "pastoral_care", "edit");
    const { supabase } = context;
    const { error } = await supabase
      .from("decisions" as never)
      .update({ assignee_note: data.note } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context as never, "pro");
    await requirePermission(context, "pastoral_care", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("decisions" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type DecisionRow = {
  id: string;
  account_id: string;
  kind: (typeof DECISION_KINDS)[number];
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: "pending" | "contacted" | "done";
  assignee_note: string | null;
  created_at: string;
  updated_at: string;
};

// --------- PUBLIC ---------

async function resolveAccountId(siteId: string): Promise<string | null> {
  const lookup = siteId.toLowerCase();
  const { data: a1 } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("custom_slug", lookup)
    .maybeSingle();
  if (a1) return a1.id;
  const { data: a2 } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("site_id", siteId)
    .maybeSingle();
  return a2?.id ?? null;
}

export const getPublicDecisionForm = createServerFn({ method: "GET" })
  .validator((i: { siteId: string }) => {
    const siteId = String(i?.siteId || "").slice(0, 64);
    if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
    return { siteId };
  })
  .handler(async ({ data }) => {
    const accountId = await resolveAccountId(data.siteId);
    if (!accountId) return null;
    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("brand_title, primary_color")
      .eq("id", accountId)
      .maybeSingle();
    return account;
  });

const SubmitInput = z.object({
  siteId: z.string().min(1).max(64),
  website: z.string().max(200),
  formStartedAt: z.number().int().positive(),
  kind: z.enum(DECISION_KINDS),
  name: z.string().min(2).max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().max(160).optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
});

function assertHumanSubmission(website: string, formStartedAt: number) {
  const elapsed = Date.now() - formStartedAt;
  if (website.trim() || elapsed < 1200 || elapsed > 60 * 60 * 1000) {
    throw new Error("Não foi possível enviar sua mensagem. Tente novamente.");
  }
}

export const submitDecision = createServerFn({ method: "POST" })
  .validator((i) => SubmitInput.parse(i))
  .handler(async ({ data }) => {
    assertHumanSubmission(data.website, data.formStartedAt);
    const accountId = await resolveAccountId(data.siteId);
    if (!accountId) throw new Error("Comunidade não encontrada.");
    const { error } = await supabaseAdmin.from("decisions" as never).insert({
      account_id: accountId,
      kind: data.kind,
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      message: data.message?.trim() || null,
      status: "pending",
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
