import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-amber-100 text-[#6B4A25]",
        primary: "bg-amber-100 text-[#6B4A25]",
        success: "bg-green-100 text-forest",
        warning: "bg-yellow-100 text-[#CA8A04]",
        error: "bg-red-100 text-[#DC2626]",
        neutral: "bg-gray-100 text-gray-700",
        outline: "border border-gray-300 text-gray-900",
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
