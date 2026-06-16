import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("account_id", userId)
      .order("full_name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(1).max(160),
  photo_url: z.string().max(800).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  marital_status: z.string().max(30).optional().nullable(),
  role: z.string().max(40),
  member_since: z.string().optional().nullable(),
  status: z.string().max(20),
  address_street: z.string().max(200).optional().nullable(),
  address_number: z.string().max(20).optional().nullable(),
  address_city: z.string().max(100).optional().nullable(),
  address_state: z.string().max(40).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  congregation: z.string().max(160).optional().nullable(),
  is_tither: z.boolean().optional().default(false),
});

export const upsertMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = {
      full_name: data.full_name.trim(),
      photo_url: data.photo_url || null,
      email: data.email ? data.email.trim() : null,
      phone: data.phone?.trim() || null,
      birth_date: data.birth_date || null,
      gender: data.gender || null,
      marital_status: data.marital_status || null,
      role: data.role,
      member_since: data.member_since || null,
      status: data.status,
      address_street: data.address_street?.trim() || null,
      address_number: data.address_number?.trim() || null,
      address_city: data.address_city?.trim() || null,
      address_state: data.address_state?.trim() || null,
      notes: data.notes?.trim() || null,
      cpf: data.cpf?.trim() || null,
      congregation: data.congregation?.trim() || null,
      is_tither: data.is_tither ?? false,
    };
    if (data.id) {
      const { error } = await supabase
        .from("members")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("members")
      .insert({ ...payload, account_id: userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", data.id)
      .eq("account_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public card validation — card data is accessed through its non-sequential UUID.
export const getPublicMemberCard = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: m, error } = await supabaseAdmin
      .from("members")
      .select("id, full_name, photo_url, role, member_since, birth_date, status, account_id, cpf, congregation")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!m) return null;
    const { data: acc } = await supabaseAdmin
      .from("accounts")
      .select("brand_title, brand_logo_url, primary_color, custom_slug, site_id, card_logo_url, card_logo_height_px, card_accent_color, card_footer_text, card_title_size_px, card_footer_size_px, card_field_size_px, card_label_size_px")
      .eq("id", m.account_id)
      .maybeSingle();
    const safeMember = {
      id: m.id,
      full_name: m.full_name,
      photo_url: m.photo_url,
      role: m.role,
      member_since: m.member_since,
      status: m.status,
      account_id: m.account_id,
      congregation: m.congregation,
      cpf: m.cpf,
      birth_date: m.birth_date,
    };
    return {
      member: safeMember,
      church: acc ?? null,
    };
  });
