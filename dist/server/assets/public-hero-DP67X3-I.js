import { jsxs, jsx } from "react/jsx-runtime";
import { B as BackToSite } from "./back-to-site-Dx7gp_s6.js";
function PublicHero({
  color,
  title,
  subtitle,
  icon,
  slug,
  size = "md"
}) {
  const padY = size === "lg" ? "py-14 sm:py-20" : size === "sm" ? "py-8 sm:py-10" : "py-12";
  const titleCls = size === "lg" ? "text-4xl sm:text-6xl" : size === "sm" ? "text-2xl sm:text-3xl" : "text-3xl md:text-4xl";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative w-full overflow-hidden",
      style: { background: `linear-gradient(135deg, ${color}, ${color}cc)` },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "absolute inset-0 opacity-10 pointer-events-none",
            style: {
              backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.6) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.4) 0, transparent 45%)"
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: `relative max-w-5xl mx-auto px-4 sm:px-6 ${padY} text-white`, children: [
          slug && /* @__PURE__ */ jsx(BackToSite, { slug, className: "mb-4" }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            icon && /* @__PURE__ */ jsx("div", { className: "mb-2 flex justify-center opacity-90", children: icon }),
            /* @__PURE__ */ jsx("h1", { className: `${titleCls} font-bold tracking-tight`, children: title }),
            subtitle && /* @__PURE__ */ jsx("p", { className: "opacity-90 mt-1 text-sm sm:text-base", children: subtitle })
          ] })
        ] })
      ]
    }
  );
}
export {
  PublicHero as P
};
