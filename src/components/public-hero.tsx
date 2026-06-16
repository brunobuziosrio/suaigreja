import { type ReactNode } from "react";
import { BackToSite } from "@/components/back-to-site";

export function PublicHero({
  color,
  title,
  subtitle,
  icon,
  slug,
  size = "md",
}: {
  color: string;
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  slug?: string;
  size?: "sm" | "md" | "lg";
}) {
  const padY =
    size === "lg" ? "py-14 sm:py-20" : size === "sm" ? "py-8 sm:py-10" : "py-12";
  const titleCls =
    size === "lg"
      ? "text-4xl sm:text-6xl"
      : size === "sm"
      ? "text-2xl sm:text-3xl"
      : "text-3xl md:text-4xl";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.6) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.4) 0, transparent 45%)",
        }}
      />
      <div className={`relative max-w-5xl mx-auto px-4 sm:px-6 ${padY} text-white`}>
        {slug && <BackToSite slug={slug} className="mb-4" />}
        <div className="text-center">
          {icon && <div className="mb-2 flex justify-center opacity-90">{icon}</div>}
          <h1 className={`${titleCls} font-bold tracking-tight`}>{title}</h1>
          {subtitle && <p className="opacity-90 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}