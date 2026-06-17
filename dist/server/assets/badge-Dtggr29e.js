import { jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { c as cn } from "./utils-H80jjgLf.js";
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gold-soft/20 text-ink",
        primary: "bg-gold-soft/20 text-ink",
        success: "bg-forest/10 text-forest",
        warning: "bg-amber-soft/60 text-amber",
        error: "bg-coral-soft/60 text-error",
        neutral: "bg-surface-sunken text-stone",
        outline: "border border-outline text-ink"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
export {
  Badge as B
};
