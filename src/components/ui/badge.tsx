import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

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
        outline: "border border-outline text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
