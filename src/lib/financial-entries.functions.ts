// Livro Caixa: lancamentos financeiros manuais (entradas/saidas), com
// importacao em lote por CSV e filtros avancados (tipo/categoria/
// contribuinte/texto livre), totais calculados no cliente sobre a lista
// ja filtrada.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";
import { parseCsv, normalizeHeader } from "@/lib/csv";

export type FinancialEntryRow = {
  id: string;
  account_id: string;
  entry_type: "income" | "expense";
  category: string;
  description: string | null;
  amount_cents: number;
  entry_date: string;
  contributor_name: string | null;
  congregation_id: string | null;
  congregations?: { id: string; name: string } | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const ENTRY_CATEGORIES = {
  income: ["Dízimo", "Oferta", "Doação", "Campanha", "Aluguel recebido", "Outro"],
  expense: ["Aluguel", "Água/Luz", "Manutenção", "Material", "Salários", "Eventos", "Outro"],
} as const;

export const listFinancialEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "view");
    const { supabase } = context;
    const { data, error } = await supabase
      .from("financial_entries" as never)
      .select("*, congregations(id, name)")
      .eq("account_id", accountId)
      .order("entry_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as FinancialEntryRow[];
  });

const entrySchema = z.object({
  id: z.string().uuid().optional(),
  entry_type: z.enum(["income", "expense"]),
  category: z.string().min(1).max(80),
  description: z.string().max(300).optional().nullable(),
  amount_cents: z.number().int().positive(),
  entry_date: z.string().min(1),
  contributor_name: z.string().max(160).optional().nullable(),
  congregation_id: z.string().uuid().optional().nullable(),
  payment_method: z
    .enum(["pix", "dinheiro", "cartao", "transferencia", "outro"])
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const upsertFinancialEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => entrySchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", data.id ? "edit" : "create");
    const { supabase } = context;
    const payload = {
      entry_type: data.entry_type,
      category: data.category.trim(),
      description: data.description?.trim() || null,
      amount_cents: data.amount_cents,
      entry_date: data.entry_date,
      contributor_name: data.contributor_name?.trim() || null,
      congregation_id: data.congregation_id ?? null,
      payment_method: data.payment_method ?? null,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      const { error } = await supabase
        .from("financial_entries" as never)
        .update(payload as never)
        .eq("id", data.id)
        .eq("account_id", accountId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("financial_entries" as never)
      .insert({ ...payload, account_id: accountId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const deleteFinancialEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "delete");
    const { supabase } = context;
    const { error } = await supabase
      .from("financial_entries" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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

function parseFlexibleAmountCents(value: string): number | null {
  const cleaned = value.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  // Aceita "1.234,56" (BR) ou "1234.56" (US).
  const normalized =
    cleaned.includes(",") && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  const value2 = Number(normalized);
  if (!Number.isFinite(value2) || value2 <= 0) return null;
  return Math.round(value2 * 100);
}

const CSV_ROW_LIMIT = 2000;
const HEADER_ALIASES = {
  entry_type: ["tipo", "entry_type", "tipo_lancamento"],
  category: ["categoria", "category"],
  description: ["descricao", "description"],
  amount: ["valor", "amount", "valor_r", "valor_rs"],
  entry_date: ["data", "date", "entry_date"],
  contributor_name: ["contribuinte", "nome", "contributor", "contributor_name"],
  congregation: ["unidade", "congregacao", "congregação", "congregation", "congregation_id"],
  payment_method: ["forma_pagamento", "pagamento", "payment_method"],
  notes: ["observacoes", "notas", "notes"],
} as const;
type ImportField = keyof typeof HEADER_ALIASES;

const importSchema = z.object({ csv: z.string().min(1).max(3_000_000) });

export const importFinancialEntriesCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => importSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requirePlanTier(context, "premium");
    await requirePermission(context, "finances", "create");
    const { supabase } = context;

    const rows = parseCsv(data.csv);
    if (rows.length < 2) throw new Error("CSV vazio ou sem linhas de dados.");
    if (rows.length - 1 > CSV_ROW_LIMIT)
      throw new Error(`Limite de ${CSV_ROW_LIMIT} linhas por importação.`);

    const header = rows[0].map(normalizeHeader);
    const columnIndex: Partial<Record<ImportField, number>> = {};
    for (const field of Object.keys(HEADER_ALIASES) as ImportField[]) {
      const idx = header.findIndex((h) => (HEADER_ALIASES[field] as readonly string[]).includes(h));
      if (idx >= 0) columnIndex[field] = idx;
    }
    if (columnIndex.category === undefined || columnIndex.amount === undefined) {
      throw new Error(
        'Colunas "categoria" e "valor" são obrigatórias no CSV. Baixe o modelo para conferir os cabeçalhos aceitos.',
      );
    }

    const congregationLookup = new Map<string, string>();
    if (columnIndex.congregation !== undefined) {
      const { data: congregationRows, error: congregationError } = await supabase
        .from("congregations" as never)
        .select("id, name, code")
        .eq("account_id", accountId);
      if (congregationError) throw new Error(congregationError.message);
      for (const row of (congregationRows ?? []) as Array<{
        id: string;
        name: string;
        code: string | null;
      }>) {
        congregationLookup.set(row.id, row.id);
        congregationLookup.set(normalizeHeader(row.name), row.id);
        if (row.code) congregationLookup.set(normalizeHeader(row.code), row.id);
      }
    }

    const errors: { row: number; message: string }[] = [];
    let created = 0;
    const dataRows = rows.slice(1);
    const toInsert: Record<string, unknown>[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const cols = dataRows[i];
      const rowNumber = i + 2;
      const get = (field: ImportField) => {
        const idx = columnIndex[field];
        return idx === undefined ? "" : (cols[idx] ?? "").trim();
      };

      const category = get("category").slice(0, 80);
      if (!category) {
        errors.push({ row: rowNumber, message: "Categoria vazia — linha ignorada." });
        continue;
      }
      const amountCents = parseFlexibleAmountCents(get("amount"));
      if (!amountCents) {
        errors.push({
          row: rowNumber,
          message: `Valor inválido ("${get("amount")}") — linha ignorada.`,
        });
        continue;
      }
      const typeRaw = get("entry_type").toLowerCase();
      const entryType = ["saida", "saída", "despesa", "expense"].includes(typeRaw)
        ? "expense"
        : "income";

      const dateRaw = get("entry_date");
      const entryDate = dateRaw
        ? parseFlexibleDate(dateRaw)
        : new Date().toISOString().slice(0, 10);
      if (dateRaw && !entryDate) {
        errors.push({ row: rowNumber, message: `Data inválida ("${dateRaw}") — linha ignorada.` });
        continue;
      }

      const congregationRaw = get("congregation");
      const congregationId = congregationRaw
        ? (congregationLookup.get(congregationRaw) ??
          congregationLookup.get(normalizeHeader(congregationRaw)) ??
          null)
        : null;
      if (congregationRaw && !congregationId) {
        errors.push({
          row: rowNumber,
          message: `Unidade não encontrada ("${congregationRaw}") — lançamento importado sem unidade.`,
        });
      }

      toInsert.push({
        account_id: accountId,
        entry_type: entryType,
        category,
        description: get("description").slice(0, 300) || null,
        amount_cents: amountCents,
        entry_date: entryDate ?? new Date().toISOString().slice(0, 10),
        contributor_name: get("contributor_name").slice(0, 160) || null,
        congregation_id: congregationId,
        payment_method: get("payment_method").toLowerCase().slice(0, 20) || null,
        notes: get("notes").slice(0, 500) || null,
      });
      created++;
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from("financial_entries" as never).insert(toInsert as never);
      if (error) throw new Error(error.message);
    }

    return { created, errors };
  });
