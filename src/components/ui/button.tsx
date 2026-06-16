import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-liturgical disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-liturgical text-white hover:bg-liturgical-light shadow-sm disabled:bg-stone-faint disabled:text-stone-light",
        primary: "bg-liturgical text-white hover:bg-liturgical-light shadow-sm disabled:bg-stone-faint",
        secondary: "border border-stone-light text-ink hover:border-liturgical-light hover:bg-liturgical-soft/30",
        success: "bg-evergreen text-white hover:bg-evergreen-light shadow-sm disabled:bg-stone-faint",
        warning: "bg-amber text-white hover:bg-amber/90 shadow-sm disabled:bg-stone-faint",
        destructive: "bg-coral text-white hover:bg-coral/90 shadow-sm disabled:bg-stone-faint",
        outline: "border border-stone-light text-ink hover:border-stone hover:bg-background",
        ghost: "text-liturgical hover:bg-liturgical-soft/20",
        link: "text-liturgical hover:text-liturgical-light underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 px-2.5 text-xs rounded-md",
        sm: "h-9 px-3 text-sm rounded-md",
        default: "h-10 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-base rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
