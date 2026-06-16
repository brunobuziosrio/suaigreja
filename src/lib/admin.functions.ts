import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: somente administradores.");
}

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const listAllAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("accounts")
      .select(
        "id, site_id, brand_title, religion_profile, subscription_status, trial_ends_at, stripe_customer_id, created_at"
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    // pega e-mails
    const ids = (data ?? []).map((a) => a.id);
    const emailMap = new Map<string, string>();
    if (ids.length) {
      // listUsers paginates; pegamos até 1000 que cobre fase inicial
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      for (const u of usersData?.users ?? []) {
        if (u.email) emailMap.set(u.id, u.email);
      }
    }

    // conta eventos por conta
    const { data: counts } = await supabaseAdmin
      .from("events")
      .select("account_id");
    const eventCount = new Map<string, number>();
    for (const row of counts ?? []) {
      eventCount.set(row.account_id, (eventCount.get(row.account_id) ?? 0) + 1);
    }

    return (data ?? []).map((a) => ({
      ...a,
      email: emailMap.get(a.id) ?? null,
      event_count: eventCount.get(a.id) ?? 0,
    }));
  });

const updateSchema = z.object({
  account_id: z.string().uuid(),
  subscription_status: z.enum(["trial", "active", "past_due", "canceled"]),
});

export const updateAccountSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("accounts")
      .update({ subscription_status: data.subscription_status })
      .eq("id", data.account_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const nameSchema = z.object({
  account_id: z.string().uuid(),
  brand_title: z.string().trim().min(1, "Nome obrigatório").max(120),
});

export const adminUpdateAccountName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => nameSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("accounts")
      .update({ brand_title: data.brand_title })
      .eq("id", data.account_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });