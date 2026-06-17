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

const generateTestDataSchema = z.object({
  account_id: z.string().uuid(),
});

export const generateTestData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => generateTestDataSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const accountId = data.account_id;

    // Generate 30 members
    const memberNames = [
      "Pedro Silva", "Maria Santos", "João Oliveira", "Ana Costa", "Carlos Souza",
      "Julia Mendes", "Roberto Ferreira", "Fernanda Rocha", "Lucas Martins", "Camila Gomes",
    ];
    const genders = ["Masculino", "Feminino"];
    const maritalStatuses = ["Solteiro", "Casado", "Divorciado", "Viúvo"];
    const roles = ["membro", "visitante", "lider", "pastor", "diacono", "obreiro"];
    const statuses = ["ativo", "inativo"];

    const members = [];
    for (let i = 1; i <= 30; i++) {
      const { data: member, error } = await supabaseAdmin
        .from("members")
        .insert({
          account_id: accountId,
          full_name: memberNames[i % 10] + " [Teste] #" + i,
          email: `teste.${i}@seuigreja.test`,
          phone: `(11) ${String(10000 + (i * 137) % 90000).padStart(5, "0")}-${String(1000 + (i * 73) % 9000).padStart(4, "0")}`,
          gender: genders[i % 2],
          marital_status: maritalStatuses[i % 4],
          role: roles[i % 6],
          status: statuses[i % 10 === 0 ? 0 : 1],
          birth_date: new Date(1980 + (i % 40), (i % 12), 1 + (i % 28)).toISOString().split("T")[0],
          member_since: new Date(2023, 0, 1 + (i % 365)).toISOString().split("T")[0],
          address_street: `Rua ${String.fromCharCode(65 + (i % 26))}`,
          address_number: String(i % 999 + 1),
          address_city: "São Paulo",
          address_state: "SP",
          is_test_data: true,
        })
        .select()
        .single();
      if (error) console.warn("Erro ao criar membro:", error);
      if (member) members.push(member);
    }

    // Generate 30 events
    const eventTypes = ["Culto Domingo", "Culto Quarta", "EBD", "Célula", "Transmissão", "Devocional"];
    const eventLocations = ["Sede Principal", "Filial Centro", "Filial Vila", "Filial Leste", "Online"];

    for (let i = 1; i <= 30; i++) {
      const startHour = [9, 19, 15][i % 3];
      const { error } = await supabaseAdmin
        .from("events")
        .insert({
          account_id: accountId,
          type_name: eventTypes[i % 6],
          location_name: eventLocations[i % 5],
          event_date: new Date(Date.now() + ((i % 60) * 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
          start_time: `${String(startHour).padStart(2, "0")}:00:00`,
          end_time: `${String(startHour + 1).padStart(2, "0")}:30:00`,
          description: `Evento de teste #${i}`,
          is_live: i % 7 === 0,
          is_test_data: true,
        });
      if (error) console.warn("Erro ao criar evento:", error);
    }

    // Generate 30 donations with various amounts
    const amounts = [500, 1000, 1500, 2000, 3000, 5000];
    const donationStatuses = ["pending", "paid", "failed"];

    for (let i = 1; i <= 30; i++) {
      const { error } = await supabaseAdmin
        .from("donations")
        .insert({
          account_id: accountId,
          donor_name: `Doador Teste ${i}`,
          donor_email: `doador.${i}@test.local`,
          donor_phone: `(11) 99999-${String(1000 + (i % 9000)).padStart(4, "0")}`,
          amount_cents: amounts[i % 6] * 100,
          status: donationStatuses[i % 3],
          paid_at: [0, 3].includes(i % 5) ? null : new Date(Date.now() - ((i % 30) * 24 * 60 * 60 * 1000)).toISOString(),
          is_test_data: true,
        });
      if (error) console.warn("Erro ao criar doação:", error);
    }

    // Create 5 EBD classes
    const ebdClasses = [];
    const ebdClassNames = ["Crianças", "Adolescentes", "Jovens", "Adultos", "Idosos"];
    const ageRanges = ["crianças", "adolescentes", "jovens", "adultos", "idosos"];

    for (let i = 0; i < 5; i++) {
      const { data: ebdClass, error } = await supabaseAdmin
        .from("ebd_classes")
        .insert({
          account_id: accountId,
          name: `Classe de ${ebdClassNames[i]} [Teste]`,
          teacher_name: `Professor Teste ${i + 1}`,
          weekday: 0,
          start_time: "09:00:00",
          age_range: ageRanges[i],
          is_test_data: true,
        })
        .select()
        .single();
      if (error) console.warn("Erro ao criar classe EBD:", error);
      if (ebdClass) ebdClasses.push(ebdClass);
    }

    // Create enrollments
    if (ebdClasses.length > 0 && members.length > 0) {
      for (let i = 0; i < Math.min(30, members.length); i++) {
        const ebdClass = ebdClasses[i % ebdClasses.length];
        const { error } = await supabaseAdmin
          .from("ebd_enrollments")
          .insert({
            account_id: accountId,
            class_id: ebdClass.id,
            member_id: members[i].id,
            is_test_data: true,
          })
          .select()
          .single();
        if (error && !error.message.includes("unique")) {
          console.warn("Erro ao criar inscrição:", error);
        }
      }
    }

    // Create attendance records
    for (const ebdClass of ebdClasses) {
      for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
        for (let memberIdx = 0; memberIdx < Math.min(10, members.length); memberIdx++) {
          const attendanceDate = new Date(Date.now() - (dayOffset * 24 * 60 * 60 * 1000))
            .toISOString()
            .split("T")[0];
          const { error } = await supabaseAdmin
            .from("ebd_attendance")
            .insert({
              account_id: accountId,
              class_id: ebdClass.id,
              member_id: members[memberIdx].id,
              attendance_date: attendanceDate,
              present: dayOffset % 3 > 0,
              is_test_data: true,
            });
          if (error && !error.message.includes("unique")) {
            console.warn("Erro ao criar frequência:", error);
          }
        }
      }
    }

    return {
      ok: true,
      created: {
        members: members.length,
        events: 30,
        donations: 30,
        ebd_classes: ebdClasses.length,
      },
    };
  });

const deleteTestDataSchema = z.object({
  account_id: z.string().uuid(),
});

export const deleteTestData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deleteTestDataSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const accountId = data.account_id;

    // Delete in correct order (respecting foreign keys)
    const deletions = {
      ebd_attendance: 0,
      ebd_enrollments: 0,
      ebd_classes: 0,
      donations: 0,
      events: 0,
      members: 0,
    };

    const tables = ["ebd_attendance", "ebd_enrollments", "ebd_classes", "donations", "events", "members"];

    for (const table of tables) {
      const { data: deleted } = await supabaseAdmin
        .from(table as any)
        .delete()
        .eq("account_id", accountId)
        .eq("is_test_data", true);

      deletions[table as keyof typeof deletions] = deleted ? deleted.length : 0;
    }

    return {
      ok: true,
      deleted: deletions,
      total: Object.values(deletions).reduce((a, b) => a + b, 0),
    };
  });

export const countTestData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;

    const tables = ["members", "donations", "events", "ebd_classes", "ebd_enrollments", "ebd_attendance"];
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const { count } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("account_id", userId)
        .eq("is_test_data", true);
      counts[table] = count ?? 0;
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return { counts, total };
  });