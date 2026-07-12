// Politica de Privacidade versionada da igreja (nao a da plataforma) --
// completa a tabela privacy_policies, que ja existia com RLS correta
// (SELECT + INSERT por is_account_member) mas nunca tinha sido usada
// por nenhuma tela.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccountContext } from "@/lib/account-context.server";

export type PrivacyPolicyRow = {
  id: string;
  account_id: string;
  version: string;
  content: string;
  effective_date: string;
  is_current: boolean;
  created_at: string;
};

export const listPrivacyPolicyVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    const { supabase } = context;
    const { data, error } = await supabase
      .from("privacy_policies" as never)
      .select("*")
      .eq("account_id", accountId)
      .order("effective_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as PrivacyPolicyRow[];
  });

const upsertSchema = z.object({
  version: z.string().min(1).max(40),
  content: z.string().min(20).max(20000),
  effective_date: z.string(),
  make_current: z.boolean().optional().default(false),
});

export const createPrivacyPolicyVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    const { supabase } = context;

    if (data.make_current) {
      const { error: clearErr } = await supabase
        .from("privacy_policies" as never)
        .update({ is_current: false } as never)
        .eq("account_id", accountId);
      if (clearErr) throw new Error(clearErr.message);
    }

    const { error } = await supabase.from("privacy_policies" as never).insert({
      account_id: accountId,
      version: data.version.trim(),
      content: data.content.trim(),
      effective_date: data.effective_date,
      is_current: data.make_current,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCurrentPrivacyPolicyVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    const { supabase } = context;
    const { error: clearErr } = await supabase
      .from("privacy_policies" as never)
      .update({ is_current: false } as never)
      .eq("account_id", accountId);
    if (clearErr) throw new Error(clearErr.message);
    const { error } = await supabase
      .from("privacy_policies" as never)
      .update({ is_current: true } as never)
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePrivacyPolicyVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await resolveAccountContext(context.userId);
    const { supabase } = context;
    const { error } = await supabase
      .from("privacy_policies" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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

export const getPublicPrivacyPolicy = createServerFn({ method: "GET" })
  .validator((i: { siteId: string }) => {
    const siteId = String(i?.siteId || "").slice(0, 64);
    if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("invalid site");
    return { siteId };
  })
  .handler(async ({ data }) => {
    const accountId = await resolveAccountId(data.siteId);
    if (!accountId) return null;
    const [{ data: account }, { data: policy }] = await Promise.all([
      supabaseAdmin.from("accounts").select("brand_title").eq("id", accountId).maybeSingle(),
      supabaseAdmin
        .from("privacy_policies" as never)
        .select("version, content, effective_date")
        .eq("account_id", accountId)
        .eq("is_current", true)
        .maybeSingle(),
    ]);
    return {
      churchName: account?.brand_title ?? "Igreja",
      policy: policy ?? null,
    };
  });
