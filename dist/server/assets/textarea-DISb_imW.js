import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./utils-H80jjgLf.js";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-outline bg-background px-3 py-2 text-base text-ink transition-all duration-200 placeholder:text-stone-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-sand focus-visible:border-sand disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-sunken",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
export {
  Textarea as T
};
