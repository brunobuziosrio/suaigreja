import { c as createServerRpc } from "./createServerRpc-C_8Vdjgs.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
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
const getMyMercadoPagoConnection_createServerFn_handler = createServerRpc({
  id: "ea0be6f95eae3c15c134dd79ab6d09364bcb0137854f5a29830b5362471dc0c3",
  name: "getMyMercadoPagoConnection",
  filename: "src/lib/mercadopago-connections.functions.ts"
}, (opts) => getMyMercadoPagoConnection.__executeServer(opts));
const getMyMercadoPagoConnection = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyMercadoPagoConnection_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("mercadopago_connections").select("public_key, connected_at").eq("account_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    connected: !!data,
    publicKey: data?.public_key ?? null,
    connectedAt: data?.connected_at ?? null
  };
});
const saveSchema = z.object({
  accessToken: z.string().min(10).max(500),
  publicKey: z.string().max(500).nullable().optional()
});
const saveMercadoPagoConnection_createServerFn_handler = createServerRpc({
  id: "477f098ee3444a24ea9390245fb4dc46f7f2891ee1547f7ae3387f83324856fb",
  name: "saveMercadoPagoConnection",
  filename: "src/lib/mercadopago-connections.functions.ts"
}, (opts) => saveMercadoPagoConnection.__executeServer(opts));
const saveMercadoPagoConnection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => saveSchema.parse(input)).handler(saveMercadoPagoConnection_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("mercadopago_connections").upsert({
    account_id: userId,
    access_token: data.accessToken.trim(),
    public_key: data.publicKey?.trim() || null
  }, {
    onConflict: "account_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const disconnectMercadoPago_createServerFn_handler = createServerRpc({
  id: "ec0044e223e528d03347901e50c43c6e7a054e820cbcdc7c126f309279bd463e",
  name: "disconnectMercadoPago",
  filename: "src/lib/mercadopago-connections.functions.ts"
}, (opts) => disconnectMercadoPago.__executeServer(opts));
const disconnectMercadoPago = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(disconnectMercadoPago_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("mercadopago_connections").delete().eq("account_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  disconnectMercadoPago_createServerFn_handler,
  getMyMercadoPagoConnection_createServerFn_handler,
  saveMercadoPagoConnection_createServerFn_handler
};
