import { jsx } from "react/jsx-runtime";
const SplitErrorComponent = ({
  error
}) => /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-destructive", children: error.message });
export {
  SplitErrorComponent as errorComponent
};
