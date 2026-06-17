import { c as createServerRpc } from "./createServerRpc-C_8Vdjgs.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
import { s as supabase } from "./client-DVtn2Z4s.js";
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
const getDonations_createServerFn_handler = createServerRpc({
  id: "fbb6aec214bfb13393d699e05a4618af3adb13eaf54267bc2306cad764023ec6",
  name: "getDonations",
  filename: "src/routes/_authenticated.finances.tsx"
}, (opts) => getDonations.__executeServer(opts));
const getDonations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getDonations_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await supabase.from("donations").select("*").eq("account_id", context.userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const getMembersWithDonations_createServerFn_handler = createServerRpc({
  id: "bdf06463391e0f38ffb2f7cbe5a89e8154db435190f58dbc561b9d635966daad",
  name: "getMembersWithDonations",
  filename: "src/routes/_authenticated.finances.tsx"
}, (opts) => getMembersWithDonations.__executeServer(opts));
const getMembersWithDonations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMembersWithDonations_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await supabase.from("members").select("*").eq("account_id", context.userId).order("full_name");
  if (error) throw new Error(error.message);
  return data ?? [];
});
export {
  getDonations_createServerFn_handler,
  getMembersWithDonations_createServerFn_handler
};
