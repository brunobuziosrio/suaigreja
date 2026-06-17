import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./utils-H80jjgLf.js";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-outline bg-background px-3 py-2 text-base text-ink transition-all duration-200 placeholder:text-stone-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-sand focus-visible:border-sand file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-sunken",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
export {
  Input as I
};
