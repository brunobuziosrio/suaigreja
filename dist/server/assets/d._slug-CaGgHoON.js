import { jsx } from "react/jsx-runtime";
const SplitErrorComponent = ({
  error
}) => /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-6 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error.message }) });
export {
  SplitErrorComponent as errorComponent
};
