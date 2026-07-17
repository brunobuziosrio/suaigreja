import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireModuleAccess } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

export type CongregationRow = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  leader_name: string | null;
  leader_phone: string | null;
  notes: string | null;
  active: boolean;
  members_count: number;
};

type CongregationWithMembersCount = Omit<CongregationRow, "members_count"> & {
  members?: { count: number }[];
};

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  code: z.string().max(40).optional().nullable(),
  address: z.string().max(240).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  leader_name: z.string().max(160).optional().nullable(),
  leader_phone: z.string().max(30).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  active: z.boolean().default(true),
});

export const listCongregations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accountId } = await requireModuleAccess(context, "/congregacoes");
    await requirePermission(context, "members", "view");
    const { data, error } = await context.supabase
      .from("congregations" as never)
      .select("*, members(count)")
      .eq("account_id", accountId)
      .order("active", { ascending: false })
      .order("name");
    if (error) throw new Error(error.message);
    return ((data ?? []) as CongregationWithMembersCount[]).map(({ members, ...row }) => ({
      ...row,
      members_count: members?.[0]?.count ?? 0,
    })) as CongregationRow[];
  });

export const upsertCongregation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => schema.parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context, "/congregacoes");
    await requirePermission(context, "members", data.id ? "edit" : "create");
    const clean = (v?: string | null) => v?.trim() || null;
    const payload = {
      name: data.name.trim(),
      code: clean(data.code),
      address: clean(data.address),
      city: clean(data.city),
      state: clean(data.state)?.toUpperCase() ?? null,
      leader_name: clean(data.leader_name),
      leader_phone: clean(data.leader_phone),
      notes: clean(data.notes),
      active: data.active,
      updated_at: new Date().toISOString(),
    };
    const query = data.id
      ? context.supabase
          .from("congregations" as never)
          .update(payload as never)
          .eq("id", data.id)
          .eq("account_id", accountId)
      : context.supabase
          .from("congregations" as never)
          .insert({ ...payload, account_id: accountId } as never);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCongregation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { accountId } = await requireModuleAccess(context, "/congregacoes");
    await requirePermission(context, "members", "delete");
    const { error } = await context.supabase
      .from("congregations" as never)
      .delete()
      .eq("id", data.id)
      .eq("account_id", accountId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
