import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireModuleAccess } from "@/lib/plan-access";
import { requirePermission } from "@/lib/permission-guard.server";

const eventInput = z.object({ name: z.string().trim().min(2).max(120), starts_at: z.string().datetime().nullable().optional() });
const stallInput = z.object({ festa_event_id: z.string().uuid(), name: z.string().trim().min(2).max(100), responsible_name: z.string().trim().max(120).nullable().optional() });
const productInput = z.object({ festa_stall_id: z.string().uuid(), name: z.string().trim().min(2).max(120), price_cents: z.number().int().min(0), stock_quantity: z.number().int().min(0).nullable().optional() });
const saleInput = z.object({ festa_stall_id: z.string().uuid(), payment_method: z.enum(["pix", "card", "cash"]), items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1).max(30) });
const eventStatusInput = z.object({ festa_event_id: z.string().uuid(), status: z.enum(["open", "closed"]) });

type FestaEvent = { id: string; name: string; status: "draft" | "open" | "closed" | "archived"; starts_at: string | null; created_at: string };
type FestaStall = { id: string; festa_event_id: string; name: string; responsible_name: string | null; active: boolean; sort_order: number };
type FestaProduct = { id: string; festa_stall_id: string; name: string; price_cents: number; stock_quantity: number | null; active: boolean };

export const listFestinhas = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { accountId } = await requireModuleAccess(context, "/festinhas");
  await requirePermission(context, "events", "view");
  const { supabase } = context;
  const { data: events, error } = await supabase.from("festa_events" as never).select("id, name, status, starts_at, created_at").eq("account_id", accountId).order("starts_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  const rows = (events ?? []) as unknown as FestaEvent[];
  const ids = rows.map((item) => item.id);
  if (!ids.length) return [] as Array<FestaEvent & { stalls: Array<FestaStall & { products: FestaProduct[] }> }>;
  const { data: stalls, error: stallsError } = await supabase.from("festa_stalls" as never).select("id, festa_event_id, name, responsible_name, active, sort_order").in("festa_event_id", ids).order("sort_order");
  if (stallsError) throw new Error(stallsError.message);
  const stallRows = (stalls ?? []) as unknown as FestaStall[];
  const stallIds = stallRows.map((item) => item.id);
  const { data: products, error: productsError } = stallIds.length ? await supabase.from("festa_products" as never).select("id, festa_stall_id, name, price_cents, stock_quantity, active").in("festa_stall_id", stallIds).order("name") : { data: [], error: null };
  if (productsError) throw new Error(productsError.message);
  const productRows = (products ?? []) as unknown as FestaProduct[];
  const { data: orders, error: ordersError } = await supabase.from("festa_orders" as never).select("festa_event_id, stall_id, payment_method, total_cents").in("festa_event_id", ids).eq("status", "delivered");
  if (ordersError) throw new Error(ordersError.message);
  const orderRows = (orders ?? []) as unknown as Array<{ festa_event_id: string; stall_id: string | null; payment_method: string; total_cents: number }>;
  return rows.map((event) => {
    const eventOrders = orderRows.filter((order) => order.festa_event_id === event.id);
    const byPayment = Object.fromEntries(["pix", "card", "cash", "credit"].map((method) => [method, eventOrders.filter((order) => order.payment_method === method).reduce((sum, order) => sum + order.total_cents, 0)]));
    const byStall = stallRows.filter((stall) => stall.festa_event_id === event.id).map((stall) => ({ stall_id: stall.id, total_cents: eventOrders.filter((order) => order.stall_id === stall.id).reduce((sum, order) => sum + order.total_cents, 0), orders: eventOrders.filter((order) => order.stall_id === stall.id).length }));
    return { ...event, stalls: stallRows.filter((stall) => stall.festa_event_id === event.id).map((stall) => ({ ...stall, products: productRows.filter((product) => product.festa_stall_id === stall.id) })), summary: { total_cents: eventOrders.reduce((sum, order) => sum + order.total_cents, 0), orders: eventOrders.length, by_payment: byPayment, by_stall: byStall } };
  });
});

export const setFestinhaStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => eventStatusInput.parse(input)).handler(async ({ data, context }) => {
  const { accountId } = await requireModuleAccess(context, "/festinhas");
  await requirePermission(context, "events", "edit");
  const { data: updated, error } = await context.supabase.from("festa_events" as never).update({ status: data.status, updated_at: new Date().toISOString() } as never).eq("id", data.festa_event_id).eq("account_id", accountId).in("status", data.status === "open" ? ["draft", "closed"] : ["open"]).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!updated) throw new Error("Esta edição não pode mudar de status no estado atual.");
  return { ok: true };
});

export const createFestinha = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => eventInput.parse(input)).handler(async ({ data, context }) => {
  const { accountId } = await requireModuleAccess(context, "/festinhas");
  await requirePermission(context, "events", "create");
  const { error } = await context.supabase.from("festa_events" as never).insert({ account_id: accountId, name: data.name, starts_at: data.starts_at ?? null } as never);
  if (error) throw new Error(error.message);
  return { ok: true };
});

export const createFestaStall = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => stallInput.parse(input)).handler(async ({ data, context }) => {
  await requireModuleAccess(context, "/festinhas"); await requirePermission(context, "events", "create");
  const { error } = await context.supabase.from("festa_stalls" as never).insert({ ...data, responsible_name: data.responsible_name ?? null } as never);
  if (error) throw new Error(error.message);
  return { ok: true };
});

export const createFestaProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => productInput.parse(input)).handler(async ({ data, context }) => {
  await requireModuleAccess(context, "/festinhas"); await requirePermission(context, "events", "create");
  const { error } = await context.supabase.from("festa_products" as never).insert({ ...data, stock_quantity: data.stock_quantity ?? null } as never);
  if (error) throw new Error(error.message);
  return { ok: true };
});

export const recordFestaSale = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => saleInput.parse(input)).handler(async ({ data, context }) => {
  await requireModuleAccess(context, "/festinhas"); await requirePermission(context, "events", "create");
  const client = context.supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: Array<{ order_id: string; order_code: string; total_cents: number }> | null; error: { message: string } | null }> };
  const { data: result, error } = await client.rpc("record_festa_sale", { p_stall_id: data.festa_stall_id, p_payment_method: data.payment_method, p_items: data.items });
  if (error) throw new Error(error.message);
  return result?.[0] ?? null;
});
