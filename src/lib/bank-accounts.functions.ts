// Cadastro dedicado de contas bancarias/chaves Pix da igreja -- multiplas
// contas, com "conta principal" (uma so por igreja) e "visivel para
// membros" (para divulgar internamente sem expor no site publico).
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export type BankAccountRow = {
  id: string;
  account_id: string;
  label: string;
  bank_name: string | null;
  account_kind: "checking" | "savings";
  agency: string | null;
  account_number: string | null;
  holder_name: string | null;
  pix_key: string | null;
  pix_key_type: "cpf" | "cnpj" | "email" | "phone" | "random" | null;
  is_primary: boolean;
  visible_to_members: boolean;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const listBankAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("bank_accounts" as never)
      .select("*")
      .eq("account_id", accountId)
      .order("is_primary", { ascending: false })
      .order("label", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as BankAccountRow[];
  });

const bankAccountSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(120),
  bank_name: z.string().max(120).optional().nullable(),
  account_kind: z.enum(["checking", "savings"]).default("checking"),
  agency: z.string().max(20).optional().nullable(),
  account_number: z.string().max(30).optional().nullable(),
  holder_name: z.string().max(160).optional().nullable(),
  pix_key: z.string().max(160).optional().nullable(),
  pix_key_type: z.enum(["cpf", "cnpj", "email", "phone", "random"]).optional().nullable(),
  visible_to_members: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export const upsertBankAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => bankAccountSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", data.id ? "edit" : "create");
    const { supabase } = context;
    const payload = {
      label: data.label.trim(),
      bank_name: data.bank_name?.trim() || null,
      account_kind: data.account_kind,
      agency: data.agency?.trim() || null,
      account_number: data.account_number?.trim() || null,
      holder_name: data.holder_name?.trim() || null,
      pix_key: data.pix_key?.trim() || null,
      pix_key_type: data.pix_key_type ?? null,
      visible_to_members: data.visible_to_members,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await supabase
        .from("bank_accounts" as never)
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("bank_accounts" as never)
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as any)!.id };
  });

// Marca uma conta como principal e desmarca as demais -- a unique index
// parcial no banco (WHERE is_primary) so permite 1 linha true por vez,
// entao o unset das outras precisa vir primeiro na mesma operacao.
export const setPrimaryBankAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "edit");
    const { supabase } = context;
    const { error: unsetErr } = await supabase
      .from("bank_accounts" as never)
      .update({ is_primary: false } as never)
      .eq("account_id", accountId)
      .eq("is_primary", true);
    if (unsetErr) throw new Error(unsetErr.message);
    const { error } = await supabase
      .from("bank_accounts" as never)
      .update({ is_primary: true } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setBankAccountActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "edit");
    const { supabase } = context;
    const { error } = await supabase
      .from("bank_accounts" as never)
      .update({ active: data.active, ...(data.active ? {} : { is_primary: false }) } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBankAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("bank_accounts" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
