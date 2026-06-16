import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-liturgical-soft text-liturgical",
        primary: "bg-liturgical-soft text-liturgical",
        success: "bg-evergreen-soft text-evergreen",
        warning: "bg-amber-soft text-amber",
        error: "bg-coral-soft text-coral",
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
