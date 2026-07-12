import { createHash, randomInt } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePlanTier } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

const hash = (code: string) => createHash("sha256").update(code).digest("hex");
const childSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(2).max(160),
  birth_date: z.string().optional().nullable(),
  guardian_name: z.string().min(2).max(160),
  guardian_phone: z.string().min(8).max(40),
  authorized_pickups: z.string().max(500).optional().nullable(),
  allergies: z.string().max(1000).optional().nullable(),
  medical_notes: z.string().max(1000).optional().nullable(),
  active: z.boolean().default(true),
});

type ChildCheckinContext = Parameters<typeof requirePlanTier>[0];

type ChildCheckinListResponse = {
  children: unknown[];
  activeEntries: unknown[];
};

async function access(context: ChildCheckinContext, action: "view" | "create" | "edit") {
  const result = await requirePlanTier(context, "premium");
  await requirePermission(context, "checkin", action);
  return result;
}
export const listChildCheckin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await access(context, "view");
    const [children, entries] = await Promise.all([
      context.supabase
        .from("child_profiles")
        .select("*")
        .eq("account_id", accountId)
        .order("full_name"),
      context.supabase
        .from("child_checkin_entries")
        .select("*, child_profiles(full_name, guardian_name, guardian_phone, allergies, photo_url)")
        .eq("account_id", accountId)
        .is("checked_out_at", null)
        .order("checked_in_at"),
    ]);
    if (children.error) throw new Error(children.error.message);
    if (entries.error) throw new Error(entries.error.message);
    return {
      children: (children.data ?? []) as unknown[],
      activeEntries: (entries.data ?? []) as unknown[],
    } satisfies ChildCheckinListResponse;
  });
export const upsertChildProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => childSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await access(context, data.id ? "edit" : "create");
    const clean = (v?: string | null) => v?.trim() || null;
    const payload = {
      full_name: data.full_name.trim(),
      birth_date: data.birth_date || null,
      guardian_name: data.guardian_name.trim(),
      guardian_phone: data.guardian_phone.trim(),
      authorized_pickups: clean(data.authorized_pickups),
      allergies: clean(data.allergies),
      medical_notes: clean(data.medical_notes),
      active: data.active,
      updated_at: new Date().toISOString(),
    };
    const q = data.id
      ? context.supabase
          .from("child_profiles")
          .update(payload)
          .eq("id", data.id)
          .eq("account_id", accountId)
      : context.supabase.from("child_profiles").insert({ ...payload, account_id: accountId });
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const checkinChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ child_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await access(context, "create");
    const { data: child, error: childError } = await context.supabase
      .from("child_profiles")
      .select("id")
      .eq("id", data.child_id)
      .eq("account_id", accountId)
      .eq("active", true)
      .maybeSingle();
    if (childError) throw new Error(childError.message);
    if (!child) throw new Error("Cadastro infantil ativo não encontrado.");
    const code = String(randomInt(0, 1000000)).padStart(6, "0");
    const { error } = await context.supabase.from("child_checkin_entries").insert({
      account_id: accountId,
      child_id: data.child_id,
      pickup_code_hash: hash(code),
    });
    if (error)
      throw new Error(
        error.code === "23505" ? "Esta criança já possui uma entrada aberta." : error.message,
      );
    return { code };
  });
export const checkoutChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) =>
    z
      .object({
        entry_id: z.string().uuid(),
        code: z.string().regex(/^\d{6}$/),
        pickup_person: z.string().min(2).max(160),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { accountId } = await access(context, "edit");
    const { data: entry, error } = await context.supabase
      .from("child_checkin_entries")
      .select("pickup_code_hash")
      .eq("id", data.entry_id)
      .eq("account_id", accountId)
      .is("checked_out_at", null)
      .maybeSingle();
    if (error || !entry) throw new Error("Entrada aberta não encontrada.");
    if ((entry as { pickup_code_hash: string }).pickup_code_hash !== hash(data.code))
      throw new Error("Código de retirada incorreto.");
    const { error: updateError } = await context.supabase
      .from("child_checkin_entries")
      .update({
        checked_out_at: new Date().toISOString(),
        checked_out_by: context.userId,
        pickup_person: data.pickup_person.trim(),
      })
      .eq("id", data.entry_id)
      .eq("account_id", accountId);
    if (updateError) throw new Error(updateError.message);
    return { ok: true };
  });
