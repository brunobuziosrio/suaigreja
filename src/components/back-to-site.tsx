import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackToSite({
  slug,
  variant = "light",
  className = "",
}: {
  slug: string;
  /** "light" = white text (use on colored hero), "dark" = stone text */
  variant?: "light" | "dark";
  className?: string;
}) {
  const tone =
    variant === "light"
      ? "text-white/85 hover:text-white"
      : "text-stone-600 hover:text-stone-900";
  return (
    <Link
      to="/$slug"
      params={{ slug }}
      className={`inline-flex items-center gap-2 text-sm font-medium ${tone} ${className}`}
    >
      <ArrowLeft className="h-4 w-4" /> Voltar para o site
    </Link>
  );
}