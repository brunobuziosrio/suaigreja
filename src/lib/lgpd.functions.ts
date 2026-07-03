/**
 * @author Bruno Linhares da Silveira
 * @copyright 2026 Digital Lagos
 * @contact contato@digitallagos.com.br
 * @date 2026-06-20
 *
 * LGPD (Lei Geral de Proteção de Dados) / GDPR compliance functions
 * Handles: consent, data export, data deletion, audit logs
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccountContext } from "@/lib/account-context.server";

export const recordDataConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        consent_type: z.enum([
          "privacy_policy",
          "whatsapp_contact",
          "marketing_emails",
          "data_processing",
          "cookies",
        ]),
        accepted: z.boolean(),
        ip_address: z.string().optional().nullable(),
        user_agent: z.string().optional().nullable(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { accountId } = await resolveAccountContext(userId);
    const now = new Date().toISOString();

    const { error } = await supabase.from("lgpd_consent_records").insert({
      account_id: accountId,
      user_id: userId,
      consent_type: data.consent_type,
      accepted: data.accepted,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      recorded_at: now,
    });

    if (error) throw new Error(error.message);
    return { ok: true, timestamp: now };
  });

export const getConsentStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("lgpd_consent_records")
      .select("consent_type, accepted")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    const latest = new Map<string, boolean>();
    (data ?? []).forEach((r: any) => {
      if (!latest.has(r.consent_type)) {
        latest.set(r.consent_type, r.accepted);
      }
    });

    return Object.fromEntries(latest);
  });

// Exporta os dados que a PLATAFORMA guarda sobre o usuário autenticado
// (o membro da equipe que fez login) -- não confundir com os dados dos
// fiéis/membros da congregação, que pertencem à igreja (controladora),
// não ao usuário da plataforma. A versão anterior desta função tentava
// exportar "um membro" via account_id sem filtrar por pessoa nenhuma
// (`.single()` sem `.eq` no usuário), o que não fazia sentido pro
// modelo de dados real (account_members != members).
export const exportMyAccountData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { accountId, role } = await resolveAccountContext(userId);

    const [{ data: membership }, { data: consents }, { data: deletionRequests }] = await Promise.all([
      supabase
        .from("account_members" as never)
        .select("role, status, created_at")
        .eq("account_id", accountId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("lgpd_consent_records")
        .select("consent_type, accepted, recorded_at")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false }),
      supabase
        .from("lgpd_deletion_requests" as never)
        .select("status, reason, requested_at, processed_at")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId,
      accountRole: role,
      membership: membership ?? null,
      consentHistory: consents ?? [],
      deletionRequests: deletionRequests ?? [],
    };
  });

export const requestDataDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        reason: z.string().max(500).optional().nullable(),
        confirm_deletion: z.boolean(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { accountId } = await resolveAccountContext(userId);

    if (!data.confirm_deletion) {
      throw new Error("Deve confirmar a exclusão de dados");
    }

    const now = new Date().toISOString();

    await supabase.from("lgpd_deletion_requests").insert({
      user_id: userId,
      account_id: accountId,
      reason: data.reason || null,
      status: "pending",
      requested_at: now,
    });

    return { ok: true, message: "Solicitação de exclusão registrada. Será processada em até 30 dias." };
  });

export const logDataAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        action: z.enum(["read", "create", "update", "delete", "export"]),
        resource_type: z.string().max(100),
        resource_id: z.string().uuid(),
        description: z.string().max(500).optional().nullable(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { accountId } = await resolveAccountContext(userId);

    const { error } = await supabaseAdmin.from("lgpd_audit_logs").insert({
      account_id: accountId,
      user_id: userId,
      action: data.action,
      resource_type: data.resource_type,
      resource_id: data.resource_id,
      description: data.description || null,
      timestamp: new Date().toISOString(),
    });

    if (error) console.error("Failed to log data access:", error.message);
    return { ok: true };
  });

export const getAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        days: z.number().int().min(1).max(90).default(30),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { accountId } = await resolveAccountContext(userId);
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - data.days);

    const { data: logs, error } = await supabase
      .from("lgpd_audit_logs")
      .select("*")
      .eq("account_id", accountId)
      .gte("timestamp", sinceDate.toISOString())
      .order("timestamp", { ascending: false });

    if (error) throw new Error(error.message);
    return logs ?? [];
  });

export const anonymizeData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        member_id: z.string().uuid(),
        confirm: z.boolean(),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { accountId } = await resolveAccountContext(userId);

    if (!data.confirm) throw new Error("Deve confirmar anonimização");

    await supabase
      .from("members")
      .update({
        full_name: "Usuário Anônimo",
        email: null,
        phone: null,
        cpf: null,
        address_street: null,
        address_number: null,
        address_city: null,
        address_state: null,
        neighborhood: null,
        birth_date: null,
        gender: null,
        marital_status: null,
        notes: "Dados anonimizados por solicitação LGPD",
        photo_url: null,
        whatsapp_consent: false,
      } as any)
      .eq("id", data.member_id)
      .eq("account_id", accountId);

    await logDataAccess({
      data: {
        action: "delete",
        resource_type: "member",
        resource_id: data.member_id,
        description: "Anonimização completa de dados do membro",
      },
    });

    return { ok: true };
  });
