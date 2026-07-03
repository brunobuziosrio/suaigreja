// Boletim Semanal — agrega agenda, aniversariantes, noticias e pedidos de
// oracao da semana num unico resumo pronto pra imprimir ou compartilhar.
// Nao introduz tabelas novas: le dados ja existentes de outros modulos.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccountContext } from "@/lib/account-context.server";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Compara apenas mes/dia (ignora ano) para achar quem faz aniversario no
// intervalo [from, from+days), mesmo cruzando a virada do ano.
function isBirthdayInRange(birthDate: string, from: Date, days: number): boolean {
  const b = new Date(`${birthDate}T00:00:00`);
  for (let i = 0; i < days; i++) {
    const day = new Date(from);
    day.setDate(day.getDate() + i);
    if (b.getMonth() === day.getMonth() && b.getDate() === day.getDate()) return true;
  }
  return false;
}

export const getWeeklyBulletin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { accountId } = await resolveAccountContext(context.userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [
      { data: account },
      { data: events, error: eventsErr },
      { data: members, error: membersErr },
      { data: news, error: newsErr },
      { data: prayers, error: prayersErr },
    ] = await Promise.all([
      supabase
        .from("accounts")
        .select("brand_title, weekly_message, weekly_verse, weekly_verse_ref")
        .eq("id", accountId)
        .maybeSingle(),
      supabase
        .from("events")
        .select("id, event_date, start_time, location_name, type_name, description")
        .eq("account_id", accountId)
        .gte("event_date", toIsoDate(today))
        .lt("event_date", toIsoDate(weekEnd))
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("members")
        .select("id, full_name, birth_date")
        .eq("account_id", accountId)
        .eq("status", "ativo")
        .not("birth_date", "is", null),
      supabase
        .from("news_posts")
        .select("id, title, subtitle, created_at")
        .eq("account_id", accountId)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("prayer_requests")
        .select("id, name, message, is_anonymous, created_at")
        .eq("account_id", accountId)
        .eq("status", "approved")
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    if (eventsErr) throw new Error(eventsErr.message);
    if (membersErr) throw new Error(membersErr.message);
    if (newsErr) throw new Error(newsErr.message);
    if (prayersErr) throw new Error(prayersErr.message);

    const birthdays = (members ?? [])
      .filter((m) => m.birth_date && isBirthdayInRange(m.birth_date, today, 7))
      .map((m) => ({ id: m.id, full_name: m.full_name, birth_date: m.birth_date as string }))
      .sort((a, b) => {
        const da = new Date(`${a.birth_date}T00:00:00`);
        const db = new Date(`${b.birth_date}T00:00:00`);
        return da.getMonth() * 31 + da.getDate() - (db.getMonth() * 31 + db.getDate());
      });

    return {
      churchName: account?.brand_title ?? "Igreja",
      weeklyMessage: account?.weekly_message ?? null,
      weeklyVerse: account?.weekly_verse ?? null,
      weeklyVerseRef: account?.weekly_verse_ref ?? null,
      periodFrom: toIsoDate(today),
      periodTo: toIsoDate(new Date(weekEnd.getTime() - 86400000)),
      events: events ?? [],
      birthdays,
      news: news ?? [],
      prayers: (prayers ?? []).map((p) => ({ ...p, name: p.is_anonymous ? "Anônimo" : p.name })),
    };
  });
