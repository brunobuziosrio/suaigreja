import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sand disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sand text-slate-faint hover:bg-sand-light shadow-sm disabled:bg-slate-faint disabled:text-slate-light",
        primary: "bg-sand text-slate-faint hover:bg-sand-light shadow-sm disabled:bg-slate-faint",
        secondary: "border border-slate-light text-foreground hover:border-ocean-light hover:bg-ocean-soft/20",
        success: "bg-forest text-white hover:bg-forest-light shadow-sm disabled:bg-slate-faint",
        warning: "bg-amber text-white hover:bg-amber/90 shadow-sm disabled:bg-slate-faint",
        destructive: "bg-coral text-white hover:bg-coral/90 shadow-sm disabled:bg-slate-faint",
        outline: "border border-slate-light text-foreground hover:border-slate hover:bg-background",
        ghost: "text-sand hover:bg-sand-soft/30",
        link: "text-ocean hover:text-ocean-light underline-offset-4 hover:underline",
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
