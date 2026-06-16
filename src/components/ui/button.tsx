import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[#D4A373] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#D4A373] text-gray-900 hover:bg-[#E6B88D] shadow-sm disabled:bg-gray-300 disabled:text-gray-500",
        primary: "bg-[#D4A373] text-gray-900 hover:bg-[#E6B88D] shadow-sm disabled:bg-gray-300",
        secondary: "border border-gray-400 text-gray-900 hover:border-[#0891B2] hover:bg-blue-50",
        success: "bg-[#166534] text-white hover:bg-[#1e7e43] shadow-sm disabled:bg-gray-300",
        warning: "bg-[#CA8A04] text-white hover:bg-[#dc9f13] shadow-sm disabled:bg-gray-300",
        destructive: "bg-[#DC2626] text-white hover:bg-red-700 shadow-sm disabled:bg-gray-300",
        outline: "border border-gray-400 text-gray-900 hover:border-gray-600 hover:bg-white",
        ghost: "text-[#D4A373] hover:bg-amber-50",
        link: "text-[#0891B2] hover:text-blue-800 underline-offset-4 hover:underline",
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
