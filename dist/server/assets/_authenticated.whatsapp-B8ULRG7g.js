import { jsxs } from "react/jsx-runtime";
const SplitErrorComponent = ({
  error
}) => /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
  "Erro ao carregar: ",
  error.message
] });
export {
  SplitErrorComponent as errorComponent
};
