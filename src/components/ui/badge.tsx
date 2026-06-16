import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-sand-soft text-sand-deep",
        primary: "bg-sand-soft text-sand-deep",
        success: "bg-forest-soft text-forest",
        warning: "bg-amber-soft text-amber",
        error: "bg-coral-soft text-coral",
        neutral: "bg-slate-faint text-slate",
        outline: "border border-slate-faint text-foreground",
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
