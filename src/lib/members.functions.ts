import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";
import { parseCsv, normalizeHeader } from "@/lib/csv";

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "members", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("account_id", accountId)
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
  neighborhood: z.string().max(120).optional().nullable(),
  ministry: z.string().max(120).optional().nullable(),
  pastoral: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  congregation: z.string().max(160).optional().nullable(),
  is_tither: z.boolean().optional().default(false),
  whatsapp_consent: z.boolean().optional().default(false),
});

export const upsertMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "members", data.id ? "edit" : "create");
    const { supabase } = context;
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
      neighborhood: data.neighborhood?.trim() || null,
      ministry: data.ministry?.trim() || null,
      pastoral: data.pastoral?.trim() || null,
      notes: data.notes?.trim() || null,
      cpf: data.cpf?.trim() || null,
      congregation: data.congregation?.trim() || null,
      is_tither: data.is_tither ?? false,
      whatsapp_consent: data.whatsapp_consent ?? false,
    };
    if (data.id) {
      const { error } = await supabase
        .from("members")
        .update(payload as any)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("members")
      .insert({ ...payload, account_id: accountId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "members", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===================== IMPORTACAO CSV =====================

const CSV_ROW_LIMIT = 2000;

const FIELD_HEADER_ALIASES = {
  full_name: ["nome", "nome_completo", "name"],
  phone: ["telefone", "celular", "whatsapp", "phone"],
  email: ["email", "e_mail"],
  birth_date: ["nascimento", "data_nascimento", "data_de_nascimento", "birth_date"],
  gender: ["sexo", "genero", "gender"],
  marital_status: ["estado_civil", "estadocivil"],
  cpf: ["cpf"],
  role: ["funcao", "cargo", "role"],
  member_since: ["membro_desde", "data_entrada", "data_de_entrada", "member_since"],
  status: ["status", "situacao"],
  address_city: ["cidade", "city"],
  address_state: ["estado", "uf", "state"],
  congregation: ["congregacao", "igreja", "unidade"],
  is_tither: ["dizimista", "contribuinte"],
  whatsapp_consent: ["consentimento_whatsapp", "aceita_whatsapp"],
  notes: ["observacoes", "obs", "notas"],
} as const;

type ImportField = keyof typeof FIELD_HEADER_ALIASES;

function parseFlexibleDate(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function parseFlexibleBoolean(value: string): boolean {
  return ["sim", "s", "yes", "y", "true", "1"].includes(value.trim().toLowerCase());
}

const importSchema = z.object({
  csv: z.string().min(1).max(3_000_000),
});

export const importMembersCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => importSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "pro");
    await requirePermission(context, "members", "create");
    const { supabase } = context;

    const rows = parseCsv(data.csv);
    if (rows.length < 2) throw new Error("CSV vazio ou sem linhas de dados.");
    if (rows.length - 1 > CSV_ROW_LIMIT) throw new Error(`Limite de ${CSV_ROW_LIMIT} linhas por importação.`);

    const header = rows[0].map(normalizeHeader);
    const columnIndex: Partial<Record<ImportField, number>> = {};
    for (const field of Object.keys(FIELD_HEADER_ALIASES) as ImportField[]) {
      const aliases: readonly string[] = FIELD_HEADER_ALIASES[field];
      const idx = header.findIndex((h) => aliases.includes(h));
      if (idx >= 0) columnIndex[field] = idx;
    }
    if (columnIndex.full_name === undefined) {
      throw new Error('Coluna "nome" não encontrada no CSV. Baixe o modelo para conferir os cabeçalhos aceitos.');
    }

    const { data: existing, error: existingErr } = await supabase
      .from("members")
      .select("id, cpf, email")
      .eq("account_id", accountId);
    if (existingErr) throw new Error(existingErr.message);

    const byCpf = new Map<string, string>();
    const byEmail = new Map<string, string>();
    for (const m of existing ?? []) {
      if (m.cpf) byCpf.set(m.cpf.trim(), m.id);
      if (m.email) byEmail.set(m.email.trim().toLowerCase(), m.id);
    }

    const errors: { row: number; message: string }[] = [];
    let created = 0;
    let updated = 0;
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const cols = dataRows[i];
      const rowNumber = i + 2; // +1 pelo cabeçalho, +1 por indexação a partir de 1
      const get = (field: ImportField) => {
        const idx = columnIndex[field];
        return idx === undefined ? "" : (cols[idx] ?? "").trim();
      };

      const fullName = get("full_name").slice(0, 160);
      if (!fullName) {
        errors.push({ row: rowNumber, message: "Nome vazio — linha ignorada." });
        continue;
      }

      const email = get("email");
      const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 255) : null;
      if (email && !validEmail) errors.push({ row: rowNumber, message: `E-mail inválido ("${email}") — importado sem e-mail.` });

      const birthRaw = get("birth_date");
      const birthDate = birthRaw ? parseFlexibleDate(birthRaw) : null;
      if (birthRaw && !birthDate) errors.push({ row: rowNumber, message: `Nascimento inválido ("${birthRaw}") — importado sem data.` });

      const memberSinceRaw = get("member_since");
      const memberSince = memberSinceRaw ? parseFlexibleDate(memberSinceRaw) : null;
      if (memberSinceRaw && !memberSince) errors.push({ row: rowNumber, message: `Data de entrada inválida ("${memberSinceRaw}") — importada sem data.` });

      const cpf = get("cpf").slice(0, 20) || null;
      const payload = {
        full_name: fullName,
        email: validEmail,
        phone: get("phone").slice(0, 40) || null,
        birth_date: birthDate,
        gender: get("gender").slice(0, 20) || null,
        marital_status: get("marital_status").slice(0, 30) || null,
        role: get("role").slice(0, 40) || "membro",
        member_since: memberSince,
        status: get("status").slice(0, 20) || "ativo",
        address_city: get("address_city").slice(0, 100) || null,
        address_state: get("address_state").slice(0, 40) || null,
        congregation: get("congregation").slice(0, 160) || null,
        cpf,
        is_tither: parseFlexibleBoolean(get("is_tither")),
        whatsapp_consent: parseFlexibleBoolean(get("whatsapp_consent")),
        notes: get("notes").slice(0, 2000) || null,
      };

      const existingId = (cpf && byCpf.get(cpf)) || (validEmail && byEmail.get(validEmail.toLowerCase()));

      if (existingId) {
        const { error } = await supabase.from("members").update(payload as any).eq("id", existingId).eq("account_id", accountId);
        if (error) { errors.push({ row: rowNumber, message: error.message }); continue; }
        updated++;
      } else {
        const { data: inserted, error } = await supabase
          .from("members")
          .insert({ ...payload, account_id: accountId } as any)
          .select("id")
          .single();
        if (error) { errors.push({ row: rowNumber, message: error.message }); continue; }
        created++;
        if (cpf) byCpf.set(cpf, inserted!.id);
        if (validEmail) byEmail.set(validEmail.toLowerCase(), inserted!.id);
      }
    }

    return { total: dataRows.length, created, updated, errors };
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
