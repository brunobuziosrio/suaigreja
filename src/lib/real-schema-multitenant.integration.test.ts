/**
 * MISSION-001b: prova de isolamento multi-tenant contra o schema real.
 *
 * Diferente de e2e-local-multitenant.test.ts / local-tenant-e2e.integration.test.ts
 * (que usam um repositório fictício em memória), este teste sobe um Postgres real
 * via @electric-sql/pglite, aplica as migrations reais de supabase/migrations e
 * roda contra o schema, as RLS policies e os dados de duas contas de verdade.
 *
 * Não depende de Docker/WSL2. Não toca produção, banco remoto ou credenciais reais.
 * Ambiente inteiramente local e descartável, recriado a cada execução.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "supabase", "migrations");

// Migrations deliberadamente fora deste teste, com motivo verificado:
// - insere um user_id de produção específico (não existe neste ambiente local).
// - dados de demonstração (seed_test_data), substituídos pela seed própria deste teste.
// - só cria índices de performance; não afeta schema, RLS ou dados.
const SKIP_MIGRATIONS = new Set([
  "20260521151518_b0d67176-e953-44f0-a2a4-17f82e8e4932.sql",
  "20260617120100_seed_test_data.sql",
  "20260620_add_performance_indexes.sql",
]);

const BOOTSTRAP_SQL = `
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create or replace function auth.uid() returns uuid
  language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create or replace function auth.role() returns text
  language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '');
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function auth.role() to anon, authenticated, service_role;

create schema if not exists storage;
create or replace function storage.foldername(name text) returns text[]
  language plpgsql immutable as $fn$
declare
  _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1:array_length(_parts,1)-1];
end;
$fn$;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid,
  public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text,
  name text,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb
);
`;

function loadMigrations(): { file: string; sql: string }[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && !SKIP_MIGRATIONS.has(f))
    .sort();
  return files.map((file) => {
    let sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    if (/CREATE EXTENSION/i.test(sql) && /pg_(cron|net)/i.test(sql)) {
      sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS pg_(cron|net)[^;]*;/gi, "-- skipped: unsupported in pglite, unused (no functional cron/net calls in migrations)");
    }
    return { file, sql };
  });
}

const orgA = { id: "10000000-0000-4000-8000-000000000001" };
const orgB = { id: "10000000-0000-4000-8000-000000000002" };
const memberA = { id: "10000000-0000-4000-8000-00000000a003", role: "recepcao" };

let db: PGlite;

async function asRole(role: "authenticated" | "service_role" | "anon", userId?: string) {
  await db.exec(`set role ${role};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false);", [userId ?? ""]);
  await db.query("select set_config('request.jwt.claim.role', $1, false);", [role]);
}

async function asSuperuser() {
  await db.exec("reset role;");
}

beforeAll(async () => {
  db = new PGlite({ extensions: { pgcrypto, uuid_ossp } });
  await db.exec(BOOTSTRAP_SQL);

  const migrations = loadMigrations();
  for (const { file, sql } of migrations) {
    try {
      await db.exec(sql);
    } catch (e) {
      throw new Error(`Migration falhou: ${file}\n${(e as Error).message}`);
    }
  }

  // Em produção, o script de init do self-hosted Supabase (fora deste repo)
  // concede privilégio padrão em tabelas futuras para anon/authenticated/
  // service_role. Este ambiente local não tem esse init script, então concede
  // explicitamente aqui — não altera nenhuma RLS policy, só o privilégio
  // equivalente ao que já existe em produção.
  await db.exec(
    "grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;",
  );

  // Duas contas reais (accounts.id = auth.users.id, igual produção). O INSERT em
  // auth.users passa pelo mesmo trigger de aceite legal e de criação de conta
  // usado em produção (enforce_platform_legal_acceptance + handle_new_user).
  const legalMeta = JSON.stringify({
    platform_terms_version: "2026-07-16",
    platform_privacy_version: "2026-07-16",
  });
  await db.query(
    "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb), ($4, $5, $3::jsonb), ($6, $7, $3::jsonb);",
    [orgA.id, "owner-a@example.test", legalMeta, orgB.id, "owner-b@example.test", memberA.id, "membro-a@example.test"],
  );
  await db.query(
    "insert into public.account_members (account_id, user_id, role, status) values ($1, $2, $3, 'active');",
    [orgA.id, memberA.id, memberA.role],
  );

  // Matriz mínima de dados por conta: pessoas, eventos, financeiro, campanhas.
  for (const org of [orgA, orgB]) {
    await db.query(
      "insert into public.members (account_id, full_name) values ($1, $2);",
      [org.id, `Membro de ${org.id}`],
    );
    await db.query(
      "insert into public.events (account_id, location_name, type_name, event_date, start_time) values ($1, 'Salão', 'Culto', current_date, '19:00');",
      [org.id],
    );
    await db.query(
      "insert into public.financial_entries (account_id, entry_type, category, amount_cents) values ($1, 'income', 'dizimo', 1000);",
      [org.id],
    );
    await db.query(
      "insert into public.campaigns (account_id, name, goal_amount_cents) values ($1, $2, 100000);",
      [org.id, `Campanha de ${org.id}`],
    );
  }
});

afterAll(async () => {
  await db.close();
});

describe("MISSION-001b: isolamento multi-tenant contra schema e migrations reais (pglite)", () => {
  it("aplicou o schema real completo (accounts, members, events, financial_entries, campaigns, account_members existem)", async () => {
    await asSuperuser();
    for (const table of ["accounts", "members", "events", "financial_entries", "campaigns", "account_members"]) {
      const { rows } = await db.query(`select to_regclass('public.${table}') as t;`);
      expect((rows[0] as { t: string | null }).t, table).toBe(table);
    }
  });

  it("RLS: dono da conta A só lista membros/eventos/campanhas da própria conta", async () => {
    await asRole("authenticated", orgA.id);
    const members = await db.query("select account_id from public.members;");
    const events = await db.query("select account_id from public.events;");
    const campaigns = await db.query("select account_id from public.campaigns;");
    for (const { rows } of [members, events, campaigns]) {
      expect(rows.every((r) => (r as { account_id: string }).account_id === orgA.id)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
    }
  });

  it("RLS: dono da conta A não consegue UPDATE/DELETE em linha da conta B mesmo sabendo o ID", async () => {
    await asSuperuser();
    const { rows: bRows } = await db.query<{ id: string }>(
      "select id from public.members where account_id = $1;",
      [orgB.id],
    );
    const foreignId = bRows[0].id;

    await asRole("authenticated", orgA.id);
    const update = await db.query("update public.members set full_name = 'ataque' where id = $1;", [foreignId]);
    expect(update.affectedRows ?? 0).toBe(0);
    const del = await db.query("delete from public.members where id = $1;", [foreignId]);
    expect(del.affectedRows ?? 0).toBe(0);

    await asSuperuser();
    const { rows: check } = await db.query<{ full_name: string }>(
      "select full_name from public.members where id = $1;",
      [foreignId],
    );
    expect(check[0].full_name).not.toBe("ataque");
  });

  it("RLS: financial_entries usa RLS por membership — membro da equipe A vê os lançamentos da conta A, não os da B", async () => {
    await asRole("authenticated", memberA.id);
    const { rows } = await db.query("select account_id from public.financial_entries;");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => (r as { account_id: string }).account_id === orgA.id)).toBe(true);
  });

  it("RLS: membro de equipe da conta A (não-dono) vê members/campaigns da própria conta via membership, não da conta B — Fase 3 (20260702160000_membership_based_rls.sql) já reescreveu essas políticas de 'account_id = auth.uid()' para is_account_member()", async () => {
    await asRole("authenticated", memberA.id);
    const members = await db.query<{ account_id: string }>("select account_id from public.members;");
    const campaigns = await db.query<{ account_id: string }>("select account_id from public.campaigns;");
    for (const { rows } of [members, campaigns]) {
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((r) => r.account_id === orgA.id)).toBe(true);
    }
  });

  it("service_role (cliente admin real dos server functions): consulta com filtro por account_id, igual ao código de produção, nunca cruza contas", async () => {
    await asRole("service_role");
    for (const table of ["members", "events", "financial_entries", "campaigns"]) {
      const { rows } = await db.query(`select account_id from public.${table} where account_id = $1;`, [orgA.id]);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((r) => (r as { account_id: string }).account_id === orgA.id)).toBe(true);
    }
  });

  it("CONTRASTE: a mesma consulta service_role SEM o filtro por account_id vazaria as duas contas — prova que o filtro manual é a barreira real, não decorativa", async () => {
    await asRole("service_role");
    const { rows } = await db.query<{ account_id: string }>("select account_id from public.members;");
    const distinctAccounts = new Set(rows.map((r) => r.account_id));
    expect(distinctAccounts.size).toBeGreaterThanOrEqual(2);
    expect(distinctAccounts.has(orgA.id)).toBe(true);
    expect(distinctAccounts.has(orgB.id)).toBe(true);
  });

  it("confere que os arquivos de serviço reais realmente usam o filtro testado acima (evita que o teste fique desatualizado em relação ao código)", () => {
    const serviceFiles = [
      "members.functions.ts",
      "events.functions.ts",
      "financial-entries.functions.ts",
      "campaigns.functions.ts",
    ];
    for (const file of serviceFiles) {
      const source = readFileSync(path.join(__dirname, file), "utf8");
      expect(source, file).toMatch(/\.eq\("account_id", accountId\)/);
    }
  });
});
