import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireModuleAccess } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type SupabaseAdminClient = typeof supabaseAdmin;

type MemberDocumentWrite = {
  template_id: string | null;
  member_id: string | null;
  title: string;
  body: string;
  issued_at: string;
  certificate_number?: string;
  account_id?: string;
};

type MemberDocumentPublic = {
  members?: {
    full_name?: string | null;
  } | null;
};

async function assertMemberBelongsToAccount(
  supabase: SupabaseAdminClient,
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

async function assertTemplateAllowed(
  supabase: SupabaseAdminClient,
  accountId: string,
  templateId?: string | null,
) {
  if (!templateId) return;
  const { data, error } = await supabase
    .from("document_templates")
    .select("id")
    .eq("id", templateId)
    .or(`is_global.eq.true,account_id.eq.${accountId}`)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("O modelo selecionado não está disponível para esta igreja.");
}

export const listDocumentTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/documentos");
    await requirePermission(context, "documents", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .or(`is_global.eq.true,account_id.eq.${accountId}`)
      .eq("active", true)
      .order("is_global", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMemberDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/documentos");
    await requirePermission(context, "documents", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("member_documents")
      .select("*, members(full_name)")
      .eq("account_id", accountId)
      .order("issued_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const issueSchema = z.object({
  id: z.string().uuid().optional(),
  template_id: z.string().uuid().nullable().optional(),
  member_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  issued_at: z.string().optional(),
  is_certificate: z.boolean().optional().default(false),
});

// Numeracao sequencial por conta e ano, ex.: "0007/2026". Conta quantos
// certificados ja foram emitidos pela conta no mesmo ano do issued_at.
async function nextCertificateNumber(
  supabase: SupabaseAdminClient,
  accountId: string,
  issuedAt: string,
): Promise<string> {
  const year = new Date(`${issuedAt}T00:00:00`).getFullYear();
  const { count, error } = await supabase
    .from("member_documents")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .not("certificate_number", "is", null)
    .gte("issued_at", `${year}-01-01`)
    .lte("issued_at", `${year}-12-31`);
  if (error) throw new Error(error.message);
  return `${String((count ?? 0) + 1).padStart(4, "0")}/${year}`;
}

export const upsertMemberDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => issueSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/documentos");
    await requirePermission(context, "documents", data.id ? "edit" : "create");
    const { supabase } = context;
    await assertMemberBelongsToAccount(supabase, accountId, data.member_id);
    await assertTemplateAllowed(supabase, accountId, data.template_id);
    const issuedAt = data.issued_at || new Date().toISOString().slice(0, 10);
    const payload: MemberDocumentWrite = {
      template_id: data.template_id || null,
      member_id: data.member_id || null,
      title: data.title.trim(),
      body: data.body.trim(),
      issued_at: issuedAt,
    };
    if (data.id) {
      if (data.is_certificate) {
        const { data: current, error: currentErr } = await supabase
          .from("member_documents")
          .select("certificate_number")
          .eq("id", data.id)
          .eq("account_id", accountId)
          .maybeSingle();
        if (currentErr) throw new Error(currentErr.message);
        if (!current?.certificate_number) {
          payload.certificate_number = await nextCertificateNumber(supabase, accountId, issuedAt);
        }
      }
      const { data: updated, error } = await supabase
        .from("member_documents")
        .update(payload)
        .eq("id", data.id)
        .eq("account_id", accountId)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!updated) throw new Error("Documento não encontrado nesta igreja.");
      return { id: data.id };
    }
    if (data.is_certificate) {
      payload.certificate_number = await nextCertificateNumber(supabase, accountId, issuedAt);
    }
    const { data: row, error } = await supabase
      .from("member_documents")
      .insert({ ...payload, account_id: accountId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteMemberDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context as never, "/documentos");
    await requirePermission(context, "documents", "delete");
    const { supabase } = context;
    const { data: deleted, error } = await supabase
      .from("member_documents")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!deleted) throw new Error("Documento não encontrado nesta igreja.");
    return { ok: true };
  });

// Validacao publica de certificado via QR Code — projeta apenas os campos
// necessarios para confirmar autenticidade, nunca o corpo do documento
// (pode conter informacao pastoral sensivel).
export const getPublicCertificate = createServerFn({ method: "GET" })
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: doc, error } = await supabaseAdmin
      .from("member_documents")
      .select("id, title, certificate_number, issued_at, account_id, members(full_name)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc || !doc.certificate_number) return null;

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("brand_title, brand_logo_url, primary_color")
      .eq("id", doc.account_id)
      .maybeSingle();

    return {
      title: doc.title,
      certificateNumber: doc.certificate_number,
      issuedAt: doc.issued_at,
      memberName: (doc as MemberDocumentPublic).members?.full_name ?? null,
      church: account ?? null,
    };
  });

// Replace template placeholders with member/church data.
export function renderTemplate(
  body: string,
  vars: Record<string, string | null | undefined>,
): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v == null ? "" : String(v);
  });
}
