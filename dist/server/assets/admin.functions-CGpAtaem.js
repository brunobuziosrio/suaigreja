import { c as createServerRpc } from "./createServerRpc-BjYlcaST.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: somente administradores.");
}
const getIsAdmin_createServerFn_handler = createServerRpc({
  id: "8ec3a24cdfc816c6a99237bbadf5c75ae0affc14e8a68ec0663a4f7dc5edbfa9",
  name: "getIsAdmin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getIsAdmin.__executeServer(opts));
const getIsAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getIsAdmin_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  return {
    isAdmin: !!data
  };
});
const listAllAccounts_createServerFn_handler = createServerRpc({
  id: "9baedc754f9abe6e0bc74138ec477e275590543cb6654601d0cf125fb2c54170",
  name: "listAllAccounts",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listAllAccounts.__executeServer(opts));
const listAllAccounts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAllAccounts_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("accounts").select("id, site_id, brand_title, religion_profile, subscription_status, trial_ends_at, stripe_customer_id, created_at").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((a) => a.id);
  const emailMap = /* @__PURE__ */ new Map();
  if (ids.length) {
    const {
      data: usersData
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1e3
    });
    for (const u of usersData?.users ?? []) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }
  const {
    data: counts
  } = await supabaseAdmin.from("events").select("account_id");
  const eventCount = /* @__PURE__ */ new Map();
  for (const row of counts ?? []) {
    eventCount.set(row.account_id, (eventCount.get(row.account_id) ?? 0) + 1);
  }
  return (data ?? []).map((a) => ({
    ...a,
    email: emailMap.get(a.id) ?? null,
    event_count: eventCount.get(a.id) ?? 0
  }));
});
const updateSchema = z.object({
  account_id: z.string().uuid(),
  subscription_status: z.enum(["trial", "active", "past_due", "canceled"])
});
const updateAccountSubscription_createServerFn_handler = createServerRpc({
  id: "3edb9c95c6e958d143255a04b67bef1ed75f9aa86a06db65952928fc39691d81",
  name: "updateAccountSubscription",
  filename: "src/lib/admin.functions.ts"
}, (opts) => updateAccountSubscription.__executeServer(opts));
const updateAccountSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => updateSchema.parse(input)).handler(updateAccountSubscription_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("accounts").update({
    subscription_status: data.subscription_status
  }).eq("id", data.account_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const nameSchema = z.object({
  account_id: z.string().uuid(),
  brand_title: z.string().trim().min(1, "Nome obrigatório").max(120)
});
const adminUpdateAccountName_createServerFn_handler = createServerRpc({
  id: "b4008e1dab8f405a0e12078ac68dda98a239edaa35fe1f8bfee30adaea9274ba",
  name: "adminUpdateAccountName",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateAccountName.__executeServer(opts));
const adminUpdateAccountName = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => nameSchema.parse(input)).handler(adminUpdateAccountName_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("accounts").update({
    brand_title: data.brand_title
  }).eq("id", data.account_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const generateTestDataSchema = z.object({
  account_id: z.string().uuid()
});
const generateTestData_createServerFn_handler = createServerRpc({
  id: "7822ffc6547e06ca58edd006cd4a93f7f73629aab0483330b41f6096fd04724a",
  name: "generateTestData",
  filename: "src/lib/admin.functions.ts"
}, (opts) => generateTestData.__executeServer(opts));
const generateTestData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => generateTestDataSchema.parse(input)).handler(generateTestData_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const accountId = data.account_id;
  const memberNames = ["Pedro Silva", "Maria Santos", "João Oliveira", "Ana Costa", "Carlos Souza", "Julia Mendes", "Roberto Ferreira", "Fernanda Rocha", "Lucas Martins", "Camila Gomes"];
  const genders = ["Masculino", "Feminino"];
  const maritalStatuses = ["Solteiro", "Casado", "Divorciado", "Viúvo"];
  const roles = ["membro", "visitante", "lider", "pastor", "diacono", "obreiro"];
  const statuses = ["ativo", "inativo"];
  const members = [];
  for (let i = 1; i <= 30; i++) {
    const {
      data: member,
      error
    } = await supabaseAdmin.from("members").insert({
      account_id: accountId,
      full_name: memberNames[i % 10] + " [Teste] #" + i,
      email: `teste.${i}@seuigreja.test`,
      phone: `(11) ${String(1e4 + i * 137 % 9e4).padStart(5, "0")}-${String(1e3 + i * 73 % 9e3).padStart(4, "0")}`,
      gender: genders[i % 2],
      marital_status: maritalStatuses[i % 4],
      role: roles[i % 6],
      status: statuses[i % 10 === 0 ? 0 : 1],
      birth_date: new Date(1980 + i % 40, i % 12, 1 + i % 28).toISOString().split("T")[0],
      member_since: new Date(2023, 0, 1 + i % 365).toISOString().split("T")[0],
      address_street: `Rua ${String.fromCharCode(65 + i % 26)}`,
      address_number: String(i % 999 + 1),
      address_city: "São Paulo",
      address_state: "SP",
      is_test_data: true
    }).select().single();
    if (error) console.warn("Erro ao criar membro:", error);
    if (member) members.push(member);
  }
  const eventTypes = ["Culto Domingo", "Culto Quarta", "EBD", "Célula", "Transmissão", "Devocional"];
  const eventLocations = ["Sede Principal", "Filial Centro", "Filial Vila", "Filial Leste", "Online"];
  for (let i = 1; i <= 30; i++) {
    const startHour = [9, 19, 15][i % 3];
    const {
      error
    } = await supabaseAdmin.from("events").insert({
      account_id: accountId,
      type_name: eventTypes[i % 6],
      location_name: eventLocations[i % 5],
      event_date: new Date(Date.now() + i % 60 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      start_time: `${String(startHour).padStart(2, "0")}:00:00`,
      end_time: `${String(startHour + 1).padStart(2, "0")}:30:00`,
      description: `Evento de teste #${i}`,
      is_live: i % 7 === 0,
      is_test_data: true
    });
    if (error) console.warn("Erro ao criar evento:", error);
  }
  const amounts = [500, 1e3, 1500, 2e3, 3e3, 5e3];
  const donationStatuses = ["pending", "paid", "failed"];
  for (let i = 1; i <= 30; i++) {
    const {
      error
    } = await supabaseAdmin.from("donations").insert({
      account_id: accountId,
      donor_name: `Doador Teste ${i}`,
      donor_email: `doador.${i}@test.local`,
      donor_phone: `(11) 99999-${String(1e3 + i % 9e3).padStart(4, "0")}`,
      amount_cents: amounts[i % 6] * 100,
      status: donationStatuses[i % 3],
      paid_at: [0, 3].includes(i % 5) ? null : new Date(Date.now() - i % 30 * 24 * 60 * 60 * 1e3).toISOString(),
      is_test_data: true
    });
    if (error) console.warn("Erro ao criar doação:", error);
  }
  const ebdClasses = [];
  const ebdClassNames = ["Crianças", "Adolescentes", "Jovens", "Adultos", "Idosos"];
  const ageRanges = ["crianças", "adolescentes", "jovens", "adultos", "idosos"];
  for (let i = 0; i < 5; i++) {
    const {
      data: ebdClass,
      error
    } = await supabaseAdmin.from("ebd_classes").insert({
      account_id: accountId,
      name: `Classe de ${ebdClassNames[i]} [Teste]`,
      teacher_name: `Professor Teste ${i + 1}`,
      weekday: 0,
      start_time: "09:00:00",
      age_range: ageRanges[i],
      is_test_data: true
    }).select().single();
    if (error) console.warn("Erro ao criar classe EBD:", error);
    if (ebdClass) ebdClasses.push(ebdClass);
  }
  if (ebdClasses.length > 0 && members.length > 0) {
    for (let i = 0; i < Math.min(30, members.length); i++) {
      const ebdClass = ebdClasses[i % ebdClasses.length];
      const {
        error
      } = await supabaseAdmin.from("ebd_enrollments").insert({
        account_id: accountId,
        class_id: ebdClass.id,
        member_id: members[i].id,
        is_test_data: true
      }).select().single();
      if (error && !error.message.includes("unique")) {
        console.warn("Erro ao criar inscrição:", error);
      }
    }
  }
  for (const ebdClass of ebdClasses) {
    for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
      for (let memberIdx = 0; memberIdx < Math.min(10, members.length); memberIdx++) {
        const attendanceDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
        const {
          error
        } = await supabaseAdmin.from("ebd_attendance").insert({
          account_id: accountId,
          class_id: ebdClass.id,
          member_id: members[memberIdx].id,
          attendance_date: attendanceDate,
          present: dayOffset % 3 > 0,
          is_test_data: true
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
      ebd_classes: ebdClasses.length
    }
  };
});
const deleteTestDataSchema = z.object({
  account_id: z.string().uuid()
});
const deleteTestData_createServerFn_handler = createServerRpc({
  id: "cfcdf74e97663be5fef33a1032891954031b66716f063dbd46be989c49a205e2",
  name: "deleteTestData",
  filename: "src/lib/admin.functions.ts"
}, (opts) => deleteTestData.__executeServer(opts));
const deleteTestData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => deleteTestDataSchema.parse(input)).handler(deleteTestData_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const accountId = data.account_id;
  const deletions = {
    ebd_attendance: 0,
    ebd_enrollments: 0,
    ebd_classes: 0,
    donations: 0,
    events: 0,
    members: 0
  };
  const tables = ["ebd_attendance", "ebd_enrollments", "ebd_classes", "donations", "events", "members"];
  for (const table of tables) {
    const {
      data: deleted
    } = await supabaseAdmin.from(table).delete().eq("account_id", accountId).eq("is_test_data", true);
    deletions[table] = deleted ? deleted.length : 0;
  }
  return {
    ok: true,
    deleted: deletions,
    total: Object.values(deletions).reduce((a, b) => a + b, 0)
  };
});
const countTestData_createServerFn_handler = createServerRpc({
  id: "0ca46ef0a035843e32280cb461ffa894fc39dcbaec8aa25e4a7f94cbdc5ca058",
  name: "countTestData",
  filename: "src/lib/admin.functions.ts"
}, (opts) => countTestData.__executeServer(opts));
const countTestData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(countTestData_createServerFn_handler, async ({
  context
}) => {
  const userId = context.userId;
  const tables = ["members", "donations", "events", "ebd_classes", "ebd_enrollments", "ebd_attendance"];
  const counts = {};
  for (const table of tables) {
    const {
      count
    } = await supabaseAdmin.from(table).select("*", {
      count: "exact",
      head: true
    }).eq("account_id", userId).eq("is_test_data", true);
    counts[table] = count ?? 0;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    counts,
    total
  };
});
export {
  adminUpdateAccountName_createServerFn_handler,
  countTestData_createServerFn_handler,
  deleteTestData_createServerFn_handler,
  generateTestData_createServerFn_handler,
  getIsAdmin_createServerFn_handler,
  listAllAccounts_createServerFn_handler,
  updateAccountSubscription_createServerFn_handler
};
