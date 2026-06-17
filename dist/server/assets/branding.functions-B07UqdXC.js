import { c as createServerRpc } from "./createServerRpc-C_8Vdjgs.js";
import { e as createServerFn } from "./server-Bu1wP-pG.js";
import { r as requireSupabaseAuth } from "./auth-middleware-_63E0ssP.js";
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
  if (!data) throw new Error("Acesso negado.");
}
const brandingSchema = z.object({
  brand_text: z.string().min(1).max(60),
  subtitle: z.string().max(40).default(""),
  icon_text: z.string().min(1).max(3),
  icon_url: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  logo_height_px: z.number().int().min(16).max(96)
});
const adminUpdateBranding_createServerFn_handler = createServerRpc({
  id: "80a20e7e47c16b99b16baeaea94307b0f4e0551d5dec78930ca3d0e4ce2f2bdb",
  name: "adminUpdateBranding",
  filename: "src/lib/branding.functions.ts"
}, (opts) => adminUpdateBranding.__executeServer(opts));
const adminUpdateBranding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => brandingSchema.parse(i)).handler(adminUpdateBranding_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("platform_branding").update({
    brand_text: data.brand_text,
    subtitle: data.subtitle,
    icon_text: data.icon_text,
    icon_url: data.icon_url ?? null,
    logo_url: data.logo_url ?? null,
    logo_height_px: data.logo_height_px
  }).eq("id", true);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  adminUpdateBranding_createServerFn_handler
};
