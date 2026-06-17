import { jsxs, jsx } from "react/jsx-runtime";
import { B as Button } from "./button-Bt6uLOVU.js";
import { Printer } from "lucide-react";
import { M as MemberCard } from "./member-card-EXst8LE0.js";
import { k as Route } from "./router-BAWvi9U-.js";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "qrcode";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "./client-DVtn2Z4s.js";
import "@supabase/supabase-js";
import "sonner";
import "./admin-payment-settings.functions-DPCtUTO2.js";
import "./server-aNfUBU9s.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CuIHMyp3.js";
import "./client.server-D5ro3rAQ.js";
import "zod";
import "./billing-plans-Ce8xzhRW.js";
function MemberCardPage() {
  const {
    member,
    church
  } = Route.useLoaderData();
  const primary = church?.primary_color || "#0c2340";
  return /* @__PURE__ */ jsxs("div", { className: "print-card-page min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:bg-white", style: {
    background: `linear-gradient(135deg, ${primary}18, ${primary}04)`
  }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body { display: block !important; }
          .print-card-wrap, .print-card-wrap * { box-shadow: none !important; }
          .print-card-page {
            min-height: auto !important;
            display: block !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .print-card-wrap {
            width: 100mm !important;
            max-width: 100mm !important;
            margin: 0 !important;
          }
          .print-card-wrap .max-w-\\[720px\\] {
            width: 100mm !important;
            max-width: 100mm !important;
            margin: 0 !important;
          }
          .print-card-wrap [style*="aspect-ratio"] {
            width: 100mm !important;
            height: 70mm !important;
            border: 0.2mm solid #d4d4d4 !important;
            border-radius: 2mm !important;
          }
        }
      ` }),
    /* @__PURE__ */ jsx("div", { className: "print-card-wrap w-full max-w-[720px]", children: /* @__PURE__ */ jsx(MemberCard, { member: {
      id: member.id,
      full_name: member.full_name,
      photo_url: member.photo_url,
      role: member.role,
      status: member.status,
      member_since: member.member_since,
      birth_date: member.birth_date,
      cpf: member.cpf,
      congregation: member.congregation
    }, church: {
      brand_title: church?.brand_title ?? null,
      card_logo_url: church?.card_logo_url ?? church?.brand_logo_url ?? null,
      card_logo_height_px: church?.card_logo_height_px ?? 72,
      primary_color: church?.primary_color ?? null,
      card_accent_color: church?.card_accent_color ?? null,
      card_footer_text: church?.card_footer_text ?? null,
      card_title_size_px: church?.card_title_size_px ?? null,
      card_footer_size_px: church?.card_footer_size_px ?? null,
      card_field_size_px: church?.card_field_size_px ?? null,
      card_label_size_px: church?.card_label_size_px ?? null
    } }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 print:hidden", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => window.print(), children: [
      /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4 mr-2" }),
      "Imprimir"
    ] }) }),
    /* @__PURE__ */ jsxs("p", { className: "mt-3 text-[10px] text-muted-foreground print:hidden", children: [
      "ID ",
      member.id.slice(0, 8),
      " • ",
      member.status === "ativo" ? "Membro ativo" : `Status: ${member.status}`
    ] })
  ] });
}
export {
  MemberCardPage as component
};
