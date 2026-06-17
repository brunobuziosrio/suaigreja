import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
function fmtDate(d) {
  if (!d) return "";
  try {
    return (/* @__PURE__ */ new Date(`${d.slice(0, 10)}T00:00:00`)).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}
function fmtCpf(cpf) {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function MemberCard({ member, church, qrValue }) {
  const primary = church.primary_color || "#0c2340";
  const accent = church.card_accent_color || "#c8102e";
  const logoH = Math.max(24, Math.min(160, church.card_logo_height_px || 72));
  const titleSize = Math.max(18, Math.min(60, church.card_title_size_px || 36));
  const footerSize = Math.max(8, Math.min(20, church.card_footer_size_px || 12));
  const fieldSize = Math.max(10, Math.min(28, church.card_field_size_px || 15));
  const labelSize = Math.max(9, Math.min(20, church.card_label_size_px || 13));
  const footer = church.card_footer_text || "É assegurada nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva Art 5º, VII, Constituição Federal.";
  const [qrUrl, setQrUrl] = useState("");
  useEffect(() => {
    const v = qrValue ?? (typeof window !== "undefined" ? window.location.href : member.id);
    QRCode.toDataURL(v, { width: 320, margin: 0, color: { dark: primary, light: "#ffffff" } }).then(setQrUrl).catch(() => {
    });
  }, [qrValue, member.id, primary]);
  const LOGO_AREA = { x: 60, y: 80, h: 90 };
  const logoW = logoH * 2.6;
  const logoX = LOGO_AREA.x;
  const logoY = LOGO_AREA.y + (LOGO_AREA.h - logoH) / 2;
  const Field = ({ x, y, w, label, value }) => /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsxs(
      "text",
      {
        x: x + 4,
        y,
        fill: primary,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: "800",
        fontSize: labelSize,
        letterSpacing: "0.5",
        children: [
          label,
          ":"
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "rect",
      {
        x,
        y: y + 8,
        width: w,
        height: 56,
        rx: 28,
        ry: 28,
        fill: "#ffffff",
        stroke: primary,
        strokeWidth: "2.5"
      }
    ),
    /* @__PURE__ */ jsx(
      "text",
      {
        x: x + 20,
        y: y + 44,
        fill: "#2a2a2a",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: "600",
        fontSize: fieldSize,
        children: value || ""
      }
    )
  ] });
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-[720px] mx-auto", children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "relative w-full overflow-hidden rounded-2xl shadow-2xl bg-white print:shadow-none print:border print:rounded-lg",
      style: { aspectRatio: "1000 / 700" },
      children: /* @__PURE__ */ jsxs(
        "svg",
        {
          viewBox: "0 0 1000 700",
          xmlns: "http://www.w3.org/2000/svg",
          className: "absolute inset-0 h-full w-full",
          children: [
            /* @__PURE__ */ jsx("rect", { x: "0", y: "0", width: "1000", height: "700", fill: "#ffffff" }),
            /* @__PURE__ */ jsx("path", { d: "M0,0 L150,0 C90,30 50,70 30,140 L0,160 Z", fill: accent }),
            /* @__PURE__ */ jsx("path", { d: "M0,0 L130,0 C80,28 45,65 25,130 L0,148 Z", fill: primary }),
            /* @__PURE__ */ jsx("path", { d: "M1000,0 L1000,180 C920,150 850,90 820,0 Z", fill: accent }),
            /* @__PURE__ */ jsx("path", { d: "M1000,0 L1000,160 C925,135 858,82 835,0 Z", fill: primary }),
            church.card_logo_url ? /* @__PURE__ */ jsx(
              "image",
              {
                href: church.card_logo_url,
                x: logoX,
                y: logoY,
                height: logoH,
                width: logoW,
                preserveAspectRatio: "xMinYMid meet"
              }
            ) : church.brand_title ? /* @__PURE__ */ jsx(
              "text",
              {
                x: LOGO_AREA.x,
                y: LOGO_AREA.y + LOGO_AREA.h / 2 + 8,
                fill: primary,
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: "900",
                fontSize: "24",
                letterSpacing: "1",
                children: church.brand_title.toUpperCase()
              }
            ) : null,
            /* @__PURE__ */ jsx(
              "text",
              {
                x: LOGO_AREA.x,
                y: LOGO_AREA.y + LOGO_AREA.h + 38,
                fill: primary,
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: "900",
                fontSize: titleSize,
                letterSpacing: "0.5",
                children: "CARTEIRA DE MEMBRO"
              }
            ),
            /* @__PURE__ */ jsx(Field, { x: 45, y: 245, w: 700, label: "NOME", value: member.full_name }),
            /* @__PURE__ */ jsx(Field, { x: 45, y: 350, w: 225, label: "CPF", value: fmtCpf(member.cpf) }),
            /* @__PURE__ */ jsx(Field, { x: 283, y: 350, w: 225, label: "DATA NASC.", value: fmtDate(member.birth_date) }),
            /* @__PURE__ */ jsx(Field, { x: 521, y: 350, w: 224, label: "CADASTRO", value: fmtDate(member.member_since) }),
            /* @__PURE__ */ jsx(
              Field,
              {
                x: 45,
                y: 455,
                w: 700,
                label: "IGREJA / CONGREGAÇÃO",
                value: member.congregation || church.brand_title || ""
              }
            ),
            /* @__PURE__ */ jsx(
              "rect",
              {
                x: 765,
                y: 30,
                width: 200,
                height: 235,
                rx: 16,
                ry: 16,
                fill: "#ffffff",
                stroke: primary,
                strokeWidth: "3"
              }
            ),
            member.photo_url ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "photoClip", children: /* @__PURE__ */ jsx("rect", { x: 765, y: 30, width: 200, height: 235, rx: 16, ry: 16 }) }) }),
              /* @__PURE__ */ jsx(
                "image",
                {
                  href: member.photo_url,
                  x: 765,
                  y: 30,
                  width: 200,
                  height: 235,
                  preserveAspectRatio: "xMidYMid slice",
                  clipPath: "url(#photoClip)"
                }
              )
            ] }) : /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx("circle", { cx: 865, cy: 125, r: 38, fill: "#d4d4d4" }),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M795,245 C805,200 865,188 865,188 C865,188 925,200 935,245 L935,260 L795,260 Z",
                  fill: "#d4d4d4"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "rect",
              {
                x: 765,
                y: 285,
                width: 200,
                height: 210,
                rx: 14,
                ry: 14,
                fill: "#ffffff",
                stroke: primary,
                strokeWidth: "3"
              }
            ),
            qrUrl ? /* @__PURE__ */ jsx(
              "image",
              {
                href: qrUrl,
                x: 780,
                y: 305,
                width: 170,
                height: 170,
                preserveAspectRatio: "xMidYMid meet"
              }
            ) : null,
            /* @__PURE__ */ jsx("foreignObject", { x: 40, y: 560, width: 920, height: 120, children: /* @__PURE__ */ jsx(
              "div",
              {
                ...{ xmlns: "http://www.w3.org/1999/xhtml" },
                style: {
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontStyle: "italic",
                  fontSize: footerSize,
                  lineHeight: 1.35,
                  color: "#444",
                  textAlign: "center",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 8px"
                },
                children: footer
              }
            ) })
          ]
        }
      )
    }
  ) });
}
export {
  MemberCard as M
};
