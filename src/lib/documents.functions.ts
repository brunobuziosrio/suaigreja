import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listDocumentTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .or(`is_global.eq.true,account_id.eq.${userId}`)
      .eq("active", true)
      .order("is_global", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMemberDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("member_documents")
      .select("*, members(full_name)")
      .eq("account_id", userId)
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
});

export const upsertMemberDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => issueSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = {
      template_id: data.template_id || null,
      member_id: data.member_id || null,
      title: data.title,
      body: data.body,
      issued_at: data.issued_at || new Date().toISOString().slice(0, 10),
    };
    if (data.id) {
      const { error } = await supabase
        .from("member_documents")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("member_documents")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteMemberDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("member_documents")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
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